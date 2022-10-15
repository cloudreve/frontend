import {
    OneDriveError,
    Policy,
    QiniuError,
    Response,
    UpyunError,
} from "../types";
import { sizeToString } from "../utils";
import i18next from "../../../../i18n";
import { AppError } from "../../../../middleware/Api";

export enum UploaderErrorName {
    InvalidFile = "InvalidFile",
    NoPolicySelected = "NoPolicySelected",
    UnknownPolicyType = "UnknownPolicyType",
    FailedCreateUploadSession = "FailedCreateUploadSession",
    FailedDeleteUploadSession = "FailedDeleteUploadSession",
    HTTPRequestFailed = "HTTPRequestFailed",
    LocalChunkUploadFailed = "LocalChunkUploadFailed",
    SlaveChunkUploadFailed = "SlaveChunkUploadFailed",
    WriteCtxFailed = "WriteCtxFailed",
    RemoveCtxFailed = "RemoveCtxFailed",
    ReadCtxFailed = "ReadCtxFailed",
    InvalidCtxData = "InvalidCtxData",
    CtxExpired = "CtxExpired",
    RequestCanceled = "RequestCanceled",
    ProcessingTaskDuplicated = "ProcessingTaskDuplicated",
    OneDriveChunkUploadFailed = "OneDriveChunkUploadFailed",
    OneDriveEmptyFile = "OneDriveEmptyFile",
    FailedFinishOneDriveUpload = "FailedFinishOneDriveUpload",
    S3LikeChunkUploadFailed = "S3LikeChunkUploadFailed",
    S3LikeUploadCallbackFailed = "S3LikeUploadCallbackFailed",
    COSUploadCallbackFailed = "COSUploadCallbackFailed",
    COSPostUploadFailed = "COSPostUploadFailed",
    UpyunPostUploadFailed = "UpyunPostUploadFailed",
    QiniuChunkUploadFailed = "QiniuChunkUploadFailed",
    FailedFinishOSSUpload = "FailedFinishOSSUpload",
    FailedFinishQiniuUpload = "FailedFinishQiniuUpload",
    FailedTransformResponse = "FailedTransformResponse",
}

const RETRY_ERROR_LIST = [
    UploaderErrorName.FailedCreateUploadSession,
    UploaderErrorName.HTTPRequestFailed,
    UploaderErrorName.LocalChunkUploadFailed,
    UploaderErrorName.SlaveChunkUploadFailed,
    UploaderErrorName.RequestCanceled,
    UploaderErrorName.ProcessingTaskDuplicated,
    UploaderErrorName.FailedTransformResponse,
];

const RETRY_CODE_LIST = [-1];

export class UploaderError implements Error {
    public stack: string | undefined;
    constructor(public name: UploaderErrorName, public message: string) {
        this.stack = new Error().stack;
    }

    public Message(): string {
        return this.message;
    }

    public Retryable(): boolean {
        return RETRY_ERROR_LIST.includes(this.name);
    }
}

// 文件未通过存储策略验证
export class FileValidateError extends UploaderError {
    // 未通过验证的文件属性
    public field: "size" | "suffix";

    // 对应的存储策略
    public policy: Policy;

    constructor(message: string, field: "size" | "suffix", policy: Policy) {
        super(UploaderErrorName.InvalidFile, message);
        this.field = field;
        this.policy = policy;
    }

    public Message(): string {
        if (this.field == "size") {
            return i18next.t(`uploader.sizeExceedLimitError`, {
                max: sizeToString(this.policy.maxSize),
            });
        }

        return i18next.t(`uploader.suffixNotAllowedError`, {
            supported: this.policy.allowedSuffix
                ? this.policy.allowedSuffix.join(",")
                : "*",
        });
    }
}

// 未知存储策略
export class UnknownPolicyError extends UploaderError {
    // 对应的存储策略
    public policy: Policy;

    constructor(message: string, policy: Policy) {
        super(UploaderErrorName.UnknownPolicyType, message);
        this.policy = policy;
    }
}

// 后端 API 出错
export class APIError extends UploaderError {
    private appError: AppError;
    constructor(
        name: UploaderErrorName,
        message: string,
        protected response: Response<any>
    ) {
        super(name, message);
        this.appError = new AppError(response.msg, response.code, response.msg);
    }

    public Message(): string {
        return `${this.message}: ${this.appError.message}`;
    }

    public Retryable(): boolean {
        return (
            super.Retryable() && RETRY_CODE_LIST.includes(this.response.code)
        );
    }
}

// 无法创建上传会话
export class CreateUploadSessionError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.FailedCreateUploadSession, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.createUploadSessionError`);
        return super.Message();
    }
}

// 无法删除上传会话
export class DeleteUploadSessionError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.FailedDeleteUploadSession, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.deleteUploadSessionError`);
        return super.Message();
    }
}

// HTTP 请求出错
export class HTTPError extends UploaderError {
    public response?: any;
    constructor(public axiosErr: any, protected url: string) {
        super(UploaderErrorName.HTTPRequestFailed, axiosErr.message);
        this.response = axiosErr.response;
    }

    public Message(): string {
        return i18next.t(`uploader.requestError`, {
            msg: this.axiosErr,
            url: this.url,
        });
    }
}

// 本地分块上传失败
export class LocalChunkUploadError extends APIError {
    constructor(response: Response<any>, protected chunkIndex: number) {
        super(UploaderErrorName.LocalChunkUploadFailed, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.chunkUploadError`, {
            index: this.chunkIndex,
        });
        return super.Message();
    }
}

// 无法创建上传会话
export class RequestCanceledError extends UploaderError {
    constructor() {
        super(UploaderErrorName.RequestCanceled, "Request canceled");
    }
}

// 从机分块上传失败
export class SlaveChunkUploadError extends APIError {
    constructor(response: Response<any>, protected chunkIndex: number) {
        super(UploaderErrorName.SlaveChunkUploadFailed, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.chunkUploadError`, {
            index: this.chunkIndex,
        });
        return super.Message();
    }
}

// 上传任务冲突
export class ProcessingTaskDuplicatedError extends UploaderError {
    constructor() {
        super(
            UploaderErrorName.ProcessingTaskDuplicated,
            "Processing task duplicated"
        );
    }

    public Message(): string {
        return i18next.t(`uploader.conflictError`);
    }
}

// OneDrive 分块上传失败
export class OneDriveChunkError extends UploaderError {
    constructor(public response: OneDriveError) {
        super(
            UploaderErrorName.OneDriveChunkUploadFailed,
            response.error.message
        );
    }

    public Message(): string {
        let msg =  i18next.t(`uploader.chunkUploadErrorWithMsg`, {
            msg: this.message,
        });

        if (this.response.error.retryAfterSeconds != undefined){
            msg += " "+i18next.t(`uploader.chunkUploadErrorWithRetryAfter`, {
                retryAfter: this.response.error.retryAfterSeconds,
            })
        }

        return msg;
    }

    public Retryable(): boolean {
        return (
            super.Retryable() || this.response.error.retryAfterSeconds != undefined
        );
    }
}

// OneDrive 选择了空文件上传
export class OneDriveEmptyFileSelected extends UploaderError {
    constructor() {
        super(UploaderErrorName.OneDriveEmptyFile, "empty file not supported");
    }

    public Message(): string {
        return i18next.t("uploader.emptyFileError");
    }
}

// OneDrive 无法完成文件上传
export class OneDriveFinishUploadError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.FailedFinishOneDriveUpload, "", response);
    }

    public Message(): string {
        this.message = i18next.t("uploader.finishUploadError");
        return super.Message();
    }
}

// S3 类策略分块上传失败
export class S3LikeChunkError extends UploaderError {
    constructor(public response: Document) {
        super(
            UploaderErrorName.S3LikeChunkUploadFailed,
            response.getElementsByTagName("Message")[0].innerHTML
        );
    }

    public Message(): string {
        return i18next.t(`uploader.chunkUploadErrorWithMsg`, {
            msg: this.message,
        });
    }
}

// OSS 完成传失败
export class S3LikeFinishUploadError extends UploaderError {
    constructor(public response: Document) {
        super(
            UploaderErrorName.S3LikeChunkUploadFailed,
            response.getElementsByTagName("Message")[0].innerHTML
        );
    }

    public Message(): string {
        return i18next.t(`uploader.ossFinishUploadError`, {
            msg: this.message,
            code: this.response.getElementsByTagName("Code")[0].innerHTML,
        });
    }
}

// qiniu 分块上传失败
export class QiniuChunkError extends UploaderError {
    constructor(public response: QiniuError) {
        super(UploaderErrorName.QiniuChunkUploadFailed, response.error);
    }

    public Message(): string {
        return i18next.t(`uploader.chunkUploadErrorWithMsg`, {
            msg: this.message,
        });
    }
}

// qiniu 完成传失败
export class QiniuFinishUploadError extends UploaderError {
    constructor(public response: QiniuError) {
        super(UploaderErrorName.FailedFinishQiniuUpload, response.error);
    }

    public Message(): string {
        return i18next.t(`uploader.finishUploadErrorWithMsg`, {
            msg: this.message,
        });
    }
}

// COS 上传失败
export class COSUploadError extends UploaderError {
    constructor(public response: Document) {
        super(
            UploaderErrorName.COSPostUploadFailed,
            response.getElementsByTagName("Message")[0].innerHTML
        );
    }

    public Message(): string {
        return i18next.t(`uploader.cosUploadFailed`, {
            msg: this.message,
            code: this.response.getElementsByTagName("Code")[0].innerHTML,
        });
    }
}

// COS 无法完成上传回调
export class COSUploadCallbackError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.COSUploadCallbackFailed, "", response);
    }

    public Message(): string {
        this.message = i18next.t("uploader.finishUploadError");
        return super.Message();
    }
}

// Upyun 上传失败
export class UpyunUploadError extends UploaderError {
    constructor(public response: UpyunError) {
        super(UploaderErrorName.UpyunPostUploadFailed, response.message);
    }

    public Message(): string {
        return i18next.t("uploader.upyunUploadFailed", {
            msg: this.message,
        });
    }
}

// S3 无法完成上传回调
export class S3LikeUploadCallbackError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.S3LikeUploadCallbackFailed, "", response);
    }

    public Message(): string {
        this.message = i18next.t("uploader.finishUploadError");
        return super.Message();
    }
}

// 无法解析响应
export class TransformResponseError extends UploaderError {
    constructor(private response: string, parseError: Error) {
        super(UploaderErrorName.FailedTransformResponse, parseError.message);
    }

    public Message(): string {
        return i18next.t("uploader.parseResponseError", {
            msg: this.message,
            content: this.response,
        });
    }
}

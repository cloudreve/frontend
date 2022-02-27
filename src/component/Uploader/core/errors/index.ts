import { Policy, Response } from "../types";
import { sizeToString } from "../utils";

export enum UploaderErrorName {
    InvalidFile = "InvalidFile",
    NoPolicySelected = "NoPolicySelected",
    UnknownPolicyType = "UnknownPolicyType",
    FailedCreateUploadSession = "FailedCreateUploadSession",
    FailedDeleteUploadSession = "FailedDeleteUploadSession",
    HTTPRequestFailed = "HTTPRequestFailed",
    LocalChunkUploadFailed = "LocalChunkUploadFailed",
    WriteCtxFailed = "WriteCtxFailed",
    RemoveCtxFailed = "RemoveCtxFailed",
    ReadCtxFailed = "ReadCtxFailed",
    InvalidCtxData = "InvalidCtxData",
    CtxExpired = "CtxExpired",
    RequestCanceled = "RequestCanceled",
}

const RETRY_ERROR_LIST = [
    UploaderErrorName.FailedCreateUploadSession,
    UploaderErrorName.HTTPRequestFailed,
    UploaderErrorName.LocalChunkUploadFailed,
    UploaderErrorName.RequestCanceled,
];

const RETRY_CODE_LIST = [-1];

export class UploaderError implements Error {
    public stack: string | undefined;
    constructor(public name: UploaderErrorName, public message: string) {
        this.stack = new Error().stack;
    }

    public Message(i18n: string): string {
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

    public Message(i18n: string): string {
        if (this.field == "size") {
            return `文件大小超出存储策略限制（最大：${sizeToString(
                this.policy.maxSize
            )}）`;
        }

        return `存储策略不支持上传此扩展名的文件（当前支持：${
            this.policy.allowedSuffix
                ? this.policy.allowedSuffix.join(",")
                : "*"
        }）`;
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
    constructor(
        name: UploaderErrorName,
        message: string,
        protected response: Response<any>
    ) {
        super(name, message);
    }

    public Message(i18n: string): string {
        let msg = `${this.message}: ${this.response.msg}`;
        if (this.response.error) {
            msg += ` (${this.response.error})`;
        }

        return msg;
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

    public Message(i18n: string): string {
        this.message = "无法创建上传会话";
        return super.Message(i18n);
    }
}

// 无法删除上传会话
export class DeleteUploadSessionError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.FailedDeleteUploadSession, "", response);
    }

    public Message(i18n: string): string {
        this.message = "无法删除上传会话";
        return super.Message(i18n);
    }
}

// HTTP 请求出错
export class HTTPError extends UploaderError {
    constructor(protected axiosErr: Error, protected url: string) {
        super(UploaderErrorName.HTTPRequestFailed, axiosErr.message);
    }

    public Message(i18n: string): string {
        return `请求失败: ${this.axiosErr} (${this.url})`;
    }
}

// 无法创建上传会话
export class LocalChunkUploadError extends APIError {
    constructor(response: Response<any>, protected chunkIndex: number) {
        super(UploaderErrorName.LocalChunkUploadFailed, "", response);
    }

    public Message(i18n: string): string {
        this.message = `分片 [${this.chunkIndex}] 上传失败`;
        return super.Message(i18n);
    }
}

// 无法创建上传会话
export class RequestCanceledError extends UploaderError {
    constructor() {
        super(UploaderErrorName.RequestCanceled, "Request canceled");
    }
}

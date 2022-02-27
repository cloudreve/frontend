import { Policy } from "../types";
import { sizeToString } from "../utils";

export enum UploaderErrorName {
    // 输入错误
    InvalidFile = "InvalidFile",
    // 未选取存储策略
    NoPolicySelected = "NoPolicySelected",
    UnknownPolicyType = "UnknownPolicyType",
}

export class UploaderError implements Error {
    public stack: string | undefined;
    constructor(public name: UploaderErrorName, public message: string) {
        this.stack = new Error().stack;
    }

    public Message(i18n: string): string {
        return this.message;
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

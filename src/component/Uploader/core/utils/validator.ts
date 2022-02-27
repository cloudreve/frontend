import { Policy } from "../types";
import { FileValidateError } from "../errors";

interface Validator {
    (file: File | null, policy: Policy): void;
}

// validators
const checkers: Array<Validator> = [
    function checkExt(file: File | null, policy: Policy) {
        if (
            policy.allowedSuffix != undefined &&
            policy.allowedSuffix.length > 0
        ) {
            const ext = file?.name.split(".").pop();
            if (ext === null || !ext || !policy.allowedSuffix.includes(ext))
                throw new FileValidateError(
                    "File suffix not allowed in policy.",
                    "suffix",
                    policy
                );
        }
    },

    function checkSize(file: File | null, policy: Policy) {
        if (options.maxFileSize !== "0.00mb") {
            const maxFileSize = parseFloat(
                options.maxFileSize.replace("mb", "")
            );

            // 转 mb
            const fileSize = file?.size!! / (1024 * 1024);

            if (fileSize > maxFileSize)
                throw new Error(
                    `文件过大，您当前用户组最多可上传 ${maxFileSize} mb的文件`
                );
        }
    },
];

/* 将每个 Checker 执行
   失败返回 Error
 */
export function check(file: File | null, policy: Policy) {
    checkers.forEach((c) => c(file, policy));
}

import { StoragePolicy } from "../../../../api/explorer.ts";
import { FileValidateError } from "../errors";

interface Validator {
  (file: File, policy: StoragePolicy): void;
}

// validators
const checkers: Array<Validator> = [
  function checkExt(file: File, policy: StoragePolicy) {
    if (policy.allowed_suffix != undefined && policy.allowed_suffix.length > 0) {
      const ext = file?.name.split(".").pop();
      if (ext === null || !ext || !policy.allowed_suffix.includes(ext))
        throw new FileValidateError("File suffix not allowed in policy.", "suffix", policy);
    }
  },

  function checkSize(file: File, policy: StoragePolicy) {
    if (policy.max_size > 0) {
      if (file.size > policy.max_size) {
        throw new FileValidateError("File size exceeds maximum limit.", "size", policy);
      }
    }
  },
];

/* 将每个 Validator 执行
   失败返回 Error
 */
export function validate(file: File, policy: StoragePolicy) {
  checkers.forEach((c) => c(file, policy));
}

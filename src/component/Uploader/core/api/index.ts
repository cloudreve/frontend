import { UploadCredential, UploadSessionRequest } from "../types";
import { requestAPI } from "../utils";
import { CreateUploadSessionError } from "../errors";

export async function createUploadSession(
    req: UploadSessionRequest
): Promise<UploadCredential> {
    const res = await requestAPI<UploadCredential>("file/upload", {
        method: "put",
        data: req,
    });

    if (res.data.code !== 0) {
        throw new CreateUploadSessionError(res.data);
    }

    return res.data.data;
}

import Chunk, { ChunkInfo } from "./chunk";
import { ossDriveUploadChunk, ossFinishUpload } from "../api";

export default class OSS extends Chunk {
    protected async uploadChunk(chunkInfo: ChunkInfo) {
        return ossDriveUploadChunk(
            this.task.session?.uploadURLs[chunkInfo.index]!,
            chunkInfo,
            (p) => {
                this.updateChunkProgress(p.loaded, chunkInfo.index);
            },
            this.cancelToken.token
        );
    }

    protected async afterUpload(): Promise<any> {
        this.logger.info(`Finishing multipart upload...`);
        return ossFinishUpload(
            this.task.session!.callback,
            this.cancelToken.token
        );
    }
}

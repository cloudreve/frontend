import Chunk, { ChunkInfo } from "./chunk";
import { finishOneDriveUpload, oneDriveUploadChunk } from "../api";
import { OneDriveChunkError, OneDriveEmptyFileSelected } from "../errors";

export default class OneDrive extends Chunk {
    protected async uploadChunk(chunkInfo: ChunkInfo) {
        if (chunkInfo.chunk.size === 0) {
            throw new OneDriveEmptyFileSelected();
        }

        const rangeEnd = this.progress.total.loaded + chunkInfo.chunk.size - 1;
        const range = `bytes ${this.progress.total.loaded}-${rangeEnd}/${this.task.file.size}`;
        return oneDriveUploadChunk(
            `${this.task.session?.uploadURLs[0]!}`,
            range,
            chunkInfo,
            (p) => {
                this.updateChunkProgress(p.loaded, chunkInfo.index);
            },
            this.cancelToken.token
        ).catch((e) => {
            if (
                e instanceof OneDriveChunkError &&
                e.response.error.innererror &&
                e.response.error.innererror.code == "fragmentOverlap"
            ) {
                this.logger.info(
                    `Chunk [${chunkInfo.index}] overlapped, skip uploading.`
                );
                this.updateChunkProgress(chunkInfo.chunk.size, chunkInfo.index);
                return;
            }

            throw e;
        });
    }

    protected async afterUpload(): Promise<any> {
        this.logger.info(`Finishing upload...`);
        return finishOneDriveUpload(
            this.task.session!.sessionID,
            this.cancelToken.token
        );
    }
}

import Base from "./base";
import * as utils from "../utils";

export interface ChunkLoaded {
    chunks: number[];
}

export interface ChunkInfo {
    chunk: Blob;
    index: number;
}

export default abstract class Chunk extends Base {
    protected chunks: Blob[];
    protected loaded: ChunkLoaded;

    public upload = async () => {
        this.logger.info("Preparing uploading file chunks.");
        this.initBeforeUploadChunks();

        this.logger.info("Starting uploading file chunks:", this.chunks);
        for (let i = 0; i < this.chunks.length; i++) {
            await this.uploadChunk({ chunk: this.chunks[i], index: i });
            this.logger.info(`Chunk [${i}] uploaded.`);
        }
    };

    private initBeforeUploadChunks() {
        this.chunks = utils.getChunks(
            this.task.file,
            this.task.session?.chunkSize
        );
        this.loaded = {
            chunks: this.chunks.map(() => 0),
        };
        this.notifyResumeProgress();
    }

    protected abstract async uploadChunk(chunkInfo: ChunkInfo): Promise<any>;

    private notifyResumeProgress() {
        this.progress = {
            total: this.getProgressInfoItem(
                utils.sum(this.loaded.chunks),
                this.task.file.size + 1 // 防止在 complete 未调用的时候进度显示 100%
            ),
            chunks: this.chunks.map((chunk, index) => {
                return this.getProgressInfoItem(
                    this.loaded.chunks[index],
                    chunk.size,
                    false
                );
            }),
        };
        this.subscriber.onProgress(this.progress);
    }

    protected updateChunkProgress(loaded: number, index: number) {
        this.loaded.chunks[index] = loaded;
        this.notifyResumeProgress();
    }
}

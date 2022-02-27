import Base from "./base";
import * as utils from "../utils";

export interface ChunkLoaded {
    chunks: number[];
}

export default class Chunk extends Base {
    protected chunks: Blob[];
    protected loaded: ChunkLoaded;

    public upload = async () => {
        this.logger.info("Starting uploading file chunks.");
        this.initBeforeUploadChunks();
    };

    private initBeforeUploadChunks() {
        this.chunks = utils.getChunks(
            this.task.file,
            this.task.session?.chunk_size
        );
        this.loaded = {
            chunks: this.chunks.map(() => 0),
        };
        this.notifyResumeProgress();
    }

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
}

import Base, { Status, UploadProgress } from "./base";
import * as utils from "../utils";
import { Task, TaskType } from "../types";
import UploadManager from "../index";
import Logger from "../logger";

export interface ChunkProgress {
    loaded: number;
    index: number;
    etag?: string;
}

export interface ChunkInfo {
    chunk: Blob;
    index: number;
}

export default abstract class Chunk extends Base {
    protected chunks: Blob[];

    public upload = async () => {
        this.logger.info("Preparing uploading file chunks.");
        this.initBeforeUploadChunks();

        this.logger.info("Starting uploading file chunks:", this.chunks);
        this.updateLocalCache();
        for (let i = 0; i < this.chunks.length; i++) {
            if (
                this.task.chunkProgress[i].loaded < this.chunks[i].size ||
                this.chunks[i].size == 0
            ) {
                await this.uploadChunk({ chunk: this.chunks[i], index: i });
                this.logger.info(`Chunk [${i}] uploaded.`);
                this.updateLocalCache();
            }
        }
    };

    private initBeforeUploadChunks() {
        this.chunks = utils.getChunks(
            this.task.file,
            this.task.session?.chunkSize
        );
        const cachedInfo = utils.getResumeCtx(this.task, this.logger);
        if (cachedInfo == null) {
            this.task.chunkProgress = this.chunks.map(
                (value, index): ChunkProgress => ({
                    loaded: 0,
                    index,
                })
            );
        }

        this.notifyResumeProgress();
    }

    protected abstract async uploadChunk(chunkInfo: ChunkInfo): Promise<any>;

    protected updateChunkProgress(loaded: number, index: number) {
        this.task.chunkProgress[index].loaded = loaded;
        this.notifyResumeProgress();
    }

    private notifyResumeProgress() {
        this.progress = {
            total: this.getProgressInfoItem(
                utils.sumChunk(this.task.chunkProgress),
                this.task.file.size + 1
            ),
            chunks: this.chunks.map((chunk, index) => {
                return this.getProgressInfoItem(
                    this.task.chunkProgress[index].loaded,
                    chunk.size,
                    false
                );
            }),
        };
        this.subscriber.onProgress(this.progress);
    }

    private updateLocalCache() {
        utils.setResumeCtx(this.task, this.logger);
    }
}

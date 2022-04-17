import Base, { Status } from "./base";
import { cosFormUploadChunk, cosUploadCallback } from "../api";

export default class COS extends Base {
    public upload = async () => {
        this.logger.info("Starting uploading file stream:", this.task.file);
        await cosFormUploadChunk(
            this.task.session?.uploadURLs[0]!,
            this.task.file,
            this.task.session?.policy!,
            this.task.session?.path!,
            this.task.session?.callback!,
            this.task.session?.sessionID!,
            this.task.session?.keyTime!,
            this.task.session?.credential!,
            this.task.session?.ak!,
            (p) => {
                this.subscriber.onProgress({
                    total: this.getProgressInfoItem(p.loaded, p.total),
                });
            },
            this.cancelToken.token
        );
    };

    protected async afterUpload(): Promise<any> {
        this.transit(Status.finishing);
        this.logger.info(`Sending COS upload callback...`);
        try {
            await cosUploadCallback(
                this.task.session!.sessionID,
                this.cancelToken.token
            );
        } catch (e) {
            this.logger.warn(`Failed to finish COS upload:`, e);
        }
    }
}

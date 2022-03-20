import Base from "./base";
import { cosFormUploadChunk } from "../api";

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
}

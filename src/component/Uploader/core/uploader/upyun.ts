import Base from "./base";
import { upyunFormUploadChunk } from "../api";

export default class Upyun extends Base {
  public upload = async () => {
    this.logger.info("Starting uploading file stream:", this.task.file);
    await upyunFormUploadChunk(
      this.task.session?.upload_urls[0]!,
      this.task.file,
      this.task.session?.upload_policy!,
      this.task.session?.credential!,
      (p) => {
        this.subscriber.onProgress({
          total: this.getProgressInfoItem(p.loaded, p.total ?? 1),
        });
      },
      this.cancelToken.token,
      this.task.session?.mime_type,
    );
  };
}

import Base from "../uploader/base";

export interface QueueContent {
    uploader: Base;
    resolve: () => void;
    reject: (err?: any) => void;
}

export class Pool {
    queue: Array<QueueContent> = [];
    processing: Array<QueueContent> = [];

    constructor(private limit: number) {}

    enqueue(uploader: Base) {
        return new Promise<void>((resolve, reject) => {
            this.queue.push({
                uploader,
                resolve,
                reject,
            });
            this.check();
        });
    }

    release(item: QueueContent) {
        this.processing = this.processing.filter((v) => v !== item);
        this.check();
    }

    run(item: QueueContent) {
        this.queue = this.queue.filter((v) => v !== item);
        this.processing.push(item);
        item.uploader.run().then(
            () => {
                item.resolve();
                this.release(item);
            },
            (err) => {
                item.reject(err);
                this.release(item);
            }
        );
    }

    check() {
        const processingNum = this.processing.length;
        const availableNum = this.limit - processingNum;
        this.queue.slice(0, availableNum).forEach((item) => {
            this.run(item);
        });
    }
}

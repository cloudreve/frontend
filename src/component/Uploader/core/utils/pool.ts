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

    run(item: QueueContent) {
        this.queue = this.queue.filter((v) => v !== item);
        this.processing.push(item);
        item.uploader.upload().then(
            () => {
                this.processing = this.processing.filter((v) => v !== item);
                item.resolve();
                this.check();
            },
            (err) => item.reject(err)
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

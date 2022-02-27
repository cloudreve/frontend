// 所有 Uploader 的基类
import { Task } from "../types";
import UploadManager from "../index";
import Logger from "../logger";
import { UploaderError } from "../errors";

export enum Status {
    added,
    preparing,
    queued,
    processing,
    done,
    error,
    stopped,
}

export interface UploadHandlers {
    onPrepare: () => void;
    onError: (err: UploaderError) => void;
    onProgress: () => void;
    onComplete: () => void;
}

export default abstract class Base {
    public child?: Base[];
    public status: Status = Status.added;

    public id = ++Base.id;
    private static id = 0;

    protected logger: Logger;

    protected subscriber: UploadHandlers;

    constructor(public task: Task, protected manager: UploadManager) {
        this.logger = new Logger(
            this.manager.logger.level,
            "UPLOADER",
            this.id
        );
        this.logger.info("Initialize new uploader for task: ", task);

        this.subscriber = {
            /* eslint-disable @typescript-eslint/no-empty-function */
            onPrepare: () => {},
            onError: (err: UploaderError) => {},
            onProgress: () => {},
            onComplete: () => {},
            /* eslint-enable @typescript-eslint/no-empty-function */
        };

        // TODO: file validate
    }

    public subscribe = (handlers: UploadHandlers) => {
        this.subscriber = handlers;
    };

    public start = async () => {
        this.logger.info("Activate uploading task.");
        this.status = Status.preparing;
    };
}

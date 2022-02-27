// 所有 Uploader 的基类
import { Task, UploadCredential } from "../types";
import UploadManager from "../index";
import Logger from "../logger";
import { validate } from "../utils/validator";
import { CancelToken, requestAPI } from "../utils/request";
import { CancelTokenSource } from "axios";

export enum Status {
    added,
    preparing,
    queued,
    processing,
    finishing,
    finished,
    error,
    stopped,
}

export interface UploadHandlers {
    onTransition: (newStatus: Status) => void;
    onError: (err: Error) => void;
    onProgress: () => void;
}

export default abstract class Base {
    public child?: Base[];
    public status: Status = Status.added;

    public id = ++Base.id;
    private static id = 0;

    protected logger: Logger;

    protected subscriber: UploadHandlers;

    // 用于取消请求
    private cancelToken: CancelTokenSource = CancelToken.source();

    constructor(public task: Task, protected manager: UploadManager) {
        this.logger = new Logger(
            this.manager.logger.level,
            "UPLOADER",
            this.id
        );
        this.logger.info("Initialize new uploader for task: ", task);

        this.subscriber = {
            /* eslint-disable @typescript-eslint/no-empty-function */
            onTransition: (newStatus: Status) => {},
            onError: (err: Error) => {},
            onProgress: () => {},
            /* eslint-enable @typescript-eslint/no-empty-function */
        };
    }

    public subscribe = (handlers: UploadHandlers) => {
        this.subscriber = handlers;
    };

    public start = async () => {
        this.logger.info("Activate uploading task");
        try {
            validate(this.task.file, this.task.policy);
        } catch (e) {
            this.logger.info("File validate failed with error:", e);
            this.setError(e);
            return;
        }

        this.manager.pool.enqueue(this).catch((e) => {
            this.logger.info("Upload task failed with error:", e);
            this.setError(e);
        });
        this.logger.info("Enqueued in manager pool");
    };

    public upload = async () => {
        this.logger.info("Start upload task");
        this.transit(Status.preparing);
    };

    public cancel = async () => {
        this.cancelToken.cancel();
        // TODO: delete upload session
    };

    protected setError(e: Error) {
        this.status = Status.error;
        this.subscriber.onError(e);
    }

    protected transit(status: Status) {
        this.status = status;
        this.subscriber.onTransition(status);
    }

    private async createUploadSession() {
        const res = await requestAPI<UploadCredential>(
            `/api/v3/file/upload/session`,
            {
                method: "put",
                cancelToken: this.cancelToken.token,
            }
        );
    }
}

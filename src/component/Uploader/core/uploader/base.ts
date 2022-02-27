// 所有 Uploader 的基类
import { Task, UploadCredential, UploadSessionRequest } from "../types";
import UploadManager from "../index";
import Logger from "../logger";
import { validate } from "../utils/validator";
import { CancelToken, requestAPI } from "../utils/request";
import { CancelTokenSource } from "axios";
import { CreateUploadSessionError } from "../errors";

export enum Status {
    added,
    initialized,
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
        this.transit(Status.initialized);

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
        this.logger.info("Start upload task, create upload session...");
        this.transit(Status.preparing);
        const uploadSession = await this.createUploadSession();
        console.log(uploadSession);
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

    private async createUploadSession(): Promise<UploadCredential> {
        const req: UploadSessionRequest = {
            path: this.task.dst,
            size: this.task.file.size,
            name: this.task.file.name,
            policy_id: this.task.policy.id,
        };

        const res = await requestAPI<UploadCredential>("file/upload/session", {
            method: "put",
            cancelToken: this.cancelToken.token,
            data: req,
        });

        if (res.data.code !== 0) {
            throw new CreateUploadSessionError(res.data);
        }

        return res.data.data;
    }
}

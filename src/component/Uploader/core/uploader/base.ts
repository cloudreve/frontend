// 所有 Uploader 的基类
import { Task } from "../types";
import UploadManager from "../index";
import Logger from "../logger";
import { validate } from "../utils/validator";
import { CancelToken } from "../utils/request";
import { CancelTokenSource } from "axios";
import { createUploadSession } from "../api";
import * as utils from "../utils";

export enum Status {
    added,
    initialized,
    queued,
    preparing,
    processing,
    finishing,
    finished,
    error,
    stopped,
}

export interface UploadHandlers {
    onTransition: (newStatus: Status) => void;
    onError: (err: Error) => void;
    onProgress: (data: UploadProgress) => void;
}

export interface UploadProgress {
    total: ProgressCompose;
    chunks?: ProgressCompose[];
}

export interface ProgressCompose {
    size: number;
    loaded: number;
    percent: number;
    fromCache?: boolean;
}

export interface Progress {
    total: number;
    loaded: number;
}

export default abstract class Base {
    public child?: Base[];
    public status: Status = Status.added;
    public error?: Error;

    public id = ++Base.id;
    private static id = 0;

    protected logger: Logger;
    protected subscriber: UploadHandlers;
    // 用于取消请求
    protected cancelToken: CancelTokenSource = CancelToken.source();
    protected progress: UploadProgress;

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
            onProgress: (data: UploadProgress) => {},
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
            this.logger.error("File validate failed with error:", e);
            this.setError(e);
            return;
        }

        this.logger.info("Enqueued in manager pool");
        this.transit(Status.queued);
        this.manager.pool.enqueue(this).catch((e) => {
            this.logger.info("Upload task failed with error:", e);
            // TODO: delete upload session
            this.setError(e);
        });
    };

    public run = async () => {
        this.logger.info("Start upload task, create upload session...");
        this.transit(Status.preparing);
        const cachedInfo = utils.getResumeCtx(this.task, this.logger);
        if (cachedInfo == null) {
            this.task.session = await createUploadSession({
                path: this.task.dst,
                size: this.task.file.size,
                name: this.task.file.name,
                policy_id: this.task.policy.id,
                last_modified: this.task.file.lastModified,
            });
            this.logger.info("Upload session created:", this.task.session);
        } else {
            this.task.session = cachedInfo.session;
            this.task.resumed = true;
            this.task.chunkProgress = cachedInfo.chunkProgress;
            this.logger.info("Resume upload from cached ctx:", cachedInfo);
        }

        this.transit(Status.processing);
        await this.upload();
    };

    public abstract async upload(): Promise<any>;

    public cancel = async () => {
        this.cancelToken.cancel();
        // TODO: delete upload session
    };

    protected setError(e: Error) {
        this.status = Status.error;
        this.error = e;
        this.subscriber.onError(e);
    }

    protected transit(status: Status) {
        this.status = status;
        this.subscriber.onTransition(status);
    }

    public getProgressInfoItem(
        loaded: number,
        size: number,
        fromCache?: boolean
    ): ProgressCompose {
        return {
            size,
            loaded,
            percent: (loaded / size) * 100,
            ...(fromCache == null ? {} : { fromCache }),
        };
    }
}

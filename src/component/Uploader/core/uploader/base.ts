// 所有 Uploader 的基类
import { PolicyType, Task } from "../types";
import UploadManager from "../index";
import Logger from "../logger";
import { validate } from "../utils/validator";
import { CancelToken } from "../utils/request";
import axios, { CancelTokenSource } from "axios";
import { createUploadSession, deleteUploadSession } from "../api";
import * as utils from "../utils";
import { RequestCanceledError, UploaderError } from "../errors";

export enum Status {
    added,
    resumable,
    initialized,
    queued,
    preparing,
    processing,
    finishing,
    finished,
    error,
    canceled,
}

export interface UploadHandlers {
    onTransition: (newStatus: Status) => void;
    onError: (err: Error) => void;
    onProgress: (data: UploadProgress) => void;
    onMsg: (msg: string, color: string) => void;
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

const resumePolicy = [
    PolicyType.local,
    PolicyType.remote,
    PolicyType.qiniu,
    PolicyType.oss,
    PolicyType.onedrive,
    PolicyType.s3,
];
const deleteUploadSessionDelay = 500;

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

    public lastTime = Date.now();
    public startTime = Date.now();

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
            onMsg: (msg, color: string) => {},
            /* eslint-enable @typescript-eslint/no-empty-function */
        };
    }

    public subscribe = (handlers: UploadHandlers) => {
        this.subscriber = handlers;
    };

    public start = async () => {
        this.logger.info("Activate uploading task");
        this.transit(Status.initialized);
        this.lastTime = this.startTime = Date.now();

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
            this.setError(e);
        });
    };

    public run = async () => {
        this.logger.info("Start upload task, create upload session...");
        this.transit(Status.preparing);
        const cachedInfo = utils.getResumeCtx(this.task, this.logger);
        if (cachedInfo == null) {
            this.task.session = await createUploadSession(
                {
                    path: this.task.dst,
                    size: this.task.file.size,
                    name: this.task.file.name,
                    policy_id: this.task.policy.id,
                    last_modified: this.task.file.lastModified,
                    mime_type: this.task.file.type,
                },
                this.cancelToken.token
            );
            this.logger.info("Upload session created:", this.task.session);
        } else {
            this.task.session = cachedInfo.session;
            this.task.resumed = true;
            this.task.chunkProgress = cachedInfo.chunkProgress;
            this.logger.info("Resume upload from cached ctx:", cachedInfo);
        }

        this.transit(Status.processing);
        await this.upload();
        await this.afterUpload();
        utils.removeResumeCtx(this.task, this.logger);
        this.transit(Status.finished);
        this.logger.info("Upload task completed");
    };

    public abstract async upload(): Promise<any>;
    protected async afterUpload(): Promise<any> {
        return;
    }

    public cancel = async () => {
        if (this.status === Status.finished) {
            return;
        }

        this.cancelToken.cancel();
        await this.cancelUploadSession();
        this.transit(Status.canceled);
    };

    public reset = () => {
        this.cancelToken = axios.CancelToken.source();
        this.progress = {
            total: {
                size: 0,
                loaded: 0,
                percent: 0,
            },
        };
    };

    protected setError(e: Error) {
        if (
            !(e instanceof UploaderError && e.Retryable()) ||
            !resumePolicy.includes(this.task.policy.type)
        ) {
            this.logger.warn("Non-resume error occurs, clean resume ctx cache");
            this.cancelUploadSession();
        }

        if (!(e instanceof RequestCanceledError)) {
            this.status = Status.error;
            this.error = e;
            this.subscriber.onError(e);
        }
    }

    protected cancelUploadSession = (): Promise<void> => {
        return new Promise<void>((resolve) => {
            utils.removeResumeCtx(this.task, this.logger);
            if (this.task.session) {
                setTimeout(() => {
                    deleteUploadSession(this.task.session!?.sessionID)
                        .catch((e) => {
                            this.logger.warn(
                                "Failed to cancel upload session: ",
                                e
                            );
                        })
                        .finally(() => {
                            resolve();
                        });
                }, deleteUploadSessionDelay);
            } else {
                resolve();
            }
        });
    };

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

    public key(): string {
        return utils.getResumeCtxKey(this.task);
    }
}

import { Policy, PolicyType, Task, TaskType } from "./types";
import Logger, { LogLevel } from "./logger";
import { UnknownPolicyError, UploaderError, UploaderErrorName } from "./errors";
import Base from "./uploader/base";
import Local from "./uploader/local";
import { Pool } from "./utils/pool";
import {
    cleanupResumeCtx,
    getDirectoryUploadDst,
    getFileInput,
    listResumeCtx,
} from "./utils";
import Remote from "./uploader/remote";
import OneDrive from "./uploader/onedrive";
import OSS from "./uploader/oss";
import Qiniu from "./uploader/qiniu";
import COS from "./uploader/cos";
import Upyun from "./uploader/upyun";
import S3 from "./uploader/s3";
import ResumeHint from "./uploader/placeholder";

export interface Option {
    logLevel: LogLevel;
    concurrentLimit: number;
}

export enum SelectType {
    File,
    Directory,
}

export default class UploadManager {
    public logger: Logger;

    public pool: Pool;

    private static id = 0;
    private policy?: Policy;
    private fileInput: HTMLInputElement;
    private directoryInput: HTMLInputElement;

    private id = ++UploadManager.id;

    constructor(o: Option) {
        this.logger = new Logger(o.logLevel, "MANAGER");
        this.logger.info(`Initialized with log level: ${o.logLevel}`);

        this.pool = new Pool(o.concurrentLimit);
        this.fileInput = getFileInput(this.id, false);
        this.directoryInput = getFileInput(this.id, true);
    }

    dispatchUploader(task: Task): Base {
        if (task.type == TaskType.resumeHint) {
            return new ResumeHint(task, this);
        }

        switch (task.policy.type) {
            case PolicyType.local:
                return new Local(task, this);
            case PolicyType.remote:
                return new Remote(task, this);
            case PolicyType.onedrive:
                return new OneDrive(task, this);
            case PolicyType.oss:
                return new OSS(task, this);
            case PolicyType.qiniu:
                return new Qiniu(task, this);
            case PolicyType.cos:
                return new COS(task, this);
            case PolicyType.upyun:
                return new Upyun(task, this);
            case PolicyType.s3:
                return new S3(task, this);
            default:
                throw new UnknownPolicyError(
                    "Unknown policy type.",
                    task.policy
                );
        }
    }

    // 设定当前存储策略
    public setPolicy(p: Policy) {
        this.policy = p;
        if (p == undefined) {
            this.logger.info(`Currently no policy selected`);
            return;
        }

        this.logger.info(`Switching policy to:`, p);

        if (p.allowedSuffix != undefined && p.allowedSuffix.length > 0) {
            const acceptVal = p.allowedSuffix
                .map((v) => {
                    return "." + v;
                })
                .join(",");
            this.logger.info(`Set allowed file suffix to ${acceptVal}`);
            this.fileInput.setAttribute("accept", acceptVal);
        } else {
            this.logger.info(`Set allowed file suffix to *`);
            this.fileInput.removeAttribute("accept");
        }
    }

    // 选择文件
    public select = (dst: string, type = SelectType.File): Promise<Base[]> => {
        return new Promise<Base[]>((resolve) => {
            if (this.policy == undefined) {
                this.logger.warn(
                    `Calling file selector while no policy is set`
                );
                throw new UploaderError(
                    UploaderErrorName.NoPolicySelected,
                    "No policy selected."
                );
            }

            this.fileInput.onchange = (ev: Event) =>
                this.fileSelectCallback(ev, dst, resolve);
            this.directoryInput.onchange = (ev: Event) =>
                this.fileSelectCallback(ev, dst, resolve);
            this.fileInput.value = "";
            this.directoryInput.value = "";
            type == SelectType.File
                ? this.fileInput.click()
                : this.directoryInput.click();
        });
    };

    public resumeTasks = (): Base[] => {
        const tasks = listResumeCtx(this.logger);
        if (tasks.length > 0) {
            this.logger.info(
                `Resumed ${tasks.length} unfinished task(s) from local storage:`,
                tasks
            );
        }
        return tasks.map((t) =>
            this.dispatchUploader({ ...t, type: TaskType.resumeHint })
        );
    };

    public cleanupSessions = () => {
        cleanupResumeCtx(this.logger);
    };

    private fileSelectCallback = (
        ev: Event,
        dst: string,
        resolve: (value?: Base[] | PromiseLike<Base[]> | undefined) => void
    ) => {
        const target = ev.target as HTMLInputElement;
        if (!ev || !target || !target.files) return;
        if (target.files.length > 0) {
            resolve(
                Array.from(target.files).map(
                    (file): Base =>
                        this.dispatchUploader({
                            type: TaskType.file,
                            policy: this.policy as Policy,
                            dst: getDirectoryUploadDst(dst, file),
                            file: file,
                            size: file.size,
                            name: file.name,
                            chunkProgress: [],
                            resumed: false,
                        })
                )
            );
        }
    };
}

import { Policy, PolicyType, Task, TaskType } from "./types";
import Logger, { LogLevel } from "./logger";
import { UnknownPolicyError, UploaderError, UploaderErrorName } from "./errors";
import Base from "./uploader/base";
import Local from "./uploader/local";
import { Pool } from "./utils/pool";
import {
    cleanupResumeCtx,
    getAllFileEntries,
    getDirectoryUploadDst,
    getFileInput,
    isFileDrop,
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
    dropZone?: HTMLElement;
    onDropOver?: (e: DragEvent) => void;
    onDropLeave?: (e: DragEvent) => void;
    onToast: (type: string, msg: string) => void;
    onDropFileAdded?: (uploaders: Base[]) => void;
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
    // used for proactive upload (drop, paste)
    private currentPath = "/";

    constructor(private o: Option) {
        this.logger = new Logger(o.logLevel, "MANAGER");
        this.logger.info(`Initialized with log level: ${o.logLevel}`);

        this.pool = new Pool(o.concurrentLimit);
        this.fileInput = getFileInput(this.id, false);
        this.directoryInput = getFileInput(this.id, true);

        if (o.dropZone) {
            this.logger.info(`Drag and drop container set to:`, o.dropZone);
            o.dropZone.addEventListener("dragenter", (e) => {
                if (isFileDrop(e)) {
                    e.preventDefault();
                    if (o.onDropOver) {
                        o.onDropOver(e);
                    }
                }
            });

            o.dropZone.addEventListener("dragleave", (e) => {
                if (isFileDrop(e)) {
                    e.preventDefault();
                    if (o.onDropLeave) {
                        o.onDropLeave(e);
                    }
                }
            });

            o.dropZone.addEventListener("drop", this.onFileDroppedIn);
        }
    }

    changeConcurrentLimit = (newLimit: number) => {
        this.pool.limit = newLimit;
    };

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
    public setPolicy(p: Policy, path: string) {
        this.policy = p;
        this.currentPath = path;
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
        return tasks
            .filter(
                (t) =>
                    t.chunkProgress.length > 0 && t.chunkProgress[0].loaded > 0
            )
            .map((t) =>
                this.dispatchUploader({ ...t, type: TaskType.resumeHint })
            );
    };

    public cleanupSessions = () => {
        cleanupResumeCtx(this.logger);
    };

    private fileSelectCallback = (
        ev: Event | File[],
        dst: string,
        resolve: (value?: Base[] | PromiseLike<Base[]> | undefined) => void
    ) => {
        let files: File[] = [];
        if (ev instanceof Event) {
            const target = ev.target as HTMLInputElement;
            if (!ev || !target || !target.files) return;
            if (target.files.length > 0) {
                files = Array.from(target.files);
            }
        } else {
            files = ev as File[];
        }

        if (files.length > 0) {
            resolve(
                files.map(
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

    private onFileDroppedIn = async (e: DragEvent) => {
        const containFile =
            e.dataTransfer && e.dataTransfer.types.includes("Files");
        if (containFile) {
            this.o.onDropLeave && this.o.onDropLeave(e);
            const items = await getAllFileEntries(e.dataTransfer!.items);
            console.log(items);
            const uploaders = await new Promise<Base[]>((resolve) =>
                this.fileSelectCallback(items, this.currentPath, resolve)
            );
            this.o.onDropFileAdded && this.o.onDropFileAdded(uploaders);
        }
    };
}

import { Policy, PolicyType, Task, TaskType } from "./types";
import Logger, { LogLevel } from "./logger";
import { UnknownPolicyError, UploaderError, UploaderErrorName } from "./errors";
import Base from "./uploader/base";
import Folder from "./uploader/folder";
import Local from "./uploader/local";

export interface Option {
    logLevel: LogLevel;
    onFileAdded: (task: Task, error?: UploaderError) => void;
}

export default class UploadManager {
    public logger: Logger;

    private static id = 0;
    private policy?: Policy;
    private input: HTMLInputElement;

    private id = ++UploadManager.id;

    constructor(o: Option) {
        this.logger = new Logger(o.logLevel, "MANAGER");
        this.logger.info(`Initialized with log level: ${o.logLevel}`);

        const input = document.createElement("input");
        input.type = "file";
        input.id = `upload-input-${this.id}`;
        input.multiple = true;
        input.hidden = true;
        document.body.appendChild(input);
        this.input = input;
    }

    dispatchUploader(task: Task): Base {
        if (task.type == TaskType.folder) {
            return new Folder(task, this);
        }

        switch (task.policy.type) {
            case PolicyType.local:
                return new Local(task, this);

            default:
                throw new UnknownPolicyError(
                    "Unknown policy type",
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

        this.logger.info(`Switching policy to: ${p.name}, type: ${p.type}`);

        if (p.allowedSuffix != undefined && p.allowedSuffix.length > 0) {
            const acceptVal = p.allowedSuffix
                .map((v) => {
                    return "." + v;
                })
                .join(",");
            this.logger.info(`Set allowed file suffix to ${acceptVal}`);
            this.input.setAttribute("accept", acceptVal);
        } else {
            this.logger.info(`Set allowed file suffix to *`);
            this.input.removeAttribute("accept");
        }
    }

    // 选择文件
    public select = (dst: string): Promise<Base[]> => {
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

            this.input.onchange = (ev: Event) => {
                const target = ev.target as HTMLInputElement;
                if (!ev || !target || !target.files) return;
                if (target.files.length > 0) {
                    resolve(
                        Array.from(target.files).map(
                            (file): Base =>
                                this.dispatchUploader({
                                    type: TaskType.file,
                                    policy: this.policy as Policy,
                                    dst: dst,
                                    file: file,
                                    name: file.name,
                                })
                        )
                    );
                }
            };

            this.input.click();
        });
    };
}

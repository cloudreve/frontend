import { Policy, Task } from "./types";
import Logger, { LogLevel } from "./logger";
import { UploaderError, UploaderErrorName } from "./errors";

export interface Option {
    logLevel: LogLevel;
    onFileAdded: (task: Task, error?: UploaderError) => void;
}

export default class UploadManager {
    private static id = 0;
    private logger: Logger;
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
        input.onchange = this.inputHandler;
        document.body.appendChild(input);
        this.input = input;
    }

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

    public openFileSelector = () => {
        if (this.policy == undefined) {
            this.logger.warn(`Calling file selector while no policy is set`);
            throw new UploaderError(
                UploaderErrorName.NoPolicySelected,
                "No policy selected."
            );
        }

        this.input.click();
    };

    public inputHandler(this: GlobalEventHandlers, ev: Event): any {
        alert("file select");
    }
}

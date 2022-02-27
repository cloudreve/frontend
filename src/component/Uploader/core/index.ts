import { Policy, Task } from "./types";
import Logger, { LogLevel } from "./logger";
import { UploaderError } from "./errors";

export interface Option {
    logLevel: LogLevel;
    onFileAdded: (task: Task, error?: UploaderError) => void;
}

export default class UploadManager {
    private logger: Logger;

    constructor(o: Option) {
        this.logger = new Logger(o.logLevel, "MANAGER");
        this.logger.info(`Initialized with log level: ${o.logLevel}`);
    }
}

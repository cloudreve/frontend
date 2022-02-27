export type LogLevel = "INFO" | "WARN" | "ERROR" | "OFF";

export default class Logger {
    private static id = 0;

    // 为每个类分配一个 id
    // 用以区分不同的上传任务
    private id = ++Logger.id;

    constructor(private level: LogLevel = "OFF", private prefix = "UPLOAD") {}

    private getPrintPrefix(level: LogLevel) {
        return `Cloudreve-Uploader [${level}][${this.prefix}#${this.id}]:`;
    }

    info(...args: unknown[]) {
        const allowLevel: LogLevel[] = ["INFO"];
        if (allowLevel.includes(this.level)) {
            // eslint-disable-next-line no-console
            console.log(this.getPrintPrefix("INFO"), ...args);
        }
    }

    warn(...args: unknown[]) {
        const allowLevel: LogLevel[] = ["INFO", "WARN"];
        if (allowLevel.includes(this.level)) {
            // eslint-disable-next-line no-console
            console.warn(this.getPrintPrefix("WARN"), ...args);
        }
    }

    error(...args: unknown[]) {
        const allowLevel: LogLevel[] = ["INFO", "WARN", "ERROR"];
        if (allowLevel.includes(this.level)) {
            // eslint-disable-next-line no-console
            console.error(this.getPrintPrefix("ERROR"), ...args);
        }
    }
}

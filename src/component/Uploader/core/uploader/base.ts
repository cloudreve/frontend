// 所有 Uploader 的基类
import { Task } from "../types";
import UploadManager from "../index";

export enum Status {
    added,
    queued,
    processing,
    done,
    error,
    stopped,
}

export default abstract class Base {
    public child?: Base[];
    public status: Status = Status.added;

    public id = ++Base.id;
    private static id = 0;

    constructor(public task: Task, protected manager: UploadManager) {
        this.manager.logger.info("Initialize new uploader for task: ", task);
        // TODO: file validate
    }
}

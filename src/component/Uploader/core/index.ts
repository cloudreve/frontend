import { PolicyType, StoragePolicy } from "../../../api/explorer.ts";
import { defaultPath } from "../../../hooks/useNavigation.tsx";
import { UnknownPolicyError, UploaderError, UploaderErrorName } from "./errors";
import Logger, { LogLevel } from "./logger";
import { Task, TaskType } from "./types";
import Base, { MessageColor } from "./uploader/base";
import COS from "./uploader/cos";
import Local from "./uploader/local";
import OBS from "./uploader/obs.ts";
import OneDrive from "./uploader/onedrive";
import OSS from "./uploader/oss";
import ResumeHint from "./uploader/placeholder";
import Qiniu from "./uploader/qiniu";
import Remote from "./uploader/remote";
import S3 from "./uploader/s3";
import Upyun from "./uploader/upyun";
import {
  cleanupResumeCtx,
  getAllFileEntries,
  getDirectoryUploadDst,
  getFileInput,
  isFileDrop,
  listResumeCtx,
} from "./utils";
import { Pool } from "./utils/pool";

export interface Option {
  logLevel: LogLevel;
  concurrentLimit: number;
  overwrite?: boolean;
  dropZone: HTMLElement | null;
  onDropOver?: (e: DragEvent) => void;
  onDropLeave?: (e: DragEvent) => void;
  onToast: (type: MessageColor, msg: string) => void;
  onPoolEmpty?: () => void;
  onProactiveFileAdded?: (uploaders: Base[]) => void;
}

export enum SelectType {
  File,
  Directory,
}

export default class UploadManager {
  public logger: Logger;
  public pool: Pool;
  public overwrite?: boolean;
  private static id = 0;
  private policy?: StoragePolicy;
  private fileInput: HTMLInputElement;
  private directoryInput: HTMLInputElement;
  private id = ++UploadManager.id;
  // used for proactive upload (drop, paste)
  private currentPath?: string;

  constructor(private o: Option) {
    this.logger = new Logger(o.logLevel, "MANAGER");
    this.logger.info(`Initialized with log level: ${o.logLevel}`);

    this.pool = new Pool(o.concurrentLimit, o.onPoolEmpty);
    this.fileInput = getFileInput(this.id, false);
    this.directoryInput = getFileInput(this.id, true);
    this.overwrite = o.overwrite;

    if (o.dropZone) {
      this.logger.info(`Drag and drop container set to:`, o.dropZone);
      o.dropZone.addEventListener("dragenter", (e) => {
        if (isFileDrop(e) && this.currentPath) {
          e.preventDefault();
          if (o.onDropOver) {
            o.onDropOver(e);
          }
        }
      });

      o.dropZone.addEventListener("dragleave", (e) => {
        if (isFileDrop(e) && this.currentPath) {
          e.preventDefault();
          if (o.onDropLeave) {
            o.onDropLeave(e);
          }
        }
      });

      o.dropZone.addEventListener("drop", this.onFileDroppedIn);
    }

    window.addEventListener("beforeunload", this.beforeLeave);
  }

  beforeLeave = (e: BeforeUnloadEvent) => {
    if (this.pool.processing.length == 0) {
      return;
    }
    var confirmationMessage =
      "It looks like you have been editing something. " +
      "If you leave before saving, your changes will be lost.";

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
  };

  changeConcurrentLimit = (newLimit: number) => {
    this.pool.limit = newLimit;
  };

  dispatchUploader(task: Task): Base {
    if (task.type == TaskType.resumeHint) {
      return new ResumeHint(task, this);
    }

    if (task.policy.relay) {
      this.logger.info("Upload relay is enabled, cast to local uploader.");
      return new Local(task, this);
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
      case PolicyType.obs:
        return new OBS(task, this);
      default:
        throw new UnknownPolicyError("Unknown policy type.", task.policy);
    }
  }

  // 设定当前存储策略
  public setPolicy(p?: StoragePolicy, path?: string) {
    this.policy = p;
    this.currentPath = path;
    this.logger.info(`Switching path to:`, path);
    if (p == undefined) {
      this.logger.info(`Currently no policy selected`);
      return;
    }

    this.logger.info(`Switching policy to:`, p);

    if (p.allowed_suffix != undefined && p.allowed_suffix.length > 0) {
      const acceptVal = p.allowed_suffix
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
        this.logger.warn(`Calling file selector while no policy is set`);
        throw new UploaderError(
          UploaderErrorName.NoPolicySelected,
          "No policy selected.",
        );
      }

      this.fileInput.onchange = (ev: Event) => this.addFiles(ev, dst, resolve);
      this.directoryInput.onchange = (ev: Event) =>
        this.addFiles(ev, dst, resolve);
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
        tasks,
      );
    }
    return tasks
      .filter(
        (t) => t.chunkProgress.length > 0 && t.chunkProgress[0].loaded > 0,
      )
      .map((t) => this.dispatchUploader({ ...t, type: TaskType.resumeHint }));
  };

  public cleanupSessions = () => {
    cleanupResumeCtx(this.logger);
  };

  public addRawFiles = async (
    files: File[],
    getName?: (file: File) => string,
  ) => {
    if (!this.currentPath) {
      return;
    }
    const uploaders = await new Promise<Base[]>((resolve) =>
      this.addFiles(files, this.currentPath ?? defaultPath, resolve, getName),
    );
    this.o.onProactiveFileAdded && this.o.onProactiveFileAdded(uploaders);
  };

  private addFiles = (
    ev: Event | File[],
    dst: string,
    resolve: (value: Base[] | PromiseLike<Base[]>) => void,
    getName?: (file: File) => string,
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
              policy: this.policy as StoragePolicy,
              dst: getDirectoryUploadDst(dst, file),
              file: file,
              size: file.size,
              overwrite: this.overwrite,
              name: getName ? getName(file) : file.name,
              chunkProgress: [],
              resumed: false,
            }),
        ),
      );
    }
  };

  private onFileDroppedIn = async (e: DragEvent) => {
    if (!this.currentPath) {
      return;
    }
    const containFile =
      e.dataTransfer && e.dataTransfer.types.includes("Files");
    if (containFile) {
      this.o.onDropLeave && this.o.onDropLeave(e);
      const items = await getAllFileEntries(e.dataTransfer!.items);
      const uploaders = await new Promise<Base[]>((resolve) =>
        this.addFiles(items, this.currentPath, resolve),
      );
      this.o.onProactiveFileAdded && this.o.onProactiveFileAdded(uploaders);
    }
  };
}

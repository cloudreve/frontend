import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { closeUploadTaskList, openUploadTaskList, setUploadProgress } from "../../redux/globalStateSlice.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { refreshFileList, updateUserCapacity } from "../../redux/thunks/filemanager.ts";
import SessionManager, { UserSettings } from "../../session";
import UploadManager, { SelectType } from "./core";
import { UploaderError } from "./core/errors";
import Base, { Status } from "./core/uploader/base.ts";
import { DropFileBackground } from "./DropFile.tsx";
import PasteUploadDialog from "./PasteUploadDialog.tsx";
import TaskList from "./Popup/TaskList.tsx";

let totalProgressCollector: NodeJS.Timeout | null = null;
let lastProgressStart = -1;
let dragCounter = 0;

const defaultClipboardImageName = "image.png";

const Uploader = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [uploaders, setUploaders] = useState<Base[]>([]);
  const [dropBgOpen, setDropBgOpen] = useState(false);

  const totalProgress = useAppSelector((state) => state.globalState.uploadProgress);
  const taskListOpen = useAppSelector((state) => state.globalState.uploadTaskListOpen);
  const parent = useAppSelector((state) => state.fileManager[0].list?.parent);
  const path = useAppSelector((state) => state.fileManager[0].pure_path);
  const policy = useAppSelector((state) => state.fileManager[0].list?.storage_policy);
  const selectFileSignal = useAppSelector((state) => state.globalState.uploadFileSignal);
  const selectFolderSignal = useAppSelector((state) => state.globalState.uploadFolderSignal);

  const taskAdded = useCallback(
    (original?: Base) => (tasks: Base[]) => {
      if (original !== undefined) {
        if (tasks.length !== 1 || tasks[0].key() !== original.key()) {
          enqueueSnackbar(t("uploader.fileNotMatchError"), {
            variant: "warning",
          });
          return;
        }
      }

      tasks.forEach((t) => t.start());

      dispatch(openUploadTaskList());
      setUploaders((uploaders) => {
        if (original !== undefined) {
          uploaders = uploaders.filter((u) => u.key() !== original.key());
        }

        return [...uploaders, ...tasks];
      });
    },
    [enqueueSnackbar, dispatch, setUploaders],
  );

  const uploadManager = useMemo(() => {
    return new UploadManager({
      logLevel: "INFO",
      concurrentLimit: parseInt(SessionManager.getWithFallback(UserSettings.ConcurrentLimit)),
      overwrite: SessionManager.getWithFallback(UserSettings.UploadOverwrite),
      dropZone: document.querySelector("body"),
      onToast: (type, msg) => {
        enqueueSnackbar(msg, { variant: type });
      },
      onDropOver: (_e) => {
        dragCounter++;
        setDropBgOpen((value) => !value);
      },
      onDropLeave: (_e) => {
        dragCounter--;
        setDropBgOpen((value) => !value);
      },
      onProactiveFileAdded: taskAdded(),
      onPoolEmpty: () => {
        dispatch(refreshFileList(0));
        dispatch(updateUserCapacity(0));
      },
    });
  }, []);

  useEffect(() => {
    uploadManager.setPolicy(policy, path);
  }, [policy]);

  const handleUploaderError = useCallback(
    (e: any) => {
      if (e instanceof UploaderError) {
        enqueueSnackbar(e.Message(), { variant: "warning" });
      } else {
        enqueueSnackbar(t("uploader:unknownError", { msg: e.message }), {
          variant: "error",
        });
      }
    },
    [enqueueSnackbar, t],
  );

  const selectFile = useCallback(
    (path: string, type = SelectType.File, original?: Base) => {
      dispatch(openUploadTaskList());

      // eslint-disable-next-line no-unreachable
      uploadManager
        .select(path, type)
        .then(taskAdded(original))
        .catch((e) => {
          handleUploaderError(e);
        });
    },
    [uploadManager, taskAdded, handleUploaderError, dispatch],
  );

  const getClipboardFileName = useCallback(
    (f: File) => {
      if (f.type.startsWith("image") && f.name == defaultClipboardImageName) {
        return t("uploader.clipboardDefaultFileName", {
          date: dayjs().valueOf(),
        });
      }
      return f.name;
    },
    [t],
  );

  const addRawFiles = useCallback(
    (files: File[]) => {
      uploadManager.addRawFiles(files, getClipboardFileName).catch((e) => {
        handleUploaderError(e);
      });
    },
    [uploadManager, taskAdded, handleUploaderError, dispatch, getClipboardFileName],
  );

  useEffect(() => {
    const unfinished = uploadManager.resumeTasks();
    setUploaders((uploaders) => [
      ...uploaders,
      ...unfinished.filter((u) => uploaders.find((v) => v.key() === u.key()) === undefined),
    ]);
    if (!totalProgressCollector) {
      totalProgressCollector = setInterval(() => {
        let progress = {
          totalSize: 0,
          processedSize: 0,
          total: 0,
          processed: 0,
        };
        setUploaders((uploaders) => {
          uploaders.forEach((u) => {
            if (u.id <= lastProgressStart) {
              return;
            }

            progress.totalSize += u.task.size;
            progress.total += 1;

            if (u.status === Status.finished || u.status === Status.canceled || u.status === Status.error) {
              progress.processedSize += u.task.size;
              progress.processed += 1;
            }

            if (
              u.status === Status.added ||
              u.status === Status.initialized ||
              u.status === Status.queued ||
              u.status === Status.preparing ||
              u.status === Status.processing ||
              u.status === Status.finishing
            ) {
              progress.processedSize += u.progress ? u.progress.total.loaded : 0;
            }
          });

          if (progress.total > 0 && progress.processed === progress.total) {
            lastProgressStart = uploaders[uploaders.length - 1].id;
          }
          return uploaders;
        });

        dispatch(
          setUploadProgress({
            progress,
            count: progress.total,
          }),
        );
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if (selectFileSignal && selectFileSignal > 0 && path) {
      selectFile(path);
    }
  }, [selectFileSignal]);

  useEffect(() => {
    if (selectFolderSignal && selectFolderSignal > 0 && path) {
      selectFile(path, SelectType.Directory);
    }
  }, [selectFolderSignal]);

  const deleteTask = useCallback((filter: (b: Base) => boolean) => {
    setUploaders((uploaders) => uploaders.filter(filter));
  }, []);

  return (
    <>
      <PasteUploadDialog onFilePasted={addRawFiles} />
      <DropFileBackground open={dropBgOpen} />
      <TaskList
        progress={totalProgress}
        uploadManager={uploadManager}
        taskList={uploaders}
        open={!!taskListOpen}
        onCancel={deleteTask}
        selectFile={selectFile}
        onClose={() => dispatch(closeUploadTaskList())}
        setUploaders={setUploaders}
      />
    </>
  );
};

export default Uploader;

import i18next from "i18next";
import { enqueueSnackbar } from "notistack";
import { getFileEntityUrl, getFileInfo, sendCreateViewerSession, sendUpdateFile } from "../../api/api.ts";
import { FileResponse, Metadata, Viewer, ViewerAction, ViewerType } from "../../api/explorer.ts";
import { AppError, Code } from "../../api/request.ts";
import { DefaultCloseAction } from "../../component/Common/Snackbar/snackbar.tsx";
import { canUpdate, getActionOpt } from "../../component/FileManager/ContextMenu/useActionDisplayOpt.ts";
import { FileManagerIndex } from "../../component/FileManager/FileManager.tsx";
import SessionManager, { UserSettings } from "../../session";
import { isTrueVal } from "../../session/utils.ts";
import { dataUrlToBytes, fileExtension, fileNameNoExt, getFileLinkedUri, sizeToString } from "../../util";
import CrUri from "../../util/uri.ts";
import { closeContextMenu, ContextMenuTypes, fileUpdated } from "../fileManagerSlice.ts";
import {
  closeImageEditor,
  setCodeViewer,
  setCustomViewer,
  setDrawIOViewer,
  setEpubViewer,
  setImageEditor,
  setImageViewer,
  setMarkdownViewer,
  setMusicPlayer,
  setPdfViewer,
  setPhotopeaViewer,
  setSearchPopup,
  setSidebar,
  setVideoViewer,
  setViewerSelector,
  setWopiViewer,
} from "../globalStateSlice.ts";
import { Viewers, ViewersByID } from "../siteConfigSlice.ts";
import { AppThunk } from "../store.ts";
import { askSaveAs, askStaleVersionAction } from "./dialog.ts";
import { longRunningTaskWithSnackbar } from "./file.ts";

export interface ExpandedViewerSetting {
  [key: string]: Viewer[];
}

export const builtInViewers = {
  image: "image",
  photopea: "photopea",
  monaco: "monaco",
  drawio: "drawio",
  markdown: "markdown",
  video: "video",
  pdf: "pdf",
  epub: "epub",
  music: "music",
};

export function openViewers(
  index: number,
  file: FileResponse,
  size?: number,
  preferredVersion?: string,
  ignorePreference?: boolean,
): AppThunk {
  return async (dispatch, getState) => {
    dispatch(closeContextMenu({ index, value: undefined }));
    const {
      siteConfig: {
        explorer: { typed },
      },
    } = getState();

    const ext = fileExtension(file.name) ?? "";
    const entitySize = size ?? file.size;

    // Try user preference
    const userPreference = SessionManager.get(UserSettings.OpenWithPrefix + ext);
    if (!ignorePreference && userPreference && ViewersByID[userPreference]) {
      dispatch(openViewer(file, ViewersByID[userPreference], entitySize, preferredVersion));
      return;
    }

    const viewerOptions = Viewers[ext];
    if (!viewerOptions) {
      return;
    }

    if (viewerOptions.length > 1) {
      // open viewer selection dialog
      dispatch(
        setViewerSelector({
          open: true,
          file,
          entitySize,
          viewers: viewerOptions,
          version: preferredVersion,
        }),
      );
      return;
    }

    dispatch(openViewer(file, viewerOptions[0], entitySize, preferredVersion));
  };
}

export function openViewer(file: FileResponse, viewer: Viewer, size: number, preferredVersion?: string): AppThunk {
  return async (dispatch, getState) => {
    // Warning for large file
    if (viewer.max_size && size > viewer.max_size) {
      enqueueSnackbar({
        message: i18next.t("fileManager.viewerFileSizeWarning", {
          file_size: sizeToString(size),
          max: sizeToString(viewer.max_size),
          app: i18next.t(viewer.display_name),
        }),
        variant: "warning",
        action: DefaultCloseAction,
      });
    }
    if (viewer.type == ViewerType.builtin) {
      const isSharedFile = file.metadata?.[Metadata.share_redirect] ?? false;
      let primaryEntity = file.primary_entity;
      if (isSharedFile) {
        const fileInfo = await dispatch(getFileInfo({ uri: getFileLinkedUri(file) }));
        primaryEntity = fileInfo.primary_entity;
      }
      switch (viewer.id) {
        case builtInViewers.image: {
          // open image viewer
          const fm = getState().fileManager[FileManagerIndex.main];
          const fileIndex = fm.list?.files?.findIndex((f) => f.id == file.id);
          dispatch(setSearchPopup(false));
          dispatch(
            setImageViewer({
              open: true,
              index: fileIndex,
              file,
              exts: viewer.exts,
              version: preferredVersion,
            }),
          );
          break;
        }
        case builtInViewers.photopea:
          dispatch(
            setPhotopeaViewer({
              open: true,
              file,
              version: preferredVersion ?? primaryEntity,
            }),
          );
          break;
        case builtInViewers.monaco:
          dispatch(
            setCodeViewer({
              open: true,
              file,
              version: preferredVersion ?? primaryEntity,
            }),
          );
          break;
        case builtInViewers.drawio:
          dispatch(
            setDrawIOViewer({
              open: true,
              file,
              version: preferredVersion,
              host: viewer.props?.host,
            }),
          );
          break;
        case builtInViewers.markdown:
          dispatch(
            setMarkdownViewer({
              open: true,
              file,
              version: preferredVersion ?? primaryEntity,
            }),
          );
          break;
        case builtInViewers.video:
          dispatch(
            setVideoViewer({
              open: true,
              file,
              version: preferredVersion,
            }),
          );
          break;
        case builtInViewers.pdf:
          dispatch(
            setPdfViewer({
              open: true,
              file,
              version: preferredVersion,
            }),
          );
          break;
        case builtInViewers.epub:
          dispatch(
            setEpubViewer({
              open: true,
              file,
              version: preferredVersion,
            }),
          );
          break;
        case builtInViewers.music: {
          // open image viewer
          const fm = getState().fileManager[FileManagerIndex.main];
          let fileIndex = -1;
          let files: FileResponse[] = [];
          if (preferredVersion) {
            fileIndex = 0;
            files = [file];
          } else {
            fm.list?.files?.forEach((f) => {
              if (f.id == file.id) {
                fileIndex = files.length;
              }

              if (viewer.exts.indexOf(fileExtension(f.name) ?? "") > -1) {
                files.push(f);
              }
            });
          }
          if (fileIndex >= 0) {
            dispatch(
              setMusicPlayer({
                files: files,
                startIndex: fileIndex,
                version: preferredVersion,
              }),
            );
          }
          break;
        }
      }
    } else if (viewer.type == ViewerType.wopi) {
      return dispatch(openWopiViewer(file, viewer, preferredVersion));
    } else if (viewer.type == ViewerType.custom) {
      return dispatch(openCustomViewer(file, viewer, preferredVersion));
    }
  };
}

export function openCustomViewer(file: FileResponse, viewer: Viewer, preferredVersion?: string): AppThunk {
  return async (dispatch, _getState) => {
    const entityUrl = await longRunningTaskWithSnackbar(
      dispatch(
        getFileEntityUrl({
          uris: [getFileLinkedUri(file)],
          entity: preferredVersion,
          use_primary_site_url: true,
        }),
      ),
      "fileManager.preparingOpenFile",
    );

    const currentUser = SessionManager.currentUser();

    const vars: { [key: string]: string } = {
      src: encodeURIComponent(entityUrl.urls[0]),
      src_raw: entityUrl.urls[0],
      name: encodeURIComponent(file.name),
      version: preferredVersion ? preferredVersion : "",
      id: file.id,
      user_id: currentUser?.id ?? "",
      user_display_name: encodeURIComponent(currentUser?.nickname ?? ""),
    };

    // replace variables in viewer.url
    let url = viewer.url;
    if (!url) {
      console.error("Viewer URL not set");
      return;
    }
    for (const key in vars) {
      url = url.replace(`{$${key}}`, vars[key]);
    }

    if (isTrueVal(viewer.props?.openInNew ?? "")) {
      window.open(url);
      return;
    }

    // open viewer
    dispatch(setCustomViewer({ open: true, url, file, version: preferredVersion }));
  };
}

export function openWopiViewer(file: FileResponse, viewer: Viewer, preferredVersion?: string): AppThunk {
  return async (dispatch, _getState) => {
    const displayOpt = getActionOpt([file], Viewers, ContextMenuTypes.file);
    const action = !preferredVersion && canUpdate(displayOpt) ? ViewerAction.edit : ViewerAction.view;

    const viewerSession = await longRunningTaskWithSnackbar(
      dispatch(
        sendCreateViewerSession({
          uri: getFileLinkedUri(file),
          viewer_id: viewer.id,
          preferred_action: action,
          version: preferredVersion,
        }),
      ),
      "fileManager.preparingOpenFile",
    );

    if (!viewerSession.wopi_src) {
      return;
    }
    dispatch(
      setWopiViewer({
        open: true,
        src: viewerSession.wopi_src,
        session: viewerSession.session,
        file: file,
        version: preferredVersion,
      }),
    );
  };
}

export function onImageViewerIndexChange(file: FileResponse): AppThunk {
  return async (dispatch, getState) => {
    const {
      globalState: { sidebarOpen },
    } = getState();
    if (sidebarOpen) {
      dispatch(
        setSidebar({
          open: true,
          target: file,
        }),
      );
    }
  };
}

export function switchToImageEditor(file: FileResponse, version?: string): AppThunk {
  return async (dispatch, getState) => {
    const {
      globalState: { imageViewer },
    } = getState();
    if (!imageViewer) {
      return;
    }

    const isSharedFile = file.metadata?.[Metadata.share_redirect] ?? false;
    if (isSharedFile) {
      const fileInfo = await dispatch(getFileInfo({ uri: getFileLinkedUri(file) }));
      version = fileInfo.primary_entity;
    }

    dispatch(
      setImageViewer({
        ...imageViewer,
        open: false,
      }),
    );

    dispatch(
      setImageEditor({
        open: true,
        file,
        version: version ?? file.primary_entity,
      }),
    );
  };
}

export function switchToImageViewer(): AppThunk {
  return async (dispatch, getState) => {
    const {
      globalState: { imageViewer },
    } = getState();
    dispatch(closeImageEditor());
    if (imageViewer) {
      dispatch(setImageViewer({ ...imageViewer, open: true }));
    }
  };
}

export function saveImage(name: string, data: string, file: FileResponse, version?: string): AppThunk {
  return async (dispatch, getState) => {
    if (!version) {
      version = file.primary_entity;
    }

    const isSharedFile = file.metadata?.[Metadata.share_redirect] ?? false;
    let originFileUri = new CrUri(getFileLinkedUri(file));
    if (name != file.name) {
      if (isSharedFile) {
        // For symbolic link, we need to save to the same folder as the link
        originFileUri = new CrUri(file.path);
      }

      originFileUri = originFileUri.parent().join(name);
    }

    const savedImageFile = await dispatch(saveFile(originFileUri.toString(), await dataUrlToBytes(data), version));
    if (savedImageFile) {
      const {
        globalState: { imageViewer },
      } = getState();
      if (imageViewer) {
        dispatch(
          setImageViewer({
            ...imageViewer,
            file: name != file.name ? file : savedImageFile,
          }),
        );
      }
    }
  };
}

export function saveFile(
  uri: string,
  data: any,
  version?: string,
  saveAsNew?: boolean,
  ignoreSnackbar?: boolean,
): AppThunk<Promise<FileResponse | undefined>> {
  return async (dispatch, _getState): Promise<FileResponse | undefined> => {
    let savedFile: FileResponse | undefined;
    if (saveAsNew) {
      try {
        const fileName = new CrUri(uri).elements().pop();
        if (fileName) {
          const saveAsDst = await dispatch(askSaveAs(fileName));
          const dst = new CrUri(saveAsDst.uri).join(saveAsDst.name);
          uri = dst.toString();
        }
      } catch (e) {
        return;
      }
    }
    try {
      savedFile = await dispatch(
        sendUpdateFile(
          {
            uri: uri,
            previous: version,
          },
          data,
        ),
      );
    } catch (e) {
      if (e instanceof AppError && e.code == Code.StaleVersion) {
        // Handle version conflict
        try {
          const opt = await dispatch(askStaleVersionAction(uri));
          if (opt.overwrite) {
            return await dispatch(saveFile(uri, data));
          } else if (opt.saveAs) {
            return await dispatch(saveFile(opt.saveAs, data, version));
          }
        } catch (e) {
          // Cancel save action
          throw e;
        }
      }
    }

    if (!savedFile) {
      return;
    }

    if (!ignoreSnackbar) {
      enqueueSnackbar({
        message: i18next.t("fileManager.fileSaved"),
        variant: "success",
        action: DefaultCloseAction,
      });
    }

    dispatch(
      fileUpdated({
        index: FileManagerIndex.main,
        value: [
          {
            oldPath: uri,
            file: savedFile,
          },
        ],
      }),
    );

    return savedFile;
  };
}

export function savePhotopea(data: ArrayBuffer, file: FileResponse, version?: string, saveAsNew?: boolean): AppThunk {
  return async (dispatch, getState) => {
    if (!version) {
      version = file.primary_entity;
    }
    const savedFile = await dispatch(saveFile(getFileLinkedUri(file), data, version, saveAsNew));

    if (savedFile) {
      const {
        globalState: { photopeaViewer },
      } = getState();
      if (photopeaViewer) {
        dispatch(
          setPhotopeaViewer({
            ...photopeaViewer,
            file: savedFile,
            version: savedFile.primary_entity,
          }),
        );
      }
    }
  };
}

export function saveCode(
  data: string,
  file: FileResponse,
  version?: string,
  saveAsNew?: boolean,
): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const isLinkedFile = file.metadata?.[Metadata.share_redirect] ?? false;
    if (!version && !isLinkedFile) {
      version = file.primary_entity;
    }
    const savedFile = await dispatch(saveFile(getFileLinkedUri(file), data, version, saveAsNew));

    if (savedFile) {
      const {
        globalState: { codeViewer },
      } = getState();
      if (codeViewer) {
        dispatch(
          setCodeViewer({
            ...codeViewer,
            file: savedFile,
            version: savedFile.primary_entity,
          }),
        );
      }
    }
  };
}

export function saveDrawIO(
  data: string,
  file: FileResponse,
  saveAsNew?: boolean,
): AppThunk<Promise<FileResponse | undefined>> {
  return async (dispatch, getState): Promise<FileResponse | undefined> => {
    const savedFile = await dispatch(saveFile(getFileLinkedUri(file), data, undefined, saveAsNew, true));

    if (savedFile) {
      const {
        globalState: { drawIOViewer },
      } = getState();
      if (drawIOViewer) {
        dispatch(
          setDrawIOViewer({
            ...drawIOViewer,
            file: savedFile,
          }),
        );
      }
    }

    return savedFile;
  };
}

export function saveMarkdown(
  data: string,
  file: FileResponse,
  version?: string,
  saveAsNew?: boolean,
): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const isLinkedFile = file.metadata?.[Metadata.share_redirect] ?? false;
    if (!version && !isLinkedFile) {
      version = file.primary_entity;
    }
    const savedFile = await dispatch(saveFile(getFileLinkedUri(file), data, version, saveAsNew));

    if (savedFile) {
      const {
        globalState: { markdownViewer },
      } = getState();
      if (markdownViewer) {
        dispatch(
          setMarkdownViewer({
            ...markdownViewer,
            file: savedFile,
            version: savedFile.primary_entity,
          }),
        );
      }
    }
  };
}

const subtitleSuffix = ["ass", "srt", "vrr"];
export function findSubtitleOptions(): AppThunk<FileResponse[]> {
  return (_dispatch, getState): FileResponse[] => {
    const {
      globalState: { videoViewer },
      fileManager,
    } = getState();
    if (!videoViewer || !videoViewer.file) {
      return [];
    }

    const fm = fileManager[FileManagerIndex.main];

    const fileNameMatch = fileNameNoExt(videoViewer.file.name) + ".";
    const options = fm.list?.files
      .filter((f) => {
        return subtitleSuffix.indexOf(fileExtension(f.name) ?? "") !== -1;
      })
      .sort((a, b) => {
        return a.name.startsWith(fileNameMatch) && !b.name.startsWith(fileNameMatch) ? -1 : 0;
      });

    return options ?? [];
  };
}

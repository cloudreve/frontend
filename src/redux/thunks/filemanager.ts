import dayjs from "dayjs";
import { getFileInfo, getFileList, getUserCapacity, sendPatchViewSync } from "../../api/api.ts";
import { ExplorerView, FileResponse, FileType, ListResponse, Metadata } from "../../api/explorer.ts";
import { getActionOpt } from "../../component/FileManager/ContextMenu/useActionDisplayOpt.ts";
import { ListViewColumnSetting } from "../../component/FileManager/Explorer/ListView/Column.tsx";
import { FileManagerIndex } from "../../component/FileManager/FileManager.tsx";
import { Condition, ConditionType } from "../../component/FileManager/Search/AdvanceSearch/ConditionBox.tsx";
import { MinPageSize } from "../../component/FileManager/TopBar/ViewOptionPopover.tsx";
import { SelectType } from "../../component/Uploader/core";
import { defaultPath } from "../../hooks/useNavigation.tsx";
import { router } from "../../router";
import SessionManager, { UserSettings } from "../../session";
import { getFileLinkedUri, sleep } from "../../util";
import CrUri, { Filesystem, SearchParam, UriQuery } from "../../util/uri.ts";
import {
  appendListResponse,
  appendTreeCache,
  applyListResponse,
  clearMultiSelectHovered,
  clearSelected,
  closeContextMenu,
  ContextMenuTypes,
  Layouts,
  resetFileManager,
  setCapacity,
  setContextMenu,
  setFmError,
  setFmLoading,
  setGalleryWidth,
  setLayout,
  setListViewColumns,
  setMultiSelectHovered,
  setPage,
  setPageSize,
  setPathProps,
  setSelected,
  setShowThumb,
  setSortOption,
  SingleManager,
} from "../fileManagerSlice.ts";
import {
  closeAdvanceSearch,
  closeImageViewer,
  resetDialogs,
  selectForUpload,
  setAdvanceSearch,
  setPinFileDialog,
  setSearchPopup,
  setShareReadmeDetect,
  setUploadFromClipboardDialog,
} from "../globalStateSlice.ts";
import { Viewers } from "../siteConfigSlice.ts";
import { AppThunk } from "../store.ts";
import { deleteFile, openFileContextMenu } from "./file.ts";
import { queueLoadShareInfo } from "./share.ts";

export function setTargetPath(index: number, path: string): AppThunk {
  return async (dispatch, _getState) => {
    try {
      const crUri = new CrUri(path);
      const pathElements = crUri.elements();
      const pure = crUri.pure_uri(UriQuery.category);
      dispatch(
        setPathProps({
          index,
          value: {
            path,
            path_elements: pathElements,
            path_root: crUri.base(),
            current_fs: crUri.fs(),
            pure_path_with_category: pure.toString().replace(/\/$/, ""),
            pure_path: crUri.pure_uri().toString(),
            path_root_with_category: pure.base(false),
            search_params: crUri.searchParams(),
          },
        }),
      );
    } catch (e) {
      dispatch(
        setFmError({
          index,
          value: e,
        }),
      );
      return;
    }
  };
}

let generation = 0;
export interface NavigateReconcileOptions {
  next_page?: boolean;
  sync_view?: boolean;
}

const pageSize = (fm: SingleManager) => {
  let pageSize = Math.max(fm.pageSize, MinPageSize);
  return Math.min(fm.pageSize, fm.list?.props.max_page_size ?? pageSize);
};

export function beforePathChange(index: number): AppThunk {
  return async (dispatch, getState) => {
    const {
      globalState: { imageViewer },
    } = getState();
    if (imageViewer?.open && index == FileManagerIndex.main) {
      dispatch(closeImageViewer());
    }

    dispatch(clearSelected({ index, value: undefined }));
    dispatch(clearMultiSelectHovered({ index, value: undefined }));
  };
}

export function checkReadMeEnabled(index: number): AppThunk {
  return async (dispatch, getState) => {
    const { path, current_fs } = getState().fileManager[index];
    if (path && current_fs == Filesystem.share) {
      try {
        const info = await dispatch(queueLoadShareInfo(new CrUri(path), false));
        dispatch(setShareReadmeDetect(info?.show_readme && info.source_type == FileType.folder));
      } catch (e) {
        dispatch(setShareReadmeDetect(false));
      }
    } else {
      dispatch(setShareReadmeDetect(false));
    }
  };
}

export function navigateReconcile(index: number, opt?: NavigateReconcileOptions): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const timeNow = dayjs().valueOf();
    const {
      fileManager,
      globalState: { sidebarOpen, imageViewer },
    } = getState();
    const { path, list, pure_path } = fileManager[index];
    if (!path) {
      return;
    }

    const currentGeneration = ++generation;
    if (!opt?.next_page) {
      dispatch(setFmLoading({ index, value: true }));
    }
    dispatch(setFmError({ index, value: undefined }));

    if (opt?.sync_view) {
      try {
        await dispatch(syncViewSettings(index));
      } catch (e) {}
    }

    const currentLogin = SessionManager.currentLoginOrNull();
    const currentView = localCustomView[pure_path ?? ""];
    let useCustomView = currentLogin?.user.disable_view_sync || currentView;

    let listRes: ListResponse | null = null;
    try {
      listRes = await dispatch(
        getFileList({
          next_page_token: opt && opt.next_page ? list?.pagination.next_token : undefined,
          uri: path,
          page: list?.pagination.page ?? undefined,
          ...(useCustomView
            ? {
                page_size: currentView?.page_size ?? pageSize(fileManager[index]),
                order_by: currentView?.order ?? fileManager[index].sortBy,
                order_direction: currentView?.order_direction ?? fileManager[index].sortDirection,
              }
            : {}),
        }),
      );
    } catch (e) {
      if (currentGeneration == generation) {
        dispatch(
          setFmError({
            index,
            value: e,
          }),
        );
        return;
      }
    } finally {
      if (currentGeneration == generation) {
        dispatch(setFmLoading({ index, value: false }));
      }
    }

    // Check if current request is stale
    if (currentGeneration !== generation) {
      return;
    }

    if (listRes) {
      const fsUri = new CrUri(path);
      dispatch(
        appendTreeCache({
          index,
          value: [listRes.files, fsUri.is_search() ? undefined : path],
        }),
      );

      if (listRes.view) {
        // Apply view setting from cloud
        dispatch(setPageSize({ index, value: listRes.view.page_size }));
        dispatch(
          setSortOption({ index, value: [listRes.view.order ?? "created_at", listRes.view.order_direction ?? "asc"] }),
        );
        if (!currentView) {
          dispatch(setShowThumb({ index, value: !!listRes.view.thumbnail }));
          dispatch(setLayout({ index, value: listRes.view.view ?? Layouts.grid }));
          dispatch(
            setListViewColumns(listRes.view.columns ?? SessionManager.getWithFallback(UserSettings.ListViewColumns)),
          );
          dispatch(
            setGalleryWidth({
              index,
              value: listRes.view.gallery_width ?? SessionManager.getWithFallback(UserSettings.GalleryWidth),
            }),
          );
        }
      }

      if (currentView) {
        // Apply view setting from local cache
        dispatch(setShowThumb({ index, value: !!currentView.thumbnail }));
        dispatch(setLayout({ index, value: currentView.view ?? Layouts.grid }));
        dispatch(
          setListViewColumns(currentView.columns ?? SessionManager.getWithFallback(UserSettings.ListViewColumns)),
        );
        dispatch(
          setGalleryWidth({
            index,
            value: currentView.gallery_width ?? SessionManager.getWithFallback(UserSettings.GalleryWidth),
          }),
        );
      }

      if (opt && opt.next_page) {
        dispatch(appendListResponse({ index, value: listRes }));
      } else {
        if (listRes.pagination.total_items) {
          // check if page is overflow
          const totalPages = Math.ceil(listRes.pagination.total_items / listRes.pagination.page_size) - 1;
          if (listRes.pagination.page > totalPages) {
            dispatch(changePage(index, totalPages));
            return;
          }
        }

        // Fill in minimum 150ms for transition animation
        const timeDiff = dayjs().valueOf() - timeNow;
        if (timeDiff > 0 && timeDiff < 140) {
          await sleep(140 - timeDiff);
        }
        dispatch(applyListResponse({ index, value: listRes }));
      }
    }
  };
}

export function loadMorePages(index: number): AppThunk {
  return async (dispatch, getState) => {
    const fm = getState().fileManager[index];
    if (fm.list?.pagination.next_token) {
      dispatch(navigateReconcile(index, { next_page: true }));
    } else {
      dispatch(changePage(index, (fm.list?.pagination.page ?? 0) + 1));
    }
  };
}

export function loadChild(index: number, path: string, beforeLoad?: () => void): AppThunk {
  return async (dispatch, getState) => {
    let listRes: ListResponse | null = null;
    const { fileManager } = getState();
    const current = fileManager[index].tree[path];
    if (current && current.children) {
      return;
    }
    try {
      if (beforeLoad) {
        beforeLoad();
      }
      listRes = await dispatch(
        getFileList({
          page_size: pageSize(fileManager[index]),
          uri: path,
          order_by: fileManager[index].sortBy,
          order_direction: fileManager[index].sortDirection,
        }),
      );
      dispatch(appendTreeCache({ index, value: [listRes.files, path] }));
    } catch (e) {
      console.log(e);
    }
  };
}

export function changePageSize(index: number, pageSize: number): AppThunk {
  return async (dispatch, _getState) => {
    SessionManager.set(UserSettings.PageSize, pageSize);
    dispatch(setPageSize({ index, value: pageSize }));
    dispatch(navigateReconcile(index, { sync_view: true }));
  };
}

export function changePage(index: number, page: number): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(setPage({ index, value: page }));
    dispatch(navigateReconcile(index));
  };
}

export function changeSortOption(index: number, sortBy: string, sortDirection: string): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(setSortOption({ index, value: [sortBy, sortDirection] }));
    SessionManager.set(UserSettings.SortBy, sortBy);
    SessionManager.set(UserSettings.SortDirection, sortDirection);
    dispatch(navigateReconcile(index, { sync_view: true }));
  };
}

export function updateUserCapacity(index: number): AppThunk {
  return async (dispatch, _getState) => {
    if (!SessionManager.currentLoginOrNull()) {
      return;
    }
    try {
      const capacity = await dispatch(getUserCapacity());
      dispatch(setCapacity({ index, value: capacity }));
    } catch (e) {
      console.warn("Failed to load user capacity", e);
    }
  };
}

export function fileHovered(index: number, file: FileResponse, hovered: boolean): AppThunk {
  return async (dispatch, getState) => {
    const fileManager = getState().fileManager[index];
    const hasFileSelected = Object.keys(fileManager.selected).length > 0;
    if (!hasFileSelected && hovered) {
      return;
    }
    dispatch(setMultiSelectHovered({ index, value: [file.path, hovered] }));
  };
}

export function refreshFileList(index: number): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(closeContextMenu({ index, value: undefined }));
    await dispatch(navigateReconcile(index));
    dispatch(clearSelected({ index, value: undefined }));
  };
}

export function openEmptyContextMenu(index: number, e: React.MouseEvent<HTMLElement>): AppThunk {
  return async (dispatch, _getState) => {
    e.preventDefault();
    const { x, y } = { x: e.clientX, y: e.clientY };
    dispatch(clearSelected({ index, value: undefined }));
    dispatch(
      setContextMenu({
        index,
        value: {
          open: true,
          pos: { x, y },
          type: ContextMenuTypes.empty,
          fmIndex: index,
          targets: undefined,
        },
      }),
    );
  };
}

export function openNewContextMenu(index: number, e: React.MouseEvent<HTMLElement>): AppThunk {
  return async (dispatch, _getState) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = { x: rect.x, y: rect.bottom };
    dispatch(
      setContextMenu({
        index,
        value: {
          open: true,
          pos: { x, y },
          type: ContextMenuTypes.new,
          fmIndex: index,
          targets: undefined,
        },
      }),
    );
  };
}

export function pinCurrentView(index: number): AppThunk {
  return async (dispatch, getState) => {
    const path = getState().fileManager[index].path;
    dispatch(setPinFileDialog({ open: true, uri: path }));
  };
}

export function navigateToPath(
  index: number,
  path: string,
  file: FileResponse | undefined = undefined,
  newTab: boolean = false,
): AppThunk {
  return async (dispatch, _getState) => {
    if (file) {
      path = getFileLinkedUri(file);
    }

    try {
      const crUri = new CrUri(path);
      const currentUser = SessionManager.currentLoginOrNull();
      if (crUri.id() && crUri.fs() == Filesystem.my && currentUser && currentUser.user.id == crUri.id()) {
        crUri.setUsername("");
        path = crUri.toString();
      }
    } catch (e) {}

    if (index == FileManagerIndex.selector) {
      return dispatch(setTargetPath(index, path));
    }

    const s = new URLSearchParams("?path=" + encodeURIComponent(path));
    const uri = "/home?" + s.toString();
    if (newTab) {
      // Open in new tab
      window.open(uri, "_blank");
      return;
    }
    router.navigate(uri);
  };
}

export function retrySharePassword(index: number, password: string): AppThunk {
  return async (dispatch, getState) => {
    const { fileManager } = getState();
    const fm = fileManager[index];
    if (!fm.path) {
      return;
    }
    const crUri = new CrUri(fm.path);
    crUri.setPassword(password);

    console.log(crUri.toString());
    dispatch(navigateToPath(index, crUri.toString()));
  };
}

export function searchMetadata(index: number, metaKey: string, metaValue?: string, newTab?: boolean): AppThunk {
  return async (dispatch, getState) => {
    const { fileManager } = getState();
    const fm = fileManager[index];
    const root = fm.path_root;
    if (!root) {
      return;
    }

    const rootUri = new CrUri(root);
    rootUri.addQuery(UriQuery.metadata_prefix + metaKey, metaValue ?? "");
    dispatch(navigateToPath(index, rootUri.toString(), undefined, newTab));
  };
}

export function uploadClicked(index: number, type: SelectType): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(closeContextMenu({ index, value: undefined }));
    dispatch(selectForUpload({ type }));
  };
}

export function uploadFromClipboard(index: number): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(closeContextMenu({ index, value: undefined }));
    dispatch(setUploadFromClipboardDialog(true));
  };
}

export function resetFm(index: number): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(resetFileManager(index));
    dispatch(resetDialogs());
  };
}

// Regex to split by spaces, but keep anything in quotes together
const SPACE_RE = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;

export function quickSearch(index: number, base: string, keyword: string): AppThunk {
  return async (dispatch, _getState) => {
    const crUri = new CrUri(base);
    crUri.setSearchParam({
      name: keyword.split(SPACE_RE).filter((x) => x),
      case_folding: true,
    });
    dispatch(navigateToPath(index, crUri.toString()));
    dispatch(setSearchPopup(false));
  };
}

export function advancedSearch(index: number, conditions: Condition[]): AppThunk {
  return async (dispatch, _getState) => {
    const params: SearchParam = {};
    let base = "";
    conditions.forEach((condition) => {
      switch (condition.type) {
        case ConditionType.base:
          base = condition.base_uri ?? defaultPath;
          break;
        case ConditionType.name:
          if (condition.names?.length ?? 0 > 0) {
            params.name = condition.names;
            params.name_op_or = condition.name_op_or;
            params.case_folding = condition.case_folding;
          }
          break;
        case ConditionType.type:
          params.type = condition.file_type;
          break;
        case ConditionType.tag:
          if (!params.metadata) {
            params.metadata = {};
          }
          if (condition.tags) {
            condition.tags.forEach((tag) => {
              if (params.metadata) {
                params.metadata[Metadata.tag_prefix + tag] = "";
              }
            });
          }
          break;
        case ConditionType.metadata:
          if (!params.metadata) {
            params.metadata = {};
          }
          if (condition.metadata_key) {
            params.metadata[condition.metadata_key] = condition.metadata_value ?? "";
          }
          break;
        case ConditionType.size:
          if (condition.size_gte != undefined || condition.size_lte != undefined) {
            params.size_gte = condition.size_gte;
            params.size_lte = condition.size_lte;
          }
          break;
        case ConditionType.created:
          if (condition.created_gte != undefined || condition.created_lte != undefined) {
            params.created_at_gte = condition.created_gte;
            params.created_at_lte = condition.created_lte;
          }
          break;
        case ConditionType.modified:
          if (condition.updated_gte != undefined || condition.updated_lte != undefined) {
            params.updated_at_gte = condition.updated_gte;
            params.updated_at_lte = condition.updated_lte;
          }
          break;
      }
    });

    const crUri = new CrUri(base);
    crUri.setSearchParam(params);
    dispatch(navigateToPath(index, crUri.toString()));
    dispatch(closeAdvanceSearch());
  };
}

export function openAdvancedSearch(index: number, initialKeywords?: string): AppThunk {
  return async (dispatch, getState) => {
    const current_base = getState().fileManager[index].pure_path;
    dispatch(setSearchPopup(false));
    dispatch(
      setAdvanceSearch({
        open: true,
        basePath: current_base ?? defaultPath,
        nameCondition: initialKeywords != undefined ? initialKeywords.split(SPACE_RE).filter((x) => x) : undefined,
      }),
    );
  };
}

export function clearSearch(index: number): AppThunk {
  return async (dispatch, getState) => {
    dispatch(navigateToPath(index, getState().fileManager[index]?.pure_path ?? defaultPath));
  };
}

export function selectAll(index: number): AppThunk {
  return async (dispatch, getState) => {
    const fm = getState().fileManager[index];
    const files = fm.list?.files;
    if (!files) {
      return;
    }
    dispatch(setSelected({ index, value: files }));
  };
}

export function shortCutDelete(index: number): AppThunk {
  return async (dispatch, getState) => {
    const selected = Object.values(getState().fileManager[index].selected);
    const actionOpt = getActionOpt(selected, Viewers);
    if (actionOpt.showDelete) {
      dispatch(deleteFile(index, selected));
    }
  };
}

export function inverseSelection(index: number): AppThunk {
  return async (dispatch, getState) => {
    const fm = getState().fileManager[index];
    const files = fm.list?.files;
    if (!files) {
      return;
    }
    const selected = Object.values(fm.selected);
    const newSelected = files.filter((file) => !selected.includes(file));
    dispatch(setSelected({ index, value: newSelected }));
  };
}

export function openContextUrlFromUri(index: number, uri: string, e: React.MouseEvent<HTMLElement>): AppThunk {
  return async (dispatch, getState) => {
    // try get file from tree cache
    let file = getState().fileManager[index].tree[uri]?.file;
    if (!file) {
      try {
        file = await dispatch(getFileInfo({ uri }));
      } catch (e) {
        return;
      }
    }

    dispatch(openFileContextMenu(index, file, true, e, ContextMenuTypes.file, false));
  };
}

export function setThumbToggle(index: number, value: boolean): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(setFmLoading({ index, value: true }));
    await dispatch(syncViewSettings(index, undefined, undefined, value));
    dispatch(setShowThumb({ index: index, value: value }));
    SessionManager.set(UserSettings.ShowThumb, value);
    dispatch(setFmLoading({ index, value: false }));
  };
}

export function setLayoutSetting(index: number, value: string): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(setFmLoading({ index, value: true }));
    dispatch(setLayout({ index: index, value: value }));
    SessionManager.set(UserSettings.Layout, value);
    await dispatch(syncViewSettings(index));
    dispatch(setFmLoading({ index, value: false }));
  };
}

let localCustomView: Record<string, ExplorerView> = {};

export const clearLocalCustomView = () => {
  localCustomView = {};
};

export function syncViewSettings(
  index: number,
  columns?: ListViewColumnSetting[],
  galleryWidth?: number,
  thumbOff?: boolean,
): AppThunk {
  return async (dispatch, getState) => {
    const fm = getState().fileManager[index];
    const currentLogin = SessionManager.currentLoginOrNull();
    if (!fm.list || !fm.pure_path) {
      return;
    }
    const parent = fm.list.parent;
    const crUri = new CrUri(fm.pure_path);
    const shouldUpdatedView =
      currentLogin &&
      !currentLogin.user.disable_view_sync &&
      (parent?.owned || crUri.fs() == Filesystem.trash || crUri.fs() == Filesystem.shared_with_me);

    const currentView: ExplorerView = {
      page_size: pageSize(fm),
      order: fm.sortBy ?? "created_at",
      order_direction: fm.sortDirection ?? "asc",
      view: fm.layout ?? Layouts.grid,
      thumbnail: thumbOff ?? fm.showThumb,
      columns: columns ?? fm.listViewColumns,
      gallery_width: galleryWidth ?? fm.galleryWidth ?? 110,
    };

    if (shouldUpdatedView) {
      await dispatch(
        sendPatchViewSync({
          uri: fm.pure_path,
          view: currentView,
        }),
      );
    } else {
      localCustomView[fm.pure_path] = currentView;
    }
  };
}

export function applyListColumns(index: number, columns: ListViewColumnSetting[]): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(setListViewColumns(columns));
    SessionManager.set(UserSettings.ListViewColumns, columns);
    dispatch(syncViewSettings(index, columns));
  };
}

export function applyGalleryWidth(index: number, width: number): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(setFmLoading({ index, value: true }));
    await dispatch(syncViewSettings(index, undefined, width));
    dispatch(setGalleryWidth({ index, value: width }));
    SessionManager.set(UserSettings.GalleryWidth, width);
    dispatch(setFmLoading({ index, value: false }));
  };
}

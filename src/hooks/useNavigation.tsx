import { useEffect } from "react";
import { useQuery } from "../util";
import { useAppDispatch, useAppSelector } from "../redux/hooks.ts";
import {
  beforePathChange,
  navigateReconcile,
  setTargetPath,
} from "../redux/thunks/filemanager.ts";
import { Filesystem } from "../util/uri.ts";
import { FileManagerIndex } from "../component/FileManager/FileManager.tsx";

const pathQueryKey = "path";
export const defaultPath = "cloudreve://my";
export const defaultTrashPath = "cloudreve://trash";
export const defaultSharedWithMePath =
  "cloudreve://" + Filesystem.shared_with_me;

const useNavigation = (index: number, initialPath?: string) => {
  const dispatch = useAppDispatch();
  const query = useQuery();
  const path = useAppSelector((s) => s.fileManager[index].path);

  // Update path in redux when path in query changes
  if (index === FileManagerIndex.main) {
    useEffect(() => {
      const path = query.get(pathQueryKey)
        ? (query.get(pathQueryKey) as string)
        : defaultPath;
      dispatch(setTargetPath(index, path));
    }, [query]);
  } else {
    useEffect(() => {
      dispatch(setTargetPath(index, initialPath ?? defaultPath));
    }, []);
  }

  // When path state changed, dispatch to load file list
  useEffect(() => {
    if (path) {
      dispatch(navigateReconcile(index));
      dispatch(beforePathChange(index));
    }
  }, [path]);
};

export default useNavigation;

import { ListItemIcon, ListItemText, MenuProps, Typography, useMediaQuery, useTheme } from "@mui/material";
import { bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { clearSelected } from "../../../redux/fileManagerSlice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { createShareShortcut, isMacbook } from "../../../redux/thunks/file.ts";
import { inverseSelection, pinCurrentView, refreshFileList, selectAll } from "../../../redux/thunks/filemanager.ts";
import SessionManager from "../../../session";
import { Filesystem } from "../../../util/uri.ts";
import { KeyIndicator } from "../../Frame/NavBar/SearchBar.tsx";
import ArrowSync from "../../Icons/ArrowSync.tsx";
import Border from "../../Icons/Border.tsx";
import BorderAll from "../../Icons/BorderAll.tsx";
import BorderInside from "../../Icons/BorderInside.tsx";
import FolderLink from "../../Icons/FolderLink.tsx";
import PinOutlined from "../../Icons/PinOutlined.tsx";
import StorageOutlined from "../../Icons/StorageOutlined.tsx";
import { DenseDivider, SquareMenu, SquareMenuItem } from "../ContextMenu/ContextMenu.tsx";
import { FileManagerIndex } from "../FileManager.tsx";
import { FmIndexContext } from "../FmIndexContext.tsx";

const MoreActionMenu = ({ onClose, ...rest }: MenuProps) => {
  const { t } = useTranslation();
  const fmIndex = useContext(FmIndexContext);
  const fs = useAppSelector((state) => state.fileManager[fmIndex].current_fs);
  const base = useAppSelector((state) => state.fileManager[fmIndex].path_root);
  const isSingleFile = useAppSelector((state) => state.fileManager[fmIndex].list?.single_file_view);
  const files = useAppSelector((state) => state.fileManager[fmIndex].list?.files);
  const dispatch = useAppDispatch();
  const isLogin = !!SessionManager.currentLoginOrNull();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mountPopupState = usePopupState({
    variant: "popover",
    popupId: "mount",
  });

  const onPinClicked = useCallback(() => {
    dispatch(pinCurrentView(fmIndex));
    onClose && onClose({}, "escapeKeyDown");
  }, [dispatch, onClose, fmIndex]);

  const onCreateShortcutClicked = useCallback(() => {
    if (isSingleFile && files && files.length > 0) {
      dispatch(createShareShortcut(files[0].path));
    } else if (base) {
      dispatch(createShareShortcut(base));
    }
    onClose && onClose({}, "escapeKeyDown");
  }, [dispatch, onClose, base, isSingleFile, files]);

  const onSelectAllClicked = useCallback(() => {
    onClose && onClose({}, "escapeKeyDown");
    dispatch(selectAll(fmIndex));
  }, [dispatch, onClose, fmIndex]);

  const onSelectNoneClicked = useCallback(() => {
    onClose && onClose({}, "escapeKeyDown");
    dispatch(clearSelected({ index: fmIndex, value: undefined }));
  }, [dispatch, onClose, fmIndex]);

  const onInverseSelectionClicked = useCallback(() => {
    onClose && onClose({}, "escapeKeyDown");
    dispatch(inverseSelection(fmIndex));
  }, [dispatch, onClose, fmIndex]);

  const onRefreshClicked = useCallback(() => {
    onClose && onClose({}, "escapeKeyDown");
    dispatch(refreshFileList(fmIndex));
  }, [dispatch, onClose, fmIndex]);

  return (
    <SquareMenu
      MenuListProps={{
        dense: true,
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      onClose={onClose}
      {...rest}
    >
      {isMobile && (
        <>
          <SquareMenuItem onClick={onRefreshClicked}>
            <ListItemIcon>
              <ArrowSync fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("application:fileManager.refresh")}</ListItemText>
          </SquareMenuItem>
          {fmIndex == FileManagerIndex.main && (
            <SquareMenuItem {...bindTrigger(mountPopupState)}>
              <ListItemIcon>
                <StorageOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("application:vas.switchFolderPolicy")}</ListItemText>
            </SquareMenuItem>
          )}
        </>
      )}
      {isLogin && (
        <SquareMenuItem onClick={onPinClicked}>
          <ListItemIcon>
            <PinOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("application:fileManager.pin")}</ListItemText>
        </SquareMenuItem>
      )}
      {isLogin && fs == Filesystem.share && (
        <SquareMenuItem onClick={onCreateShortcutClicked}>
          <ListItemIcon>
            <FolderLink fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("application:fileManager.saveShortcut")}</ListItemText>
        </SquareMenuItem>
      )}
      {isLogin && <DenseDivider />}
      <SquareMenuItem onClick={onSelectAllClicked}>
        <ListItemIcon>
          <BorderAll fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("application:fileManager.selectAll")}</ListItemText>
        <Typography variant="body2" color="text.secondary">
          <KeyIndicator>{isMacbook ? "⌘" : "Crtl"}</KeyIndicator>+<KeyIndicator>A</KeyIndicator>
        </Typography>
      </SquareMenuItem>
      <SquareMenuItem onClick={onSelectNoneClicked}>
        <ListItemIcon>
          <Border fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("application:fileManager.selectNone")}</ListItemText>
      </SquareMenuItem>
      <SquareMenuItem onClick={onInverseSelectionClicked}>
        <ListItemIcon>
          <BorderInside fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("application:fileManager.invertSelection")}</ListItemText>
      </SquareMenuItem>
    </SquareMenu>
  );
};

export default MoreActionMenu;

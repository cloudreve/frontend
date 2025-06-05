import { Link, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getFileInfo, sendPatchViewSync } from "../../../api/api.ts";
import { ExplorerView, FileResponse, FileType, FolderSummary, Metadata } from "../../../api/explorer.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import SessionManager from "../../../session/index.ts";
import { sizeToString } from "../../../util";
import CrUri from "../../../util/uri.ts";
import TimeBadge from "../../Common/TimeBadge.tsx";
import FileBadge from "../FileBadge.tsx";
import InfoRow from "./InfoRow.tsx";

export interface BasicInfoProps {
  target: FileResponse;
}

const BasicInfo = ({ target }: BasicInfoProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // null: not valid, undefined: not loaded, FolderSummary: loaded
  const [folderSummary, setFolderSummary] = useState<FolderSummary | undefined | null>(null);
  useEffect(() => {
    setFolderSummary(null);
  }, [target]);

  const [viewSetting, setViewSetting] = useState<ExplorerView | undefined>(undefined);

  useEffect(() => {
    setViewSetting(target?.extended_info?.view);
  }, [target]);

  const isSymbolicLink = useMemo(() => {
    return !!(target.metadata && target.metadata[Metadata.share_redirect]);
  }, [target.metadata]);
  const fileType = useMemo(() => {
    let srcType = "";
    switch (target.type) {
      case FileType.file:
        srcType = t("fileManager.file");
        break;
      case FileType.folder:
        srcType = t("fileManager.folder");
        break;
      default:
        srcType = t("fileManager.file");
    }

    if (isSymbolicLink) {
      return t("fileManager.symbolicLink", { srcType });
    }

    return srcType;
  }, [target, isSymbolicLink, t]);

  const displaySize = useCallback(
    (size: number): string => sizeToString(size) + t("fileManager.bytes", { bytes: size.toLocaleString() }),
    [t],
  );

  const storagePolicy = useMemo(() => {
    if (target.extended_info) {
      if (!target.extended_info.storage_policy) {
        return t("fileManager.unset");
      }

      return target.extended_info.storage_policy.name;
    }
    return <Skeleton variant={"text"} width={75} />;
  }, [target.extended_info, t]);

  const targetCrUri = useMemo(() => {
    return new CrUri(target.path);
  }, [target]);

  const viewSyncEnabled = useMemo(() => {
    return !SessionManager.currentLoginOrNull()?.user?.disable_view_sync;
  }, [target]);

  const restoreParent = useMemo(() => {
    if (!target.metadata || !target.metadata[Metadata.restore_uri]) {
      return null;
    }
    return new CrUri(target.metadata[Metadata.restore_uri]);
  }, [target]);

  const getFolderSummary = useCallback(() => {
    setFolderSummary(undefined);
    dispatch(getFileInfo({ uri: target.path, folder_summary: true }))
      .then((res) => {
        setFolderSummary(res.folder_summary ?? null);
      })
      .catch(() => {
        setFolderSummary(null);
      });
  }, [target, setFolderSummary, dispatch]);

  const folderSize = useMemo(() => {
    if (!folderSummary) {
      return "";
    }

    const sizeText = displaySize(folderSummary.size);
    if (!folderSummary.completed) {
      return t("fileManager.moreThan", { text: sizeText });
    }
    return sizeText;
  }, [folderSummary, t]);

  const folderChildren = useMemo(() => {
    if (!folderSummary) {
      return "";
    }

    let files = folderSummary.files.toLocaleString();
    let folders = folderSummary.folders.toLocaleString();

    if (!folderSummary.completed) {
      files += "+";
      folders += "+";
    }

    return t("application:fileManager.folderChildren", {
      files,
      folders,
    });
  }, [folderSummary, t]);

  const handleDeleteViewSetting = useCallback(() => {
    dispatch(sendPatchViewSync({ uri: target.path }))
      .then(() => {
        setViewSetting(undefined);
      })
      .catch((error) => {
        console.error("Failed to delete view setting:", error);
      });
  }, [target.path, dispatch]);

  return (
    <>
      <Typography sx={{ pt: 1 }} color="textPrimary" fontWeight={500} variant={"subtitle1"}>
        {t("application:fileManager.basicInfo")}
      </Typography>
      <InfoRow title={t("fileManager.type")} content={fileType} />
      <InfoRow
        title={t("fileManager.parentFolder")}
        content={
          <FileBadge
            clickable
            variant={"outlined"}
            sx={{ px: 1, mt: "2px" }}
            simplifiedFile={{
              path: targetCrUri.parent().toString(),
              type: FileType.folder,
            }}
          />
        }
      />
      {restoreParent && (
        <InfoRow
          title={t("fileManager.originalLocation")}
          content={
            <FileBadge
              clickable
              variant={"outlined"}
              sx={{ px: 1, mt: "2px" }}
              simplifiedFile={{
                path: restoreParent.parent().toString(),
                type: FileType.folder,
              }}
            />
          }
        />
      )}
      {target.metadata && target.metadata[Metadata.expected_collect_time] && (
        <InfoRow
          title={t("application:fileManager.expires")}
          content={
            <TimeBadge
              variant={"body2"}
              datetime={dayjs.unix(parseInt(target.metadata[Metadata.expected_collect_time]))}
            />
          }
        />
      )}
      {target.type == FileType.folder && !isSymbolicLink && (
        <>
          {!folderSummary && (
            <InfoRow
              title={t("fileManager.size")}
              content={
                folderSummary === undefined ? (
                  <Skeleton variant={"text"} width={75} />
                ) : (
                  <Link href={"#"} onClick={getFolderSummary} underline={"hover"}>
                    {t("fileManager.calculate")}
                  </Link>
                )
              }
            />
          )}
          {folderSummary && (
            <>
              <InfoRow title={t("fileManager.size")} content={folderSize} />
              <InfoRow title={t("fileManager.descendant")} content={folderChildren} />
              <InfoRow
                title={t("application:fileManager.statisticAt")}
                content={<TimeBadge variant={"body2"} datetime={folderSummary.calculated_at} />}
              />
            </>
          )}
        </>
      )}
      {target.type == FileType.file && (
        <>
          <InfoRow title={t("fileManager.size")} content={displaySize(target.size)} />
          <InfoRow
            title={t("application:fileManager.storageUsed")}
            content={
              target.extended_info ? (
                displaySize(target.extended_info.storage_used)
              ) : (
                <Skeleton variant={"text"} width={75} />
              )
            }
          />
        </>
      )}
      <InfoRow
        title={t("application:fileManager.createdAt")}
        content={<TimeBadge variant={"body2"} datetime={target.created_at} />}
      />
      <InfoRow
        title={t("application:fileManager.modifiedAt")}
        content={<TimeBadge variant={"body2"} datetime={target.updated_at} />}
      />
      {target.type == FileType.folder && viewSyncEnabled && target.owned && !restoreParent && !isSymbolicLink && (
        <InfoRow
          title={t("application:fileManager.viewSetting")}
          content={
            !!viewSetting ? (
              <>
                {t("application:fileManager.saved")}{" "}
                <Link
                  href={"#"}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteViewSetting();
                  }}
                  underline={"hover"}
                >
                  {t("application:fileManager.deleteViewSetting")}
                </Link>
              </>
            ) : (
              t("application:fileManager.notSet")
            )
          }
        />
      )}
    </>
  );
};

export default BasicInfo;

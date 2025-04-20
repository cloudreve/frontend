import { Box, Checkbox, IconButton, Link, Skeleton, TableCell, TableRow, Tooltip } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { batchDeleteFiles, getFileUrl } from "../../../api/api";
import { File } from "../../../api/dashboard";
import { FileType, Metadata } from "../../../api/explorer";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { sizeToString } from "../../../util";
import { NoWrapTableCell, NoWrapTypography } from "../../Common/StyledComponents";
import TimeBadge from "../../Common/TimeBadge";
import UserAvatar from "../../Common/User/UserAvatar";
import FileTypeIcon from "../../FileManager/Explorer/FileTypeIcon";
import UploadingTag from "../../FileManager/Explorer/UploadingTag";
import Delete from "../../Icons/Delete";
import LinkIcon from "../../Icons/LinkOutlined";
import Open from "../../Icons/Open";
import Share from "../../Icons/Share";

export interface FileRowProps {
  file?: File;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onDetails?: (id: number) => void;
  onSelect?: (id: number) => void;
  openUserDialog?: (id: number) => void;
}

const FileRow = ({
  file,
  loading,
  deleting,
  selected,
  onDelete,
  onDetails,
  onSelect,
  openUserDialog,
}: FileRowProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const onRowClick = () => {
    onDetails?.(file?.id ?? 0);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("file.confirmDelete", { file: file?.name }))).then(() => {
      if (file?.id) {
        setDeleteLoading(true);
        dispatch(batchDeleteFiles({ ids: [file.id] }))
          .then(() => {
            onDelete?.();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      }
    });
  };

  const onOpenClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenLoading(true);
    var fileLink = window.open("", "_blank");
    fileLink?.document.write("Loading file URL...");
    dispatch(getFileUrl(file?.id ?? 0))
      .then((url) => {
        fileLink ? (fileLink.location.href = url) : window.open(url, "_blank");
      })
      .finally(() => {
        setOpenLoading(false);
      })
      .catch(() => {
        fileLink && fileLink.close();
      });
  };

  const onSelectClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(file?.id ?? 0);
  };

  const uploading = useMemo(() => {
    return (
      file?.edges?.metadata && file?.edges?.metadata.some((metadata) => metadata.name === Metadata.upload_session_id)
    );
  }, [file?.edges?.metadata]);

  if (loading) {
    return (
      <TableRow sx={{ height: "43px" }}>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={30} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={200} />
          </Box>
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
      </TableRow>
    );
  }

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    openUserDialog?.(file?.owner_id ?? 0);
  };

  const sizeUsed = useMemo(() => {
    return sizeToString(file?.edges?.entities?.reduce((acc, entity) => acc + (entity.size ?? 0), 0) ?? 0);
  }, [file?.edges?.entities]);

  return (
    <TableRow hover key={file?.id} sx={{ cursor: "pointer" }} onClick={onRowClick} selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          disabled={deleting}
          size="small"
          disableRipple
          color="primary"
          onClick={onSelectClick}
          checked={selected}
        />
      </TableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{file?.id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FileTypeIcon name={file?.name ?? ""} fileType={FileType.file} />
          <NoWrapTypography variant="inherit">{file?.name}</NoWrapTypography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {uploading && <UploadingTag disabled />}
            {file?.edges?.direct_links?.length && (
              <Tooltip title={t("file.haveDirectLinks")}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LinkIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </Box>
              </Tooltip>
            )}
            {file?.edges?.shares?.length && (
              <Tooltip title={t("file.haveShares")}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Share fontSize="small" sx={{ color: "text.secondary" }} />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{sizeToString(file?.size ?? 0)}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{sizeUsed}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UserAvatar
            sx={{ width: 24, height: 24 }}
            overwriteTextSize
            user={{
              id: file?.user_hash_id ?? "",
              nickname: file?.edges?.owner?.nick ?? "",
              created_at: file?.edges?.owner?.created_at ?? "",
            }}
          />
          <NoWrapTypography variant="inherit">
            <Link
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={userClicked}
              underline="hover"
              href="#/"
            >
              {file?.edges?.owner?.nick}
            </Link>
          </NoWrapTypography>
        </Box>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          <TimeBadge datetime={file?.created_at ?? ""} variant="inherit" timeAgoThreshold={0} />
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={onOpenClick} disabled={openLoading || deleting}>
            <Open fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDeleteClick} disabled={deleteLoading || deleting}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </NoWrapTableCell>
    </TableRow>
  );
};

export default FileRow;

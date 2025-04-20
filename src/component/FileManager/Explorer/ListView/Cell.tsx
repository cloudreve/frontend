import { Box, Fade, PopoverProps, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";
import { sizeToString } from "../../../../util";
import CrUri, { SearchParam } from "../../../../util/uri.ts";
import FileSmallIcon from "../FileSmallIcon.tsx";
import { FmFile } from "../GridView/GridView.tsx";
import { ColumType, ListViewColumn } from "./Column.tsx";
// @ts-ignore
import dayjs, { Dayjs } from "dayjs";
import { bindPopover } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";
import { TransitionGroup } from "react-transition-group";
import { FileType, Metadata } from "../../../../api/explorer.ts";
import { bindDelayedHover } from "../../../../hooks/delayedHover.tsx";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { loadFileThumb } from "../../../../redux/thunks/file.ts";
import AutoHeight from "../../../Common/AutoHeight.tsx";
import { NoWrapBox } from "../../../Common/StyledComponents.tsx";
import TimeBadge from "../../../Common/TimeBadge.tsx";
import Info from "../../../Icons/Info.tsx";
import FileBadge from "../../FileBadge.tsx";
import {
  getAlbum,
  getAperture,
  getArtist,
  getCameraMake,
  getCameraModel,
  getDuration,
  getExposure,
  getExposureBias,
  getFlash,
  getFocalLength,
  getImageSize,
  getIso,
  getLensMake,
  getLensModel,
  getMediaTitle,
  getSoftware,
  takenAt,
} from "../../Sidebar/MediaInfo.tsx";
import { MediaMetaElements } from "../../Sidebar/MediaMetaCard.tsx";
import FileTagSummary from "../FileTagSummary.tsx";
import { ThumbLoadingPlaceholder, ThumbPopoverImg } from "../GridView/GridFile.tsx";
import UploadingTag from "../UploadingTag.tsx";

export interface CellProps {
  file: FmFile;
  column: ListViewColumn;
  isSelected?: boolean;
  search?: SearchParam;
  fileTag?: {
    key: string;
    value: string;
  }[];
  uploading?: boolean;
  noThumb?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
}

export interface ThumbPopoverProps {
  file: FmFile;
  popupState: PopoverProps;
  thumbWidth?: number;
  thumbHeight?: number;
}

export const ThumbPopover = memo((props: ThumbPopoverProps) => {
  const { t } = useTranslation();
  const {
    file,
    popupState: { open, ...rest },
    thumbWidth,
    thumbHeight,
  } = props;

  const dispatch = useAppDispatch();
  // undefined: not loaded, null: no thumb
  const [thumbSrc, setThumbSrc] = useState<string | undefined | null>(undefined);
  const [imageLoading, setImageLoading] = useState(true);

  const tryLoadThumbSrc = useCallback(async () => {
    const thumbSrc = await dispatch(loadFileThumb(0, file));
    setThumbSrc(thumbSrc);
  }, [dispatch, file, setThumbSrc, setImageLoading]);

  const onImgLoadError = useCallback(() => {
    setImageLoading(false);
    setThumbSrc(null);
  }, [setImageLoading, setThumbSrc]);

  useEffect(() => {
    if (open && !thumbSrc) {
      tryLoadThumbSrc();
    }
  }, [open]);

  const showPlaceholder = thumbSrc === undefined || (thumbSrc && imageLoading);

  return (
    <HoverPopover
      open={open}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      {...rest}
    >
      <AutoHeight>
        <TransitionGroup
          style={{
            width: !showPlaceholder ? "initial" : "300px",
            height: !showPlaceholder ? "100%" : "300px",
          }}
        >
          {showPlaceholder && (
            <Fade key={"loading"}>
              <ThumbLoadingPlaceholder variant={"rectangular"} />
            </Fade>
          )}
          {thumbSrc && (
            <Fade key={"image"}>
              <ThumbPopoverImg
                width={thumbWidth}
                height={thumbHeight}
                onLoad={() => setImageLoading(false)}
                onError={onImgLoadError}
                src={thumbSrc}
                draggable={false}
              />
            </Fade>
          )}
          {thumbSrc === null && (
            <Fade key={"failed"}>
              <Box sx={{ py: 0.5, px: 1, display: "flex", alignItems: "center" }} color={"text.secondary"}>
                <Info sx={{ mr: 1 }} />
                <Typography variant="body2">{t("fileManager.failedLoadPreview")}</Typography>
              </Box>
            </Fade>
          )}
        </TransitionGroup>
      </AutoHeight>
    </HoverPopover>
  );
});

const FileNameCell = memo((props: CellProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTouch = useMediaQuery("(pointer: coarse)");
  const { file, uploading, noThumb, fileTag, search, isSelected, thumbWidth, thumbHeight } = props;

  const popupState = usePopupState({
    variant: "popover",
    popupId: "thumbPreview" + file.id,
  });

  const hoverState = bindDelayedHover(popupState, 800);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box {...(noThumb || isMobile || isTouch ? {} : hoverState)}>
          <FileSmallIcon variant={"list"} selected={!!isSelected} file={file} />
        </Box>

        <Tooltip title={file.name}>
          <NoWrapBox>
            {search?.name ? (
              <Highlighter
                highlightClassName="highlight-marker"
                searchWords={search?.name}
                autoEscape={true}
                textToHighlight={file.name}
              />
            ) : (
              file.name
            )}
          </NoWrapBox>
        </Tooltip>
        {!uploading && fileTag && fileTag.length > 0 && <FileTagSummary sx={{ maxWidth: "50%" }} tags={fileTag} />}
        {uploading && <UploadingTag sx={{ maxWidth: "50%" }} />}
      </Box>
      {!noThumb && (
        <ThumbPopover
          thumbWidth={thumbWidth}
          thumbHeight={thumbHeight}
          popupState={bindPopover(popupState)}
          {...props}
        />
      )}
    </>
  );
});

interface FolderSizeCellProps {
  file: FmFile;
}

const FolderSizeCell = memo(({ file }: FolderSizeCellProps) => {
  const { t } = useTranslation();
  if (file.type == FileType.folder || file.metadata?.[Metadata.share_redirect]) {
    return <Box />;
  }
  return <Box>{sizeToString(file.size)}</Box>;
});

interface FolderDateCellProps {
  file: FmFile;
  dateType: "created" | "modified" | "expired";
}

const FolderDateCell = memo(({ file, dateType }: FolderDateCellProps) => {
  const { t } = useTranslation();
  let datetime: string | Dayjs = "";
  switch (dateType) {
    case "created":
      datetime = file.created_at;
      break;
    case "modified":
      datetime = file.updated_at;
      break;
    case "expired":
      datetime = file.metadata?.[Metadata.expected_collect_time]
        ? dayjs.unix(parseInt(file.metadata?.[Metadata.expected_collect_time]))
        : "";
  }

  if (!datetime) {
    return <Box />;
  }
  return <TimeBadge variant={"inherit"} datetime={datetime} />;
});

const FolderCell = memo(({ path }: { path: string }) => {
  return (
    <FileBadge
      clickable
      sx={{ px: 1, maxWidth: "100%" }}
      simplifiedFile={{
        path: path,
        type: FileType.folder,
      }}
    />
  );
});

const MediaElementsCell = memo(({ element }: { element?: MediaMetaElements | string }) => {
  if (!element) {
    return <Box />;
  }
  if (typeof element === "string") {
    return <Box>{element}</Box>;
  }
  return <MediaMetaElements element={element} />;
});

const Cell = memo((props: CellProps) => {
  const { t } = useTranslation();
  const { file, column, uploading, showLock, fileTag, search, isSelected } = props;
  switch (column.type) {
    case ColumType.name:
      return <FileNameCell {...props} />;
    case ColumType.size:
      return <FolderSizeCell file={file} />;
    case ColumType.date_modified:
      return <FolderDateCell file={file} dateType={"modified"} />;
    case ColumType.date_created:
      return <FolderDateCell file={file} dateType={"created"} />;
    case ColumType.parent: {
      let crUrl = new CrUri(file.path);
      return <FolderCell path={crUrl.parent().toString()} />;
    }
    case ColumType.recycle_restore_parent: {
      if (!file.metadata?.[Metadata.restore_uri]) {
        return <Box />;
      }

      let crUrl = new CrUri(file.metadata[Metadata.restore_uri]);
      return <FolderCell path={crUrl.parent().toString()} />;
    }
    case ColumType.recycle_expire:
      return <FolderDateCell file={file} dateType={"expired"} />;
    case ColumType.aperture:
      return <MediaElementsCell element={getAperture(file)} />;
    case ColumType.exposure:
      return <MediaElementsCell element={getExposure(file, t)} />;
    case ColumType.iso:
      return <MediaElementsCell element={getIso(file)} />;
    case ColumType.camera_make:
      return <MediaElementsCell element={getCameraMake(file)} />;
    case ColumType.camera_model:
      return <MediaElementsCell element={getCameraModel(file)} />;
    case ColumType.lens_make:
      return <MediaElementsCell element={getLensMake(file)} />;
    case ColumType.lens_model:
      return <MediaElementsCell element={getLensModel(file)} />;
    case ColumType.focal_length:
      return <MediaElementsCell element={getFocalLength(file)} />;
    case ColumType.exposure_bias:
      return <MediaElementsCell element={getExposureBias(file)} />;
    case ColumType.flash:
      return <MediaElementsCell element={getFlash(file, t)} />;
    case ColumType.software:
      return <MediaElementsCell element={getSoftware(file)} />;
    case ColumType.taken_at:
      return <MediaElementsCell element={takenAt(file)} />;
    case ColumType.image_size:
      return (
        <Box sx={{ display: "flex" }}>{getImageSize(file)?.map((size) => <MediaElementsCell element={size} />)}</Box>
      );
    case ColumType.title:
      return <MediaElementsCell element={getMediaTitle(file)} />;
    case ColumType.artist:
      return <MediaElementsCell element={getArtist(file)} />;
    case ColumType.album:
      return <MediaElementsCell element={getAlbum(file)} />;
    case ColumType.duration:
      return <MediaElementsCell element={getDuration(file)} />;
  }
});

export default Cell;

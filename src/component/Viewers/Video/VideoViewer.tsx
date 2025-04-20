import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import ViewerDialog, { ViewerLoading } from "../ViewerDialog.tsx";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { closeVideoViewer } from "../../../redux/globalStateSlice.ts";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { getFileEntityUrl } from "../../../api/api.ts";
import { fileExtension, fileNameNoExt, getFileLinkedUri } from "../../../util";
import Artplayer from "artplayer";
import dayjs from "dayjs";
import { FileResponse } from "../../../api/explorer.ts";
import { findSubtitleOptions } from "../../../redux/thunks/viewer.ts";
import Subtitles from "../../Icons/Subtitles.tsx";
import {
  DenseDivider,
  SquareMenuItem,
} from "../../FileManager/ContextMenu/ContextMenu.tsx";
import Checkmark from "../../Icons/Checkmark.tsx";
import SessionManager, { UserSettings } from "../../../session";
import TextEditStyle from "../../Icons/TextEditStyle.tsx";
import SubtitleStyleDialog from "./SubtitleStyleDialog.tsx";

const Player = lazy(() => import("./Artplayer.tsx"));

export interface SubtitleStyle {
  fontSize?: number;
  fontColor?: string;
}

const srcRefreshMargin = 5 * 1000;
const VideoViewer = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const viewerState = useAppSelector((state) => state.globalState.videoViewer);

  const [loaded, setLoaded] = useState(false);
  const [art, setArt] = useState<Artplayer | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentExpire = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [subtitles, setSubtitles] = useState<FileResponse[]>([]);
  const [subtitleSelected, setSubtitleSelected] = useState<FileResponse | null>(
    null,
  );
  const [subtitleStyleOpen, setSubtitleStyleOpen] = useState(false);

  const subtitleStyle = useMemo(() => {
    return SessionManager.getWithFallback(
      UserSettings.SubtitleStyle,
    ) as SubtitleStyle;
  }, []);

  // refresh video src before entity url expires
  const refreshSrc = useCallback(() => {
    if (!viewerState || !viewerState.file || !art) {
      return;
    }

    const firstLoad = !currentExpire.current;

    dispatch(
      getFileEntityUrl({
        uris: [getFileLinkedUri(viewerState.file)],
        entity: viewerState.version,
      }),
    )
      .then((res) => {
        const current = art.currentTime;

        let timeOut =
          dayjs(res.expires).diff(dayjs(), "millisecond") - srcRefreshMargin;
        if (timeOut < 0) {
          timeOut = 2000;
        }
        currentExpire.current = setTimeout(refreshSrc, timeOut);

        art.switchUrl(res.urls[0]).then(() => {
          art.currentTime = current;
        });

        if (firstLoad) {
          const subs = dispatch(findSubtitleOptions());
          setSubtitles(subs);
          if (
            subs.length > 0 &&
            subs[0].name.startsWith(fileNameNoExt(viewerState.file.name) + ".")
          ) {
            switchSubtitle(subs[0]);
          }
        }
      })
      .catch((e) => {
        console.error(e);
        onClose();
      });
  }, [viewerState?.file, art]);

  const chapters = useMemo(() => {
    if (!viewerState || !viewerState.file?.metadata) {
      return undefined;
    }

    const chapterMap: {
      [key: string]: {
        start: number;
        end: number;
        title: string;
      };
    } = {};

    Object.keys(viewerState.file.metadata).map((k) => {
      if (k.startsWith("stream:chapter_")) {
        const id = k.split("_")[1];
        // type = remove prefix
        const type = k.replace(`stream:chapter_${id}_`, "");
        if (!chapterMap[id]) {
          chapterMap[id] = {
            start: 0,
            end: 0,
            title: "",
          };
        }
        switch (type) {
          case "start_time":
            chapterMap[id].start = parseFloat(
              viewerState.file?.metadata?.[k] ?? "0",
            );
            break;
          case "end_time":
            chapterMap[id].end = parseFloat(
              viewerState.file?.metadata?.[k] ?? "0",
            );
            break;
          case "name":
            chapterMap[id].title = viewerState.file?.metadata?.[k] ?? "";
            break;
        }
      }
    });

    return Object.values(chapterMap).map((c) => ({
      start: c.start,
      end: c.end,
      title: c.title,
    }));
  }, [viewerState]);

  const switchSubtitle = useCallback(
    async (subtitle?: FileResponse) => {
      if (!art) {
        return;
      }

      setAnchorEl(null);

      if (!subtitle) {
        setSubtitleSelected(null);
        art.subtitle.show = false;
        return;
      }

      setSubtitleSelected(subtitle);
      try {
        const subtitleUrl = await dispatch(
          getFileEntityUrl({
            uris: [getFileLinkedUri(subtitle)],
          }),
        );

        art.subtitle.switch(subtitleUrl.urls[0], {
          type: fileExtension(subtitle.name) ?? "",
        });
        art.subtitle.show = true;
      } catch (e) {
        console.error(e);
        return;
      }
    },
    [art],
  );

  useEffect(() => {
    if (!art) {
      return;
    }
    art.on("ready", () => {
      art.autoHeight();
      art.autoSize();
    });
    art.query(".art-video").addEventListener(
      "leavepictureinpicture",
      () => {
        art.pause();
      },
      false,
    );
    refreshSrc();
  }, [art]);

  useEffect(() => {
    if (!viewerState || !viewerState.open) {
      if (currentExpire.current) {
        clearTimeout(currentExpire.current);
        currentExpire.current = undefined;
      }
      return;
    }

    setArt(null);
    setSubtitles([]);
    setSubtitleSelected(null);
  }, [viewerState?.open]);

  const onClose = useCallback(() => {
    dispatch(closeVideoViewer());
  }, [dispatch]);

  const openOption = useCallback(
    (e: React.MouseEvent<any>) => {
      setAnchorEl(e.currentTarget);
    },
    [dispatch],
  );

  const openSubtitleStyle = useCallback(() => {
    setSubtitleStyleOpen(true);
    setAnchorEl(null);
  }, []);

  const applySubtitleStyle = useCallback(
    (style: SubtitleStyle) => {
      SessionManager.set(UserSettings.SubtitleStyle, style);
      setSubtitleStyleOpen(false);
      if (art) {
        art.subtitle.style({
          color: style.fontColor ?? "#fff",
          fontSize: `${style.fontSize ?? 20}px`,
        });
      }
    },
    [art],
  );

  // TODO: Add artplayer-plugin-chapter after it's released to npm
  return (
    <ViewerDialog
      file={viewerState?.file}
      actions={
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={t("fileManager.subtitles")}>
            <IconButton onClick={openOption}>
              <Subtitles fontSize={"small"} />
            </IconButton>
          </Tooltip>
        </Box>
      }
      fullScreenToggle
      toggleFullScreen={() => art && (art.fullscreenWeb = true)}
      dialogProps={{
        open: !!(viewerState && viewerState.open),
        onClose: onClose,
        fullWidth: true,
        maxWidth: "md",
      }}
    >
      <SubtitleStyleDialog
        onSaveSubmit={applySubtitleStyle}
        open={subtitleStyleOpen}
        onClose={() => setSubtitleStyleOpen(false)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              minWidth: 150,
              maxWidth: 250,
            },
          },
        }}
      >
        <SquareMenuItem dense onClick={() => openSubtitleStyle()}>
          <ListItemIcon>
            <TextEditStyle fontSize={"small"} />{" "}
          </ListItemIcon>
          <ListItemText>
            {t("application:fileManager.subtitleStyles")}
          </ListItemText>
        </SquareMenuItem>
        <DenseDivider />
        {subtitles.length == 0 && (
          <Box sx={{ p: 1 }}>
            <Typography variant={"caption"} color={"text.secondary"}>
              {t("application:fileManager.noSubtitle")}
            </Typography>
          </Box>
        )}
        {subtitles.length > 0 && (
          <SquareMenuItem onClick={() => switchSubtitle()} dense>
            <em>
              <ListItemText
                primary={t("application:fileManager.disableSubtitle")}
              />
            </em>
          </SquareMenuItem>
        )}
        {subtitles.map((sub) => (
          <Tooltip title={sub.name} key={sub.id}>
            <SquareMenuItem onClick={() => switchSubtitle(sub)} dense>
              <ListItemText
                primary={sub.name}
                slotProps={{
                  primary: {
                    sx: {
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    },
                  }
                }}
              />
              {subtitleSelected?.id == sub.id && (
                <ListItemIcon sx={{ minWidth: "0!important" }}>
                  <Checkmark />
                </ListItemIcon>
              )}
            </SquareMenuItem>
          </Tooltip>
        ))}
      </Menu>
      <Suspense fallback={<ViewerLoading minHeight={"calc(100vh - 350px)"} />}>
        <Player
          key={viewerState?.file?.path}
          sx={{
            width: "100%",
            height: "100%",
            minHeight: "calc(100vh - 350px)",
          }}
          chapters={chapters}
          getInstance={(instance) => setArt(instance)}
          option={{
            title: viewerState?.file?.name,
            theme: theme.palette.primary.main,
            flip: true,
            setting: true,
            playbackRate: true,
            aspectRatio: true,
            hotkey: true,
            pip: true,
            fullscreen: true,
            fullscreenWeb: true,
            autoHeight: true,
            whitelist: ["*"],
            moreVideoAttr: {
              "webkit-playsinline": true,
              playsInline: true,
            },
            subtitle: {
              style: {
                color: subtitleStyle.fontColor ?? "#fff",
                fontSize: `${subtitleStyle.fontSize ?? 20}px`,
              },
            },
            plugins: [],
            lang: t("artPlayerLocaleCode", { ns: "common" }), // TODO: review
          }}
        />
      </Suspense>
    </ViewerDialog>
  );
};

export default VideoViewer;

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Button, Paper } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import { useDispatch } from "react-redux";
import pathHelper from "../../utils/page";
import UseFileSubTitle from "../../hooks/fileSubtitle";
import { getPreviewURL } from "../../middleware/Api";
import { useHistory } from "react-router-dom";
import { basename, fileNameNoExt, isMobileSafari } from "../../utils";
import { list } from "../../services/navigate";
import { getViewerURL } from "../../redux/explorer/action";
import { subtitleSuffix, videoPreviewSuffix } from "../../config";
import { toggleSnackbar } from "../../redux/explorer";
import { pathJoin } from "../Uploader/core/utils";
import { Launch, PlaylistPlay, Subtitles } from "@material-ui/icons";
import TextLoading from "../Placeholder/TextLoading";
import SelectMenu from "./SelectMenu";
import { getDownloadURL } from "../../services/file";

const Artplayer = React.lazy(() =>
    import(
        /* webpackChunkName: "artplayer" */ "artplayer/examples/react/Artplayer"
    )
);

const externalPlayers = [
    {
        name: "PotPlayer",
        url: (source, title) => `potplayer://${source}`,
    },
    {
        name: "VLC",
        url: (source, title) => `vlc://${source}`,
    },
    {
        name: "IINA",
        url: (source, title) => `iina://weblink?url=${source}`,
    },
    {
        name: "nPlayer",
        url: (source, title) => `nplayer-${source}`,
    },
    {
        name: "MXPlayer (Free)",
        url: (source, title) =>
            `intent:${source}#Intent;package=com.mxtech.videoplayer.ad;S.title=${title};end`,
    },
    {
        name: "MXPlayer (Pro)",
        url: (source, title) =>
            `intent:${source}#Intent;package=com.mxtech.videoplayer.pro;S.title=${title};end`,
    },
];

const useStyles = makeStyles((theme) => ({
    layout: {
        width: "auto",
        marginTop: "30px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto",
        },
        marginBottom: 50,
    },
    player: {
        borderRadius: "4px",
        height: 600,
    },
    actions: {
        marginTop: theme.spacing(2),
    },
    actionButton: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function VideoViewer() {
    const math = useRouteMatch();
    const location = useLocation();
    const query = useQuery();
    const { id } = useParams();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const { title, path } = UseFileSubTitle(query, math, location);
    const theme = useTheme();
    const [art, setArt] = useState(null);
    const history = useHistory();
    const [files, setFiles] = useState([]);
    const [subtitles, setSubtitles] = useState([]);
    const [playlist, setPlaylist] = useState([]);
    const [subtitleOpen, setSubtitleOpen] = useState(null);
    const [subtitleSelected, setSubtitleSelected] = useState("");
    const [playlistOpen, setPlaylistOpen] = useState(null);
    const [externalPlayerOpen, setExternalPlayerOpen] = useState(null);
    const isShare = pathHelper.isSharePage(location.pathname);

    useEffect(() => {
        art &&
            art.on("ready", () => {
                art.autoHeight = true;
            });
        return () => {
            if (
                art !== null &&
                !isMobileSafari() &&
                document.pictureInPictureEnabled &&
                art.playing
            ) {
                art.pip = true;
                art.query(".art-video").addEventListener(
                    "leavepictureinpicture",
                    () => {
                        art.pause();
                    },
                    false
                );
            }
        };
    }, [art]);

    const classes = useStyles();

    useEffect(() => {
        if (art !== null) {
            const newURL = getPreviewURL(
                isShare,
                id,
                query.get("id"),
                query.get("share_path")
            );
            if (newURL !== art.url) {
                if (art.subtitle) {
                    art.subtitle.show = false;
                }
                art.switchUrl(newURL);
                if (path && path !== "") {
                    list(
                        basename(path),
                        isShare ? { key: id } : null,
                        "",
                        ""
                    ).then((res) => {
                        setFiles(
                            res.data.objects.filter((o) => o.type === "file")
                        );
                        setPlaylist(
                            res.data.objects.filter(
                                (o) =>
                                    o.type === "file" &&
                                    videoPreviewSuffix.indexOf(
                                        o.name.split(".").pop().toLowerCase()
                                    ) !== -1
                            )
                        );
                    });
                }
            }
        }
    }, [art, id, location, path]);

    const switchSubtitle = (f) => {
        if (art !== null) {
            const fileType = f.name.split(".").pop().toLowerCase();
            art.subtitle.switch(
                getPreviewURL(
                    isShare,
                    id,
                    f.id,
                    pathJoin([basename(query.get("share_path")), f.name])
                ),
                {
                    type: fileType,
                }
            );
            art.subtitle.show = true;
            setSubtitleSelected(f.name);
            ToggleSnackbar("top", "center", `字幕切换到：${f.name} `, "info");
        }
    };

    useEffect(() => {
        if (files.length > 0) {
            const options = files.filter((f) => {
                const fileType = f.name.split(".").pop().toLowerCase();
                if (subtitleSuffix.indexOf(fileType) !== -1) {
                    if (fileNameNoExt(f.name) === fileNameNoExt(title)) {
                        switchSubtitle(f);
                    }
                    return true;
                }
                return false;
            });
            setSubtitles(options);
        }
    }, [files]);

    const switchVideo = (file) => {
        if (isShare) {
            file.key = id;
        }
        if (isMobileSafari()) {
            window.location.href = getViewerURL("video", file, isShare);
        } else {
            history.push(getViewerURL("video", file, isShare));
        }
    };

    const setSubtitle = (sub) => {
        setSubtitleOpen(null);
        switchSubtitle(sub);
    };

    const startSelectSubTitle = (e) => {
        if (subtitles.length === 0) {
            ToggleSnackbar(
                "top",
                "right",
                `视频目录下没有可用字幕文件 (支持：ASS/SRT/VTT)`,
                "warning"
            );
            return;
        }
        setSubtitleOpen(e.currentTarget);
    };

    const openInExternalPlayer = (player) => {
        const current = { name: title };
        current.id = query.get("id");
        current.path = basename(path);
        if (isShare) {
            current.key = id;
        }

        setExternalPlayerOpen(null);
        getDownloadURL(current)
            .then((response) => {
                window.location.assign(player.url(response.data, title));
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    return (
        <div className={classes.layout}>
            <Paper className={classes.root} elevation={1}>
                <Suspense fallback={<TextLoading />}>
                    <Artplayer
                        option={{
                            title: title,
                            theme: theme.palette.secondary.main,
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
                        }}
                        className={classes.player}
                        getInstance={(a) => setArt(a)}
                    />
                </Suspense>
            </Paper>
            <div className={classes.actions}>
                <Button
                    onClick={startSelectSubTitle}
                    className={classes.actionButton}
                    startIcon={<Subtitles />}
                    variant="outlined"
                >
                    选择字幕
                </Button>
                {playlist.length >= 2 && (
                    <Button
                        onClick={(e) => setPlaylistOpen(e.currentTarget)}
                        className={classes.actionButton}
                        startIcon={<PlaylistPlay />}
                        variant="outlined"
                    >
                        播放列表
                    </Button>
                )}
                <Button
                    onClick={(e) => setExternalPlayerOpen(e.currentTarget)}
                    className={classes.actionButton}
                    startIcon={<Launch />}
                    variant="outlined"
                >
                    用外部播放器打开
                </Button>
            </div>
            <SelectMenu
                selected={subtitleSelected}
                options={subtitles}
                callback={setSubtitle}
                anchorEl={subtitleOpen}
                handleClose={() => setSubtitleOpen(null)}
            />
            <SelectMenu
                selected={title}
                options={playlist}
                callback={switchVideo}
                anchorEl={playlistOpen}
                handleClose={() => setPlaylistOpen(null)}
            />
            <SelectMenu
                showIcon={false}
                options={externalPlayers}
                callback={openInExternalPlayer}
                anchorEl={externalPlayerOpen}
                handleClose={() => setExternalPlayerOpen(null)}
            />
        </div>
    );
}

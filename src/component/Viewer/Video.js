import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Button, Paper } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import { useDispatch, useSelector } from "react-redux";
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
import { Launch, PlaylistPlay, Subtitles/*, SubtitlesOutlined*/ } from "@material-ui/icons";
import TextLoading from "../Placeholder/TextLoading";
import SelectMenu from "./SelectMenu";
import { getDownloadURL } from "../../services/file";
import { sortMethodFuncs } from "../FileManager/Sort";
import { useTranslation } from "react-i18next";

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
        marginTop: 30,
        marginBottom: 20,
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto",
        },
    },
    player: {
        height: "100vh",
        maxHeight: "calc(100vh - 180px)",
    },
    actions: {
        marginTop: theme.spacing(2),
    },
    actionButton: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    "@global": {
        "video,.art-video-player,.art-bottom": {
            borderRadius: theme.shape.borderRadius,
        }
    }
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function VideoViewer() {
    const { t } = useTranslation();
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
    const sortMethod = useSelector((state) => state.viewUpdate.sortMethod);
    const sortFunc = sortMethodFuncs[sortMethod];

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
                            res.data.objects.sort(sortFunc).filter((o) => o.type === "file")
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
            // if (f.name === subtitleSelected) {
            //     setSubtitleSelected('');
            //     art.subtitle.show = false;
            //     return;
            // }
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
            ToggleSnackbar(
                "top",
                "center",
                t("fileManager.subtitleSwitchTo", {
                    subtitle: f.name,
                }),
                "info"
            );
        }
    };

    useEffect(() => {
        if (files.length > 0) {
            const fileNameMatch = fileNameNoExt(title) + ".";
            const options = files.filter((f) => {
                const fileType = f.name.split(".").pop().toLowerCase();
                return subtitleSuffix.indexOf(fileType) !== -1;
            }).sort((a, b) => {
                return (a.name.startsWith(fileNameMatch) && !b.name.startsWith(fileNameMatch)) ? -1 : 0;
            });
            if (options.length > 0 && options[0].name.startsWith(fileNameMatch)) {
                switchSubtitle(options[0]);
            }
            setSubtitles(options);
        }
    }, [files]);

    const switchVideo = (file) => {
        setSubtitleSelected('');
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
                t("fileManager.noSubtitleAvailable"),
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
                            lang: t("artPlayerLocaleCode", { ns: "common" }),
                            subtitle: {
                                style: {
                                    color: 'var(--theme)', //#fe9200
                                    // fontSize: '22px',// bottom: '15px',
                                    'text-shadow': '#0009 1px 0 1px, #0009 0 1px 1px, #0009 -1px 0 1px, #0009 0 -1px 1px, #0009 1px 1px 1px, #0009 -1px -1px 1px, #0009 1px -1px 1px, #0009 -1px 1px 1px',
                                }
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
                    startIcon={/*(subtitleSelected !== '' && !art.subtitle.show) ? (<SubtitlesOutlined />) : */(<Subtitles />)}
                    variant="outlined"
                    onContextMenu={(e) => {
                        e.preventDefault();
                        if (subtitleSelected !== '') {
                            if (art.subtitle.show) {
                                art.subtitle.show = false;
                            } else {
                                art.subtitle.show = true;
                            }
                        }
                    }}
                >
                    {t("fileManager.subtitle")}
                </Button>
                {playlist.length >= 2 && (
                    <Button
                        onClick={(e) => setPlaylistOpen(e.currentTarget)}
                        className={classes.actionButton}
                        startIcon={<PlaylistPlay />}
                        variant="outlined"
                    >
                        {t("fileManager.playlist")}
                    </Button>
                )}
                <Button
                    onClick={(e) => setExternalPlayerOpen(e.currentTarget)}
                    className={classes.actionButton}
                    startIcon={<Launch />}
                    variant="outlined"
                >
                    {t("fileManager.openInExternalPlayer")}
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

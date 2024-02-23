import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    makeStyles,
    MenuItem,
    TextField,
} from "@material-ui/core";
import PathSelector from "../FileManager/PathSelector";
import { useDispatch } from "react-redux";
import API, { AppError } from "../../middleware/Api";
import { setModalsLoading, toggleSnackbar } from "../../redux/explorer";
import { Trans, useTranslation } from "react-i18next";
import { DnsOutlined, FolderOpenOutlined } from "@material-ui/icons";
import { pathBack } from "../../utils";
import InputAdornment from "@material-ui/core/InputAdornment";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import LinkIcon from "@material-ui/icons/Link";
import Auth from "../../middleware/Auth";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
    contentFix: {
        padding: "10px 24px 0px 24px",
    },
    wrapper: {
        margin: theme.spacing(1),
        position: "relative",
    },
    buttonProgress: {
        color: theme.palette.secondary.light,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formGroup: {
        display: "flex",
        marginBottom: theme.spacing(3),
    },
    forumInput: {
        flexGrow: 1,
    },
}));

export default function RemoteDownload(props) {
    const { t } = useTranslation();
    const [selectPathOpen, setSelectPathOpen] = useState(false);
    const [selectedPath, setSelectedPath] = useState("");
    const [selectedPathName, setSelectedPathName] = useState("");
    const [downloadTo, setDownloadTo] = useState("");
    const [url, setUrl] = useState("");
    const [nodes, setNodes] = useState([]);
    const [nodesLoading, setNodesLoading] = useState(false);
    const [preferredNode, setPreferredNode] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const user = Auth.GetUser();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        if (props.open) {
            setDownloadTo(props.presentPath);

            if (user.group.selectNode && nodes.length === 0) {
                setNodesLoading(true);
                API.get("/user/setting/nodes")
                    .then((response) => {
                        setNodes(response.data);
                        setNodesLoading(false);
                    })
                    .catch(() => {
                        setNodes([]);
                        setNodesLoading(false);
                    });
            }
        }
    }, [props.open]);

    const setDownloadToPath = (folder) => {
        const path =
            folder.path === "/"
                ? folder.path + folder.name
                : folder.path + "/" + folder.name;
        setSelectedPath(path);
        setSelectedPathName(folder.name);
    };

    const selectPath = () => {
        setDownloadTo(selectedPath === "//" ? "/" : selectedPath);
        setSelectPathOpen(false);
    };

    const submitTorrentDownload = (e) => {
        e.preventDefault();
        props.setModalsLoading(true);
        API.post("/aria2/torrent/" + props.torrent.id, {
            dst: downloadTo === "//" ? "/" : downloadTo,
            preferred_node: preferredNode,
        })
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("modals.taskCreated"),
                    "success"
                );
                props.onClose();
                props.setModalsLoading(false);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "warning");
                props.setModalsLoading(false);
            });
    };

    const submitDownload = (e) => {
        e.preventDefault();
        props.setModalsLoading(true);
        API.post("/aria2/url", {
            url: url.split("\n"),
            dst: downloadTo === "//" ? "/" : downloadTo,
            preferred_node: preferredNode,
        })
            .then((response) => {
                const failed = response.data
                    .filter((r) => r.code !== 0)
                    .map((r) => new AppError(r.msg, r.code, r.error).message);
                if (failed.length > 0) {
                    ToggleSnackbar(
                        "top",
                        "right",
                        t("modals.taskCreateFailed", {
                            failed: failed.length,
                            details: failed.join(","),
                        }),
                        "warning"
                    );
                } else {
                    ToggleSnackbar(
                        "top",
                        "right",
                        t("modals.taskCreated"),
                        "success"
                    );
                }

                props.onClose();
                props.setModalsLoading(false);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                props.setModalsLoading(false);
            });
    };

    const classes = useStyles();

    return (
        <>
            <Dialog
                open={props.open}
                onClose={props.onClose}
                aria-labelledby="form-dialog-title"
                fullWidth
            >
                <DialogTitle id="form-dialog-title">
                    {t("modals.newRemoteDownloadTitle")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <div className={classes.formGroup}>
                            <div className={classes.forumInput}>
                                <TextField
                                    variant={"outlined"}
                                    label={t("modals.remoteDownloadURL")}
                                    autoFocus
                                    fullWidth
                                    disabled={props.torrent}
                                    multiline
                                    value={
                                        props.torrent ? props.torrent.name : url
                                    }
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder={t(
                                        "modals.remoteDownloadURLDescription"
                                    )}
                                    InputProps={{
                                        startAdornment: !isMobile && (
                                            <InputAdornment position="start">
                                                <LinkIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>
                        </div>
                        <div className={classes.formGroup}>
                            <div className={classes.forumInput}>
                                <TextField
                                    variant={"outlined"}
                                    fullWidth
                                    value={downloadTo}
                                    onChange={(e) =>
                                        setDownloadTo(e.target.value)
                                    }
                                    className={classes.input}
                                    label={t("modals.remoteDownloadDst")}
                                    InputProps={{
                                        startAdornment: !isMobile && (
                                            <InputAdornment position="start">
                                                <FolderOpenOutlined />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button
                                                    className={classes.button}
                                                    color="primary"
                                                    onClick={() =>
                                                        setSelectPathOpen(true)
                                                    }
                                                >
                                                    {t(
                                                        "navbar.addTagDialog.selectFolder"
                                                    )}
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <br />
                            </div>
                        </div>
                        {user.group.selectNode && (
                            <div className={classes.formGroup}>
                                <div className={classes.forumInput}>
                                    <FormControl
                                        variant="outlined"
                                        fullWidth
                                        className={classes.formControl}
                                    >
                                        <InputLabel id="demo-simple-select-label">
                                            {t("modals.remoteDownloadNode")}
                                        </InputLabel>
                                        <Select
                                            startAdornment={
                                                !isMobile && (
                                                    <InputAdornment position="start">
                                                        {nodesLoading ? (
                                                            <CircularProgress
                                                                size={24}
                                                            />
                                                        ) : (
                                                            <DnsOutlined />
                                                        )}
                                                    </InputAdornment>
                                                )
                                            }
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            label={t(
                                                "modals.remoteDownloadNode"
                                            )}
                                            value={preferredNode}
                                            onChange={(e) =>
                                                setPreferredNode(e.target.value)
                                            }
                                        >
                                            <MenuItem value={0}>
                                                <em>
                                                    {t(
                                                        "modals.remoteDownloadNodeAuto"
                                                    )}
                                                </em>
                                            </MenuItem>
                                            {nodes.map((node) => (
                                                <MenuItem
                                                    key={node.id}
                                                    value={node.id}
                                                >
                                                    {node.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <br />
                                </div>
                            </div>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose}>
                        {t("cancel", { ns: "common" })}
                    </Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={
                                props.torrent
                                    ? submitTorrentDownload
                                    : submitDownload
                            }
                            color="primary"
                            disabled={
                                (url === "" && props.torrent === null) ||
                                downloadTo === "" ||
                                props.modalsLoading
                            }
                        >
                            {t("modals.createTask")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

            <Dialog
                open={selectPathOpen}
                onClose={() => setSelectPathOpen(false)}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {t("modals.remoteDownloadDst")}
                </DialogTitle>
                <PathSelector
                    presentPath={pathBack(props.presentPath)}
                    selected={[]}
                    onSelect={setDownloadToPath}
                />

                {selectedPathName !== "" && (
                    <DialogContent className={classes.contentFix}>
                        <DialogContentText>
                            <Trans
                                i18nKey="modals.downloadTo"
                                values={{
                                    name: selectedPathName,
                                }}
                                components={[<strong key={0} />]}
                            />
                        </DialogContentText>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={() => setSelectPathOpen(false)}>
                        {t("cancel", { ns: "common" })}
                    </Button>
                    <Button
                        onClick={selectPath}
                        color="primary"
                        disabled={selectedPath === ""}
                    >
                        {t("ok", { ns: "common" })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

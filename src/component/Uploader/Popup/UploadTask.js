import React, { useMemo, useState } from "react";
import {
    Divider,
    IconButton,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    makeStyles,
    Tooltip,
} from "@material-ui/core";
import TypeIcon from "../../FileManager/TypeIcon";
import { useUpload } from "../UseUpload";
import { Status } from "../core/uploader/base";
import { UploaderError } from "../core/errors";
import { sizeToString } from "../../../utils";
import { darken, lighten } from "@material-ui/core/styles/colorManipulator";
import { useTheme } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from "@material-ui/icons/Refresh";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
    progressContent: {
        position: "relative",
        zIndex: 9,
    },
    progress: {
        transition: "width .4s linear",
        zIndex: 1,
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
    },
    progressContainer: {
        position: "relative",
    },
    listAction: {
        marginLeft: 20,
        marginRight: 20,
    },
    fileName: {
        wordBreak: "break-all",
        [theme.breakpoints.up("sm")]: {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
    },
    successStatus: {
        color: theme.palette.success.main,
    },
    errorStatus: {
        color: theme.palette.warning.main,
        wordBreak: "break-all",
    },
    disabledBadge: {
        marginLeft: theme.spacing(1),
        height: 18,
    },
    delete: {
        zIndex: 9,
    },
    fileNameContainer: {
        display: "flex",
        alignItems: "center",
    },
}));

const getSpeedText = (speed, speedAvg, useSpeedAvg) => {
    let displayedSpeed = speedAvg;
    if (!useSpeedAvg) {
        displayedSpeed = speed;
    }

    return `${sizeToString(displayedSpeed ? displayedSpeed : 0)} /s`;
};

export default function UploadTask({ uploader, useAvgSpeed, onCancel }) {
    const classes = useStyles();
    const theme = useTheme();
    const { status, error, progress, speed, speedAvg, retry } = useUpload(
        uploader
    );
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [loading, setLoading] = useState(false);

    const statusText = useMemo(() => {
        let errMsg;
        switch (status) {
            case Status.preparing:
                return <div>准备中...</div>;
            case Status.error:
                errMsg = error.message;
                if (error instanceof UploaderError) {
                    errMsg = error.Message("");
                }

                return (
                    <div className={classes.errorStatus}>
                        {errMsg}
                        <br />
                    </div>
                );
            case Status.processing:
                if (progress) {
                    return (
                        <div>
                            {`${getSpeedText(
                                speed,
                                speedAvg,
                                useAvgSpeed
                            )} 已上传 ${sizeToString(
                                progress.total.loaded
                            )} , 共 ${sizeToString(
                                progress.total.size
                            )} - ${progress.total.percent.toFixed(2)}%`}
                        </div>
                    );
                }
                break;
            default:
                return <div>未知</div>;
        }
    }, [status, error, progress, speed, speedAvg, useAvgSpeed]);

    const resumeLabel = useMemo(
        () =>
            uploader.task.resumed && !fullScreen ? (
                <Chip
                    className={classes.disabledBadge}
                    size="small"
                    label={"断点续传"}
                />
            ) : null,
        [status, fullScreen]
    );

    const progressBar = useMemo(
        () =>
            status === Status.processing && progress ? (
                <div
                    style={{
                        backgroundColor:
                            theme.palette.type === "light"
                                ? lighten(theme.palette.primary.main, 0.8)
                                : darken(theme.palette.background.paper, 0.2),
                        width: progress.total.percent + "%",
                    }}
                    className={classes.progress}
                />
            ) : null,
        [status, progress, theme]
    );

    const cancel = () => {
        setLoading(true);
        uploader.cancel().then(() => {
            setLoading(false);
            onCancel(uploader);
        });
    };

    const secondaryAction = useMemo(() => {
        if (status === Status.error) {
            return (
                <Tooltip title={"重试"}>
                    <IconButton aria-label="Delete" onClick={() => retry()}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            );
        }

        return (
            <Tooltip title={"取消并删除"}>
                <IconButton
                    aria-label="Delete"
                    disabled={loading}
                    onClick={() => cancel()}
                >
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        );
    }, [status, loading]);

    return (
        <>
            <div className={classes.progressContainer}>
                {progressBar}
                <ListItem className={classes.progressContent} button>
                    <TypeIcon fileName={uploader.task.name} isUpload />
                    <ListItemText
                        className={classes.listAction}
                        primary={
                            <div className={classes.fileNameContainer}>
                                <div className={classes.fileName}>
                                    {uploader.task.name}
                                </div>
                                <div>{resumeLabel}</div>
                            </div>
                        }
                        secondary={statusText}
                    />
                    <ListItemSecondaryAction className={classes.delete}>
                        {secondaryAction}
                    </ListItemSecondaryAction>
                </ListItem>
            </div>
            <Divider />
        </>
    );
}

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, CircularProgress, makeStyles } from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import PublishIcon from "@material-ui/icons/Publish";
import { useDispatch, useSelector } from "react-redux";
import AutoHidden from "./AutoHidden";
import statusHelper from "../../utils/page";
import Backdrop from "@material-ui/core/Backdrop";
import { FilePlus, FolderUpload } from "mdi-material-ui";
import { green } from "@material-ui/core/colors";
import { SelectType } from "../Uploader/core";
import {
    openCreateFileDialog,
    openCreateFolderDialog,
    toggleSnackbar,
} from "../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
    fab: {
        margin: 0,
        top: "auto",
        right: 20,
        bottom: 20,
        left: "auto",
        zIndex: 5,
        position: "fixed",
    },
    badge: {
        position: "absolute",
        bottom: 26,
        top: "auto",
        zIndex: 9999,
        right: 7,
    },
    "@global": {
        ".MuiSpeedDialAction-staticTooltipLabel": {
            whiteSpace: "nowrap",
        },
    },
    fabProgress: {
        color: green[500],
        position: "absolute",
        bottom: -6,
        left: -6,
        zIndex: 1,
    },
    buttonSuccess: {
        backgroundColor: green[500],
        "&:hover": {
            backgroundColor: green[700],
        },
    },
}));

export default function UploadButton(props) {
    const { t } = useTranslation("application", { keyPrefix: "fileManager" });
    const [open, setOpen] = useState(false);
    const [queued, setQueued] = useState(5);
    const path = useSelector((state) => state.navigator.path);
    const classes = useStyles();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const OpenNewFolderDialog = useCallback(
        () => dispatch(openCreateFolderDialog()),
        [dispatch]
    );
    const OpenNewFileDialog = useCallback(
        () => dispatch(openCreateFileDialog()),
        [dispatch]
    );

    useEffect(() => {
        setQueued(props.Queued);
    }, [props.Queued]);

    const uploadClicked = () => {
        if (open) {
            if (queued !== 0) {
                props.openFileList();
            } else {
                props.selectFile(path);
            }
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const circularProgress = useMemo(() => {
        if (props.progress.totalSize > 0) {
            return (
                <CircularProgress
                    key={1}
                    size={68}
                    variant="determinate"
                    value={
                        (props.progress.processedSize /
                            props.progress.totalSize) *
                        100
                    }
                    className={classes.fabProgress}
                />
            );
        }
    }, [classes, props.progress]);

    return (
        <AutoHidden enable hide={props.taskListOpen}>
            <Badge
                badgeContent={queued}
                classes={{
                    badge: classes.badge, // class name, e.g. `root-x`
                }}
                className={classes.fab}
                invisible={queued === 0}
                color="primary"
            >
                <Backdrop open={open && statusHelper.isMobile()} />
                <SpeedDial
                    hidden={false}
                    tooltipTitle={t("uploadFiles")}
                    icon={
                        <SpeedDialIcon
                            openIcon={
                                !statusHelper.isMobile() && <PublishIcon />
                            }
                        />
                    }
                    onClose={handleClose}
                    FabProps={{
                        onClick: () =>
                            !statusHelper.isMobile() && uploadClicked(),
                        color: "secondary",
                    }}
                    onOpen={handleOpen}
                    open={open}
                    ariaLabel={""}
                >
                    {statusHelper.isMobile() && (
                        <SpeedDialAction
                            key="UploadFile"
                            icon={<PublishIcon />}
                            tooltipOpen
                            tooltipTitle={t("uploadFiles")}
                            onClick={() => uploadClicked()}
                            title={t("uploadFiles")}
                        />
                    )}
                    {!statusHelper.isMobile() && (
                        <SpeedDialAction
                            key="UploadFolder"
                            icon={<FolderUpload />}
                            tooltipOpen
                            tooltipTitle={t("uploadFolder")}
                            onClick={() =>
                                props.selectFile(path, SelectType.Directory)
                            }
                            title={t("uploadFolder")}
                        />
                    )}
                    <SpeedDialAction
                        key="NewFolder"
                        icon={<CreateNewFolderIcon />}
                        tooltipOpen
                        tooltipTitle={t("newFolder")}
                        onClick={() => OpenNewFolderDialog()}
                        title={t("newFolder")}
                    />
                    <SpeedDialAction
                        key="NewFile"
                        icon={<FilePlus />}
                        tooltipOpen
                        tooltipTitle={t("newFile")}
                        onClick={() => OpenNewFileDialog()}
                        title={t("newFile")}
                    />
                </SpeedDial>
                {circularProgress}
            </Badge>
        </AutoHidden>
    );
}

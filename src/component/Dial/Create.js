import React, { useCallback, useState, useEffect } from "react";
import { makeStyles, Badge } from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import PublishIcon from "@material-ui/icons/Publish";
import {openCreateFolderDialog, openRemoteDownloadDialog, toggleSnackbar} from "../../actions";
import {useDispatch} from "react-redux";
import AutoHidden from "./AutoHidden";
import statusHelper from "../../untils/page"
import Backdrop from "@material-ui/core/Backdrop";
import {CloudDownload} from "@material-ui/icons";
import Auth from "../../middleware/Auth";
import {FolderUpload} from "mdi-material-ui";

const useStyles = makeStyles(() => ({
    fab: {
        margin: 0,
        top: "auto",
        right: 20,
        bottom: 20,
        left: "auto",
        zIndex: 5,
        position: "fixed"
    },
    badge: {
        position: "absolute",
        bottom: 26,
        top: "auto",
        zIndex: 9999,
        right: 7
    }
}));

export default function UploadButton(props) {
    const [open, setOpen] = useState(false);
    const [queued, setQueued] = useState(5);

    const classes = useStyles();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const OpenNewFolderDialog = useCallback(
        () =>
            dispatch(openCreateFolderDialog()),
        [dispatch]
    );
    const OpenRemoteDownloadDialog = useCallback(
        () =>
            dispatch(openRemoteDownloadDialog()),
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
                openUpload("uploadFileForm");
            }
        }
    };

    const openUpload = id =>{
        let uploadButton = document.getElementsByClassName(
            id
        )[0];
        if (document.body.contains(uploadButton)) {
            uploadButton.click();
        } else {
            ToggleSnackbar(
                "top",
                "right",
                "上传组件还未加载完成",
                "warning"
            );
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const user = Auth.GetUser();

    return (
        <AutoHidden enable>
            <Badge
                badgeContent={queued}
                classes={{
                    badge: classes.badge // class name, e.g. `root-x`
                }}
                className={classes.fab}
                invisible={queued === 0}
                color="primary"
            >
                <Backdrop open={open && statusHelper.isMobile()} />
                <SpeedDial
                    ariaLabel="SpeedDial openIcon example"
                    hidden={false}
                    tooltipTitle="上传文件"
                    icon={<SpeedDialIcon openIcon={!statusHelper.isMobile()&&<PublishIcon />} />}
                    onClose={handleClose}
                    FabProps={{
                        onClick: () => !statusHelper.isMobile() && uploadClicked(),
                        color: "secondary",
                    }}
                    onOpen={handleOpen}
                    open={open}
                >
                    {statusHelper.isMobile() && <SpeedDialAction
                        key="NewFolder"
                        icon={<PublishIcon />}
                        tooltipTitle="上传文件"
                        onClick= {() => uploadClicked()}
                        title={"上传文件"}/>}
                    {!statusHelper.isMobile() && <SpeedDialAction
                        key="NewFolder"
                        icon={<FolderUpload />}
                        tooltipTitle="上传目录"
                        onClick= {() => openUpload("uploadFolderForm")}
                        title={"上传目录"}/>}
                    <SpeedDialAction
                        key="NewFolder"
                        icon={<CreateNewFolderIcon />}
                        tooltipTitle="新目录"
                        onClick= {() => OpenNewFolderDialog()}
                        title={"新目录"}/>
                    {user.group.allowRemoteDownload&&
                    <SpeedDialAction
                        key="NewDownload"
                        icon={<CloudDownload />}
                        tooltipTitle="离线下载"
                        onClick= {() => OpenRemoteDownloadDialog()}
                        title={"离线下载"}/>
                    }

                </SpeedDial>
            </Badge>
        </AutoHidden>
    );
}

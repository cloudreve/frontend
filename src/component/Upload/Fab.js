import React, { useCallback, useState, useEffect } from "react";
import { makeStyles, useTheme, Badge } from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import PublishIcon from "@material-ui/icons/Publish";
import { toggleSnackbar } from "../../actions/index";
import { useDispatch } from "react-redux";
import Zoom from '@material-ui/core/Zoom';

const useStyles = makeStyles(theme => ({
    fab: {
        margin: 0,
        top: "auto",
        right: 20,
        bottom: 20,
        left: "auto",
        zIndex: 5,
        position: "fixed"
    },
    badge:{
        position: "absolute",
        bottom: 26,
        top: "auto",
        zIndex: 9999,
        right: 7,
    },
}));

export default function UploadButton(props) {
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [queued, setQueued] = useState(5);

    const theme = useTheme();
    const classes = useStyles();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    let prev = window.scrollY;
    let lastUpdate = window.scrollY;
    const show = 50;

    useEffect(() => {
        window.addEventListener('scroll', e => handleNavigation(e));
    }, [])

    const handleNavigation = (e) => {
        const window = e.currentTarget;
    
        if (prev > window.scrollY) {
            if (lastUpdate - window.scrollY > show){
                lastUpdate = window.scrollY;
                setHidden(false);
            }
        } else if (prev < window.scrollY) {
            if (window.scrollY - lastUpdate > show){
                lastUpdate = window.scrollY;
                setHidden(true);
            }
        }
        prev = window.scrollY;
    };


    useEffect(() => {
        setQueued(props.Queued);
    }, [props.Queued]);

    const uploadClicked = () => {
        if (open){
            if (queued !== 0) {
            props.openFileList();
        } else {
            let uploadButton = document.getElementsByClassName("uploadForm")[0];
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
        }
        }
        
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Zoom in={!hidden}>
        <Badge 
        badgeContent={queued} 
        classes={{
            badge: classes.badge, // class name, e.g. `root-x`
          }}
        className={classes.fab} 
        invisible={queued === 0} 
        color="secondary">
            <SpeedDial
                ariaLabel="SpeedDial openIcon example"
                hidden={false}
                tooltipTitle="上传文件"
                icon={<SpeedDialIcon openIcon={<PublishIcon />} />}
                onClose={handleClose}
                onClick={uploadClicked}
                onOpen={handleOpen}
                open={open}
            >
                <SpeedDialAction
                    key="NewFolder"
                    icon={<CreateNewFolderIcon />}
                    tooltipTitle="新建文件夹"
                    onClick={handleClose}
                />
            </SpeedDial>
        </Badge>
        </Zoom>
    );
}

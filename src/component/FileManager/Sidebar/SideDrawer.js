import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import Drawer from "@material-ui/core/Drawer";
import Toolbar from "@material-ui/core/Toolbar";
import { Clear, Folder, Inbox, Mail } from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
import { setSideBar } from "../../../redux/explorer/action";
import TypeIcon from "../TypeIcon";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";

const drawerWidth = 350;

const useStyles = makeStyles(theme => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        width: drawerWidth,
        boxShadow:
            "0px 8px 10px -5px rgb(0 0 0 / 20%), 0px 16px 24px 2px rgb(0 0 0 / 14%), 0px 6px 30px 5px rgb(0 0 0 / 12%)"
    },
    drawerContainer: {
        overflow: "auto"
    },
    header: {
        display: "flex",
        padding: theme.spacing(3),
        placeContent: "space-between"
    },
    fileIcon: { width: 33, height: 33 },
    fileIconSVG: { fontSize: 20 },
    folderIcon: {
        color: theme.palette.text.secondary,
        width: 33,
        height: 33
    },
    fileName: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        wordBreak: "break-all",
        flexGrow: 2
    },
    closeIcon: {
        placeSelf: "flex-start",
        marginTop: 2
    }
}));

export default function SideDrawer() {
    const dispatch = useDispatch();
    const sideBarOpen = useSelector(state => state.explorer.sideBarOpen);
    const selected = useSelector(state => state.explorer.selected);
    const SetSideBar = useCallback(open => dispatch(setSideBar(open)), [
        dispatch
    ]);
    const [target, setTarget] = useState(null);
    useEffect(() => {
        if (sideBarOpen) {
            if (selected.length !== 1) {
                SetSideBar(false);
            } else {
                setTarget(selected[0]);
            }
        }
    }, [selected, sideBarOpen]);
    const classes = useStyles();
    return (
        <>
            <Drawer
                className={classes.drawer}
                variant="persistent"
                classes={{
                    paper: classes.drawerPaper
                }}
                open={sideBarOpen}
                anchor="right"
            >
                <Toolbar />
                <div className={classes.drawerContainer}>
                    {target && (
                        <>
                            <div className={classes.header}>
                                {target.type === "dir" && (
                                    <Folder className={classes.folderIcon} />
                                )}
                                {target.type !== "dir" && (
                                    <TypeIcon
                                        isUpload
                                        className={classes.fileIcon}
                                        iconClassName={classes.fileIconSVG}
                                        fileName={target.name}
                                    />
                                )}
                                <div className={classes.fileName}>
                                    <Typography variant="h6" gutterBottom>
                                        {target.name}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={() => SetSideBar(false)}
                                    className={classes.closeIcon}
                                    aria-label="close"
                                    size={"small"}
                                >
                                    <Clear />
                                </IconButton>
                            </div>
                        </>
                    )}
                    <Divider />
                </div>
            </Drawer>
        </>
    );
}

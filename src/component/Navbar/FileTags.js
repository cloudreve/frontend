import React, { useCallback, useState, useEffect } from "react";
import {Divider, List, ListItem, ListItemIcon, ListItemText, makeStyles, withStyles} from "@material-ui/core";
import {KeyboardArrowRight} from "@material-ui/icons";
import classNames from "classnames";
import FolderShared from "@material-ui/icons/FolderShared";
import UploadIcon from "@material-ui/icons/CloudUpload";
import VideoIcon from "@material-ui/icons/VideoLibraryOutlined";
import ImageIcon from "@material-ui/icons/CollectionsOutlined";
import MusicIcon from "@material-ui/icons/LibraryMusicOutlined";
import DocIcon from "@material-ui/icons/FileCopyOutlined";
import {useHistory, useLocation} from "react-router";
import pathHelper from "../../untils/page";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import {searchMyFile, toggleSnackbar} from "../../actions";
import {useDispatch, useSelector} from "react-redux";
import Auth from "../../middleware/Auth";

const ExpansionPanel = withStyles({
    root: {
        maxWidth: "100%",
        boxShadow: "none",
        "&:not(:last-child)": {
            borderBottom: 0
        },
        "&:before": {
            display: "none"
        },
        "&$expanded": {margin:0,}
    },
    expanded: {
    }
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        minHeight: 0,
        padding: 0,

        "&$expanded": {
            minHeight: 0
        }
    },
    content: {
        maxWidth: "100%",
        margin: 0,
        display: "block",
        "&$expanded": {
            margin: "0"
        }
    },
    expanded: {}
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        display: "block",
        padding: theme.spacing(0)
    }
}))(MuiExpansionPanelDetails);

const useStyles = makeStyles(theme => ({
    expand: {
        display:"none",
        transition: ".15s all ease-in-out"
    },
    expanded: {
        display:"block",
        transform: "rotate(90deg)"
    },
    iconFix: {
        marginLeft: "16px"
    },
    hiddenButton: {
        display: "none"
    },
    subMenu:{
        marginLeft:theme.spacing(2),
    },
}));


export default function FileTag(props){
    const classes = useStyles();

    let location = useLocation();
    let history = useHistory();

    const isHomePage = pathHelper.isHomePage(location.pathname);

    const [tagOpen,setTagOpen] = useState(true);

    const dispatch = useDispatch();
    const SearchMyFile = useCallback(k =>
            dispatch(searchMyFile(k)),
        [dispatch]
    );
    const isLogin = useSelector(state => state.viewUpdate.isLogin);
    const user = useCallback(()=>{
        return Auth.GetUser();
    },[isLogin]);

    return (
        <ExpansionPanel
            square
            expanded={tagOpen && isHomePage}
            onChange={()=>isHomePage&&setTagOpen(!tagOpen)}
        >
            <ExpansionPanelSummary
                aria-controls="panel1d-content"
                id="panel1d-header"
            >
                <ListItem
                    button
                    key="我的文件"
                    onClick={() =>
                        !isHomePage&&history.push("/home?path=%2F")
                    }
                >
                    <ListItemIcon>
                        <KeyboardArrowRight
                            className={classNames(
                                {
                                    [classes.expanded]:
                                    tagOpen && isHomePage,
                                    [classes.iconFix]:true,
                                },
                                classes.expand
                            )}
                        />
                        {!(tagOpen && isHomePage)&&<FolderShared className={classes.iconFix} />}


                    </ListItemIcon>
                    <ListItemText primary="我的文件" />
                </ListItem>
                <Divider />
            </ExpansionPanelSummary>


            <ExpansionPanelDetails>
                <List>
                    <ListItem
                        button
                        id="pickfiles"
                        className={classes.hiddenButton}
                    >
                        <ListItemIcon>
                            <UploadIcon />
                        </ListItemIcon>
                        <ListItemText />
                    </ListItem>
                    {[
                        {
                            key: "视频",
                            id: "video",
                            icon: (
                                <VideoIcon
                                    className={[
                                        classes.iconFix,
                                        classes.iconVideo
                                    ]}
                                />
                            )
                        },
                        {
                            key: "图片",
                            id: "image",
                            icon: (
                                <ImageIcon
                                    className={[
                                        classes.iconFix,
                                        classes.iconImg
                                    ]}
                                />
                            )
                        },
                        {
                            key: "音频",
                            id: "audio",
                            icon: (
                                <MusicIcon
                                    className={[
                                        classes.iconFix,
                                        classes.iconAudio
                                    ]}
                                />
                            )
                        },
                        {
                            key: "文档",
                            id: "doc",
                            icon: (
                                <DocIcon
                                    className={[
                                        classes.iconFix,
                                        classes.iconDoc
                                    ]}
                                />
                            )
                        }
                    ].map(v => (
                        <ListItem
                            button
                            key={v.key}
                            onClick={() =>
                                SearchMyFile(v.id +"/internal")
                            }
                        >
                            <ListItemIcon className={classes.subMenu}>
                                {v.icon}
                            </ListItemIcon>
                            <ListItemText primary={v.key} />
                        </ListItem>
                    ))}
                    {user().tags && user().tags.map(v=>(
                        <ListItem
                            button
                            key={v.id}
                            onClick={() =>
                                v.type === 0 ? SearchMyFile("tag/"+v.id):alert("folder")
                            }
                        >
                            <ListItemIcon className={classes.subMenu}>
                                {v.icon}
                            </ListItemIcon>
                            <ListItemText primary={v.name} />
                        </ListItem>
                    ))}
                </List>{" "}
                <Divider />
            </ExpansionPanelDetails>

        </ExpansionPanel>
    )
}
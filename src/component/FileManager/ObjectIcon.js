import React, { useCallback,useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    changeContextMenu,
    setSelectedTarget,
    addSelectedTarget,
    removeSelectedTarget,
    setNavigatorLoadingStatus,
    navitateTo,
    showImgPreivew,
    openMusicDialog,
    toggleSnackbar
} from "../../actions/index";
import statusHelper from "../../untils/page"
import FileIcon from "./FileIcon";
import SmallIcon from "./SmallIcon";
import TableItem from "./TableRow";
import classNames from "classnames";
import { isPreviewable } from "../../config";
import { allowSharePreview } from "../../untils/index";
import { makeStyles } from "@material-ui/core";
import { useDrag } from "react-dnd";
import { getEmptyImage } from 'react-dnd-html5-backend'
import DropWarpper from "./DnD/DropWarpper"
import {
    useLocation
  } from "react-router-dom";

const useStyles = makeStyles(theme => ({
    container: {
        padding: "7px"
    },
    fixFlex: {
        minWidth: 0
    },
    dragging:{
        opacity:0.4,
    }
}));

export default function ObjectIcon(props) {
    const path = useSelector(state => state.navigator.path);
    const selected = useSelector(state => state.explorer.selected);
    const viewMethod = useSelector(
        state => state.viewUpdate.explorerViewMethod
    );
    let location = useLocation();

    const dispatch = useDispatch();
    const ContextMenu = useCallback(
        (type, open) => dispatch(changeContextMenu(type, open)),
        [dispatch]
    );
    const SetSelectedTarget = useCallback(
        targets => dispatch(setSelectedTarget(targets)),
        [dispatch]
    );
    const AddSelectedTarget = useCallback(
        targets => dispatch(addSelectedTarget(targets)),
        [dispatch]
    );
    const RemoveSelectedTarget = useCallback(
        id => dispatch(removeSelectedTarget(id)),
        [dispatch]
    );
    const SetNavigatorLoadingStatus = useCallback(
        status => dispatch(setNavigatorLoadingStatus(status)),
        [dispatch]
    );
    const NavitateTo = useCallback(targets => dispatch(navitateTo(targets)), [
        dispatch
    ]);
    const ShowImgPreivew = useCallback(
        targets => dispatch(showImgPreivew(targets)),
        [dispatch]
    );
    const OpenMusicDialog = useCallback(() => dispatch(openMusicDialog()), [
        dispatch
    ]);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const classes = useStyles();

    const contextMenu = e => {
        e.preventDefault();
        if (
            selected.findIndex(value => {
                return value === props.file;
            }) === -1
        ) {
            SetSelectedTarget([props.file]);
        }
        ContextMenu("file", true);
    };

    const selectFile = e => {
        let presentIndex = selected.findIndex(value => {
            return value === props.file;
        });
        if (presentIndex !== -1 && e.ctrlKey) {
            RemoveSelectedTarget(presentIndex);
        } else {
            if (e.ctrlKey) {
                AddSelectedTarget(props.file);
            } else {
                SetSelectedTarget([props.file]);
            }
        }
    };

    const handleClick = e => {
        if (window.isMobile) {
            selectFile(e);
            if (props.file.type === "dir") {
                enterFolder();
                return;
            }
        } else {
            selectFile(e);
        }
    };

    const handleDoubleClick = () => {
        if (props.file.type === "dir") {
            enterFolder();
            return;
        }
        if (!allowSharePreview()) {
            ToggleSnackbar("top", "right", "未登录用户无法预览", "warning");
            return;
        }
        let previewPath =
            selected[0].path === "/"
                ? selected[0].path + selected[0].name
                : selected[0].path + "/" + selected[0].name;
        switch (isPreviewable(selected[0].name)) {
            case "img":
                ShowImgPreivew(selected[0]);
                return;
            case "msDoc":
                window.open(
                    window.apiURL.docPreiview +
                        "/?path=" +
                        encodeURIComponent(previewPath)
                );
                return;
            case "audio":
                OpenMusicDialog();
                return;
            case "open":
                window.open(
                    window.apiURL.preview +
                        "/?action=preview&path=" +
                        encodeURIComponent(previewPath)
                );
                return;
            case "video":
                if (window.isSharePage) {
                    window.location.href =
                        "/Viewer/Video?share=true&shareKey=" +
                        window.shareInfo.shareId +
                        "&path=" +
                        encodeURIComponent(previewPath);
                    return;
                }
                window.location.href =
                    "/Viewer/Video?path=" + encodeURIComponent(previewPath);
                return;
            case "edit":
                if (window.isSharePage) {
                    window.location.href =
                        "/Viewer/Markdown?share=true&shareKey=" +
                        window.shareInfo.shareId +
                        "&path=" +
                        encodeURIComponent(previewPath);
                    return;
                }
                window.location.href =
                    "/Viewer/Markdown?path=" + encodeURIComponent(previewPath);
                return;
            default:
                window.open(
                    window.apiURL.download +
                        "?action=download&path=" +
                        encodeURIComponent(previewPath)
                );
                return;
        }
    };

    const enterFolder = () => {
        NavitateTo(
            path === "/" ? path + props.file.name : path + "/" + props.file.name
        );
    };

    const [{ isDragging }, drag,preview] = useDrag({
        item: {
            object:props.file,
            type: "object",
            selected:[...selected],
            viewMethod:viewMethod,
            },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                alert(`drop`);
                console.log(item.object,dropResult.folder);
            }
        },
        canDrag: () =>{
            return !statusHelper.isMobile() && statusHelper.isHomePage(location.pathname);
        },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    }, [])


    if (viewMethod === "list") {
        return (
            <TableItem
                contextMenu={contextMenu}
                handleClick={handleClick}
                handleDoubleClick={handleDoubleClick.bind(this)}
                file={props.file}
            />
        );
    }

    return (
        <div
            ref={drag}
            className={classNames({
                [classes.container]: viewMethod !== "list",
                [classes.dragging]: isDragging,
            })}
        >
            <div
                className={classes.fixFlex}
                onContextMenu={contextMenu}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick.bind(this)}
            >
                {props.file.type === "dir" && viewMethod !== "list" && (
                    <DropWarpper folder={props.file}/>
                       
                )}
                {props.file.type === "file" && viewMethod === "icon" && (
                    <FileIcon ref={drag} file={props.file} />
                )}
                {props.file.type === "file" && viewMethod === "smallIcon" && (
                    <SmallIcon file={props.file} />
                )}
            </div>
        </div>
    );
}

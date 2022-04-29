import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import statusHelper from "../../utils/page";
import FileIcon from "./FileIcon";
import SmallIcon from "./SmallIcon";
import TableItem from "./TableRow";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import DropWarpper from "./DnD/DropWarpper";
import { useLocation } from "react-router-dom";
import { pathBack } from "../../utils";
import {
    changeContextMenu,
    dragAndDrop,
    navigateTo,
    openLoadingDialog,
    openPreview,
    selectFile,
    setSelectedTarget,
    toggleSnackbar,
} from "../../redux/explorer";
import useDragScrolling from "./DnD/Scrolling";

const useStyles = makeStyles(() => ({
    container: {
        padding: "7px",
    },
    fixFlex: {
        minWidth: 0,
    },
    dragging: {
        opacity: 0.4,
    },
}));

export default function ObjectIcon(props) {
    const path = useSelector((state) => state.navigator.path);
    const shareInfo = useSelector((state) => state.viewUpdate.shareInfo);
    const selected = useSelector((state) => state.explorer.selected);
    const viewMethod = useSelector(
        (state) => state.viewUpdate.explorerViewMethod
    );
    const navigatorPath = useSelector((state) => state.navigator.path);
    const location = useLocation();

    const dispatch = useDispatch();
    const ContextMenu = useCallback(
        (type, open) => dispatch(changeContextMenu(type, open)),
        [dispatch]
    );
    const SetSelectedTarget = useCallback(
        (targets) => dispatch(setSelectedTarget(targets)),
        [dispatch]
    );

    const NavitateTo = useCallback((targets) => dispatch(navigateTo(targets)), [
        dispatch,
    ]);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const DragAndDrop = useCallback(
        (source, target) => dispatch(dragAndDrop(source, target)),
        [dispatch]
    );
    const OpenLoadingDialog = useCallback(
        (text) => dispatch(openLoadingDialog(text)),
        [dispatch]
    );
    const OpenPreview = useCallback((share) => dispatch(openPreview(share)), [
        dispatch,
    ]);
    const StartDownload = useCallback(
        (share, file) => dispatch(StartDownload(share, file)),
        [dispatch]
    );

    const classes = useStyles();

    const contextMenu = (e) => {
        if (props.file.type === "up") {
            return;
        }
        e.preventDefault();
        if (
            selected.findIndex((value) => {
                return value === props.file;
            }) === -1
        ) {
            SetSelectedTarget([props.file]);
        }
        ContextMenu("file", true);
    };

    const SelectFile = (e) => {
        dispatch(selectFile(props.file, e, props.index));
    };
    const enterFolder = () => {
        NavitateTo(
            path === "/" ? path + props.file.name : path + "/" + props.file.name
        );
    };
    const handleClick = (e) => {
        if (props.file.type === "up") {
            NavitateTo(pathBack(navigatorPath));
            return;
        }

        SelectFile(e);
        if (
            props.file.type === "dir" &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.shiftKey
        ) {
            enterFolder();
        }
    };

    const handleDoubleClick = () => {
        if (props.file.type === "up") {
            return;
        }
        if (props.file.type === "dir") {
            enterFolder();
            return;
        }

        OpenPreview(shareInfo);
    };

    const handleIconClick = (e) => {
        e.stopPropagation();
        if (!e.shiftKey) {
            e.ctrlKey = true;
        }
        SelectFile(e);
        return false;
    };

    const {
        addEventListenerForWindow,
        removeEventListenerForWindow,
    } = useDragScrolling();

    const [{ isDragging }, drag, preview] = useDrag({
        item: {
            object: props.file,
            type: "object",
            selected: [...selected],
            viewMethod: viewMethod,
        },
        begin: () => {
            addEventListenerForWindow();
        },
        end: (item, monitor) => {
            removeEventListenerForWindow();
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                if (dropResult.folder) {
                    if (
                        item.object.id !== dropResult.folder.id ||
                        item.object.type !== dropResult.folder.type
                    ) {
                        DragAndDrop(item.object, dropResult.folder);
                    }
                }
            }
        },
        canDrag: () => {
            return (
                !statusHelper.isMobile() &&
                statusHelper.isHomePage(location.pathname)
            );
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
        // eslint-disable-next-line
    }, []);

    if (viewMethod === "list") {
        return (
            <>
                {props.file.type === "dir" && (
                    <DropWarpper
                        isListView={true}
                        pref={drag}
                        className={classNames(classes.container, {
                            [classes.dragging]: isDragging,
                        })}
                        onIconClick={handleIconClick}
                        contextMenu={contextMenu}
                        handleClick={handleClick}
                        handleDoubleClick={handleDoubleClick.bind(this)}
                        folder={props.file}
                    />
                )}
                {props.file.type !== "dir" && (
                    <TableItem
                        pref={drag}
                        className={classNames(classes.container, {
                            [classes.dragging]: isDragging,
                        })}
                        onIconClick={handleIconClick}
                        contextMenu={contextMenu}
                        handleClick={handleClick}
                        handleDoubleClick={handleDoubleClick.bind(this)}
                        file={props.file}
                    />
                )}
            </>
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
                    <DropWarpper
                        isListView={false}
                        onIconClick={handleIconClick}
                        folder={props.file}
                    />
                )}
                {props.file.type === "file" && viewMethod === "icon" && (
                    <FileIcon
                        onIconClick={handleIconClick}
                        ref={drag}
                        file={props.file}
                    />
                )}
                {props.file.type === "file" && viewMethod === "smallIcon" && (
                    <SmallIcon
                        onIconClick={handleIconClick}
                        file={props.file}
                    />
                )}
            </div>
        </div>
    );
}

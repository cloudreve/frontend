import {
    ListItemIcon,
    makeStyles,
    Menu,
    MenuItem,
    Tooltip,
} from "@material-ui/core";
import React, { useCallback } from "react";
import { DeleteSweep } from "@material-ui/icons";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";

const useStyles = makeStyles((theme) => ({}));

const menuItems = [
    {
        item: [],
    },
];

export default function MoreActions({ anchorEl, onClose, uploadManager }) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const actionClicked = (next) => () => {
        onClose();
        next();
    };

    const cleanupSessions = () => {
        uploadManager.cleanupSessions();
        API.delete("/file/upload")
            .then((response) => {
                ToggleSnackbar("top", "right", "上传会话已清除", "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const open = Boolean(anchorEl);
    const id = open ? "uploader-action-popover" : undefined;

    return (
        <Menu id={id} open={open} anchorEl={anchorEl} onClose={onClose}>
            <Tooltip title={"清空服务端所有未完成的上传会话"}>
                <MenuItem onClick={actionClicked(() => cleanupSessions())}>
                    <ListItemIcon>
                        <DeleteSweep fontSize="small" />
                    </ListItemIcon>
                    清空所有上传会话
                </MenuItem>
            </Tooltip>
        </Menu>
    );
}

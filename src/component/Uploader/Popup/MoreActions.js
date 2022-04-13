import {
    Icon,
    ListItemIcon,
    makeStyles,
    Menu,
    MenuItem,
    Tooltip,
} from "@material-ui/core";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import API from "../../../middleware/Api";
import { TaskType } from "../core/types";
import { refreshStorage, toggleSnackbar } from "../../../redux/explorer";
import Divider from "@material-ui/core/Divider";
import CheckIcon from "@material-ui/icons/Check";
import { DeleteEmpty } from "mdi-material-ui";
import DeleteIcon from "@material-ui/icons/Delete";
import ConcurrentOptionDialog from "../../Modals/ConcurrentOption";
import Auth from "../../../middleware/Auth";
import { ClearAll } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
    icon: {
        minWidth: 38,
    },
}));

export default function MoreActions({
    anchorEl,
    onClose,
    uploadManager,
    deleteTask,
    useAvgSpeed,
    setUseAvgSpeed,
    filter,
    setFilter,
    sorter,
    setSorter,
    cleanFinished,
}) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [concurrentDialog, setConcurrentDialog] = useState(false);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const RefreshStorage = useCallback(() => dispatch(refreshStorage()), [
        dispatch,
    ]);

    const actionClicked = (next) => () => {
        onClose();
        next();
    };

    const cleanupSessions = () => {
        uploadManager.cleanupSessions();
        API.delete("/file/upload")
            .then((response) => {
                if (response.rawData.code === 0) {
                    ToggleSnackbar("top", "right", "上传会话已清除", "success");
                } else {
                    ToggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                deleteTask((u) => u.task.type !== TaskType.resumeHint);
                RefreshStorage();
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const open = Boolean(anchorEl);
    const id = open ? "uploader-action-popover" : undefined;

    const listItems = useMemo(
        () => [
            {
                tooltip: "列表中不显示已完成、失败、被取消的任务",
                onClick: () =>
                    setFilter(filter === "default" ? "ongoing" : "default"),
                icon: filter !== "default" ? <CheckIcon /> : <Icon />,
                text: "隐藏已完成任务",
                divider: true,
            },
            {
                tooltip: "最先添加的任务排在最前",
                onClick: () => setSorter("default"),
                icon: sorter === "default" ? <CheckIcon /> : <Icon />,
                text: "最先添加靠前",
                divider: false,
            },
            {
                tooltip: "最后添加的任务排在最前",
                onClick: () => setSorter("reverse"),
                icon: sorter === "reverse" ? <CheckIcon /> : <Icon />,
                text: "最后添加靠前",
                divider: true,
            },
            {
                tooltip: "单个任务上传速度展示为瞬时速度",
                onClick: () => setUseAvgSpeed(false),
                icon: useAvgSpeed ? <Icon /> : <CheckIcon />,
                text: "瞬时速度",
                divider: false,
            },
            {
                tooltip: "单个任务上传速度展示为平均速度",
                onClick: () => setUseAvgSpeed(true),
                icon: !useAvgSpeed ? <Icon /> : <CheckIcon />,
                text: "平均速度",
                divider: true,
            },
            {
                tooltip: "清空服务端所有未完成的上传会话",
                onClick: () => cleanupSessions(),
                icon: <DeleteEmpty />,
                text: "清空所有上传会话",
                divider: false,
            },
            {
                tooltip: "清除列表中已完成、失败、被取消的任务",
                onClick: () => cleanFinished(),
                icon: <DeleteIcon />,
                text: "清除已完成任务",
                divider: true,
            },
            {
                tooltip: "清除列表中已完成、失败、被取消的任务",
                onClick: () => setConcurrentDialog(true),
                icon: <ClearAll />,
                text: "设置并行数量",
                divider: false,
            },
        ],
        [
            useAvgSpeed,
            setUseAvgSpeed,
            sorter,
            setSorter,
            filter,
            setFilter,
            cleanFinished,
        ]
    );

    const onConcurrentLimitSave = (val) => {
        val = parseInt(val);
        if (val > 0) {
            Auth.SetPreference("concurrent_limit", val);
            uploadManager.changeConcurrentLimit(parseInt(val));
        }
        setConcurrentDialog(false);
    };

    return (
        <>
            <Menu id={id} open={open} anchorEl={anchorEl} onClose={onClose}>
                {listItems.map((item) => (
                    <>
                        <Tooltip
                            enterNextDelay={500}
                            key={item.text}
                            title={item.tooltip}
                        >
                            <MenuItem
                                dense
                                onClick={actionClicked(item.onClick)}
                            >
                                <ListItemIcon className={classes.icon}>
                                    {item.icon}
                                </ListItemIcon>
                                {item.text}
                            </MenuItem>
                        </Tooltip>
                        {item.divider && <Divider />}
                    </>
                ))}
            </Menu>
            <ConcurrentOptionDialog
                open={concurrentDialog}
                onClose={() => setConcurrentDialog(false)}
                onSave={onConcurrentLimitSave}
            />
        </>
    );
}

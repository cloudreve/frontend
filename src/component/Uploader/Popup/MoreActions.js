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
import { ClearAll, Replay } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

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
    retryFailed,
}) {
    const { t } = useTranslation("application", { keyPrefix: "uploader" });
    const classes = useStyles();
    const dispatch = useDispatch();
    const [concurrentDialog, setConcurrentDialog] = useState(false);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const RefreshStorage = useCallback(
        () => dispatch(refreshStorage()),
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
                if (response.rawData.code === 0) {
                    ToggleSnackbar(
                        "top",
                        "right",
                        t("uploadSessionCleaned"),
                        "success"
                    );
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
                tooltip: t("hideCompletedTooltip"),
                onClick: () =>
                    setFilter(filter === "default" ? "ongoing" : "default"),
                icon: filter !== "default" ? <CheckIcon /> : <Icon />,
                text: t("hideCompleted"),
                divider: true,
            },
            {
                tooltip: t("addTimeAscTooltip"),
                onClick: () => setSorter("default"),
                icon: sorter === "default" ? <CheckIcon /> : <Icon />,
                text: t("addTimeAsc"),
                divider: false,
            },
            {
                tooltip: t("addTimeDescTooltip"),
                onClick: () => setSorter("reverse"),
                icon: sorter === "reverse" ? <CheckIcon /> : <Icon />,
                text: t("addTimeDesc"),
                divider: true,
            },
            {
                tooltip: t("showInstantSpeedTooltip"),
                onClick: () => setUseAvgSpeed(false),
                icon: useAvgSpeed ? <Icon /> : <CheckIcon />,
                text: t("showInstantSpeed"),
                divider: false,
            },
            {
                tooltip: t("showAvgSpeedTooltip"),
                onClick: () => setUseAvgSpeed(true),
                icon: !useAvgSpeed ? <Icon /> : <CheckIcon />,
                text: t("showAvgSpeed"),
                divider: true,
            },
            {
                tooltip: t("cleanAllSessionTooltip"),
                onClick: () => cleanupSessions(),
                icon: <DeleteEmpty />,
                text: t("cleanAllSession"),
                divider: false,
            },
            {
                tooltip: t("cleanCompletedTooltip"),
                onClick: () => cleanFinished(),
                icon: <DeleteIcon />,
                text: t("cleanCompleted"),
                divider: false,
            },
            {
                tooltip: t("retryFailedTasksTooltip"),
                onClick: () => retryFailed(),
                icon: <Replay />,
                text: t("retryFailedTasks"),
                divider: true,
            },
            {
                tooltip: t("setConcurrentTooltip"),
                onClick: () => setConcurrentDialog(true),
                icon: <ClearAll />,
                text: t("setConcurrent"),
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

import React, { useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AppBar,
    Dialog,
    DialogContent,
    Fade,
    IconButton,
    makeStyles,
    Slide,
    Toolbar,
    Tooltip,
    Typography,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandLess";
import AddIcon from "@material-ui/icons/Add";
import classnames from "classnames";
import UploadTask from "./UploadTask";
import { MoreHoriz } from "@material-ui/icons";
import MoreActions from "./MoreActions";
import { useSelector } from "react-redux";
import { Virtuoso } from "react-virtuoso";
import Nothing from "../../Placeholder/Nothing";
import { lighten } from "@material-ui/core/styles/colorManipulator";
import { Status } from "../core/uploader/base";
import Auth from "../../../middleware/Auth";
import { useTranslation } from "react-i18next";
import { useUpload } from "../UseUpload";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    rootOverwrite: {
        top: "auto!important",
        left: "auto!important",
    },
    appBar: {
        position: "relative",
    },
    flex: {
        flex: 1,
    },
    popup: {
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    dialog: {
        margin: 0,
        right: 10,
        bottom: 10,
        zIndex: 9999,
        position: "fixed",
        inset: "-1!important",
    },
    paddingZero: {
        padding: 0,
    },
    dialogContent: {
        [theme.breakpoints.up("md")]: {
            width: 500,
            minHeight: 300,
            maxHeight: "calc(100vh - 140px)",
        },
        padding: 0,
        paddingTop: "0!important",
    },
    virtualList: {
        height: "100%",
        maxHeight: "calc(100vh - 56px)",
        [theme.breakpoints.up("md")]: {
            minHeight: 300,
            maxHeight: "calc(100vh - 140px)",
        },
    },
    expandIcon: {
        transform: "rotate(0deg)",
        transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandIconExpanded: {
        transform: "rotate(180deg)",
    },
    toolbar: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    progress: {
        transition: "width .4s linear",
        zIndex: -1,
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
    },
}));

const sorters = {
    default: (a, b) => a.id - b.id,
    reverse: (a, b) => b.id - a.id,
};

const filters = {
    default: (u) => true,
    ongoing: (u) => u.status < Status.finished,
};

export default function TaskList({
    open,
    onClose,
    selectFile,
    taskList,
    onCancel,
    uploadManager,
    progress,
    setUploaders,
}) {
    const { t } = useTranslation("application", { keyPrefix: "uploader" });
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const path = useSelector((state) => state.navigator.path);
    const [expanded, setExpanded] = useState(true);
    const [useAvgSpeed, setUseAvgSpeed] = useState(
        Auth.GetPreferenceWithDefault("use_avg_speed", true)
    );
    const [anchorEl, setAnchorEl] = useState(null);
    const [filter, setFilter] = useState(
        Auth.GetPreferenceWithDefault("task_filter", "default")
    );
    const [sorter, setSorter] = useState(
        Auth.GetPreferenceWithDefault("task_sorter", "default")
    );
    const [refreshList, setRefreshList] = useState(false);

    const handleActionClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleActionClose = () => {
        setAnchorEl(null);
    };

    const close = (e, reason) => {
        if (reason !== "backdropClick") {
            onClose();
        } else {
            setExpanded(false);
        }
    };
    const handlePanelChange = (event, isExpanded) => {
        setExpanded(isExpanded);
    };

    useMemo(() => {
        if (open) {
            setExpanded(true);
        }
    }, [taskList]);

    const progressBar = useMemo(
        () =>
            progress.totalSize > 0 ? (
                <Fade in={progress.totalSize > 0 && !expanded}>
                    <div>
                        <div
                            style={{
                                backgroundColor:
                                    theme.palette.type === "light"
                                        ? lighten(
                                              theme.palette.primary.main,
                                              0.2
                                          )
                                        : lighten(
                                              theme.palette.primary.main,
                                              0.2
                                          ),
                                width:
                                    (progress.processedSize /
                                        progress.totalSize) *
                                        100 +
                                    "%",
                            }}
                            className={classes.progress}
                        />
                    </div>
                </Fade>
            ) : null,
        [progress, expanded, classes, theme]
    );

    const list = useMemo(() => {
        const currentList = taskList
            .filter(filters[filter])
            .sort(sorters[sorter]);
        if (currentList.length === 0) {
            return <Nothing size={0.5} top={63} primary={t("taskListEmpty")} />;
        }

        return (
            <Virtuoso
                style={{
                    height: (fullScreen ? 500 : 73) * currentList.length,
                }}
                className={classes.virtualList}
                increaseViewportBy={180}
                data={currentList}
                itemContent={(index, uploader) => (
                    <UploadTask
                        selectFile={selectFile}
                        onClose={close}
                        onCancel={onCancel}
                        key={uploader.id}
                        useAvgSpeed={useAvgSpeed}
                        uploader={uploader}
                        filter={filters[filter]}
                        onRefresh={() => setRefreshList((r) => !r)}
                    />
                )}
            />
        );
    }, [
        classes,
        taskList,
        useAvgSpeed,
        fullScreen,
        filter,
        sorter,
        refreshList,
    ]);

    const retryFailed = () => {
        taskList.forEach((task) => {
            if (task.status === Status.error) {
                task.reset();
                task.start();
            }
        });
    };

    return (
        <>
            <MoreActions
                deleteTask={onCancel}
                onClose={handleActionClose}
                uploadManager={uploadManager}
                anchorEl={anchorEl}
                useAvgSpeed={useAvgSpeed}
                setUseAvgSpeed={(v) => {
                    Auth.SetPreference("use_avg_speed", v);
                    setUseAvgSpeed(v);
                }}
                filter={filter}
                sorter={sorter}
                setFilter={(v) => {
                    Auth.SetPreference("task_filter", v);
                    setFilter(v);
                }}
                setSorter={(v) => {
                    Auth.SetPreference("task_sorter", v);
                    setSorter(v);
                }}
                retryFailed={retryFailed}
                cleanFinished={() =>
                    setUploaders((u) => u.filter(filters["ongoing"]))
                }
            />
            <Dialog
                classes={{
                    container: classes.popup, // class name, e.g. `classes-nesting-root-x`
                    root: classnames({
                        [classes.rootOverwrite]: !fullScreen,
                    }),
                }}
                className={classnames({
                    [classes.dialog]: !fullScreen,
                })}
                fullScreen={fullScreen}
                open={open}
                onClose={close}
                TransitionComponent={Transition}
                disableEnforceFocus={!expanded}
                hideBackdrop={!expanded}
                disableBackdropClick={!expanded}
                disableScrollLock={!expanded}
            >
                <Accordion
                    expanded={expanded || fullScreen}
                    onChange={handlePanelChange}
                >
                    <AppBar className={classes.appBar}>
                        {progressBar}
                        <Toolbar disableGutters className={classes.toolbar}>
                            <Tooltip title={t("hideTaskList")}>
                                <IconButton
                                    color="inherit"
                                    onClick={close}
                                    aria-label="Close"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Tooltip>
                            <Typography
                                variant="h6"
                                color="inherit"
                                className={classes.flex}
                            >
                                {t("uploadTasks")}
                            </Typography>
                            <Tooltip title={t("moreActions")}>
                                <IconButton
                                    color="inherit"
                                    onClick={handleActionClick}
                                >
                                    <MoreHoriz />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("addNewFiles")}>
                                <IconButton
                                    color="inherit"
                                    onClick={() => selectFile(path)}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                            {!fullScreen && (
                                <Tooltip title={t("toggleTaskList")}>
                                    <IconButton
                                        color="inherit"
                                        onClick={() => setExpanded(!expanded)}
                                    >
                                        <ExpandMoreIcon
                                            className={classnames({
                                                [classes.expandIconExpanded]:
                                                    expanded,
                                                [classes.expandIcon]: true,
                                            })}
                                        />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Toolbar>
                    </AppBar>
                    <AccordionDetails className={classes.paddingZero}>
                        <DialogContent className={classes.dialogContent}>
                            {list}
                        </DialogContent>
                    </AccordionDetails>
                </Accordion>
            </Dialog>
        </>
    );
}

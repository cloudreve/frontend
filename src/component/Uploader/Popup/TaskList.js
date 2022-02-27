import React, { useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AppBar,
    Dialog,
    DialogContent,
    IconButton,
    List,
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
        [theme.breakpoints.up("sm")]: {
            width: 500,
            maxHeight: "calc(100vh - 140px)",
        },
        padding: 0,
        paddingTop: "0!important",
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
}));

export default function TaskList({
    open,
    onClose,
    selectFile,
    taskList,
    onCancel,
}) {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [expanded, setExpanded] = useState(true);
    const [useAvgSpeed, setUseAvgSpeed] = useState(true);

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

    return (
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
                    <Toolbar disableGutters className={classes.toolbar}>
                        <Tooltip title={"隐藏队列"}>
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
                            上传队列
                        </Typography>
                        <Tooltip title={"更多操作"}>
                            <IconButton color="inherit" onClick={selectFile}>
                                <MoreHoriz />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"添加新文件"}>
                            <IconButton color="inherit" onClick={selectFile}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                        {!fullScreen && (
                            <Tooltip title={"展开/折叠队列"}>
                                <IconButton
                                    color="inherit"
                                    onClick={() => setExpanded(!expanded)}
                                >
                                    <ExpandMoreIcon
                                        className={classnames({
                                            [classes.expandIconExpanded]: expanded,
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
                        <List className={classes.paddingZero}>
                            {taskList.map((uploader) => (
                                <UploadTask
                                    onCancel={onCancel}
                                    key={uploader.id}
                                    useAvgSpeed={useAvgSpeed}
                                    uploader={uploader}
                                />
                            ))}
                        </List>
                    </DialogContent>
                </AccordionDetails>
            </Accordion>
        </Dialog>
    );
}

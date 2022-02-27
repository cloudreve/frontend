import React, { useState } from "react";
import {
    AppBar,
    Dialog,
    IconButton,
    makeStyles,
    Slide,
    Toolbar,
    Typography,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import classnames from "classnames";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
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
        top: "auto",
        right: 0,
        bottom: 0,
        left: "auto",
        zIndex: 9999,
        position: "fixed",
    },
}));

export default function TaskList({ open, onClose }) {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [expanded, setExpanded] = useState(false);
    const close = () => {
        setExpanded(false);
        onClose();
    };

    return (
        <Dialog
            classes={{
                container: classes.popup, // class name, e.g. `classes-nesting-root-x`
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
            disableScrollLock={true}
        >
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        onClick={close}
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        color="inherit"
                        className={classes.flex}
                    >
                        上传队列
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <AddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Dialog>
    );
}

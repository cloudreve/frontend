import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
    FormControlLabel,
    Checkbox,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { useTranslation } from "react-i18next";
import { useInterval, usePrevious, useGetState } from "ahooks";
import { cancelDirectoryDownload } from "../../redux/explorer/action";
import Auth from "../../middleware/Auth";

const useStyles = makeStyles((theme) => ({
    contentFix: {
        padding: "10px 24px 0px 24px",
        backgroundColor: theme.palette.background.default,
    },
    buttonProgress: {
        color: theme.palette.secondary.light,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
}));

export default function DirectoryDownloadDialog(props) {
    const { t } = useTranslation();

    const classes = useStyles();

    const logRef = useRef();
    const [autoScroll, setAutoScroll] = useState(
        Auth.GetPreferenceWithDefault("autoScroll", true)
    );
    const previousLog = usePrevious(props.log, (prev, next) => true);
    const [timer, setTimer] = useState(-1);

    useInterval(() => {
        if (autoScroll && logRef.current && previousLog !== props.log) {
            logRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, timer);

    useEffect(() => {
        if (props.done) {
            setTimer(-1);
        } else if (props.open) {
            setTimer(1000);
        }
    }, [props.done, props.open]);

    return (
        <Dialog
            open={props.open}
            // open
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
            fullWidth
        >
            <DialogTitle id="form-dialog-title">
                {t("modals.directoryDownloadTitle")}
            </DialogTitle>

            <DialogContent className={classes.contentFix}>
                <TextField
                    value={props.log}
                    ref={logRef}
                    multiline
                    fullWidth
                    id="standard-basic"
                />
            </DialogContent>
            <DialogActions>
                <FormControlLabel
                    control={<Checkbox />}
                    checked={autoScroll}
                    onChange={() =>
                        setAutoScroll((previous) => {
                            Auth.SetPreference("autoScroll", !previous);
                            return !previous;
                        })
                    }
                    label={t("modals.directoryDownloadAutoscroll")}
                />
                <Button
                    onClick={
                        props.done ? props.onClose : cancelDirectoryDownload
                    }
                >
                    {t("cancel", { ns: "common" })}
                </Button>
                <div className={classes.wrapper}>
                    <Button
                        color="primary"
                        disabled={!props.done}
                        onClick={props.onClose}
                    >
                        {t("ok", { ns: "common" })}
                        {!props.done && (
                            <CircularProgress
                                size={24}
                                className={classes.buttonProgress}
                            />
                        )}
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

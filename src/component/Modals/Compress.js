import React, { useCallback, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    makeStyles,
} from "@material-ui/core";
import PathSelector from "../FileManager/PathSelector";
import { useDispatch } from "react-redux";
import TextField from "@material-ui/core/TextField";
import { setModalsLoading, toggleSnackbar } from "../../redux/explorer";
import { submitCompressTask } from "../../redux/explorer/action";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    contentFix: {
        padding: "10px 24px 0px 24px",
        backgroundColor: theme.palette.background.default,
    },
    wrapper: {
        margin: theme.spacing(1),
        position: "relative",
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

export default function CompressDialog(props) {
    const { t } = useTranslation();
    const [selectedPath, setSelectedPath] = useState("");
    const [fileName, setFileName] = useState("");
    // eslint-disable-next-line
    const [selectedPathName, setSelectedPathName] = useState("");

    const dispatch = useDispatch();

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const SetModalsLoading = useCallback(
        (status) => {
            dispatch(setModalsLoading(status));
        },
        [dispatch]
    );

    const SubmitCompressTask = useCallback(
        (name, path) => dispatch(submitCompressTask(name, path)),
        [dispatch]
    );

    const setMoveTarget = (folder) => {
        const path =
            folder.path === "/"
                ? folder.path + folder.name
                : folder.path + "/" + folder.name;
        setSelectedPath(path);
        setSelectedPathName(folder.name);
    };

    const submitMove = (e) => {
        if (e != null) {
            e.preventDefault();
        }
        SetModalsLoading(true);

        SubmitCompressTask(fileName, selectedPath)
            .then(() => {
                props.onClose();
                ToggleSnackbar(
                    "top",
                    "right",
                    t("modals.taskCreated"),
                    "success"
                );
                SetModalsLoading(false);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                SetModalsLoading(false);
            });
    };

    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                {t("modals.saveToTitle")}
            </DialogTitle>
            <PathSelector
                presentPath={props.presentPath}
                selected={props.selected}
                onSelect={setMoveTarget}
            />

            {selectedPath !== "" && (
                <DialogContent className={classes.contentFix}>
                    <DialogContentText>
                        <TextField
                            onChange={(e) => setFileName(e.target.value)}
                            value={fileName}
                            fullWidth
                            autoFocus
                            id="standard-basic"
                            label={t("modals.zipFileName")}
                        />
                    </DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={props.onClose}>
                    {t("cancel", { ns: "common" })}
                </Button>
                <div className={classes.wrapper}>
                    <Button
                        onClick={submitMove}
                        color="primary"
                        disabled={
                            selectedPath === "" ||
                            fileName === "" ||
                            props.modalsLoading
                        }
                    >
                        {t("ok", { ns: "common" })}
                        {props.modalsLoading && (
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

import React, { useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
} from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import MenuItem from "@material-ui/core/MenuItem";
import { Virtuoso } from "react-virtuoso";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    contentFix: {
        padding: "10px 24px 0px 24px",
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
    content: {
        padding: 0,
    },
    scroll: {
        maxHeight: "calc(100vh - 200px)",
    },
}));

export default function SelectFileDialog(props) {
    const { t } = useTranslation();
    const [files, setFiles] = useState(props.files);

    useEffect(() => {
        setFiles(props.files);
    }, [props.files]);

    const handleChange = (index) => (event) => {
        const filesCopy = [...files];
        // eslint-disable-next-line
        filesCopy.map((v, k) => {
            if (v.index === index) {
                filesCopy[k] = {
                    ...filesCopy[k],
                    selected: event.target.checked ? "true" : "false",
                };
            }
        });
        setFiles(filesCopy);
    };

    const submit = () => {
        const index = [];
        // eslint-disable-next-line
        files.map((v) => {
            if (v.selected === "true") {
                index.push(parseInt(v.index));
            }
        });
        props.onSubmit(index);
    };

    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
            fullWidth
        >
            <DialogTitle id="form-dialog-title">
                {t("download.selectDownloadingFile")}
            </DialogTitle>
            <DialogContent dividers={"paper"} className={classes.content}>
                <Virtuoso
                    style={{ height: 54 * files.length }}
                    className={classes.scroll}
                    data={files}
                    itemContent={(index, v) => (
                        <MenuItem key={index}>
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            onChange={handleChange(v.index)}
                                            checked={v.selected === "true"}
                                            value="checkedA"
                                        />
                                    }
                                    label={v.path}
                                />
                            </FormGroup>
                        </MenuItem>
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>
                    {t("cancel", { ns: "common" })}
                </Button>
                <div className={classes.wrapper}>
                    <Button
                        color="primary"
                        onClick={submit}
                        disabled={props.modalsLoading}
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

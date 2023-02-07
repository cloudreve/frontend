import React, { useCallback, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    makeStyles,
    Tooltip,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../redux/explorer";
import { Trans, useTranslation } from "react-i18next";
import { useTheme } from "@material-ui/core/styles";
import Auth from "../../middleware/Auth";
import API from "../../middleware/Api";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles((theme) => ({
    form: {
        marginTop: theme.spacing(2),
    },
}));

export default function Delete(props) {
    const { t } = useTranslation();
    const theme = useTheme();
    const user = Auth.GetUser();
    const [force, setForce] = useState(false);
    const [unlink, setUnlink] = useState(false);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const submitRemove = (e) => {
        e.preventDefault();
        props.setModalsLoading(true);
        const dirs = [],
            items = [];
        // eslint-disable-next-line
        props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.delete("/object", {
            data: {
                items: items,
                dirs: dirs,
                force,
                unlink,
            },
        })
            .then((response) => {
                if (response.rawData.code === 0) {
                    props.onClose();
                    setTimeout(props.refreshFileList, 500);
                } else {
                    ToggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                props.setModalsLoading(false);
                props.refreshStorage();
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                props.setModalsLoading(false);
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
                {t("modals.deleteTitle")}
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    {props.selected.length === 1 && (
                        <Trans
                            i18nKey="modals.deleteOneDescription"
                            values={{
                                name: props.selected[0].name,
                            }}
                            components={[<strong key={0} />]}
                        />
                    )}
                    {props.selected.length > 1 &&
                        t("modals.deleteMultipleDescription", {
                            num: props.selected.length,
                        })}
                </DialogContentText>
                {user.group.advanceDelete && (
                    <FormControl component="fieldset" className={classes.form}>
                        <FormLabel component="legend">
                            {t("modals.advanceOptions")}
                        </FormLabel>
                        <FormGroup>
                            <Tooltip title={t("modals.forceDeleteDes")}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={force}
                                            onChange={(e) =>
                                                setForce(e.target.checked)
                                            }
                                        />
                                    }
                                    label={t("modals.forceDelete")}
                                />
                            </Tooltip>
                            <Tooltip title={t("modals.unlinkOnlyDes")}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={unlink}
                                            onChange={(e) =>
                                                setUnlink(e.target.checked)
                                            }
                                        />
                                    }
                                    label={t("modals.unlinkOnly")}
                                />
                            </Tooltip>
                        </FormGroup>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>
                    {t("cancel", { ns: "common" })}
                </Button>
                <div className={classes.wrapper}>
                    <Button
                        onClick={submitRemove}
                        color="primary"
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

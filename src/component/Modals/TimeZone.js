import React, { useCallback, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import TextField from "@material-ui/core/TextField";
import {
    refreshTimeZone,
    timeZone,
    validateTimeZone,
} from "../../utils/datetime";
import FormControl from "@material-ui/core/FormControl";
import Auth from "../../middleware/Auth";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({}));

export default function TimeZoneDialog(props) {
    const { t } = useTranslation();
    const [timeZoneValue, setTimeZoneValue] = useState(timeZone);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const saveZoneInfo = () => {
        if (!validateTimeZone(timeZoneValue)) {
            ToggleSnackbar("top", "right", "无效的时区名称", "warning");
            return;
        }
        Auth.SetPreference("timeZone", timeZoneValue);
        refreshTimeZone();
        props.onClose();
    };

    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                {t("setting.timeZone")}
            </DialogTitle>

            <DialogContent>
                <FormControl>
                    <TextField
                        label={t("setting.timeZoneCode")}
                        value={timeZoneValue}
                        onChange={(e) => setTimeZoneValue(e.target.value)}
                    />
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button onClick={props.onClose}>
                    {t("cancel", { ns: "common" })}
                </Button>
                <div className={classes.wrapper}>
                    <Button
                        color="primary"
                        disabled={timeZoneValue === ""}
                        onClick={() => saveZoneInfo()}
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

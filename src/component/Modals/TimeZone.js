import { useTranslation } from "react-i18next";
import React, { useState, useCallback, useEffect } from "react";
import { FormLabel, makeStyles } from "@material-ui/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    CircularProgress,
} from "@material-ui/core";
import { toggleSnackbar, setModalsLoading } from "../../actions/index";
import PathSelector from "../FileManager/PathSelector";
import { useDispatch } from "react-redux";
import API from "../../middleware/Api";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {
    refreshTimeZone,
    timeZone,
    validateTimeZone,
} from "../../utils/datetime";
import FormControl from "@material-ui/core/FormControl";
import Auth from "../../middleware/Auth";

const useStyles = makeStyles((theme) => ({}));

export default function TimeZoneDialog(props) {
    const [timeZoneValue, setTimeZoneValue] = useState(timeZone);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const { t } = useTranslation();

    const saveZoneInfo = () => {
        if (!validateTimeZone(timeZoneValue)) {
            ToggleSnackbar("top", "right", t('Invalid time zone name'), "warning");
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
          <DialogTitle id="form-dialog-title">{t('Change time zone')}</DialogTitle>

          <DialogContent>
              <FormControl>
                  <TextField
                      label={t('IANA Time Zone Name Identification')}
                      value={timeZoneValue}
                      onChange={(e) => setTimeZoneValue(e.target.value)}
                  />
              </FormControl>
          </DialogContent>

          <DialogActions>
              <Button onClick={props.onClose}>{t('Cancel')}</Button>
              <div className={classes.wrapper}>
                  <Button
                      color="primary"
                      disabled={timeZoneValue === ""}
                      onClick={() => saveZoneInfo()}
                  >
                    {t('Ok')}
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

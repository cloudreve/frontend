import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Input,
    InputLabel,
    makeStyles,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Auth from "../../middleware/Auth";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({}));

export default function ConcurrentOptionDialog({ open, onClose, onSave }) {
    const { t } = useTranslation();
    const [count, setCount] = useState(
        Auth.GetPreferenceWithDefault("concurrent_limit", "5")
    );
    const classes = useStyles();

    return (
        <Dialog
            fullWidth
            maxWidth={"xs"}
            open={open}
            onClose={onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                {t("uploader.setConcurrent")}
            </DialogTitle>

            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel htmlFor="component-helper">
                        {t("uploader.concurrentTaskNumber")}
                    </InputLabel>
                    <Input
                        type={"number"}
                        inputProps={{
                            min: 1,
                            step: 1,
                            max: 20,
                        }}
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                    />
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    {t("cancel", { ns: "common" })}
                </Button>
                <div className={classes.wrapper}>
                    <Button
                        color="primary"
                        disabled={count === ""}
                        onClick={() => onSave(count)}
                    >
                        {t("ok", { ns: "common" })}
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

import React, { useState } from "react";
import { Input, InputLabel, makeStyles } from "@material-ui/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Auth from "../../middleware/Auth";
const useStyles = makeStyles((theme) => ({}));

export default function ConcurrentOptionDialog({ open, onClose, onSave }) {
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
            <DialogTitle id="form-dialog-title">任务并行数量</DialogTitle>

            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel htmlFor="component-helper">
                        同时上传的任务数量
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
                <Button onClick={onClose}>取消</Button>
                <div className={classes.wrapper}>
                    <Button
                        color="primary"
                        disabled={count === ""}
                        onClick={() => onSave(count)}
                    >
                        确定
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

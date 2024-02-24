import React, { useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import { useCaptcha } from "../../hooks/useCaptcha";
import { toggleSnackbar } from "../../redux/explorer";

const useStyles = makeStyles((theme) => ({
    smsCode: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    sendButton: {
        marginLeft: theme.spacing(1),
    },
}));

export default function BindPhone(props) {
    const [phone, setPhone] = useState(props.phone);
    const [loading, setLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [countdown, setCountdown] = useState(0);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    let countdownTimer, countdownSecond;

    const {
        captchaLoading,
        isValidate,
        validate,
        CaptchaRender,
        captchaRefreshRef,
        captchaParamsRef,
    } = useCaptcha();

    const savePhoneInfo = () => {
        return false;
    };

    const sendSMS = () => {
        setCountdown(60);
        countdownSecond = 60;
        countdownTimer = setInterval(function () {
            countdownSecond = countdownSecond - 1;
            setCountdown(countdownSecond);
            if (countdownSecond <= 0) {
                clearInterval(countdownTimer);
            }
        }, 1000);
        return false;
    };

    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
            maxWidth={"xs"}
        >
            <DialogTitle id="form-dialog-title">绑定手机</DialogTitle>

            <DialogContent>
                <FormControl fullWidth>
                    <TextField
                        label={"手机号"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <CaptchaRender />
                </FormControl>
                <FormControl fullWidth className={classes.smsCode}>
                    <TextField
                        fullWidth
                        label={"短信验证码"}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                    />
                    <Button
                        disabled={countdown > 0 || loading}
                        fullWidth
                        onClick={sendSMS}
                        variant="contained"
                        className={classes.sendButton}
                        color="primary"
                    >
                        {countdown <= 0
                            ? "发送短信验证码"
                            : `重新发送 (${countdown})`}
                    </Button>
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button onClick={props.onClose}>取消</Button>
                <div className={classes.wrapper}>
                    <Button
                        color="primary"
                        disabled={loading}
                        onClick={() => savePhoneInfo()}
                    >
                        确定
                        {loading && (
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

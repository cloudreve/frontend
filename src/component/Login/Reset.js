import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Avatar,
    Button,
    Divider,
    FormControl,
    Input,
    InputLabel,
    Link,
    makeStyles,
    Paper,
    Typography,
} from "@material-ui/core";
import API from "../../middleware/Api";
import KeyIcon from "@material-ui/icons/VpnKeyOutlined";
import { useCaptcha } from "../../hooks/useCaptcha";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    layout: {
        width: "auto",
        marginTop: "110px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up("sm")]: {
            width: 400,
            marginLeft: "auto",
            marginRight: "auto",
        },
        marginBottom: 110,
    },
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
            3
        )}px`,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    captchaContainer: {
        display: "flex",
        marginTop: "10px",
    },
    captchaPlaceholder: {
        width: 200,
    },
    link: {
        marginTop: "20px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
    },
}));

function Reset() {
    const { t } = useTranslation();

    const [input, setInput] = useState({
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const forgetCaptcha = useSelector(
        (state) => state.siteConfig.forgetCaptcha
    );
    const registerEnabled = useSelector(
        (state) => state.siteConfig.registerEnabled
    );
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const handleInputChange = (name) => (e) => {
        setInput({
            ...input,
            [name]: e.target.value,
        });
    };

    const {
        captchaLoading,
        isValidate,
        validate,
        CaptchaRender,
        captchaRefreshRef,
        captchaParamsRef,
    } = useCaptcha();

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (!isValidate.current.isValidate && forgetCaptcha) {
            validate(() => submit(e), setLoading);
            return;
        }
        API.post("/user/reset", {
            userName: input.email,
            ...captchaParamsRef.current,
        })
            .then(() => {
                setLoading(false);
                ToggleSnackbar(
                    "top",
                    "right",
                    t("login.resetEmailSent"),
                    "success"
                );
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
                captchaRefreshRef.current();
            });
    };

    const classes = useStyles();

    return (
        <div className={classes.layout}>
            <Paper className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <KeyIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {t("login.findMyPassword")}
                </Typography>
                <form className={classes.form} onSubmit={submit}>
                    <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="email">
                            {t("login.email")}
                        </InputLabel>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            onChange={handleInputChange("email")}
                            autoComplete
                            value={input.email}
                            autoFocus
                        />
                    </FormControl>
                    {forgetCaptcha && <CaptchaRender />}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={
                            loading || (forgetCaptcha ? captchaLoading : false)
                        }
                        className={classes.submit}
                    >
                        {t("login.sendMeAnEmail")}
                    </Button>{" "}
                </form>{" "}
                <Divider />
                <div className={classes.link}>
                    <div>
                        <Link component={RouterLink} to={"/login"}>
                            {t("login.backToSingIn")}
                        </Link>
                    </div>
                    <div>
                        {registerEnabled && (
                            <Link component={RouterLink} to={"/signup"}>
                                {t("login.signUpAccount")}
                            </Link>
                        )}
                    </div>
                </div>
            </Paper>
        </div>
    );
}

export default Reset;

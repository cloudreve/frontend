import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RegIcon from "@material-ui/icons/AssignmentIndOutlined";
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
    TextField,
    Typography,
} from "@material-ui/core";
import { Link as RouterLink, useHistory } from "react-router-dom";
import API from "../../middleware/Api";
import EmailIcon from "@material-ui/icons/EmailOutlined";
import { useCaptcha } from "../../hooks/useCaptcha";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";
import InputAdornment from "@material-ui/core/InputAdornment";
import { EmailOutlined, VpnKeyOutlined } from "@material-ui/icons";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

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
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    link: {
        marginTop: "20px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
    },
    buttonContainer: {
        display: "flex",
    },
    authnLink: {
        textAlign: "center",
        marginTop: 16,
    },
    avatarSuccess: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
}));

function Register() {
    const { t } = useTranslation();

    const [input, setInput] = useState({
        email: "",
        password: "",
        password_repeat: "",
    });
    const [loading, setLoading] = useState(false);
    const [emailActive, setEmailActive] = useState(false);

    const title = useSelector((state) => state.siteConfig.title);
    const regCaptcha = useSelector((state) => state.siteConfig.regCaptcha);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const history = useHistory();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    const classes = useStyles();

    const register = (e) => {
        e.preventDefault();

        if (input.password !== input.password_repeat) {
            ToggleSnackbar(
                "top",
                "right",
                t("login.passwordNotMatch"),
                "warning"
            );
            return;
        }

        setLoading(true);
        if (!isValidate.current.isValidate && regCaptcha) {
            validate(() => register(e), setLoading);
            return;
        }
        API.post("/user", {
            userName: input.email,
            Password: input.password,
            ...captchaParamsRef.current,
        })
            .then((response) => {
                setLoading(false);
                if (response.rawData.code === 203) {
                    setEmailActive(true);
                } else {
                    history.push("/login?username=" + input.email);
                    ToggleSnackbar(
                        "top",
                        "right",
                        t("login.signUpSuccess"),
                        "success"
                    );
                }
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
                captchaRefreshRef.current();
            });
    };

    return (
        <div className={classes.layout}>
            <>
                {!emailActive && (
                    <Paper className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <RegIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            {t("login.sinUpTitle", { title })}
                        </Typography>

                        <form className={classes.form} onSubmit={register}>
                            <FormControl margin="normal" required fullWidth>
                                <TextField
                                    variant={"outlined"}
                                    label={t("login.email")}
                                    inputProps={{
                                        name: "email",
                                        type: "email",
                                        id: "email",
                                    }}
                                    InputProps={{
                                        startAdornment: !isMobile && (
                                            <InputAdornment position="start">
                                                <EmailOutlined />
                                            </InputAdornment>
                                        ),
                                    }}
                                    onChange={handleInputChange("email")}
                                    autoComplete
                                    value={input.email}
                                    autoFocus
                                />
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <TextField
                                    variant={"outlined"}
                                    label={t("login.password")}
                                    inputProps={{
                                        name: "password",
                                        type: "password",
                                        id: "password",
                                    }}
                                    InputProps={{
                                        startAdornment: !isMobile && (
                                            <InputAdornment position="start">
                                                <VpnKeyOutlined />
                                            </InputAdornment>
                                        ),
                                    }}
                                    onChange={handleInputChange("password")}
                                    value={input.password}
                                    autoComplete
                                />
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <TextField
                                    label={t("login.repeatPassword")}
                                    variant={"outlined"}
                                    inputProps={{
                                        name: "pwdRepeat",
                                        type: "password",
                                        id: "pwdRepeat",
                                    }}
                                    onChange={handleInputChange(
                                        "password_repeat"
                                    )}
                                    InputProps={{
                                        startAdornment: !isMobile && (
                                            <InputAdornment position="start">
                                                <VpnKeyOutlined />
                                            </InputAdornment>
                                        ),
                                    }}
                                    value={input.password_repeat}
                                    autoComplete
                                />
                            </FormControl>
                            {regCaptcha && <CaptchaRender />}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={
                                    loading ||
                                    (regCaptcha ? captchaLoading : false)
                                }
                                className={classes.submit}
                            >
                                {t("login.signUp")}
                            </Button>
                        </form>

                        <Divider />
                        <div className={classes.link}>
                            <div>
                                <Link component={RouterLink} to={"/login"}>
                                    {t("login.backToSingIn")}
                                </Link>
                            </div>
                            <div>
                                <Link component={RouterLink} to={"/forget"}>
                                    {t("login.forgetPassword")}
                                </Link>
                            </div>
                        </div>
                    </Paper>
                )}
                {emailActive && (
                    <Paper className={classes.paper}>
                        <Avatar className={classes.avatarSuccess}>
                            <EmailIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            {t("login.activateTitle")}
                        </Typography>
                        <Typography style={{ marginTop: "10px" }}>
                            {t("login.activateDescription")}
                        </Typography>
                    </Paper>
                )}
            </>
        </div>
    );
}

export default Register;

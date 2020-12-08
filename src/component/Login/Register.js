import React, { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RegIcon from "@material-ui/icons/AssignmentIndOutlined";
import { makeStyles } from "@material-ui/core";
import { toggleSnackbar } from "../../actions/index";
import Placeholder from "../Placeholder/Captcha";
import { useHistory } from "react-router-dom";
import API from "../../middleware/Api";
import {
    Button,
    FormControl,
    Divider,
    Link,
    Input,
    InputLabel,
    Paper,
    Avatar,
    Typography
} from "@material-ui/core";
import EmailIcon from "@material-ui/icons/EmailOutlined";
import ReCaptcha from "./ReCaptcha";
const useStyles = makeStyles(theme => ({
    layout: {
        width: "auto",
        marginTop: "110px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up("sm")]: {
            width: 400,
            marginLeft: "auto",
            marginRight: "auto"
        },
        marginBottom: 110
    },
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
            3
        )}px`
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1)
    },
    submit: {
        marginTop: theme.spacing(3)
    },
    link: {
        marginTop: "20px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between"
    },
    captchaContainer: {
        display: "flex",
        marginTop: "10px",
        [theme.breakpoints.down("sm")]: {
            display: "block"
        }
    },
    captchaPlaceholder: {
        width: 200
    },
    buttonContainer: {
        display: "flex"
    },
    authnLink: {
        textAlign: "center",
        marginTop: 16
    },
    avatarSuccess: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main
    }
}));

function Register() {
    const [input, setInput] = useState({
        email: "",
        password: "",
        password_repeat: "",
        captcha: ""
    });
    const [loading, setLoading] = useState(false);
    const [emailActive, setEmailActive] = useState(false);
    const [captchaData, setCaptchaData] = useState(null);

    const title = useSelector(state => state.siteConfig.title);
    const regCaptcha = useSelector(state => state.siteConfig.regCaptcha);
    const useReCaptcha = useSelector(
        state => state.siteConfig.captcha_IsUseReCaptcha
    );
    const reCaptchaKey = useSelector(
        state => state.siteConfig.captcha_ReCaptchaKey
    );

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const history = useHistory();

    const handleInputChange = name => e => {
        setInput({
            ...input,
            [name]: e.target.value
        });
    };

    const classes = useStyles();

    const refreshCaptcha = useCallback(() => {
        API.get("/site/captcha")
            .then(response => {
                setCaptchaData(response.data);
            })
            .catch(error => {
                ToggleSnackbar(
                    "top",
                    "right",
                    "无法加载验证码：" + error.message,
                    "error"
                );
            });
    }, []);

    const register = e => {
        e.preventDefault();

        if (input.password !== input.password_repeat) {
            ToggleSnackbar("top", "right", "两次密码输入不一致", "warning");
            return;
        }

        setLoading(true);
        API.post("/user", {
            userName: input.email,
            Password: input.password,
            captchaCode: input.captcha
        })
            .then(response => {
                setLoading(false);
                if (response.rawData.code === 203) {
                    setEmailActive(true);
                } else {
                    history.push("/login?username=" + input.email);
                    ToggleSnackbar("top", "right", "注册成功", "success");
                }
            })
            .catch(error => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
                if (!useReCaptcha) {
                    refreshCaptcha();
                }
            });
    };

    useEffect(() => {
        if (regCaptcha && !useReCaptcha) {
            refreshCaptcha();
        }
    }, [regCaptcha]);

    return (
        <div className={classes.layout}>
            <>
                {!emailActive && (
                    <Paper className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <RegIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            注册 {title}
                        </Typography>

                        <form className={classes.form} onSubmit={register}>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="email">
                                    电子邮箱
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
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="password">密码</InputLabel>
                                <Input
                                    name="password"
                                    onChange={handleInputChange("password")}
                                    type="password"
                                    id="password"
                                    value={input.password}
                                    autoComplete
                                />
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="password">
                                    确认密码
                                </InputLabel>
                                <Input
                                    name="pwdRepeat"
                                    onChange={handleInputChange(
                                        "password_repeat"
                                    )}
                                    type="password"
                                    id="pwdRepeat"
                                    value={input.password_repeat}
                                    autoComplete
                                />
                            </FormControl>
                            {regCaptcha && !useReCaptcha && (
                                <div className={classes.captchaContainer}>
                                    <FormControl
                                        margin="normal"
                                        required
                                        fullWidth
                                    >
                                        <InputLabel htmlFor="captcha">
                                            验证码
                                        </InputLabel>
                                        <Input
                                            name="captcha"
                                            onChange={handleInputChange(
                                                "captcha"
                                            )}
                                            type="text"
                                            id="captcha"
                                            value={input.captcha}
                                            autoComplete
                                        />
                                    </FormControl>{" "}
                                    <div>
                                        {captchaData === null && (
                                            <div
                                                className={
                                                    classes.captchaPlaceholder
                                                }
                                            >
                                                <Placeholder />
                                            </div>
                                        )}
                                        {captchaData !== null && (
                                            <img
                                                src={captchaData}
                                                alt="captcha"
                                                onClick={refreshCaptcha}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {regCaptcha && useReCaptcha && (
                                <div className={classes.captchaContainer}>
                                    <FormControl
                                        margin="normal"
                                        required
                                        fullWidth
                                    >
                                        <ReCaptcha
                                            style={{ display: "inline-block" }}
                                            sitekey={reCaptchaKey}
                                            onChange={value =>
                                                setInput({
                                                    ...input,
                                                    captcha: value
                                                })
                                            }
                                            id="captcha"
                                            name="captcha"
                                        />
                                    </FormControl>{" "}
                                </div>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                className={classes.submit}
                            >
                                注册账号
                            </Button>
                        </form>

                        <Divider />
                        <div className={classes.link}>
                            <div>
                                <Link href={"/login"}>返回登录</Link>
                            </div>
                            <div>
                                <Link href={"/forget"}>忘记密码</Link>
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
                            邮件激活
                        </Typography>
                        <Typography style={{ marginTop: "10px" }}>
                            一封激活邮件已经发送至您的邮箱，请访问邮件中的链接以继续完成注册。
                        </Typography>
                    </Paper>
                )}
            </>
        </div>
    );
}

export default Register;

import React, { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { makeStyles } from "@material-ui/core";
import { toggleSnackbar, applyThemes } from "../../actions/index";
import Placeholder from "../placeholder/captcha";
import { useHistory } from "react-router-dom";
import API from "../../middleware/Api";
import Auth from "../../middleware/Auth";
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
import { bufferDecode, bufferEncode } from "../../untils/index";
const useStyles = makeStyles(theme => ({
    layout: {
        width: "auto",
        marginTop: "110px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 400,
            marginLeft: "auto",
            marginRight: "auto"
        }
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
        marginTop: "10px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between"
    },
    captchaContainer: {
        display: "flex",
        marginTop: "10px"
    },
    captchaPlaceholder: {
        width: 200
    }
}));

function LoginForm() {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [loading, setLoading] = useState(false);
    const [captchaData, setCaptchaData] = useState(null);

    const loginCaptcha = useSelector(state => state.siteConfig.loginCaptcha);
    const title = useSelector(state => state.siteConfig.title);
    const regCaptcha = useSelector(state => state.siteConfig.regCaptcha);
    const forgetCaptcha = useSelector(state => state.siteConfig.forgetCaptcha);
    const emailActive = useSelector(state => state.siteConfig.emailActive);
    const QQLogin = useSelector(state => state.siteConfig.QQLogin);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const ApplyThemes = useCallback(theme => dispatch(applyThemes(theme)), [
        dispatch
    ]);

    let history = useHistory();

    const classes = useStyles();

    const refreshCaptcha = () => {
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
    };

    useEffect(() => {
        if (loginCaptcha) {
            refreshCaptcha();
        }
    }, []);

    const authRegTest = e => {
        e.preventDefault();
        API.put("/user/authn", {})
            .then(response => {
                let credentialCreationOptions = response.data;
                console.log(credentialCreationOptions);
                credentialCreationOptions.publicKey.challenge = bufferDecode(
                    credentialCreationOptions.publicKey.challenge
                );
                credentialCreationOptions.publicKey.user.id = bufferDecode(
                    credentialCreationOptions.publicKey.user.id
                );
                if (credentialCreationOptions.publicKey.excludeCredentials) {
                    for (
                        var i = 0;
                        i <
                        credentialCreationOptions.publicKey.excludeCredentials
                            .length;
                        i++
                    ) {
                        credentialCreationOptions.publicKey.excludeCredentials[
                            i
                        ].id = bufferDecode(
                            credentialCreationOptions.publicKey
                                .excludeCredentials[i].id
                        );
                    }
                }

                return navigator.credentials.create({
                    publicKey: credentialCreationOptions.publicKey
                });
            })
            .then(credential => {
                console.log(credential);
                let attestationObject = credential.response.attestationObject;
                let clientDataJSON = credential.response.clientDataJSON;
                let rawId = credential.rawId;
                API.put(
                    "/user/authn/finish",
                    JSON.stringify({
                        id: credential.id,
                        rawId: bufferEncode(rawId),
                        type: credential.type,
                        response: {
                            attestationObject: bufferEncode(attestationObject),
                            clientDataJSON: bufferEncode(clientDataJSON)
                        }
                    })
                );
            })
            .then(success => {
                alert("successfully registered!");
                return;
            })
            .catch(error => {
                console.log(error);
                alert("failed to register ");
            });
    };

    const authnLogin = e => {
        e.preventDefault();
        API.get("/user/authn/" + email)
            .then(response => {
                let credentialRequestOptions = response.data;
                console.log(credentialRequestOptions);
                credentialRequestOptions.publicKey.challenge = bufferDecode(
                    credentialRequestOptions.publicKey.challenge
                );
                credentialRequestOptions.publicKey.allowCredentials.forEach(
                    function(listItem) {
                        listItem.id = bufferDecode(listItem.id);
                    }
                );

                return navigator.credentials.get({
                    publicKey: credentialRequestOptions.publicKey
                });
            })
            .then(assertion => {
                console.log(assertion);
                let authData = assertion.response.authenticatorData;
                let clientDataJSON = assertion.response.clientDataJSON;
                let rawId = assertion.rawId;
                let sig = assertion.response.signature;
                let userHandle = assertion.response.userHandle;

                API.post(
                    "/user/authn/finish/" + email,
                    JSON.stringify({
                        id: assertion.id,
                        rawId: bufferEncode(rawId),
                        type: assertion.type,
                        response: {
                            authenticatorData: bufferEncode(authData),
                            clientDataJSON: bufferEncode(clientDataJSON),
                            signature: bufferEncode(sig),
                            userHandle: bufferEncode(userHandle)
                        }
                    })
                ).then(response => {
                    setLoading(false);
                    Auth.authenticate(response.data);

                    // 设置用户主题色
                    if (response.data["preferred_theme"] !== "") {
                        ApplyThemes(response.data["preferred_theme"]);
                    }

                    history.push("/home");
                    ToggleSnackbar("top", "right", "登录成功", "success");
                    return;
                });
            })
            .then(success => {

                return;
            })
            .catch(error => {
                console.log(error);
                alert("failed to register ");
            });
    };

    const login = e => {
        // authnLogin(e);
        // return;

        e.preventDefault();
        setLoading(true);
        API.post("/user/session", {
            userName: email,
            Password: pwd,
            captchaCode: captcha
        })
            .then(response => {
                // console.log(response);
                // if(response.data.code!=="200"){
                //     this.setState({
                //         loading:false,
                //     });
                //     if(response.data.message==="tsp"){
                //         window.location.href="/Member/TwoStep";
                //     }else{
                //         this.props.toggleSnackbar("top","right",response.data.message,"warning");
                //         this.refreshCaptcha();
                //     }
                // }else{
                setLoading(false);
                Auth.authenticate(response.data);

                // 设置用户主题色
                if (response.data["preferred_theme"] !== "") {
                    ApplyThemes(response.data["preferred_theme"]);
                }

                history.push("/home");
                ToggleSnackbar("top", "right", "登录成功", "success");
                // }
            })
            .catch(error => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
                refreshCaptcha();
            });
    };

    return (
        <div className={classes.layout}>
            <Paper className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    登录{title}
                </Typography>
                <form className={classes.form} onSubmit={login}>
                    <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="email">电子邮箱</InputLabel>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            onChange={e => setEmail(e.target.value)}
                            autoComplete
                            value={email}
                            autoFocus
                        />
                    </FormControl>
                    <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="password">密码</InputLabel>
                        <Input
                            name="password"
                            onChange={e => setPwd(e.target.value)}
                            type="password"
                            id="password"
                            value={pwd}
                            autoComplete
                        />
                    </FormControl>
                    {loginCaptcha && (
                        <div className={classes.captchaContainer}>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="captcha">
                                    验证码
                                </InputLabel>
                                <Input
                                    name="captcha"
                                    onChange={e => setCaptcha(e.target.value)}
                                    type="text"
                                    id="captcha"
                                    value={captcha}
                                    autoComplete
                                />
                            </FormControl>{" "}
                            <div>
                                {captchaData === null && (
                                    <div className={classes.captchaPlaceholder}>
                                        <Placeholder />
                                    </div>
                                )}
                                {captchaData !== null && (
                                    <img
                                        src={captchaData}
                                        alt="captcha"
                                        onClick={refreshCaptcha}
                                    ></img>
                                )}
                            </div>
                        </div>
                    )}
                    {QQLogin && (
                        <div>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                className={classes.submit}
                            >
                                登录
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                style={{ marginLeft: "10px" }}
                                disabled={loading}
                                className={classes.submit}
                                onClick={() =>
                                    (window.location.href = "/Member/QQLogin")
                                }
                            >
                                使用QQ登录
                            </Button>
                        </div>
                    )}
                    {!QQLogin && (
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            className={classes.submit}
                        >
                            登录
                        </Button>
                    )}
                </form>{" "}
                <Divider />
                <div className={classes.link}>
                    <div>
                        <Link href={"/Member/FindPwd"}>忘记密码</Link>
                    </div>
                    <div>
                        <Link href={"/SignUp"}>注册账号</Link>
                    </div>
                </div>
            </Paper>
        </div>
    );
}

export default LoginForm;

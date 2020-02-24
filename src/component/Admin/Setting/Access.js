import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import AlertDialog from "../Dialogs/Alert";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100
        },
        marginBottom: 40
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
        marginBottom: 20
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px"
        }
    }
}));

export default function Access() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        register_enabled: "1",
        default_group: "1",
        email_active: "0",
        login_captcha: "0",
        reg_captcha: "0",
        forget_captcha: "0",
        qq_login: "0",
        qq_direct_login: "0",
        qq_login_id: "",
        qq_login_key: "",
        authn_enabled: "0"
    });
    const [siteURL, setSiteURL] = useState("");
    const [groups, setGroups] = useState([]);
    const [httpAlert, setHttpAlert] = useState(false);

    const handleChange = name => event => {
        let value = event.target.value;
        if (event.target.checked !== undefined) {
            value = event.target.checked ? "1" : "0";
        }
        setOptions({
            ...options,
            [name]: value
        });
    };

    const handleInputChange = name => event => {
        let value = event.target.value;
        setOptions({
            ...options,
            [name]: value
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.post("/admin/setting", {
            keys: [...Object.keys(options), "siteURL"]
        })
            .then(response => {
                setSiteURL(response.data.siteURL);
                delete response.data.siteURL;
                setOptions(response.data);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });

        API.get("/admin/groups")
            .then(response => {
                setGroups(response.data);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const submit = e => {
        e.preventDefault();
        setLoading(true);
        let option = [];
        Object.keys(options).forEach(k => {
            option.push({
                key: k,
                value: options[k]
            });
        });
        API.patch("/admin/setting", {
            options: option
        })
            .then(response => {
                ToggleSnackbar("top", "right", "设置已更改", "success");
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <AlertDialog
                title={"提示"}
                msg={
                    "Web Authn 需要您的站点启用 HTTPS，并确认 参数设置 - 站点信息 - 站点URL 也使用了 HTTPS 后才能开启。"
                }
                onClose={() => setHttpAlert(false)}
                open={httpAlert}
            />
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        注册与登录
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.register_enabled === "1"
                                            }
                                            onChange={handleChange(
                                                "register_enabled"
                                            )}
                                        />
                                    }
                                    label="允许新用户注册"
                                />
                                <FormHelperText id="component-helper-text">
                                    关闭后，无法再通过前台注册新的用户
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.email_active === "1"
                                            }
                                            onChange={handleChange(
                                                "email_active"
                                            )}
                                        />
                                    }
                                    label="邮件激活"
                                />
                                <FormHelperText id="component-helper-text">
                                    开启后，新用户注册需要点击邮件中的激活链接才能完成。请确认邮件发送设置是否正确，否则激活邮件无法送达
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.reg_captcha === "1"
                                            }
                                            onChange={handleChange(
                                                "reg_captcha"
                                            )}
                                        />
                                    }
                                    label="注册验证码"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否启用注册表单验证码
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.login_captcha === "1"
                                            }
                                            onChange={handleChange(
                                                "login_captcha"
                                            )}
                                        />
                                    }
                                    label="登录验证码"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否启用登录表单验证码
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.forget_captcha === "1"
                                            }
                                            onChange={handleChange(
                                                "forget_captcha"
                                            )}
                                        />
                                    }
                                    label="找回密码验证码"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否启用找回密码表单验证码
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.authn_enabled === "1"
                                            }
                                            onChange={e => {
                                                if (
                                                    !siteURL.startsWith(
                                                        "https://"
                                                    )
                                                ) {
                                                    setHttpAlert(true);
                                                    return;
                                                }
                                                handleChange("authn_enabled")(
                                                    e
                                                );
                                            }}
                                        />
                                    }
                                    label="Web Authn"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否允许用户使用绑定的外部验证器登录，站点必须启动
                                    HTTPS 才能使用。
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    默认用户组
                                </InputLabel>
                                <Select
                                    value={options.default_group}
                                    onChange={handleInputChange(
                                        "default_group"
                                    )}
                                    required
                                >
                                    {groups.map(v => {
                                        if (v.ID === 3) {
                                            return null;
                                        }
                                        return (
                                            <MenuItem
                                                key={v.ID}
                                                value={v.ID.toString()}
                                            >
                                                {v.Name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    用户注册后的初始用户组
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        QQ互联
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Alert severity="info">创建应用时，回调地址请填写：{siteURL.endsWith("/") ? (siteURL + "api/v3/callback/qq"):(siteURL + "/api/v3/callback/qq")}</Alert>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={options.qq_login === "1"}
                                            onChange={handleChange("qq_login")}
                                        />
                                    }
                                    label="开启QQ互联"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否允许绑定QQ、使用QQ登录本站
                                </FormHelperText>
                            </FormControl>
                        </div>

                        {options.qq_login === "1" && (
                            <>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={
                                                        options.qq_direct_login ===
                                                        "1"
                                                    }
                                                    onChange={handleChange(
                                                        "qq_direct_login"
                                                    )}
                                                />
                                            }
                                            label="未绑定时可直接登录"
                                        />
                                        <FormHelperText id="component-helper-text">
                                            开启后，如果用户使用了QQ登录，但是没有已绑定的注册用户，系统会为其创建用户并登录。这种方式创建的用户日后只能使用QQ登录。
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            APP ID
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.qq_login_id}
                                            onChange={handleInputChange(
                                                "qq_login_id"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            应用管理页面获取到的的 APP ID
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            APP KEY
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.qq_login_key}
                                            onChange={handleInputChange(
                                                "qq_login_key"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            应用管理页面获取到的的 APP KEY
                                        </FormHelperText>
                                    </FormControl>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={classes.root}>
                    <Button
                        disabled={loading}
                        type={"submit"}
                        variant={"contained"}
                        color={"primary"}
                    >
                        保存
                    </Button>
                </div>
            </form>
        </div>
    );
}

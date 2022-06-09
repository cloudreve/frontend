import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import Link from "@material-ui/core/Link";
import { toggleSnackbar } from "../../../redux/explorer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
        marginBottom: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
}));

export default function Captcha() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        captcha_type: "normal",
        captcha_height: "1",
        captcha_width: "1",
        captcha_mode: "3",
        captcha_CaptchaLen: "6",
        captcha_ComplexOfNoiseText: "0",
        captcha_ComplexOfNoiseDot: "0",
        captcha_IsShowHollowLine: "0",
        captcha_IsShowNoiseDot: "0",
        captcha_IsShowNoiseText: "0",
        captcha_IsShowSlimeLine: "0",
        captcha_IsShowSineLine: "0",
        captcha_ReCaptchaKey: "",
        captcha_ReCaptchaSecret: "",
        captcha_TCaptcha_CaptchaAppId: "",
        captcha_TCaptcha_AppSecretKey: "",
        captcha_TCaptcha_SecretId: "",
        captcha_TCaptcha_SecretKey: "",
    });

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
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
            keys: Object.keys(options),
        })
            .then((response) => {
                setOptions(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        const option = [];
        Object.keys(options).forEach((k) => {
            option.push({
                key: k,
                value: options[k],
            });
        });
        API.patch("/admin/setting", {
            options: option,
        })
            .then(() => {
                ToggleSnackbar("top", "right", "设置已更改", "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const handleCheckChange = (name) => (event) => {
        const value = event.target.checked ? "1" : "0";
        setOptions({
            ...options,
            [name]: value,
        });
    };

    return (
        <div>
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        验证码
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    验证码类型
                                </InputLabel>
                                <Select
                                    value={options.captcha_type}
                                    onChange={handleChange("captcha_type")}
                                    required
                                >
                                    <MenuItem value={"normal"}>普通</MenuItem>
                                    <MenuItem value={"recaptcha"}>
                                        reCAPTCHA V2
                                    </MenuItem>
                                    <MenuItem value={"tcaptcha"}>
                                        腾讯云验证码
                                    </MenuItem>
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    验证码类型
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                {options.captcha_type === "normal" && (
                    <div className={classes.root}>
                        <Typography variant="h6" gutterBottom>
                            普通验证码
                        </Typography>
                        <div className={classes.formContainer}>
                            <div className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        宽度
                                    </InputLabel>
                                    <Input
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={options.captcha_width}
                                        onChange={handleChange("captcha_width")}
                                        required
                                    />
                                </FormControl>
                            </div>

                            <div className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        高度
                                    </InputLabel>
                                    <Input
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={options.captcha_height}
                                        onChange={handleChange(
                                            "captcha_height"
                                        )}
                                        required
                                    />
                                </FormControl>
                            </div>

                            <div className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        长度
                                    </InputLabel>
                                    <Input
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={options.captcha_CaptchaLen}
                                        onChange={handleChange(
                                            "captcha_CaptchaLen"
                                        )}
                                        required
                                    />
                                </FormControl>
                            </div>
                            <div className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        模式
                                    </InputLabel>
                                    <Select
                                        value={options.captcha_mode}
                                        onChange={handleChange("captcha_mode")}
                                        required
                                    >
                                        <MenuItem value={"0"}>数字</MenuItem>
                                        <MenuItem value={"1"}>字母</MenuItem>
                                        <MenuItem value={"2"}>算数</MenuItem>
                                        <MenuItem value={"3"}>
                                            数字+字母
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText id="component-helper-text">
                                        验证码的形式
                                    </FormHelperText>
                                </FormControl>
                            </div>
                            {[
                                {
                                    name: "加强干扰文字",
                                    field: "captcha_ComplexOfNoiseText",
                                },
                                {
                                    name: "加强干扰点",
                                    field: "captcha_ComplexOfNoiseDot",
                                },
                                {
                                    name: "使用空心线",
                                    field: "captcha_IsShowHollowLine",
                                },
                                {
                                    name: "使用噪点",
                                    field: "captcha_IsShowNoiseDot",
                                },
                                {
                                    name: "使用干扰文字",
                                    field: "captcha_IsShowNoiseText",
                                },
                                {
                                    name: "使用波浪线",
                                    field: "captcha_IsShowSlimeLine",
                                },
                                {
                                    name: "使用正弦线",
                                    field: "captcha_IsShowSineLine",
                                },
                            ].map((input) => (
                                <div key={input.name} className={classes.form}>
                                    <FormControl fullWidth>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={
                                                        options[input.field] ===
                                                        "1"
                                                    }
                                                    onChange={handleCheckChange(
                                                        input.field
                                                    )}
                                                />
                                            }
                                            label={input.name}
                                        />
                                    </FormControl>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {options.captcha_type === "recaptcha" && (
                    <div className={classes.root}>
                        <Typography variant="h6" gutterBottom>
                            reCAPTCHA V2
                        </Typography>
                        <div className={classes.formContainer}>
                            <div className={classes.form}>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            Site KEY
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.captcha_ReCaptchaKey}
                                            onChange={handleChange(
                                                "captcha_ReCaptchaKey"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            <Link
                                                href={
                                                    "https://www.google.com/recaptcha/admin/create"
                                                }
                                                target={"_blank"}
                                            >
                                                应用管理页面
                                            </Link>{" "}
                                            获取到的的 网站密钥
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            Secret
                                        </InputLabel>
                                        <Input
                                            required
                                            value={
                                                options.captcha_ReCaptchaSecret
                                            }
                                            onChange={handleChange(
                                                "captcha_ReCaptchaSecret"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            <Link
                                                href={
                                                    "https://www.google.com/recaptcha/admin/create"
                                                }
                                                target={"_blank"}
                                            >
                                                应用管理页面
                                            </Link>{" "}
                                            获取到的的 秘钥
                                        </FormHelperText>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {options.captcha_type === "tcaptcha" && (
                    <div className={classes.root}>
                        <Typography variant="h6" gutterBottom>
                            腾讯云验证码
                        </Typography>
                        <div className={classes.formContainer}>
                            <div className={classes.form}>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            SecretId
                                        </InputLabel>
                                        <Input
                                            required
                                            value={
                                                options.captcha_TCaptcha_SecretId
                                            }
                                            onChange={handleChange(
                                                "captcha_TCaptcha_SecretId"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            <Link
                                                href={
                                                    "https://console.cloud.tencent.com/capi"
                                                }
                                                target={"_blank"}
                                            >
                                                访问密钥页面
                                            </Link>{" "}
                                            获取到的的 SecretId
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            SecretKey
                                        </InputLabel>
                                        <Input
                                            required
                                            value={
                                                options.captcha_TCaptcha_SecretKey
                                            }
                                            onChange={handleChange(
                                                "captcha_TCaptcha_SecretKey"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            <Link
                                                href={
                                                    "https://console.cloud.tencent.com/capi"
                                                }
                                                target={"_blank"}
                                            >
                                                访问密钥页面
                                            </Link>{" "}
                                            获取到的的 SecretKey
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            APPID
                                        </InputLabel>
                                        <Input
                                            required
                                            value={
                                                options.captcha_TCaptcha_CaptchaAppId
                                            }
                                            onChange={handleChange(
                                                "captcha_TCaptcha_CaptchaAppId"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            <Link
                                                href={
                                                    "https://console.cloud.tencent.com/captcha/graphical"
                                                }
                                                target={"_blank"}
                                            >
                                                图形验证页面
                                            </Link>{" "}
                                            获取到的的 APPID
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            App Secret Key
                                        </InputLabel>
                                        <Input
                                            required
                                            value={
                                                options.captcha_TCaptcha_AppSecretKey
                                            }
                                            onChange={handleChange(
                                                "captcha_TCaptcha_AppSecretKey"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            <Link
                                                href={
                                                    "https://console.cloud.tencent.com/captcha/graphical"
                                                }
                                                target={"_blank"}
                                            >
                                                图形验证页面
                                            </Link>{" "}
                                            获取到的的 App Secret Key
                                        </FormHelperText>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

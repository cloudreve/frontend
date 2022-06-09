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
import { Trans, useTranslation } from "react-i18next";

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
                ToggleSnackbar("top", "right", t("saved"), "success");
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
                        {t("captcha")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("captchaType")}
                                </InputLabel>
                                <Select
                                    value={options.captcha_type}
                                    onChange={handleChange("captcha_type")}
                                    required
                                >
                                    <MenuItem value={"normal"}>
                                        {t("plainCaptcha")}
                                    </MenuItem>
                                    <MenuItem value={"recaptcha"}>
                                        {t("reCaptchaV2")}
                                    </MenuItem>
                                    <MenuItem value={"tcaptcha"}>
                                        {t("tencentCloudCaptcha")}
                                    </MenuItem>
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {t("captchaProvider")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                {options.captcha_type === "normal" && (
                    <div className={classes.root}>
                        <Typography variant="h6" gutterBottom>
                            {t("plainCaptchaTitle")}
                        </Typography>
                        <div className={classes.formContainer}>
                            <div className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        {t("captchaWidth")}
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
                                        {t("captchaHeight")}
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
                                        {t("captchaLength")}
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
                                        {t("captchaMode")}
                                    </InputLabel>
                                    <Select
                                        value={options.captcha_mode}
                                        onChange={handleChange("captcha_mode")}
                                        required
                                    >
                                        <MenuItem value={"0"}>
                                            {t("captchaModeNumber")}
                                        </MenuItem>
                                        <MenuItem value={"1"}>
                                            {t("captchaModeLetter")}
                                        </MenuItem>
                                        <MenuItem value={"2"}>
                                            {t("captchaModeMath")}
                                        </MenuItem>
                                        <MenuItem value={"3"}>
                                            {t("captchaModeNumberLetter")}
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText id="component-helper-text">
                                        {t("captchaElement")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                            {[
                                {
                                    name: "complexOfNoiseText",
                                    field: "captcha_ComplexOfNoiseText",
                                },
                                {
                                    name: "complexOfNoiseDot",
                                    field: "captcha_ComplexOfNoiseDot",
                                },
                                {
                                    name: "showHollowLine",
                                    field: "captcha_IsShowHollowLine",
                                },
                                {
                                    name: "showNoiseDot",
                                    field: "captcha_IsShowNoiseDot",
                                },
                                {
                                    name: "showNoiseText",
                                    field: "captcha_IsShowNoiseText",
                                },
                                {
                                    name: "showSlimeLine",
                                    field: "captcha_IsShowSlimeLine",
                                },
                                {
                                    name: "showSineLine",
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
                                            label={t(input.name)}
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
                            {t("reCaptchaV2")}
                        </Typography>
                        <div className={classes.formContainer}>
                            <div className={classes.form}>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("siteKey")}
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.captcha_ReCaptchaKey}
                                            onChange={handleChange(
                                                "captcha_ReCaptchaKey"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            <Trans
                                                ns={"dashboard"}
                                                i18nKey={"settings.siteKeyDes"}
                                                components={[
                                                    <Link
                                                        key={0}
                                                        href={
                                                            "https://www.google.com/recaptcha/admin/create"
                                                        }
                                                        target={"_blank"}
                                                    />,
                                                ]}
                                            />
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("siteSecret")}
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
                                            <Trans
                                                ns={"dashboard"}
                                                i18nKey={
                                                    "settings.siteSecretDes"
                                                }
                                                components={[
                                                    <Link
                                                        key={0}
                                                        href={
                                                            "https://www.google.com/recaptcha/admin/create"
                                                        }
                                                        target={"_blank"}
                                                    />,
                                                ]}
                                            />
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
                            {t("tencentCloudCaptcha")}
                        </Typography>
                        <div className={classes.formContainer}>
                            <div className={classes.form}>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("secretID")}
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
                                            <Trans
                                                ns={"dashboard"}
                                                i18nKey={
                                                    "settings.siteSecretDes"
                                                }
                                                components={[
                                                    <Link
                                                        key={0}
                                                        href={
                                                            "https://console.cloud.tencent.com/capi"
                                                        }
                                                        target={"_blank"}
                                                    />,
                                                ]}
                                            />
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("secretKey")}
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
                                            <Trans
                                                ns={"dashboard"}
                                                i18nKey={
                                                    "settings.secretKeyDes"
                                                }
                                                components={[
                                                    <Link
                                                        key={0}
                                                        href={
                                                            "https://console.cloud.tencent.com/capi"
                                                        }
                                                        target={"_blank"}
                                                    />,
                                                ]}
                                            />
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("tCaptchaAppID")}
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
                                            <Trans
                                                ns={"dashboard"}
                                                i18nKey={
                                                    "settings.tCaptchaAppIDDes"
                                                }
                                                components={[
                                                    <Link
                                                        key={0}
                                                        href={
                                                            "https://console.cloud.tencent.com/captcha/graphical"
                                                        }
                                                        target={"_blank"}
                                                    />,
                                                ]}
                                            />
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("tCaptchaSecretKey")}
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
                                            <Trans
                                                ns={"dashboard"}
                                                i18nKey={
                                                    "settings.tCaptchaSecretKeyDes"
                                                }
                                                components={[
                                                    <Link
                                                        key={0}
                                                        href={
                                                            "https://console.cloud.tencent.com/captcha/graphical"
                                                        }
                                                        target={"_blank"}
                                                    />,
                                                ]}
                                            />
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
                        {t("save")}
                    </Button>
                </div>
            </form>
        </div>
    );
}

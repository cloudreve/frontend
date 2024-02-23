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
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import AlertDialog from "../Dialogs/Alert";
import Alert from "@material-ui/lab/Alert";
import FileSelector from "../Common/FileSelector";
import { toggleSnackbar } from "../../../redux/explorer";
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

export default function Access() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const { t: tVas } = useTranslation("dashboard", { keyPrefix: "vas" });
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [initCompleted, setInitComplete] = useState(false);
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
        authn_enabled: "0",
        mail_domain_filter: "0",
        mail_domain_filter_list: "",
        initial_files: "[]",
    });
    const [siteURL, setSiteURL] = useState("");
    const [groups, setGroups] = useState([]);
    const [httpAlert, setHttpAlert] = useState(false);

    const handleChange = (name) => (event) => {
        let value = event.target.value;
        if (event.target.checked !== undefined) {
            value = event.target.checked ? "1" : "0";
        }
        setOptions({
            ...options,
            [name]: value,
        });
    };

    const handleInputChange = (name) => (event) => {
        const value = event.target.value;
        setOptions({
            ...options,
            [name]: value,
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
            keys: [...Object.keys(options), "siteURL"],
        })
            .then((response) => {
                setSiteURL(response.data.siteURL);
                delete response.data.siteURL;
                setOptions(response.data);
                setInitComplete(true);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });

        API.get("/admin/groups")
            .then((response) => {
                setGroups(response.data);
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

    return (
        <div>
            <AlertDialog
                title={t("hint")}
                msg={t("webauthnNoHttps")}
                onClose={() => setHttpAlert(false)}
                open={httpAlert}
            />
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("accountManagement")}
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
                                    label={t("allowNewRegistrations")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("allowNewRegistrationsDes")}
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
                                    label={t("emailActivation")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("emailActivationDes")}
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
                                    label={t("captchaForSignup")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("captchaForSignupDes")}
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
                                    label={t("captchaForLogin")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("captchaForLoginDes")}
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
                                    label={t("captchaForReset")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("captchaForResetDes")}
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
                                            onChange={(e) => {
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
                                    label={t("webauthn")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("webauthnDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("defaultGroup")}
                                </InputLabel>
                                <Select
                                    value={options.default_group}
                                    onChange={handleInputChange(
                                        "default_group"
                                    )}
                                    required
                                >
                                    {groups.map((v) => {
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
                                    {t("defaultGroupDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                {initCompleted && (
                                    <FileSelector
                                        label={tVas("initialFiles")}
                                        value={JSON.parse(
                                            options.initial_files
                                        )}
                                        onChange={(v) =>
                                            handleInputChange("initial_files")({
                                                target: { value: v },
                                            })
                                        }
                                    />
                                )}
                                <FormHelperText id="component-helper-text">
                                    {tVas("initialFilesDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {tVas("filterEmailProvider")}
                                </InputLabel>
                                <Select
                                    value={options.mail_domain_filter}
                                    onChange={handleInputChange(
                                        "mail_domain_filter"
                                    )}
                                    required
                                >
                                    {[
                                        tVas("filterEmailProviderDisabled"),
                                        tVas("filterEmailProviderWhitelist"),
                                        tVas("filterEmailProviderBlacklist"),
                                    ].map((v, i) => (
                                        <MenuItem key={i} value={i.toString()}>
                                            {v}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {tVas("filterEmailProviderDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        {options.mail_domain_filter !== "0" && (
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {tVas("filterEmailProviderRule")}
                                    </InputLabel>
                                    <Input
                                        value={options.mail_domain_filter_list}
                                        onChange={handleChange(
                                            "mail_domain_filter_list"
                                        )}
                                        multiline
                                        rowsMax="10"
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {tVas("filterEmailProviderRuleDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {tVas("qqConnect")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Alert severity="info">
                                {tVas("qqConnectHint", {
                                    url: siteURL.endsWith("/")
                                        ? siteURL + "login/qq"
                                        : siteURL + "/login/qq",
                                })}
                            </Alert>
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
                                    label={tVas("enableQQConnect")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {tVas("enableQQConnectDes")}
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
                                            label={tVas("loginWithoutBinding")}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            {tVas("loginWithoutBindingDes")}
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {tVas("appid")}
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.qq_login_id}
                                            onChange={handleInputChange(
                                                "qq_login_id"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            {tVas("appidDes")}
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {tVas("appKey")}
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.qq_login_key}
                                            onChange={handleInputChange(
                                                "qq_login_key"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            {tVas("appKeyDes")}
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
                        {t("save")}
                    </Button>
                </div>
            </form>
        </div>
    );
}

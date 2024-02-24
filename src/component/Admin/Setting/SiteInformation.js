import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { toggleSnackbar } from "../../../redux/explorer";
import { Trans, useTranslation } from "react-i18next";
import InputAdornment from "@material-ui/core/InputAdornment";
import { green } from "@material-ui/core/colors";
import { Cancel, CheckCircle, Sync } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import { Tooltip } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Link from "@material-ui/core/Link";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

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

export default function SiteInformation() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const { t: tVas } = useTranslation("dashboard", { keyPrefix: "vas" });
    const { t: tGlobal } = useTranslation("dashboard");
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        siteURL: "",
        siteName: "",
        siteTitle: "",
        siteKeywords: "",
        siteDes: "",
        siteScript: "",
        siteNotice: "",
        pwa_small_icon: "",
        pwa_medium_icon: "",
        pwa_large_icon: "",
        pwa_display: "",
        pwa_theme_color: "",
        pwa_background_color: "",
        vol_content: "",
        show_app_promotion: "0",
        app_feedback_link: "",
        app_forum_link: "",
    });

    const vol = useMemo(() => {
        if (options.vol_content) {
            const volJson = atob(options.vol_content);
            return JSON.parse(volJson);
        }
    }, [options]);

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
        });
    };

    const handleOptionChange = (name) => (event) => {
        let value = event.target.value;
        if (event.target.checked !== undefined) {
            value = event.target.checked ? "1" : "0";
        }
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

    const refresh = () =>
        API.post("/admin/setting", {
            keys: Object.keys(options),
        })
            .then((response) => {
                setOptions(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });

    useEffect(() => {
        refresh();
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

    const syncVol = () => {
        setLoading(true);
        API.get("/admin/vol/sync")
            .then(() => {
                refresh();
                ToggleSnackbar("top", "right", tVas("volSynced"), "success");
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
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("basicInformation")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("mainTitle")}
                                </InputLabel>
                                <Input
                                    value={options.siteName}
                                    onChange={handleChange("siteName")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("mainTitleDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("subTitle")}
                                </InputLabel>
                                <Input
                                    value={options.siteTitle}
                                    onChange={handleChange("siteTitle")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("subTitleDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("siteKeywords")}
                                </InputLabel>
                                <Input
                                    value={options.siteKeywords}
                                    onChange={handleChange("siteKeywords")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("siteKeywordsDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("siteDescription")}
                                </InputLabel>
                                <Input
                                    value={options.siteDes}
                                    onChange={handleChange("siteDes")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("siteDescriptionDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("siteURL")}
                                </InputLabel>
                                <Input
                                    type={"url"}
                                    value={options.siteURL}
                                    onChange={handleChange("siteURL")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("siteURLDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("customFooterHTML")}
                                </InputLabel>
                                <Input
                                    multiline
                                    value={options.siteScript}
                                    onChange={handleChange("siteScript")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("customFooterHTMLDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("announcement")}
                                </InputLabel>
                                <Input
                                    placeholder={t("supportHTML")}
                                    multiline
                                    value={options.siteNotice}
                                    onChange={handleChange("siteNotice")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("announcementDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {tVas("mobileApp")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Alert severity="info">
                                <Typography variant="body2">
                                    <Trans
                                        ns={"dashboard"}
                                        i18nKey={"vas.volPurchase"}
                                        components={[
                                            <Link
                                                key={0}
                                                href={
                                                    "https://cloudreve.org/login"
                                                }
                                                target={"_blank"}
                                            />,
                                            <Link
                                                key={1}
                                                href={
                                                    "https://cloudreve.org/ios"
                                                }
                                                target={"_blank"}
                                            />,
                                        ]}
                                    />
                                </Typography>
                            </Alert>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {tVas("iosVol")}
                                </InputLabel>
                                <Input
                                    startAdornment={
                                        <InputAdornment position="start">
                                            {vol ? (
                                                <CheckCircle
                                                    style={{
                                                        color: green[500],
                                                    }}
                                                />
                                            ) : (
                                                <Cancel color={"error"} />
                                            )}
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title={tVas("syncLicense")}
                                            >
                                                <IconButton
                                                    disabled={loading}
                                                    onClick={() => syncVol()}
                                                    aria-label="toggle password visibility"
                                                >
                                                    <Sync />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    }
                                    readOnly
                                    value={
                                        vol ? vol.domain : tGlobal("share.none")
                                    }
                                />
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.show_app_promotion ===
                                                "1"
                                            }
                                            onChange={handleOptionChange(
                                                "show_app_promotion"
                                            )}
                                        />
                                    }
                                    label={tVas("showAppPromotion")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {tVas("showAppPromotionDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {tVas("appFeedback")}
                                </InputLabel>
                                <Input
                                    value={options.app_feedback_link}
                                    onChange={handleChange("app_feedback_link")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {tVas("appLinkDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {tVas("appForum")}
                                </InputLabel>
                                <Input
                                    value={options.app_forum_link}
                                    onChange={handleChange("app_forum_link")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {tVas("appLinkDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("pwa")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("smallIcon")}
                                </InputLabel>
                                <Input
                                    value={options.pwa_small_icon}
                                    onChange={handleChange("pwa_small_icon")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("smallIconDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("mediumIcon")}
                                </InputLabel>
                                <Input
                                    value={options.pwa_medium_icon}
                                    onChange={handleChange("pwa_medium_icon")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("mediumIconDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("largeIcon")}
                                </InputLabel>
                                <Input
                                    value={options.pwa_large_icon}
                                    onChange={handleChange("pwa_large_icon")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("largeIconDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("displayMode")}
                                </InputLabel>
                                <Select
                                    value={options.pwa_display}
                                    onChange={handleChange("pwa_display")}
                                >
                                    <MenuItem value={"fullscreen"}>
                                        fullscreen
                                    </MenuItem>
                                    <MenuItem value={"standalone"}>
                                        standalone
                                    </MenuItem>
                                    <MenuItem value={"minimal-ui"}>
                                        minimal-ui
                                    </MenuItem>
                                    <MenuItem value={"browser"}>
                                        browser
                                    </MenuItem>
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {t("displayModeDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("themeColor")}
                                </InputLabel>
                                <Input
                                    value={options.pwa_theme_color}
                                    onChange={handleChange("pwa_theme_color")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("themeColorDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("backgroundColor")}
                                </InputLabel>
                                <Input
                                    value={options.pwa_background_color}
                                    onChange={handleChange(
                                        "pwa_background_color"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("backgroundColorDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
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

import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../redux/explorer";
import API from "../../../middleware/Api";
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

export default function SiteInformation() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        siteURL: "",
        siteName: "",
        siteTitle: "",
        siteDes: "",
        siteScript: "",
        pwa_small_icon: "",
        pwa_medium_icon: "",
        pwa_large_icon: "",
        pwa_display: "",
        pwa_theme_color: "",
        pwa_background_color: "",
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

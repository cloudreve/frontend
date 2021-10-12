import { useTranslation } from "react-i18next";
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
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";

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
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        siteURL: "",
        siteName: "",
        siteTitle: "",
        siteDes: "",
        siteICPId: "",
        siteScript: "",
        pwa_small_icon: "",
        pwa_medium_icon: "",
        pwa_large_icon: "",
        pwa_display: "",
        pwa_theme_color: "",
        pwa_background_color: "",
    });

    const { t } = useTranslation();

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
                ToggleSnackbar("top", "right", t('Settings have been changed'), "success");
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
                    {t('Basic Information')}
                  </Typography>
                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Main title')}
                              </InputLabel>
                              <Input
                                  value={options.siteName}
                                  onChange={handleChange("siteName")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The main title of the site')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('subtitle')}
                              </InputLabel>
                              <Input
                                  value={options.siteTitle}
                                  onChange={handleChange("siteTitle")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Subtitle of the site')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Site Description')}
                              </InputLabel>
                              <Input
                                  value={options.siteDes}
                                  onChange={handleChange("siteDes")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Site description information may be displayed in the summary of the sharing page')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Site URL')}
                              </InputLabel>
                              <Input
                                  type={"url"}
                                  value={options.siteURL}
                                  onChange={handleChange("siteURL")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Very important, please ensure that it is consistent with the actual situation. When using cloud storage strategies and payment platforms, please fill in an address that can be accessed by the external network.')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Website record number')}
                              </InputLabel>
                              <Input
                                  value={options.siteICPId}
                                  onChange={handleChange("siteICPId")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Ministry of Industry and Information Technology website ICP record number')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Footer Code')}
                              </InputLabel>
                              <Input
                                  multiline
                                  value={options.siteScript}
                                  onChange={handleChange("siteScript")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Custom HTML code inserted at the bottom of the page')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                  </div>
              </div>
              <div className={classes.root}>
                  <Typography variant="h6" gutterBottom>
                    {t('Progressive Web App (PWA)')}
                  </Typography>
                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Small Icon')}
                              </InputLabel>
                              <Input
                                  value={options.pwa_small_icon}
                                  onChange={handleChange("pwa_small_icon")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The address of the small icon with the extension ico')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Medium Icon')}
                              </InputLabel>
                              <Input
                                  value={options.pwa_medium_icon}
                                  onChange={handleChange("pwa_medium_icon")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('192x192 medium icon address, png format')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Large Icon')}
                              </InputLabel>
                              <Input
                                  value={options.pwa_large_icon}
                                  onChange={handleChange("pwa_large_icon")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('512x512 large icon address, png format')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Display Mode')}
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
                                {t('Display mode after PWA application is added')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Theme Color')}
                              </InputLabel>
                              <Input
                                  value={options.pwa_theme_color}
                                  onChange={handleChange("pwa_theme_color")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'CSS color value affects the color of the status bar on the startup screen, the status bar in the content page, and the address bar on the PWA\n'
                                )}
                              </FormHelperText>
                          </FormControl>
                      </div>
                  </div>
                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Background color')}
                              </InputLabel>
                              <Input
                                  value={options.pwa_background_color}
                                  onChange={handleChange(
                                      "pwa_background_color"
                                  )}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('CSS color value')}
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
                    {t('save')}
                  </Button>
              </div>
          </form>
      </div>
    );
}

import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";
import AlertDialog from "../Dialogs/Alert";

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
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        register_enabled: "1",
        default_group: "1",
        email_active: "0",
        login_captcha: "0",
        reg_captcha: "0",
        forget_captcha: "0",
        authn_enabled: "0",
    });
    const [siteURL, setSiteURL] = useState("");
    const [groups, setGroups] = useState([]);
    const [httpAlert, setHttpAlert] = useState(false);

    const { t } = useTranslation();

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
          <AlertDialog
              title={t('hint')}
              msg={
                  t('Web Authn requires your site to enable HTTPS, and confirm the parameter settings-site information-site URL also uses HTTPS before it can be turned on.')
              }
              onClose={() => setHttpAlert(false)}
              open={httpAlert}
          />
          <form onSubmit={submit}>
              <div className={classes.root}>
                  <Typography variant="h6" gutterBottom>
                    {t('Registration and Login')}
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
                                  label={t('Allow new users to register')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('When disabled, users can no longer register through the login page')}
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
                                  label={t('Mail activation')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('When enabled, the new user registration needs to click the activation link in the email to complete. Please confirm that the email sending settings are correct, otherwise the activation email will not be delivered')}
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
                                  label={t('Register Verification Code')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Whether to enable the registration form verification code')}
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
                                  label={t('Login Verification Code')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Whether to enable the login form verification code')}
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
                                  label={t('Retrieve password verification code')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Whether to enable the password recovery form verification code')}
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
                                  label="Web Authn"
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'Whether the user is allowed to log in using the bound external authenticator, the site must use\nHTTPS before it can be used.'
                                )}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Default User Group')}
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
                                {t('Initial user group after user registration')}
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

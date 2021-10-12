import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
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

export default function Aria2() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        aria2_rpcurl: "",
        aria2_token: "",
        aria2_temp_path: "",
        aria2_options: "",
        aria2_interval: "0",
        aria2_call_timeout: "0",
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

    const reload = () => {
        API.get("/admin/reload/aria2")
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .then(() => {})
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .then(() => {});
    };

    const test = () => {
        setLoading(true);
        API.post("/admin/aria2/test", {
            server: options.aria2_rpcurl,
            token: options.aria2_token,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t('The connection is successful, the Aria2 version is: ') + response.data,
                    "success"
                );
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

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
                reload();
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
                      Aria2
                  </Typography>

                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <Alert severity="info" style={{ marginTop: 8 }}>
                              <Typography variant="body2">
                                {t('Cloudreve\'s offline download function is controlled by')}{" "}
                                <Link
                                    href={"https://aria2.github.io/"}
                                    target={"_blank"}
                                >
                                    Aria2
                                </Link>{" "}
                                {t(
                                  'Driver. If you need to use it, please start Aria2 on the same device as the user running\nCloudreve, and enable the RPC\nservice in the configuration file of\nAria2. For more information and instructions, please refer to the docs'
                                )}{" "}
                                <Link
                                    href={
                                        "https://docs.cloudreve.org/use/aria2"
                                    }
                                    target={"_blank"}
                                >
                                  {t('Offline download')}
                                </Link>{" "}
                                {t('chapter.')}
                              </Typography>
                          </Alert>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('RPC server address')}
                              </InputLabel>
                              <Input
                                  type={"url"}
                                  value={options.aria2_rpcurl}
                                  onChange={handleChange("aria2_rpcurl")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'The complete RPC\nserver address including the port, for example: http://127.0.0.1:6800/, leave it blank to not enable the\nAria2 service'
                                )}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                  RPC Secret
                              </InputLabel>
                              <Input
                                  value={options.aria2_token}
                                  onChange={handleChange("aria2_token")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('RPC authorization token, consistent with the Aria2\nconfiguration file, please leave it blank if it is not set.')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Temporary Download Directory')}
                              </InputLabel>
                              <Input
                                  value={options.aria2_temp_path}
                                  onChange={handleChange("aria2_temp_path")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Offline download of the temporary download directory')}
                                <strong>{t('Absolute path')}</strong>{t(', the Cloudreve\nprocess requires read, write, and execute permissions for this directory.')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Status refresh interval (seconds)')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      step: 1,
                                      min: 1,
                                  }}
                                  required
                                  value={options.aria2_interval}
                                  onChange={handleChange("aria2_interval")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The interval at which Cloudreve requests Aria2 to refresh the task status.')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('RPC call timeout (seconds)')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      step: 1,
                                      min: 1,
                                  }}
                                  required
                                  value={options.aria2_call_timeout}
                                  onChange={handleChange(
                                      "aria2_call_timeout"
                                  )}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The longest waiting time when calling RPC service')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Global Task Parameters')}
                              </InputLabel>
                              <Input
                                  multiline
                                  required
                                  value={options.aria2_options}
                                  onChange={handleChange("aria2_options")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'The additional setting parameters carried when creating a download task are written in JSON\nencoded format. You can also write these settings in the\nAria2 configuration file. For available parameters, please refer to the official documentation'
                                )}
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
                  <Button
                      style={{ marginLeft: 8 }}
                      disabled={loading}
                      onClick={() => test()}
                      variant={"outlined"}
                      color={"secondary"}
                  >
                    {t('Test Connection')}
                  </Button>
              </div>
          </form>
      </div>
    );
}

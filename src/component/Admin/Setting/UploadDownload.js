import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";
import SizeInput from "../Common/SizeInput";

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

export default function UploadDownload() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        max_worker_num: "1",
        max_parallel_transfer: "1",
        temp_path: "",
        maxEditSize: "0",
        onedrive_chunk_retries: "0",
        archive_timeout: "0",
        download_timeout: "0",
        preview_timeout: "0",
        doc_preview_timeout: "0",
        upload_credential_timeout: "0",
        upload_session_timeout: "0",
        slave_api_timeout: "0",
        onedrive_monitor_timeout: "0",
        share_download_session_timeout: "0",
        onedrive_callback_check: "0",
        reset_after_upload_failed: "0",
        onedrive_source_timeout: "0",
    });

    const { t } = useTranslation();

    const handleCheckChange = (name) => (event) => {
        const value = event.target.checked ? "1" : "0";
        setOptions({
            ...options,
            [name]: value,
        });
    };

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
                    {t('Storage and Transmission')}
                  </Typography>
                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Number of Workers')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.max_worker_num}
                                  onChange={handleChange("max_worker_num")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The maximum number of tasks executed in parallel in the task queue. After saving, you need to restart\nCloudreve to take effect')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Transit Parallel Transmission')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.max_parallel_transfer}
                                  onChange={handleChange(
                                      "max_parallel_transfer"
                                  )}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The maximum number of parallel coroutines when transferring tasks in the task queue')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Temporary Directory')}
                              </InputLabel>
                              <Input
                                  value={options.temp_path}
                                  onChange={handleChange("temp_path")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The directory path used to store temporary files generated by tasks such as package download, decompression, compression, etc.')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <SizeInput
                                  value={options.maxEditSize}
                                  onChange={handleChange("maxEditSize")}
                                  required
                                  min={0}
                                  max={2147483647}
                                  label={t('Online edit size of text file')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The maximum size of a text file that can be edited online. Files beyond this size cannot be edited online')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('OneDrive fragmentation error retry')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 0,
                                      step: 1,
                                  }}
                                  value={options.onedrive_chunk_retries}
                                  onChange={handleChange(
                                      "onedrive_chunk_retries"
                                  )}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'OneDrive\nThe maximum number of retries after a failed upload of storage policy fragments, only applicable to server uploads or transfers'
                                )}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <FormControlLabel
                                  control={
                                      <Switch
                                          checked={
                                              options.reset_after_upload_failed ===
                                              "1"
                                          }
                                          onChange={handleCheckChange(
                                              "reset_after_upload_failed"
                                          )}
                                      />
                                  }
                                  label={t('Forcibly reset the connection when upload verification fails')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('When enabled, if the data upload verification of this policy, avatar, etc. fails, the server will forcibly reset the connection')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                  </div>
              </div>

              <div className={classes.root}>
                  <Typography variant="h6" gutterBottom>
                    {t('Validity period (seconds)')}
                  </Typography>

                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Download package')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.archive_timeout}
                                  onChange={handleChange("archive_timeout")}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Download Session')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.download_timeout}
                                  onChange={handleChange("download_timeout")}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Preview link')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.preview_timeout}
                                  onChange={handleChange("preview_timeout")}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Office Document Preview Connection')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.doc_preview_timeout}
                                  onChange={handleChange(
                                      "doc_preview_timeout"
                                  )}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('upload certificate')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.upload_credential_timeout}
                                  onChange={handleChange(
                                      "upload_credential_timeout"
                                  )}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Upload session')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.upload_session_timeout}
                                  onChange={handleChange(
                                      "upload_session_timeout"
                                  )}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('After exceeding this upload callback request will not be processed')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Slave API request')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.slave_api_timeout}
                                  onChange={handleChange("slave_api_timeout")}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Share download session')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={
                                      options.share_download_session_timeout
                                  }
                                  onChange={handleChange(
                                      "share_download_session_timeout"
                                  )}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Repetitive downloading of shared files within the set time will not be counted in the total number of downloads')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('OneDrive client upload monitoring interval')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.onedrive_monitor_timeout}
                                  onChange={handleChange(
                                      "onedrive_monitor_timeout"
                                  )}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'Every set time interval, Cloudreve will ask OneDrive\nto check the customer The client upload situation has ensured that the client upload is controllable'
                                )}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('OneDrive callback waiting')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.onedrive_callback_check}
                                  onChange={handleChange(
                                      "onedrive_callback_check"
                                  )}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'OneDrive\nThe maximum time to wait for the callback after the client upload is completed, if it exceeds, the upload will be considered failed'
                                )}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('OneDrive download request cache')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      max: 3659,
                                      step: 1,
                                  }}
                                  value={options.onedrive_source_timeout}
                                  onChange={handleChange(
                                      "onedrive_source_timeout"
                                  )}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'OneDrive can cache the results after obtaining the file download URL\n, reducing the frequency of popular file download API requests'
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
              </div>
          </form>
      </div>
    );
}

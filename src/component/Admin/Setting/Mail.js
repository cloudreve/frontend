import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";
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
    buttonMargin: {
        marginLeft: 8,
    },
}));

export default function Mail() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [test, setTest] = useState(false);
    const [tesInput, setTestInput] = useState("");
    const [options, setOptions] = useState({
        fromName: "",
        fromAdress: "",
        smtpHost: "",
        smtpPort: "",
        replyTo: "",
        smtpUser: "",
        smtpPass: "",
        smtpEncryption: "",
        mail_keepalive: "30",
        mail_activation_template: "",
        mail_reset_pwd_template: "",
    });

    const { t } = useTranslation();

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
        });
    };

    const handleCheckChange = (name) => (event) => {
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

    const sendTestMail = () => {
        setLoading(true);
        API.post("/admin/mailTest", {
            to: tesInput,
        })
            .then(() => {
                ToggleSnackbar("top", "right", t('Test mail has been sent'), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const reload = () => {
        API.get("/admin/reload/email")
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .then(() => {})
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .then(() => {});
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
          <Dialog
              open={test}
              onClose={() => setTest(false)}
              aria-labelledby="form-dialog-title"
          >
              <DialogTitle id="form-dialog-title">{t('Sending Test')}</DialogTitle>
              <DialogContent>
                  <DialogContentText>
                      <Typography>
                        {t('Before sending a test mail, please save the changed mail settings;')}
                      </Typography>
                      <Typography>
                        {t(
                          'The result of the email will not be reported immediately. If you have not received the test email for a long time, please check the error log output by\nCloudreve in the terminal.'
                        )}
                      </Typography>
                  </DialogContentText>
                  <TextField
                      autoFocus
                      margin="dense"
                      id="name"
                      label={t('receiver\'s address')}
                      value={tesInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      type="email"
                      fullWidth
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setTest(false)} color="default">
                    {t('Cancel')}
                  </Button>
                  <Button
                      onClick={() => sendTestMail()}
                      disabled={loading}
                      color="primary"
                  >
                    {t('send')}
                  </Button>
              </DialogActions>
          </Dialog>

          <form onSubmit={submit}>
              <div className={classes.root}>
                  <Typography variant="h6" gutterBottom>
                    {t('Send a letter')}
                  </Typography>

                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Sender\'s name')}
                              </InputLabel>
                              <Input
                                  value={options.fromName}
                                  onChange={handleChange("fromName")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The sender\'s name shown in the message')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Sender\'s mailbox')}
                              </InputLabel>
                              <Input
                                  type={"email"}
                                  required
                                  value={options.fromAdress}
                                  onChange={handleChange("fromAdress")}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The address of the sending mailbox')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('SMTP server')}
                              </InputLabel>
                              <Input
                                  value={options.smtpHost}
                                  onChange={handleChange("smtpHost")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Sending server address without port number')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('SMTP port')}
                              </InputLabel>
                              <Input
                                  inputProps={{ min: 1, step: 1 }}
                                  type={"number"}
                                  value={options.smtpPort}
                                  onChange={handleChange("smtpPort")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Sending server address port number')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('SMTP username')}
                              </InputLabel>
                              <Input
                                  value={options.smtpUser}
                                  onChange={handleChange("smtpUser")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The user name of the sending mailbox, generally the same as the mailbox address')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('SMTP password')}
                              </InputLabel>
                              <Input
                                  type={"password"}
                                  value={options.smtpPass}
                                  onChange={handleChange("smtpPass")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Send Mail Password')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Reply mailbox')}
                              </InputLabel>
                              <Input
                                  value={options.replyTo}
                                  onChange={handleChange("replyTo")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The mailbox used to receive the reply when the user responds to the email sent by the system')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <FormControlLabel
                                  control={
                                      <Switch
                                          checked={
                                              options.smtpEncryption === "1"
                                          }
                                          onChange={handleCheckChange(
                                              "smtpEncryption"
                                          )}
                                      />
                                  }
                                  label={t('Enforce SSL connection')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t(
                                  'Whether to force the use of SSL\nencrypted connection. If you cannot send mail, you can turn this off,\nCloudreve will try to use STARTTLS\nand decide whether to use encrypted connection'
                                )}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('SMTP connection validity period (seconds)')}
                              </InputLabel>
                              <Input
                                  inputProps={{ min: 1, step: 1 }}
                                  type={"number"}
                                  value={options.mail_keepalive}
                                  onChange={handleChange("mail_keepalive")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The SMTP\nconnection established within the validity period will be reused by new mail sending requests')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                  </div>
              </div>

              <div className={classes.root}>
                  <Typography variant="h6" gutterBottom>
                    {t('Mail Template')}
                  </Typography>

                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('New user activation')}
                              </InputLabel>
                              <Input
                                  value={options.mail_activation_template}
                                  onChange={handleChange(
                                      "mail_activation_template"
                                  )}
                                  multiline
                                  rowsMax="10"
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Activate email template after registration for new users')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('reset Password')}
                              </InputLabel>
                              <Input
                                  value={options.mail_reset_pwd_template}
                                  onChange={handleChange(
                                      "mail_reset_pwd_template"
                                  )}
                                  multiline
                                  rowsMax="10"
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Password reset email template')}
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
                  {"   "}
                  <Button
                      className={classes.buttonMargin}
                      variant={"outlined"}
                      color={"primary"}
                      onClick={() => setTest(true)}
                  >
                    {t('Send test mail')}
                  </Button>
              </div>
          </form>
      </div>
    );
}

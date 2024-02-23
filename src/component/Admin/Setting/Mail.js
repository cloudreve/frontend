import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { useDispatch } from "react-redux";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
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
    buttonMargin: {
        marginLeft: 8,
    },
}));

export default function Mail() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const { t: tVas } = useTranslation("dashboard", { keyPrefix: "vas" });
    const { t: tGlobal } = useTranslation("common");
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
        over_used_template: "",
        mail_activation_template: "",
        mail_reset_pwd_template: "",
    });

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
        API.post("/admin/test/mail", {
            to: tesInput,
        })
            .then(() => {
                ToggleSnackbar("top", "right", t("testMailSent"), "success");
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
                ToggleSnackbar("top", "right", t("saved"), "success");
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
                <DialogTitle id="form-dialog-title">
                    {t("testSMTPSettings")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography>{t("testSMTPTooltip")}</Typography>
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t("recipient")}
                        value={tesInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        type="email"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTest(false)} color="default">
                        {tGlobal("cancel")}
                    </Button>
                    <Button
                        onClick={() => sendTestMail()}
                        disabled={loading}
                        color="primary"
                    >
                        {t("send")}
                    </Button>
                </DialogActions>
            </Dialog>

            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("smtp")}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("senderName")}
                                </InputLabel>
                                <Input
                                    value={options.fromName}
                                    onChange={handleChange("fromName")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("senderNameDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("senderAddress")}
                                </InputLabel>
                                <Input
                                    type={"email"}
                                    required
                                    value={options.fromAdress}
                                    onChange={handleChange("fromAdress")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("senderAddressDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("smtpServer")}
                                </InputLabel>
                                <Input
                                    value={options.smtpHost}
                                    onChange={handleChange("smtpHost")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("smtpServerDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("smtpPort")}
                                </InputLabel>
                                <Input
                                    inputProps={{ min: 1, step: 1 }}
                                    type={"number"}
                                    value={options.smtpPort}
                                    onChange={handleChange("smtpPort")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("smtpPortDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("smtpUsername")}
                                </InputLabel>
                                <Input
                                    value={options.smtpUser}
                                    onChange={handleChange("smtpUser")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("smtpUsernameDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("smtpPassword")}
                                </InputLabel>
                                <Input
                                    type={"password"}
                                    value={options.smtpPass}
                                    onChange={handleChange("smtpPass")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("smtpPasswordDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("replyToAddress")}
                                </InputLabel>
                                <Input
                                    value={options.replyTo}
                                    onChange={handleChange("replyTo")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("replyToAddressDes")}
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
                                    label={t("enforceSSL")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("enforceSSLDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("smtpTTL")}
                                </InputLabel>
                                <Input
                                    inputProps={{ min: 1, step: 1 }}
                                    type={"number"}
                                    value={options.mail_keepalive}
                                    onChange={handleChange("mail_keepalive")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("smtpTTLDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("emailTemplates")}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("activateNewUser")}
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
                                    {t("activateNewUserDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {tVas("overuseReminder")}
                                </InputLabel>
                                <Input
                                    value={options.over_used_template}
                                    onChange={handleChange(
                                        "over_used_template"
                                    )}
                                    multiline
                                    rowsMax="10"
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {tVas("overuseReminderDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("resetPassword")}
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
                                    {t("resetPasswordDes")}
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
                    {"   "}
                    <Button
                        className={classes.buttonMargin}
                        variant={"outlined"}
                        color={"primary"}
                        onClick={() => setTest(true)}
                    >
                        {t("sendTestEmail")}
                    </Button>
                </div>
            </form>
        </div>
    );
}

import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import Link from "@material-ui/core/Link";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import FormHelperText from "@material-ui/core/FormHelperText";
import API from "../../../../middleware/Api";
import { toggleSnackbar } from "../../../../redux/explorer";
import { Trans, useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    stepContent: {
        padding: "16px 32px 16px 32px",
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
    subStepContainer: {
        display: "flex",
        marginBottom: 20,
        padding: 10,
        transition: theme.transitions.create("background-color", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        "&:focus-within": {
            backgroundColor: theme.palette.background.default,
        },
    },
    stepNumber: {
        width: 20,
        height: 20,
        backgroundColor: lighten(theme.palette.secondary.light, 0.2),
        color: theme.palette.secondary.contrastText,
        textAlign: "center",
        borderRadius: " 50%",
    },
    stepNumberContainer: {
        marginRight: 10,
    },
    stepFooter: {
        marginTop: 32,
    },
    button: {
        marginRight: theme.spacing(1),
    },
    viewButtonLabel: { textTransform: "none" },
    "@global": {
        code: {
            color: "rgba(0, 0, 0, 0.87)",
            display: "inline-block",
            padding: "2px 6px",
            fontFamily:
                ' Consolas, "Liberation Mono", Menlo, Courier, monospace',
            borderRadius: "2px",
            backgroundColor: "rgba(255,229,100,0.1)",
        },
        pre: {
            margin: "24px 0",
            padding: "12px 18px",
            overflow: "auto",
            direction: "ltr",
            borderRadius: "4px",
            backgroundColor: "#272c34",
            color: "#fff",
            fontFamily:
                ' Consolas, "Liberation Mono", Menlo, Courier, monospace',
        },
    },
}));

export default function Aria2RPC(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "node" });
    const { t: tDashboard } = useTranslation("dashboard");
    const classes = useStyles();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const testAria2 = () => {
        setLoading(true);
        API.post("/admin/node/aria2/test", {
            type: props.node.Type,
            server: props.node.Server,
            secret: props.node.SlaveKey,
            rpc: props.node.Aria2OptionsSerialized.server,
            token: props.node.Aria2OptionsSerialized.token,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("ariaSuccess", { version: response.data }),
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

    const mode = props.node.Type === 0 ? t("slave") : t("master");

    return (
        <form
            className={classes.stepContent}
            onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit(e);
            }}
        >
            <Alert severity="info" style={{ marginBottom: 10 }}>
                <Typography variant="body2">
                    <Trans
                        ns={"dashboard"}
                        i18nKey={"node.aria2Des"}
                        values={{
                            mode: mode,
                        }}
                        components={[
                            <Link
                                href={"https://aria2.github.io/"}
                                target={"_blank"}
                                key={0}
                            />,
                            <Box
                                component="span"
                                fontWeight="fontWeightBold"
                                key={1}
                            />,
                            <Link
                                href={t("aria2DocURL")}
                                target={"_blank"}
                                key={2}
                            />,
                        ]}
                    />
                </Typography>
            </Alert>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>1</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {props.node.Type === 0
                            ? t("slaveTakeOverRemoteDownload")
                            : t("masterTakeOverRemoteDownload")}
                        <br />
                        {props.node.Type === 0
                            ? t("routeTaskSlave")
                            : t("routeTaskMaster")}
                    </Typography>

                    <div className={classes.form}>
                        <FormControl required component="fieldset">
                            <RadioGroup
                                required
                                value={props.node.Aria2Enabled}
                                onChange={props.handleTextChange(
                                    "Aria2Enabled"
                                )}
                                row
                            >
                                <FormControlLabel
                                    value={"true"}
                                    control={<Radio color={"primary"} />}
                                    label={t("enable")}
                                />
                                <FormControlLabel
                                    value={"false"}
                                    control={<Radio color={"primary"} />}
                                    label={t("disable")}
                                />
                            </RadioGroup>
                        </FormControl>
                    </div>
                </div>
            </div>

            <Collapse in={props.node.Aria2Enabled === "true"}>
                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>2</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            {t("aria2ConfigDes", {
                                target:
                                    props.node.Type === 0
                                        ? t("slaveNodeTarget")
                                        : t("masterNodeTarget"),
                            })}
                        </Typography>
                        <pre>
                            # {t("enableRPCComment")}
                            <br />
                            enable-rpc=true
                            <br /># {t("rpcPortComment")}
                            <br />
                            rpc-listen-port=6800
                            <br /># {t("rpcSecretComment")}
                            <br />
                            rpc-secret=
                            {props.node.Aria2OptionsSerialized.token}
                            <br />
                        </pre>
                        <Alert severity="info" style={{ marginBottom: 10 }}>
                            <Typography variant="body2">
                                {t("rpcConfigDes")}
                            </Typography>
                        </Alert>
                    </div>
                </div>

                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>3</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            <Trans
                                ns={"dashboard"}
                                i18nKey={"node.rpcServerDes"}
                                values={{
                                    mode: mode,
                                }}
                                components={[
                                    <code key={0} />,
                                    <code key={1} />,
                                    <code key={2} />,
                                ]}
                            />
                        </Typography>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("rpcServer")}
                                </InputLabel>
                                <Input
                                    required
                                    type={"url"}
                                    value={
                                        props.node.Aria2OptionsSerialized.server
                                    }
                                    onChange={props.handleOptionChange(
                                        "server"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("rpcServerHelpDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>4</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            <Trans
                                ns={"dashboard"}
                                i18nKey={"node.rpcTokenDes"}
                                components={[<code key={0} />]}
                            />
                        </Typography>
                        <div className={classes.form}>
                            <Input
                                value={props.node.Aria2OptionsSerialized.token}
                                onChange={props.handleOptionChange("token")}
                            />
                        </div>
                    </div>
                </div>

                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>5</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            <Trans
                                ns={"dashboard"}
                                i18nKey={"node.aria2PathDes"}
                                components={[<strong key={0} />]}
                            />
                        </Typography>
                        <div className={classes.form}>
                            <Input
                                value={
                                    props.node.Aria2OptionsSerialized.temp_path
                                }
                                onChange={props.handleOptionChange("temp_path")}
                            />
                        </div>
                    </div>
                </div>

                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>5</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            {t("aria2SettingDes")}
                        </Typography>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("refreshInterval")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                    }}
                                    required
                                    value={
                                        props.node.Aria2OptionsSerialized
                                            .interval
                                    }
                                    onChange={props.handleOptionChange(
                                        "interval"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("refreshIntervalDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("rpcTimeout")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                    }}
                                    required
                                    value={
                                        props.node.Aria2OptionsSerialized
                                            .timeout
                                    }
                                    onChange={props.handleOptionChange(
                                        "timeout"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("rpcTimeoutDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("globalOptions")}
                                </InputLabel>
                                <Input
                                    multiline
                                    required
                                    value={
                                        props.node.Aria2OptionsSerialized
                                            .options
                                    }
                                    onChange={props.handleOptionChange(
                                        "options"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("globalOptionsDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>6</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            {t("testAria2Des", { mode })}
                            {props.node.Type === 0 &&
                                t("testAria2DesSlaveAddition")}
                        </Typography>
                        <div className={classes.form}>
                            <Button
                                disabled={loading}
                                variant={"outlined"}
                                onClick={() => testAria2()}
                                color={"primary"}
                            >
                                {t("testAria2")}
                            </Button>
                        </div>
                    </div>
                </div>
            </Collapse>

            <div className={classes.stepFooter}>
                {props.activeStep !== 0 && (
                    <Button
                        color={"default"}
                        className={classes.button}
                        onClick={props.onBack}
                    >
                        {tDashboard("policy.back")}
                    </Button>
                )}
                <Button
                    disabled={loading || props.loading}
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                    onClick={props.onSubmit}
                >
                    {tDashboard("policy.next")}
                </Button>
            </div>
        </form>
    );
}

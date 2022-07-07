import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import API from "../../../../middleware/Api";
import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
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

export default function Communication(props) {
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

    const testSlave = () => {
        setLoading(true);

        // 测试路径是否可用
        API.post("/admin/policy/test/slave", {
            server: props.node.Server,
            secret: props.node.SlaveKey,
        })
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    tDashboard("policy.communicationOK"),
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

    return (
        <form
            className={classes.stepContent}
            onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit(e);
            }}
        >
            <Alert severity="info" style={{ marginBottom: 10 }}>
                <Trans
                    ns={"dashboard"}
                    i18nKey={"node.slaveNodeDes"}
                    components={[<Box key={0} fontWeight="fontWeightBold" />]}
                />
            </Alert>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>1</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {tDashboard("policy.remoteCopyBinaryDescription")}
                    </Typography>
                </div>
            </div>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>2</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {tDashboard("policy.remoteSecretDescription")}
                    </Typography>
                    <div className={classes.form}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="component-helper">
                                {tDashboard("policy.remoteSecret")}
                            </InputLabel>
                            <Input
                                required
                                inputProps={{
                                    minlength: 64,
                                }}
                                value={props.node.SlaveKey}
                                onChange={props.handleTextChange("SlaveKey")}
                            />
                        </FormControl>
                    </div>
                </div>
            </div>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>3</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {tDashboard("policy.modifyRemoteConfig")}
                        <br />
                        <Trans
                            ns={"dashboard"}
                            i18nKey={"policy.addRemoteConfigDes"}
                            components={[<code key={0} />]}
                        />
                    </Typography>
                    <pre>
                        [System]
                        <br />
                        Mode = slave
                        <br />
                        Listen = :5212
                        <br />
                        <br />
                        [Slave]
                        <br />
                        Secret = {props.node.SlaveKey}
                        <br />
                        <br />
                        <Trans
                            ns={"dashboard"}
                            i18nKey={"node.overwriteDes"}
                            components={[<br key={0} />, <br key={1} />]}
                        />
                        <br />
                        [OptionOverwrite]
                        <br />; {t("workerNumDes")}
                        <br />
                        max_worker_num = 50
                        <br />; {t("parallelTransferDes")}
                        <br />
                        max_parallel_transfer = 10
                        <br />; {t("chunkRetriesDes")}
                        <br />
                        chunk_retries = 10
                    </pre>
                    <Typography variant={"body2"}>
                        {tDashboard("policy.remoteConfigDifference")}
                        <ul>
                            <li>
                                <Trans
                                    ns={"dashboard"}
                                    i18nKey={"policy.remoteConfigDifference1"}
                                    components={[
                                        <code key={0} />,
                                        <code key={1} />,
                                        <code key={2} />,
                                    ]}
                                />
                            </li>
                            <li>
                                <Trans
                                    ns={"dashboard"}
                                    i18nKey={"policy.remoteConfigDifference2"}
                                    components={[
                                        <code key={0} />,
                                        <code key={1} />,
                                    ]}
                                />
                            </li>
                        </ul>
                        {t("multipleMasterDes")}
                    </Typography>
                </div>
            </div>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>4</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {tDashboard("policy.inputRemoteAddress")}
                        <br />
                        {tDashboard("policy.inputRemoteAddressDes")}
                    </Typography>
                    <div className={classes.form}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="component-helper">
                                {tDashboard("policy.remoteAddress")}
                            </InputLabel>
                            <Input
                                fullWidth
                                required
                                type={"url"}
                                value={props.node.Server}
                                onChange={props.handleTextChange("Server")}
                            />
                        </FormControl>
                    </div>
                </div>
            </div>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>5</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {tDashboard("policy.testCommunicationDes")}
                    </Typography>
                    <div className={classes.form}>
                        <Button
                            disabled={loading}
                            variant={"outlined"}
                            onClick={() => testSlave()}
                            color={"primary"}
                        >
                            {tDashboard("policy.testCommunication")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className={classes.stepFooter}>
                <Button
                    disabled={loading || props.loading}
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                >
                    {tDashboard("policy.next")}
                </Button>
            </div>
        </form>
    );
}

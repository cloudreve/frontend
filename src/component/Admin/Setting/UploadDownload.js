import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import SizeInput from "../Common/SizeInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
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
}));

export default function UploadDownload() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        max_worker_num: "1",
        max_parallel_transfer: "1",
        temp_path: "",
        chunk_retries: "0",
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
        slave_node_retry: "0",
        slave_ping_interval: "0",
        slave_recover_interval: "0",
        slave_transfer_timeout: "0",
        use_temp_chunk_buffer: "1",
        public_resource_maxage: "0",
    });

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
                        {t("transportation")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("workerNum")}
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
                                    {t("workerNumDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("transitParallelNum")}
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
                                    {t("transitParallelNumDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("tempFolder")}
                                </InputLabel>
                                <Input
                                    value={options.temp_path}
                                    onChange={handleChange("temp_path")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("tempFolderDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("failedChunkRetry")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 0,
                                        step: 1,
                                    }}
                                    value={options.chunk_retries}
                                    onChange={handleChange("chunk_retries")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("failedChunkRetryDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.use_temp_chunk_buffer ===
                                                "1"
                                            }
                                            onChange={handleCheckChange(
                                                "use_temp_chunk_buffer"
                                            )}
                                        />
                                    }
                                    label={t("cacheChunks")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("cacheChunksDes")}
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
                                    label={t("resetConnection")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("resetConnectionDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("expirationDuration")}
                    </Typography>
                    <div className={classes.formContainer}>
                        {[
                            {
                                name: "batchDownload",
                                field: "archive_timeout",
                            },
                            {
                                name: "downloadSession",
                                field: "download_timeout",
                            },
                            {
                                name: "previewURL",
                                field: "preview_timeout",
                            },
                            {
                                name: "docPreviewURL",
                                field: "doc_preview_timeout",
                            },
                            {
                                name: "staticResourceCache",
                                field: "public_resource_maxage",
                                des: "staticResourceCacheDes",
                            },
                            {
                                name: "uploadSession",
                                field: "upload_session_timeout",
                                des: "uploadSessionDes",
                            },
                            {
                                name: "downloadSessionForShared",
                                field: "share_download_session_timeout",
                                des: "downloadSessionForSharedDes",
                            },
                            {
                                name: "onedriveMonitorInterval",
                                field: "onedrive_monitor_timeout",
                                des: "onedriveMonitorIntervalDes",
                            },
                            {
                                name: "onedriveCallbackTolerance",
                                field: "onedrive_callback_check",
                                des: "onedriveCallbackToleranceDes",
                            },
                            {
                                name: "onedriveDownloadURLCache",
                                field: "onedrive_source_timeout",
                                des: "onedriveDownloadURLCacheDes",
                            },
                        ].map((input) => (
                            <div key={input.name} className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        {t(input.name)}
                                    </InputLabel>
                                    <Input
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={options[input.field]}
                                        onChange={handleChange(input.field)}
                                        required
                                    />
                                    {input.des && (
                                        <FormHelperText id="component-helper-text">
                                            {t(input.des)}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("nodesCommunication")}
                    </Typography>
                    <div className={classes.formContainer}>
                        {[
                            {
                                name: "slaveAPIExpiration",
                                field: "slave_api_timeout",
                                des: "slaveAPIExpirationDes",
                            },
                            {
                                name: "heartbeatInterval",
                                field: "slave_ping_interval",
                                des: "heartbeatIntervalDes",
                            },
                            {
                                name: "heartbeatFailThreshold",
                                field: "slave_node_retry",
                                des: "heartbeatFailThresholdDes",
                            },
                            {
                                name: "heartbeatRecoverModeInterval",
                                field: "slave_recover_interval",
                                des: "heartbeatRecoverModeIntervalDes",
                            },
                            {
                                name: "slaveTransitExpiration",
                                field: "slave_transfer_timeout",
                                des: "slaveTransitExpirationDes",
                            },
                        ].map((input) => (
                            <div key={input.name} className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        {t(input.name)}
                                    </InputLabel>
                                    <Input
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={options[input.field]}
                                        onChange={handleChange(input.field)}
                                        required
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t(input.des)}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        ))}
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

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
import { toggleSnackbar } from "../../../redux/explorer";
import Alert from "@material-ui/lab/Alert";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { Trans, useTranslation } from "react-i18next";
import Link from "@material-ui/core/Link";
import ThumbGenerators from "./ThumbGenerators";
import PolicySelector from "../Common/PolicySelector";

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

export default function ImageSetting() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        gravatar_server: "",
        avatar_path: "",
        avatar_size: "",
        avatar_size_l: "",
        avatar_size_m: "",
        avatar_size_s: "",
        thumb_width: "",
        thumb_height: "",
        office_preview_service: "",
        thumb_file_suffix: "",
        thumb_max_task_count: "",
        thumb_encode_method: "",
        thumb_gc_after_gen: "0",
        thumb_encode_quality: "",
        maxEditSize: "",
        wopi_enabled: "0",
        wopi_endpoint: "",
        wopi_session_timeout: "0",
        thumb_builtin_enabled: "0",
        thumb_vips_enabled: "0",
        thumb_vips_exts: "",
        thumb_ffmpeg_enabled: "0",
        thumb_vips_path: "",
        thumb_ffmpeg_path: "",
        thumb_ffmpeg_exts: "",
        thumb_ffmpeg_seek: "",
        thumb_libreoffice_path: "",
        thumb_libreoffice_enabled: "0",
        thumb_libreoffice_exts: "",
        thumb_proxy_enabled: "0",
        thumb_proxy_policy: [],
        thumb_max_src_size: "",
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
                response.data.thumb_proxy_policy = JSON.parse(
                    response.data.thumb_proxy_policy
                ).map((v) => {
                    return v.toString();
                });
                setOptions(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const reload = () => {
        API.get("/admin/reload/wopi")
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
            let value = options[k];
            if (k === "thumb_proxy_policy") {
                value = JSON.stringify(value.map((v) => parseInt(v)));
            }

            option.push({
                key: k,
                value,
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

    const handleCheckChange = (name) => (event) => {
        const value = event.target.checked ? "1" : "0";
        setOptions({
            ...options,
            [name]: value,
        });
    };

    return (
        <div>
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("avatar")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("gravatarServer")}
                                </InputLabel>
                                <Input
                                    type={"url"}
                                    value={options.gravatar_server}
                                    onChange={handleChange("gravatar_server")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("gravatarServerDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("avatarFilePath")}
                                </InputLabel>
                                <Input
                                    value={options.avatar_path}
                                    onChange={handleChange("avatar_path")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("avatarFilePathDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                {options.avatar_size !== "" && (
                                    <SizeInput
                                        value={options.avatar_size}
                                        onChange={handleChange("avatar_size")}
                                        required
                                        min={0}
                                        max={2147483647}
                                        label={t("avatarSize")}
                                    />
                                )}
                                <FormHelperText id="component-helper-text">
                                    {t("avatarSizeDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("smallAvatarSize")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={options.avatar_size_s}
                                    onChange={handleChange("avatar_size_s")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("mediumAvatarSize")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={options.avatar_size_m}
                                    onChange={handleChange("avatar_size_m")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("largeAvatarSize")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={options.avatar_size_l}
                                    onChange={handleChange("avatar_size_l")}
                                    required
                                />
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("filePreview")}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("officePreviewService")}
                                </InputLabel>
                                <Input
                                    value={options.office_preview_service}
                                    onChange={handleChange(
                                        "office_preview_service"
                                    )}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("officePreviewServiceDes")}
                                    <br />
                                    <code>{"{$src}"}</code> -{" "}
                                    {t("officePreviewServiceSrcDes")}
                                    <br />
                                    <code>{"{$srcB64}"}</code> -{" "}
                                    {t("officePreviewServiceSrcB64Des")}
                                    <br />
                                    <code>{"{$name}"}</code> -{" "}
                                    {t("officePreviewServiceName")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                {options.maxEditSize !== "" && (
                                    <SizeInput
                                        value={options.maxEditSize}
                                        onChange={handleChange("maxEditSize")}
                                        required
                                        min={0}
                                        max={2147483647}
                                        label={t("textEditMaxSize")}
                                    />
                                )}

                                <FormHelperText id="component-helper-text">
                                    {t("textEditMaxSizeDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("wopiClient")}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Alert severity="info">
                                <Trans
                                    ns={"dashboard"}
                                    i18nKey={"settings.wopiClientDes"}
                                    components={[
                                        <Link
                                            key={0}
                                            target={"_blank"}
                                            href={t("wopiDocLink")}
                                        />,
                                    ]}
                                />
                            </Alert>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.wopi_enabled === "1"
                                            }
                                            onChange={handleCheckChange(
                                                "wopi_enabled"
                                            )}
                                        />
                                    }
                                    label={t("enableWopi")}
                                />
                            </FormControl>
                        </div>

                        {options.wopi_enabled === "1" && (
                            <>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("wopiEndpoint")}
                                        </InputLabel>
                                        <Input
                                            value={options.wopi_endpoint}
                                            onChange={handleChange(
                                                "wopi_endpoint"
                                            )}
                                            required
                                        />
                                        <FormHelperText id="component-helper-text">
                                            {t("wopiEndpointDes")}
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("wopiSessionTtl")}
                                        </InputLabel>
                                        <Input
                                            inputProps={{ min: 1, step: 1 }}
                                            type={"number"}
                                            value={options.wopi_session_timeout}
                                            onChange={handleChange(
                                                "wopi_session_timeout"
                                            )}
                                            required
                                        />
                                        <FormHelperText id="component-helper-text">
                                            {t("wopiSessionTtlDes")}
                                        </FormHelperText>
                                    </FormControl>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("thumbnails")}
                    </Typography>
                        <div className={classes.form}>
                        <Alert severity="info">
                            <Trans
                                ns={"dashboard"}
                                i18nKey={"settings.thumbnailDoc"}
                                components={[
                                    <Link
                                        key={0}
                                        target={"_blank"}
                                        href={t("thumbnailDocLink")}
                                    />,
                                ]}
                            />
                        </Alert>
                        </div>
                    <Typography variant="subtitle1" gutterBottom>
                        {t("thumbnailBasic")}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("thumbWidth")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={options.thumb_width}
                                    onChange={handleChange("thumb_width")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("thumbHeight")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={options.thumb_height}
                                    onChange={handleChange("thumb_height")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("thumbSuffix")}
                                </InputLabel>
                                <Input
                                    type={"text"}
                                    value={options.thumb_file_suffix}
                                    onChange={handleChange("thumb_file_suffix")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("thumbConcurrent")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: -1,
                                        step: 1,
                                    }}
                                    value={options.thumb_max_task_count}
                                    onChange={handleChange(
                                        "thumb_max_task_count"
                                    )}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("thumbConcurrentDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("thumbFormat")}
                                </InputLabel>
                                <Input
                                    type={"test"}
                                    value={options.thumb_encode_method}
                                    onChange={handleChange(
                                        "thumb_encode_method"
                                    )}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("thumbFormatDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("thumbQuality")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                        max: 100,
                                    }}
                                    value={options.thumb_encode_quality}
                                    onChange={handleChange(
                                        "thumb_encode_quality"
                                    )}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("thumbQualityDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                {options.thumb_max_src_size !== "" && (
                                    <SizeInput
                                        value={options.thumb_max_src_size}
                                        onChange={handleChange(
                                            "thumb_max_src_size"
                                        )}
                                        required
                                        min={0}
                                        max={2147483647}
                                        label={t("thumbMaxSize")}
                                    />
                                )}
                                <FormHelperText id="component-helper-text">
                                    {t("thumbMaxSizeDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.thumb_gc_after_gen ===
                                                "1"
                                            }
                                            onChange={handleCheckChange(
                                                "thumb_gc_after_gen"
                                            )}
                                        />
                                    }
                                    label={t("thumbGC")}
                                />
                            </FormControl>
                        </div>
                    </div>

                    <Typography variant="subtitle1" gutterBottom>
                        {t("generators")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <ThumbGenerators
                                options={options}
                                setOptions={setOptions}
                            />
                        </div>
                    </div>

                    <Typography variant="subtitle1" gutterBottom>
                        {t("generatorProxy")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Alert severity="info">
                                {t("generatorProxyWarning")}
                            </Alert>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.thumb_proxy_enabled ===
                                                "1"
                                            }
                                            onChange={handleCheckChange(
                                                "thumb_proxy_enabled"
                                            )}
                                        />
                                    }
                                    label={t("enableThumbProxy")}
                                />
                            </FormControl>
                        </div>
                        {options.thumb_proxy_enabled === "1" && (
                            <>
                                <div className={classes.form}>
                                    <PolicySelector
                                        value={options.thumb_proxy_policy}
                                        onChange={handleChange(
                                            "thumb_proxy_policy"
                                        )}
                                        filter={(t) => t.Type !== "local"}
                                        label={t("proxyPolicyList")}
                                        helperText={t("proxyPolicyListDes")}
                                    />
                                </div>
                            </>
                        )}
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

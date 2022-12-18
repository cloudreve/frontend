import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Step from "@material-ui/core/Step";
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
import API from "../../../../middleware/Api";
import MagicVar from "../../Dialogs/MagicVar";
import DomainInput from "../../Common/DomainInput";
import SizeInput from "../../Common/SizeInput";
import { useHistory } from "react-router";
import { getNumber } from "../../../../utils";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import AlertDialog from "../../Dialogs/Alert";
import { toggleSnackbar } from "../../../../redux/explorer";
import { Trans, useTranslation } from "react-i18next";
import { transformPolicyRequest } from "../utils";

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
        },
    },
}));

const steps = [
    {
        title: "storageBucket",
        optional: false,
    },
    {
        title: "storagePathStep",
        optional: false,
    },
    {
        title: "sourceLinkStep",
        optional: false,
    },
    {
        title: "uploadSettingStep",
        optional: false,
    },
    {
        title: "corsSettingStep",
        optional: true,
    },
    {
        title: "finishStep",
        optional: false,
    },
];

const regions = {
    "us-east-2": "US East (Ohio)",
    "us-east-1": "US East (N. Virginia)",
    "us-west-1": "US West (N. California)",
    "us-west-2": "US West (Oregon)",
    "af-south-1": "Africa (Cape Town)",
    "ap-east-1": "Asia Pacific (Hong Kong)",
    "ap-south-1": "Asia Pacific (Mumbai)",
    "ap-northeast-3": "Asia Pacific (Osaka-Local)",
    "ap-northeast-2": "Asia Pacific (Seoul)",
    "ap-southeast-1": "Asia Pacific (Singapore)",
    "ap-southeast-2": "Asia Pacific (Sydney)",
    "ap-northeast-1": "Asia Pacific (Tokyo)",
    "ca-central-1": "Canada (Central)",
    "cn-north-1": "China (Beijing)",
    "cn-northwest-1": "China (Ningxia)",
    "eu-central-1": "Europe (Frankfurt)",
    "eu-west-1": "Europe (Ireland)",
    "eu-west-2": "Europe (London)",
    "eu-south-1": "Europe (Milan)",
    "eu-west-3": "Europe (Paris)",
    "eu-north-1": "Europe (Stockholm)",
    "me-south-1": "Middle East (Bahrain)",
    "sa-east-1": "South America (São Paulo)",
};

export default function S3Guide(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "policy" });
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [alertOpen, setAlertOpen] = useState(true);
    const [skipped, setSkipped] = React.useState(new Set());
    const [magicVar, setMagicVar] = useState("");
    const [useCDN, setUseCDN] = useState("false");
    const [policy, setPolicy] = useState(
        props.policy
            ? props.policy
            : {
                  Type: "s3",
                  Name: "",
                  SecretKey: "",
                  AccessKey: "",
                  BaseURL: "",
                  Server: "",
                  IsPrivate: "true",
                  DirNameRule: "uploads/{year}/{month}/{day}",
                  AutoRename: "true",
                  FileNameRule: "{randomkey8}_{originname}",
                  IsOriginLinkEnable: "false",
                  MaxSize: "0",
                  OptionsSerialized: {
                      file_type: "",
                      region: "us-east-2",
                      chunk_size: 25 << 20,
                      placeholder_with_size: "false",
                      s3_path_style: "true",
                  },
              }
    );
    const [policyID, setPolicyID] = useState(
        props.policy ? props.policy.ID : 0
    );

    const handleChange = (name) => (event) => {
        setPolicy({
            ...policy,
            [name]: event.target.value,
        });
    };

    const handleOptionChange = (name) => (event) => {
        setPolicy({
            ...policy,
            OptionsSerialized: {
                ...policy.OptionsSerialized,
                [name]: event.target.value,
            },
        });
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const submitPolicy = (e) => {
        e.preventDefault();
        setLoading(true);

        let policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        if (useCDN === "false") {
            policyCopy.BaseURL = "";
        }

        // 类型转换
        policyCopy = transformPolicyRequest(policyCopy);

        API.post("/admin/policy", {
            policy: policyCopy,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    props.policy ? t("policySaved") : t("policyAdded"),
                    "success"
                );
                setActiveStep(4);
                setPolicyID(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });

        setLoading(false);
    };

    const createCORS = () => {
        setLoading(true);
        API.post("/admin/policy/cors", {
            id: policyID,
        })
            .then(() => {
                ToggleSnackbar("top", "right", t("corsPolicyAdded"), "success");
                setActiveStep(5);
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
                open={alertOpen}
                onClose={() => setAlertOpen(false)}
                title={t("warning")}
                msg={t("s3SelfHostWarning")}
            />
            <Typography variant={"h6"}>
                {props.policy
                    ? t("editS3StoragePolicy")
                    : t("addS3StoragePolicy")}
            </Typography>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (label.optional) {
                        labelProps.optional = (
                            <Typography variant="caption">
                                {t("optional")}
                            </Typography>
                        );
                    }
                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }
                    return (
                        <Step key={label.title} {...stepProps}>
                            <StepLabel {...labelProps}>
                                {t(label.title)}
                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            {activeStep === 0 && (
                <form
                    className={classes.stepContent}
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActiveStep(1);
                    }}
                >
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                <Trans
                                    ns={"dashboard"}
                                    i18nKey={"policy.s3BucketDes"}
                                    components={[<code key={0} />]}
                                />
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("bucketName")}
                                    </InputLabel>
                                    <Input
                                        required
                                        value={policy.BucketName}
                                        onChange={handleChange("BucketName")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>2</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("bucketTypeDes")}
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={policy.IsPrivate}
                                        onChange={handleChange("IsPrivate")}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("publicAccessDisabled")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("publicAccessEnabled")}
                                        />
                                    </RadioGroup>
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
                                <Trans
                                    ns={"dashboard"}
                                    i18nKey={"policy.s3EndpointDes"}
                                    components={[<code key={0} />]}
                                />
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("endpoint")}
                                    </InputLabel>
                                    <Input
                                        value={policy.Server}
                                        onChange={handleChange("Server")}
                                    />
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
                                    i18nKey={"policy.s3EndpointPathStyle"}
                                    components={[<code key={0} />]}
                                />
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={
                                            policy.OptionsSerialized
                                                .s3_path_style
                                        }
                                        onChange={handleOptionChange(
                                            "s3_path_style"
                                        )}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("usePathEndpoint")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("useHostnameEndpoint")}
                                        />
                                    </RadioGroup>
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
                                {t("selectRegionDes")}
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <Autocomplete
                                        options={Object.keys(regions)}
                                        freeSolo
                                        value={policy.OptionsSerialized.region}
                                        onInputChange={(_, value) =>
                                            handleOptionChange("region")({
                                                target: { value: value },
                                            })
                                        }
                                        renderOption={(option) => (
                                            <React.Fragment>
                                                {regions[option]}
                                            </React.Fragment>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                style={{ width: "100%" }}
                                                {...params}
                                            />
                                        )}
                                    />
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
                                {t("useCDN")}
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={useCDN}
                                        onChange={(e) => {
                                            setUseCDN(e.target.value);
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("use")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("notUse")}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Collapse in={useCDN === "true"}>
                        <div className={classes.subStepContainer}>
                            <div className={classes.stepNumberContainer}>
                                <div className={classes.stepNumber}>7</div>
                            </div>
                            <div className={classes.subStepContent}>
                                <Typography variant={"body2"}>
                                    {t("bucketCDNDomain")}
                                </Typography>
                                <div className={classes.form}>
                                    <DomainInput
                                        value={policy.BaseURL}
                                        onChange={handleChange("BaseURL")}
                                        required={useCDN === "true"}
                                        label={t("bucketCDNDomain")}
                                    />
                                </div>
                            </div>
                        </div>
                    </Collapse>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {getNumber(7, [useCDN === "true"])}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("enterAccessCredentials")}
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("accessKey")}
                                    </InputLabel>
                                    <Input
                                        required
                                        inputProps={{
                                            pattern: "\\S+",
                                            title: t("shouldNotContainSpace"),
                                        }}
                                        value={policy.AccessKey}
                                        onChange={handleChange("AccessKey")}
                                    />
                                </FormControl>
                            </div>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("secretKey")}
                                    </InputLabel>
                                    <Input
                                        required
                                        inputProps={{
                                            pattern: "\\S+",
                                            title: t("shouldNotContainSpace"),
                                        }}
                                        value={policy.SecretKey}
                                        onChange={handleChange("SecretKey")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {getNumber(8, [useCDN === "true"])}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("nameThePolicyFirst")}
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("policyName")}
                                    </InputLabel>
                                    <Input
                                        required
                                        value={policy.Name}
                                        onChange={handleChange("Name")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.stepFooter}>
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            {t("next")}
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 1 && (
                <form
                    className={classes.stepContent}
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActiveStep(2);
                    }}
                >
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                <Trans
                                    ns={"dashboard"}
                                    i18nKey={"policy.pathMagicVarDes"}
                                    components={[
                                        <Link
                                            key={0}
                                            color={"secondary"}
                                            href={"javascript:void()"}
                                            onClick={() => setMagicVar("path")}
                                        />,
                                    ]}
                                />
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("pathOfFolderToStoreFiles")}
                                    </InputLabel>
                                    <Input
                                        required
                                        value={policy.DirNameRule}
                                        onChange={handleChange("DirNameRule")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>2</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                <Trans
                                    ns={"dashboard"}
                                    i18nKey={"policy.filePathMagicVarDes"}
                                    components={[
                                        <Link
                                            key={0}
                                            color={"secondary"}
                                            href={"javascript:void()"}
                                            onClick={() => setMagicVar("file")}
                                        />,
                                    ]}
                                />
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        aria-label="gender"
                                        name="gender1"
                                        value={policy.AutoRename}
                                        onChange={handleChange("AutoRename")}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("autoRenameStoredFile")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("keepOriginalFileName")}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            <Collapse in={policy.AutoRename === "true"}>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("renameRule")}
                                        </InputLabel>
                                        <Input
                                            required={
                                                policy.AutoRename === "true"
                                            }
                                            value={policy.FileNameRule}
                                            onChange={handleChange(
                                                "FileNameRule"
                                            )}
                                        />
                                    </FormControl>
                                </div>
                            </Collapse>
                        </div>
                    </div>

                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => setActiveStep(0)}
                        >
                            {t("back")}
                        </Button>
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            {t("next")}
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 2 && (
                <form
                    className={classes.stepContent}
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActiveStep(3);
                    }}
                >
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("enableGettingPermanentSourceLink")}
                                <br />
                                {t("enableGettingPermanentSourceLinkDes")}
                            </Typography>

                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={policy.IsOriginLinkEnable}
                                        onChange={(e) => {
                                            if (
                                                policy.IsPrivate === "true" &&
                                                e.target.value === "true"
                                            ) {
                                                ToggleSnackbar(
                                                    "top",
                                                    "right",
                                                    t(
                                                        "cannotEnableForPrivateBucket"
                                                    ),
                                                    "warning"
                                                );
                                            }
                                            handleChange("IsOriginLinkEnable")(
                                                e
                                            );
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("allowed")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("forbidden")}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => setActiveStep(1)}
                        >
                            {t("back")}
                        </Button>{" "}
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            {t("next")}
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 3 && (
                <form className={classes.stepContent} onSubmit={submitPolicy}>
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("limitFileSize")}
                            </Typography>

                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={
                                            policy.MaxSize === "0"
                                                ? "false"
                                                : "true"
                                        }
                                        onChange={(e) => {
                                            if (e.target.value === "true") {
                                                setPolicy({
                                                    ...policy,
                                                    MaxSize: "10485760",
                                                });
                                            } else {
                                                setPolicy({
                                                    ...policy,
                                                    MaxSize: "0",
                                                });
                                            }
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("limit")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("notLimit")}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Collapse in={policy.MaxSize !== "0"}>
                        <div className={classes.subStepContainer}>
                            <div className={classes.stepNumberContainer}>
                                <div className={classes.stepNumber}>2</div>
                            </div>
                            <div className={classes.subStepContent}>
                                <Typography variant={"body2"}>
                                    {t("enterSizeLimit")}
                                </Typography>
                                <div className={classes.form}>
                                    <SizeInput
                                        value={policy.MaxSize}
                                        onChange={handleChange("MaxSize")}
                                        min={0}
                                        max={9223372036854775807}
                                        label={t("maxSizeOfSingleFile")}
                                    />
                                </div>
                            </div>
                        </div>
                    </Collapse>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {policy.MaxSize !== "0" ? "3" : "2"}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("limitFileExt")}
                            </Typography>

                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={
                                            policy.OptionsSerialized
                                                .file_type === ""
                                                ? "false"
                                                : "true"
                                        }
                                        onChange={(e) => {
                                            if (e.target.value === "true") {
                                                setPolicy({
                                                    ...policy,
                                                    OptionsSerialized: {
                                                        ...policy.OptionsSerialized,
                                                        file_type:
                                                            "jpg,png,mp4,zip,rar",
                                                    },
                                                });
                                            } else {
                                                setPolicy({
                                                    ...policy,
                                                    OptionsSerialized: {
                                                        ...policy.OptionsSerialized,
                                                        file_type: "",
                                                    },
                                                });
                                            }
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("limit")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("notLimit")}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Collapse in={policy.OptionsSerialized.file_type !== ""}>
                        <div className={classes.subStepContainer}>
                            <div className={classes.stepNumberContainer}>
                                <div className={classes.stepNumber}>
                                    {policy.MaxSize !== "0" ? "4" : "3"}
                                </div>
                            </div>
                            <div className={classes.subStepContent}>
                                <Typography variant={"body2"}>
                                    {t("enterFileExt")}
                                </Typography>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("extList")}
                                        </InputLabel>
                                        <Input
                                            value={
                                                policy.OptionsSerialized
                                                    .file_type
                                            }
                                            onChange={handleOptionChange(
                                                "file_type"
                                            )}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </Collapse>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {getNumber(3, [
                                    policy.MaxSize !== "0",
                                    policy.OptionsSerialized.file_type !== "",
                                ])}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("chunkSizeLabelS3")}
                                <br />
                                {t("chunkSizeDes")}
                            </Typography>
                            <div className={classes.form}>
                                <SizeInput
                                    value={policy.OptionsSerialized.chunk_size}
                                    onChange={handleOptionChange("chunk_size")}
                                    min={5 << 20}
                                    max={53687091200}
                                    label={t("chunkSize")}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {getNumber(4, [
                                    policy.MaxSize !== "0",
                                    policy.OptionsSerialized.file_type !== "",
                                ])}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("createPlaceholderDes")}
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        aria-label="gender"
                                        name="gender1"
                                        value={
                                            policy.OptionsSerialized
                                                .placeholder_with_size
                                        }
                                        onChange={handleOptionChange(
                                            "placeholder_with_size"
                                        )}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("createPlaceholder")}
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label={t("notCreatePlaceholder")}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => setActiveStep(2)}
                        >
                            {t("back")}
                        </Button>{" "}
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            {t("next")}
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 4 && (
                <form className={classes.stepContent} onSubmit={submitPolicy}>
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer} />
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                {t("ossCORSDes")}
                            </Typography>
                            <div className={classes.form}>
                                <Button
                                    disabled={loading}
                                    color={"secondary"}
                                    variant={"contained"}
                                    className={classes.button}
                                    onClick={() => createCORS()}
                                    classes={{ label: classes.viewButtonLabel }}
                                >
                                    {t("letCloudreveHelpMe")}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => {
                                setActiveStep(
                                    (prevActiveStep) => prevActiveStep + 1
                                );
                                setSkipped((prevSkipped) => {
                                    const newSkipped = new Set(
                                        prevSkipped.values()
                                    );
                                    newSkipped.add(activeStep);
                                    return newSkipped;
                                });
                            }}
                        >
                            {t("skip")}
                        </Button>{" "}
                    </div>
                </form>
            )}

            {activeStep === 5 && (
                <>
                    <form className={classes.stepContent}>
                        <Typography>
                            {props.policy ? t("policySaved") : t("policyAdded")}
                        </Typography>
                        <Typography variant={"body2"} color={"textSecondary"}>
                            {t("furtherActions")}
                        </Typography>
                    </form>
                    <div className={classes.stepFooter}>
                        <Button
                            color={"primary"}
                            className={classes.button}
                            onClick={() => history.push("/admin/policy")}
                        >
                            {t("backToList")}
                        </Button>
                    </div>
                </>
            )}

            <MagicVar
                open={magicVar === "file"}
                isFile
                onClose={() => setMagicVar("")}
            />
            <MagicVar
                open={magicVar === "path"}
                onClose={() => setMagicVar("")}
            />
        </div>
    );
}

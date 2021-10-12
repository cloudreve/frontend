import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../../actions";
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
        title: i18next.t('Storage'),
        optional: false,
    },
    {
        title: i18next.t('Upload Path'),
        optional: false,
    },
    {
        title: i18next.t('Straight link settings'),
        optional: false,
    },
    {
        title: i18next.t('Upload limit'),
        optional: false,
    },
    {
        title: i18next.t('Cross Domain Policy'),
        optional: true,
    },
    {
        title: i18next.t('Finish'),
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
    "sa-east-1": i18next.t('South America (São Paulo)'),
};

export default function S3Guide(props) {
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
                  },
              }
    );
    const [policyID, setPolicyID] = useState(
        props.policy ? props.policy.ID : 0
    );

    const { t } = useTranslation();

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

        const policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        if (useCDN === "false") {
            policyCopy.BaseURL = "";
        }

        // 类型转换
        policyCopy.AutoRename = policyCopy.AutoRename === "true";
        policyCopy.IsOriginLinkEnable =
            policyCopy.IsOriginLinkEnable === "true";
        policyCopy.IsPrivate = policyCopy.IsPrivate === "true";
        policyCopy.MaxSize = parseInt(policyCopy.MaxSize);
        policyCopy.OptionsSerialized.file_type = policyCopy.OptionsSerialized.file_type.split(
            ","
        );
        if (
            policyCopy.OptionsSerialized.file_type.length === 1 &&
            policyCopy.OptionsSerialized.file_type[0] === ""
        ) {
            policyCopy.OptionsSerialized.file_type = [];
        }

        API.post("/admin/policy", {
            policy: policyCopy,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t('Storage Policy Already') + (props.policy ? t('save') : t('Add to')),
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
                ToggleSnackbar("top", "right", t('Cross-domain policy has been added'), "success");
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
              title={t('warn')}
              msg={
                  t('S3 type storage policy is currently only available for self-use, or for trusted user groups.')
              }
          />
          <Typography variant={"h6"}>
            {props.policy ? t('Revise') : t('Add to')} {t('Amazon S3 Storage Policy')}
          </Typography>
          <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (label.optional) {
                      labelProps.optional = (
                          (<Typography variant="caption">{t('Optional')}</Typography>)
                      );
                  }
                  if (isStepSkipped(index)) {
                      stepProps.completed = false;
                  }
                  return (
                      <Step key={label.title} {...stepProps}>
                          <StepLabel {...labelProps}>{label.title}</StepLabel>
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
                          <div className={classes.stepNumber}>0</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('The Cloudreve master site needs to enable CORS support, the specific steps are as follows:')}
                            <br />
                            {t(
                              'Modify the Cloudreve configuration file, add the following CORS\nconfiguration items, save and restart Cloudreve.'
                            )}
                            <pre>
                                [CORS]
                                <br />
                                AllowOrigins = *<br />
                                AllowMethods = OPTIONS,GET,POST
                                <br />
                                AllowHeaders = *<br />
                            </pre>
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>1</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Go to the AWS S3\nconsole to create a bucket, and fill in the  specified when you created the bucket below')}
                            <code>{t('Bucket name')}</code>{t('：')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Bucket name')}
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
                            {t('Select the type of public access permissions for the space you created below. It is recommended to select "Private" for higher security. Private spaces cannot enable the "Get direct link" function.')}
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
                                          label={t('Block all public access rights')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('Allow public reading')}
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
                            {t(
                              '(Optional) Specify the EndPoint (regional node) of the bucket, fill in\nas a complete URL format, such as '
                            )}{" "}
                            <code>https://bucket.region.example.com</code>{t('.\nLeave blank to use the default access point generated by the system.')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                      EndPoint
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
                            {t('Select the region where the bucket is located, or manually enter the region code')}
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
                          <div className={classes.stepNumber}>5</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Do you want to use CDN to accelerate access?')}
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
                                          label={t('use')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('Do not use')}
                                      />
                                  </RadioGroup>
                              </FormControl>
                          </div>
                      </div>
                  </div>

                  <Collapse in={useCDN === "true"}>
                      <div className={classes.subStepContainer}>
                          <div className={classes.stepNumberContainer}>
                              <div className={classes.stepNumber}>6</div>
                          </div>
                          <div className={classes.subStepContent}>
                              <Typography variant={"body2"}>
                                {t('CDN accelerated domain name')}
                              </Typography>
                              <div className={classes.form}>
                                  <DomainInput
                                      value={policy.BaseURL}
                                      onChange={handleChange("BaseURL")}
                                      required={useCDN === "true"}
                                      label={t('CDN accelerated domain name')}
                                  />
                              </div>
                          </div>
                      </div>
                  </Collapse>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>
                              {getNumber(6, [useCDN === "true"])}
                          </div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Get the access key and fill it in below.')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                      AccessKey
                                  </InputLabel>
                                  <Input
                                      required
                                      inputProps={{
                                          pattern: "\\S+",
                                          title: t('Cannot contain spaces'),
                                      }}
                                      value={policy.AccessKey}
                                      onChange={handleChange("AccessKey")}
                                  />
                              </FormControl>
                          </div>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                      SecretKey
                                  </InputLabel>
                                  <Input
                                      required
                                      inputProps={{
                                          pattern: "\\S+",
                                          title: t('Cannot contain spaces'),
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
                              {getNumber(7, [useCDN === "true"])}
                          </div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Name this storage policy:')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Storage Policy Name')}
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
                        {t('Next step"')}
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
                            {t(
                              'Please keep at least one color scheme'
                            )}{" "}
                            <Link
                                color={"secondary"}
                                href={"javascript:void()"}
                                onClick={() => setMagicVar("path")}
                            >
                              {t('Path Magic Variable List')}
                            </Link>{" "}
                            {t('。')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Storage Directory')}
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
                            {t(
                              'Does the stored physical file need to be renamed? The renaming here will not affect the\nfile name that is finally presented to the user. The file name can also use magic variables,\ncan refer to the available magic variables'
                            )}{" "}
                            <Link
                                color={"secondary"}
                                href={"javascript:void()"}
                                onClick={() => setMagicVar("file")}
                            >
                              {t('File name magic variable list')}
                            </Link>{" "}
                            {t('。')}
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
                                          label={t('Turn on rename')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('Do not open')}
                                      />
                                  </RadioGroup>
                              </FormControl>
                          </div>

                          <Collapse in={policy.AutoRename === "true"}>
                              <div className={classes.form}>
                                  <FormControl fullWidth>
                                      <InputLabel htmlFor="component-helper">
                                        {t('Naming Rules')}
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
                        {t('Previous')}
                      </Button>
                      <Button
                          disabled={loading}
                          type={"submit"}
                          variant={"contained"}
                          color={"primary"}
                      >
                        {t('Next step"')}
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
                            {t('Are you allowed to obtain permanent direct links to files?')}
                            <br />
                            {t('When enabled, the user can request a direct link that can directly access the content of the file, suitable for image bed applications or personal use.')}
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
                                                  t('Private space cannot open this function'),
                                                  "warning"
                                              );
                                              return;
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
                                          label={t('allow')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('prohibit')}
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
                        {t('Previous')}
                      </Button>{" "}
                      <Button
                          disabled={loading}
                          type={"submit"}
                          variant={"contained"}
                          color={"primary"}
                      >
                        {t('Next step"')}
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
                            {t('Do you want to limit the size of the uploaded single file?')}
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
                                          label={t('limit')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('not limited')}
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
                                {t('Input limit:')}
                              </Typography>
                              <div className={classes.form}>
                                  <SizeInput
                                      value={policy.MaxSize}
                                      onChange={handleChange("MaxSize")}
                                      min={0}
                                      max={9223372036854775807}
                                      label={t('Single file size limit')}
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
                            {t('Do you want to restrict uploading file extensions?')}
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
                                          label={t('limit')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('not limited')}
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
                                {t('Enter the file extensions allowed to upload, please use a comma for more than one file,\nseparated')}
                              </Typography>
                              <div className={classes.form}>
                                  <FormControl fullWidth>
                                      <InputLabel htmlFor="component-helper">
                                        {t('List of extensions')}
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

                  <div className={classes.stepFooter}>
                      <Button
                          color={"default"}
                          className={classes.button}
                          onClick={() => setActiveStep(2)}
                      >
                        {t('Previous')}
                      </Button>{" "}
                      <Button
                          disabled={loading}
                          type={"submit"}
                          variant={"contained"}
                          color={"primary"}
                      >
                        {t('Next step"')}
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
                            {t(
                              'S3 Bucket needs to configure the cross-domain policy correctly before you can upload files on the Web\nside. Cloudreve\ncan automatically set it for you, or you can set it manually by referring to the document steps. If you have already set this\nBucket Cross-domain policy, this step can be skipped.'
                            )}
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
                                {t('Let Cloudreve set it up for me')}
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
                        {t('jump over')}
                      </Button>{" "}
                  </div>
              </form>
          )}

          {activeStep === 5 && (
              <>
                  <form className={classes.stepContent}>
                      <Typography>
                        {t('Storage Policy Already')}{props.policy ? t('save') : t('Add to')}{t('！')}
                      </Typography>
                      <Typography variant={"body2"} color={"textSecondary"}>
                        {t('To use this storage policy, please go to the user group management page and bind this storage policy to the corresponding user group.')}
                      </Typography>
                  </form>
                  <div className={classes.stepFooter}>
                      <Button
                          color={"primary"}
                          className={classes.button}
                          onClick={() => history.push("/admin/policy")}
                      >
                        {t('Return to storage policy list')}
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

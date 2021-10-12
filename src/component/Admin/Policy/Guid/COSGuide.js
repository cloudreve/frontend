import { useTranslation } from "react-i18next";
import i18next from "i18next";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Select from "@material-ui/core/Select";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toggleSnackbar } from "../../../../actions";
import API from "../../../../middleware/Api";
import { getNumber } from "../../../../utils";
import DomainInput from "../../Common/DomainInput";
import SizeInput from "../../Common/SizeInput";
import MagicVar from "../../Dialogs/MagicVar";

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
        title: i18next.t('Cloud function callback'),
        optional: true,
    },
    {
        title: i18next.t('Finish'),
        optional: false,
    },
];

export default function COSGuide(props) {
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [skipped, setSkipped] = React.useState(new Set());
    const [magicVar, setMagicVar] = useState("");
    const [useCDN, setUseCDN] = useState("false");
    const [policy, setPolicy] = useState(
        props.policy
            ? props.policy
            : {
                  Type: "cos",
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
                  },
              }
    );
    const [policyID, setPolicyID] = useState(
        props.policy ? props.policy.ID : 0
    );
    const [region, setRegion] = useState("ap-chengdu");

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
            policyCopy.BaseURL = policy.Server;
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

    const creatCallback = () => {
        setLoading(true);
        API.post("/admin/policy/scf", {
            id: policyID,
            region: region,
        })
            .then(() => {
                ToggleSnackbar("top", "right", t('Callback cloud function has been added'), "success");
                setActiveStep(6);
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
          <Typography variant={"h6"}>
            {props.policy ? t('Revise') : t('Add to')} {t('Tencent Cloud COS Storage Strategy')}
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
                            {t(
                              'Before using the Tencent Cloud COS storage strategy, please make sure that the\naddress you fill in the parameter setting\n-site information-site URL matches the actual one, and '
                            )}
                            <strong>{t('Able to be normally accessed by the external network')}</strong>{t('。')}
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>1</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Go to')}
                            <Link
                                href={
                                    "https://console.cloud.tencent.com/cos5"
                                }
                                target={"_blank"}
                            >
                              {t('COS Management Console')}
                            </Link>
                            {t('Create bucket.')}
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>2</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Go to the basic configuration page of the created bucket, change ')}
                            <code>{t('Space name')}</code>{t('Fill in below:')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Space name')}
                                  </InputLabel>
                                  <Input
                                      inputProps={{
                                          pattern: "[a-z0-9-]+-[0-9]+",
                                          title:
                                              t('The format of the space name is incorrect, for example: ccc-1252109809'),
                                      }}
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
                          <div className={classes.stepNumber}>3</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Select the type of access permission for the space you created below, it is recommended to choose')}
                            <code>{t('Private Read and Write')}</code>
                            {t('In order to obtain higher security, the private space cannot open the "Get Direct Link" function.')}
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
                                          label={t('Private Read and Write')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('Public Read Private Write')}
                                      />
                                  </RadioGroup>
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
                            {t('Go to the basic configuration of the created Bucket and fill in ')}
                            <code>{t('Basic Information')}</code>{t('Given under the column')}{" "}
                            <code>{t('Access Domain')}</code>
                          </Typography>
                          <div className={classes.form}>
                              <DomainInput
                                  value={policy.Server}
                                  onChange={handleChange("Server")}
                                  required
                                  label={t('Access Domain')}
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
                            {t('Do you want to use the supporting Tencent Cloud CDN to accelerate COS access?')}
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
                                {t('Go to')}
                                <Link
                                    href={
                                        "https://console.cloud.tencent.com/cdn/access/guid"
                                    }
                                    target={"_blank"}
                                >
                                  {t('Tencent Cloud CDN Management Console')}
                                </Link>
                                {t(
                                  'Create a CDN accelerated domain name, and set the source site to the newly created COS\nbucket. Fill in the CDN\naccelerated domain name below, and choose whether to use HTTPS:'
                                )}
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
                            {t('In Tencent Cloud')}
                            <Link
                                href={
                                    "https://console.cloud.tencent.com/cam/capi"
                                }
                                target={"_blank"}
                            >
                              {t('Access Key')}
                            </Link>
                            {t(
                              'The page gets a pair of\naccess keys and fills them in below. Please make sure that this pair of keys has access rights to\nCOS and SCF services.'
                            )}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                      SecretId
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
                  className={classes.stepContental}
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMagicVar("path");
                                }}
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMagicVar("file");
                                }}
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
              <form className={classes.stepContent}>
                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer} />
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t(
                              'The COS bucket needs to be correctly configured with the cross-domain policy before you can use the Web\nside to upload files. Cloudreve\ncan automatically set it for you, or you can set it manually by referring to the document steps. If you have already set this\nBucket Cross-domain policy, this step can be skipped.'
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
              <form className={classes.stepContent}>
                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer} />
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('The direct transmission of the COS bucket client requires the help of Tencent Cloud')}
                            <Link
                                href={
                                    "https://console.cloud.tencent.com/scf/index?rid=16"
                                }
                                target={"_blank"}
                            >
                              {t('Cloud Function')}
                            </Link>
                            {t(
                              'Products to ensure that upload callbacks are controllable. If you plan to use this storage policy for your own use, or assign it to a trusted user group, you can skip this step.\nIf it is for public use, please be sure to create a callback cloud function.'
                            )}
                            <br />
                            <br />
                          </Typography>
                          <Typography variant={"body2"}>
                            {t(
                              'Cloudreve can try to automatically create a callback cloud function for you. Please select the location of\nCOS bucket and continue.\nCreation may take a few seconds, please be patient. Please make sure your Tencent Cloud account is enabled before creating Cloud function service.'
                            )}
                          </Typography>

                          <div className={classes.form}>
                              <FormControl>
                                  <InputLabel htmlFor="component-helper">
                                    {t('The region where the bucket is located')}
                                  </InputLabel>
                                  <Select
                                      value={region}
                                      onChange={(e) =>
                                          setRegion(e.target.value)
                                      }
                                      required
                                  >
                                      <MenuItem value={"ap-beijing"}>
                                        {t('North China (Beijing)')}
                                      </MenuItem>
                                      <MenuItem value={"ap-chengdu"}>
                                        {t('Southwest Region (Chengdu)')}
                                      </MenuItem>
                                      <MenuItem value={"ap-guangzhou"}>
                                        {t('South China (Guangzhou)')}
                                      </MenuItem>
                                      <MenuItem value={"ap-guangzhou-open"}>
                                        {t('South China (Guangzhou Open)')}
                                      </MenuItem>
                                      <MenuItem value={"ap-hongkong"}>
                                        {t('Hong Kong, Macao and Taiwan (Hong Kong, China)')}
                                      </MenuItem>
                                      <MenuItem value={"ap-mumbai"}>
                                        {t('South Asia Pacific (Mumbai)')}
                                      </MenuItem>
                                      <MenuItem value={"ap-shanghai"}>
                                        {t('East China (Shanghai)')}
                                      </MenuItem>
                                      <MenuItem value={"ap-singapore"}>
                                        {t('Southeast Asia Pacific (Singapore)')}
                                      </MenuItem>
                                      <MenuItem value={"na-siliconvalley"}>
                                        {t('Western United States (Silicon Valley)')}
                                      </MenuItem>
                                      <MenuItem value={"na-toronto"}>
                                        {t('North America (Toronto)')}
                                      </MenuItem>
                                  </Select>
                              </FormControl>
                          </div>

                          <div className={classes.form}>
                              <Button
                                  disabled={loading}
                                  color={"secondary"}
                                  variant={"contained"}
                                  className={classes.button}
                                  onClick={() => creatCallback()}
                                  classes={{ label: classes.viewButtonLabel }}
                              >
                                {t('Let Cloudreve help me create')}
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

          {activeStep === 6 && (
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

import { useTranslation } from "react-i18next";
import i18next from "i18next";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toggleSnackbar } from "../../../../actions";
import API from "../../../../middleware/Api";
import SizeInput from "../../Common/SizeInput";
import AlertDialog from "../../Dialogs/Alert";
import MagicVar from "../../Dialogs/MagicVar";
import DomainInput from "../../Common/DomainInput";

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
        title: i18next.t('App Authorization'),
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
        title: i18next.t('Account authorization'),
        optional: false,
    },
    {
        title: i18next.t('Finish'),
        optional: false,
    },
];

export default function OneDriveGuide(props) {
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [skipped] = React.useState(new Set());
    const [magicVar, setMagicVar] = useState("");
    const [useCDN, setUseCDN] = useState(
        props.policy && props.policy.OptionsSerialized.od_proxy
            ? props.policy.OptionsSerialized.od_proxy !== ""
            : false
    );
    const [useSharePoint, setUseSharePoint] = useState(
        props.policy && props.policy.OptionsSerialized.od_driver
            ? props.policy.OptionsSerialized.od_driver !== ""
            : false
    );
    const [policy, setPolicy] = useState(
        props.policy
            ? props.policy
            : {
                  Type: "onedrive",
                  Name: "",
                  BucketName: "",
                  SecretKey: "",
                  AccessKey: "",
                  BaseURL: "",
                  Server: "https://graph.microsoft.com/v1.0",
                  IsPrivate: "true",
                  DirNameRule: "uploads/{year}/{month}/{day}",
                  AutoRename: "true",
                  FileNameRule: "{randomkey8}_{originname}",
                  IsOriginLinkEnable: "false",
                  MaxSize: "0",
                  OptionsSerialized: {
                      file_type: "",
                      od_redirect: "",
                      od_proxy: "",
                      od_driver: "",
                  },
              }
    );
    const [policyID, setPolicyID] = useState(
        props.policy ? props.policy.ID : 0
    );
    const [httpsAlert, setHttpsAlert] = useState(false);

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

    useEffect(() => {
        API.post("/admin/setting", {
            keys: ["siteURL"],
        })
            .then((response) => {
                if (!response.data.siteURL.startsWith("https://")) {
                    setHttpsAlert(true);
                }
                if (policy.OptionsSerialized.od_redirect === "") {
                    setPolicy({
                        ...policy,
                        OptionsSerialized: {
                            ...policy.OptionsSerialized,
                            od_redirect: new URL(
                                "/api/v3/callback/onedrive/auth",
                                response.data.siteURL
                            ).toString(),
                        },
                    });
                }
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    const statOAuth = () => {
        setLoading(true);
        API.get("/admin/policy/" + policyID + "/oauth")
            .then((response) => {
                window.location.href = response.data;
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                setLoading(false);
            });
    };

    const submitPolicy = (e) => {
        e.preventDefault();
        setLoading(true);

        const policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        // baseURL处理
        if (policyCopy.Server === "https://graph.microsoft.com/v1.0") {
            policyCopy.BaseURL =
                "https://login.microsoftonline.com/common/oauth2/v2.0";
        } else {
            policyCopy.BaseURL = "https://login.chinacloudapi.cn/common/oauth2";
        }

        if (!useCDN) {
            policyCopy.OptionsSerialized.od_proxy = "";
        }

        if (!useSharePoint) {
            policyCopy.OptionsSerialized.od_driver = "";
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

    return (
      <div>
          <AlertDialog
              open={httpsAlert}
              onClose={() => setHttpsAlert(false)}
              title={t('warn')}
              msg={
                  t('You must enable HTTPS to use the OneDrive/SharePoint storage policy; after enabling it, change the parameter settings-site information-site URL.')
              }
          />
          <Typography variant={"h6"}>
            {props.policy ? t('Revise') : t('Add to')} {t('OneDrive/SharePoint Storage Strategy')}
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
                          <div className={classes.stepNumber}>1</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Go to')}
                            <Link
                                href={
                                    "https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview"
                                }
                                target={"_blank"}
                            >
                              {t('Azure Active Directory Console (International Account)')}
                            </Link>{" "}
                            {t('or')}{" "}
                            <Link
                                href={
                                    "https://portal.azure.cn/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview"
                                }
                                target={"_blank"}
                            >
                              {t('Azure Active Directory console (21Vianet account)')}
                            </Link>
                            {t('Log in and enter after logging in')}
                            <code>Azure Active Directory</code>{t('Admin Panel.')}
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>2</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Enter the left side')} <code>{t('Application Registration')}</code> {t('Menu and click ')}{" "}
                            <code>{t('New registration')}</code> {t('Button.')}
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>3</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Fill in the application registration form. Among them, the name can be any; ')}
                            <code>{t('Supported account types')}</code> {t('Select as ')}
                            <code>
                              {t('An account in any organization directory (any Azure AD directory-\nmulti-tenant)')}
                            </code>
                            {t('；')}<code>{t('Redirect URI (optional)')}</code>
                            {t('please choose')}<code>Web</code>{t(', and fill in ')}
                            <code>
                                {policy.OptionsSerialized.od_redirect}
                            </code>
                            {t('; Others can be kept by default": ')}
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>4</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('After the creation is complete, enter the application management')}<code>{t('Overview')}</code>
                            {t('Page, copy')}<code>{t('Application (Client) ID')}</code>
                            {t('And fill in the following:')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Application (Client) ID')}
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
                          <div className={classes.stepNumber}>5</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Enter on the left side of the application management page,')}<code>{t('Certificate and Password')}</code>
                            {t('Menu, click')}
                            <code>{t('New Client Password')}</code>
                            {t('Button, ')}<code>{t('Deadline')}</code>{t('Select as ')}
                            <code>{t('Never')}</code>
                            {t('. After the creation is complete, fill in the value of the client password below: ')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Client Password')}
                                  </InputLabel>
                                  <Input
                                      required
                                      value={policy.SecretKey}
                                      onChange={handleChange("SecretKey")}
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
                            {t('Select your Microsoft 365 account type:')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl required component="fieldset">
                                  <RadioGroup
                                      required
                                      value={policy.Server}
                                      onChange={handleChange("Server")}
                                      row
                                  >
                                      <FormControlLabel
                                          value={
                                              "https://graph.microsoft.com/v1.0"
                                          }
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('International Edition')}
                                      />
                                      <FormControlLabel
                                          value={
                                              "https://microsoftgraph.chinacloudapi.cn/v1.0"
                                          }
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('21Vianet Edition')}
                                      />
                                  </RadioGroup>
                              </FormControl>
                          </div>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>7</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Do you want to store the file in SharePoint?')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl required component="fieldset">
                                  <RadioGroup
                                      required
                                      value={useSharePoint.toString()}
                                      onChange={(e) => {
                                          setUseSharePoint(
                                              e.target.value === "true"
                                          );
                                      }}
                                      row
                                  >
                                      <FormControlLabel
                                          value={"true"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('Save to specified SharePoint')}
                                      />
                                      <FormControlLabel
                                          value={"false"}
                                          control={
                                              <Radio color={"primary"} />
                                          }
                                          label={t('Save to the account default OneDrive drive')}
                                      />
                                  </RadioGroup>
                              </FormControl>
                          </div>
                          <Collapse in={useSharePoint}>
                              <div className={classes.form}>
                                  <FormControl fullWidth>
                                      <InputLabel htmlFor="component-helper">
                                        {t('SharePoint site address')}
                                      </InputLabel>
                                      <Input
                                          placeholder={
                                              "https://example.sharepoint.com/sites/demo"
                                          }
                                          value={
                                              policy.OptionsSerialized
                                                  .od_driver
                                          }
                                          onChange={handleOptionChange(
                                              "od_driver"
                                          )}
                                          required={useSharePoint}
                                          label={t('SharePoint site address')}
                                      />
                                  </FormControl>
                              </div>
                          </Collapse>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>8</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Do you want to replace with a self-built anti-generation server when downloading files?')}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl required component="fieldset">
                                  <RadioGroup
                                      required
                                      value={useCDN.toString()}
                                      onChange={(e) => {
                                          setUseCDN(
                                              e.target.value === "true"
                                          );
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
                          <Collapse in={useCDN}>
                              <div className={classes.form}>
                                  <FormControl fullWidth>
                                      <DomainInput
                                          value={
                                              policy.OptionsSerialized
                                                  .od_proxy
                                          }
                                          onChange={handleOptionChange(
                                              "od_proxy"
                                          )}
                                          required={useCDN}
                                          label={t('Counter generation server address')}
                                      />
                                  </FormControl>
                              </div>
                          </Collapse>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>9</div>
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
                            {t('Storage Policy Already')}{props.policy ? t('save') : t('Add to')}
                            {t(
                              'But you need to click the button below and use OneDrive\nto log in and authorize to complete the initialization before you can use it.\nYou can re-authorize on the storage policy list page in the future.'
                            )}
                          </Typography>
                          <div className={classes.form}>
                              <Button
                                  disabled={loading}
                                  color={"secondary"}
                                  variant={"contained"}
                                  className={classes.button}
                                  onClick={statOAuth}
                                  classes={{ label: classes.viewButtonLabel }}
                              >
                                {t('Go to authorization page')}
                              </Button>
                          </div>
                      </div>
                  </div>
                  <div className={classes.stepFooter}></div>
              </form>
          )}

          {activeStep === 5 && (
              <>
                  <form className={classes.stepContent}>
                      <Typography>{t('Storage policy has been added!')}</Typography>
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

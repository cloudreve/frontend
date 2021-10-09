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
import Alert from "@material-ui/lab/Alert";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toggleSnackbar } from "../../../../actions";
import API from "../../../../middleware/Api";
import { randomStr } from "../../../../utils";
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
    "@global": {
        code: {
            color: "rgba(0, 0, 0, 0.87)",
            display: "inline-block",
            padding: "2px 6px",
            fontSize: "14px",
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
        title: i18next.t('Storage configuration'),
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
        title: i18next.t('Finish'),
        optional: false,
    },
];

export default function RemoteGuide(props) {
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [skipped] = React.useState(new Set());
    const [magicVar, setMagicVar] = useState("");
    const [useCDN, setUseCDN] = useState("false");
    const [policy, setPolicy] = useState(
        props.policy
            ? props.policy
            : {
                  Type: "remote",
                  Name: "",
                  Server: "https://example.com:5212",
                  SecretKey: randomStr(64),
                  DirNameRule: "uploads/{year}/{month}/{day}",
                  AutoRename: "true",
                  FileNameRule: "{randomkey8}_{originname}",
                  IsOriginLinkEnable: "false",
                  BaseURL: "",
                  IsPrivate: "true",
                  MaxSize: "0",
                  OptionsSerialized: {
                      file_type: "",
                  },
              }
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

    const testSlave = () => {
        setLoading(true);

        // 测试路径是否可用
        API.post("/admin/policy/test/slave", {
            server: policy.Server,
            secret: policy.SecretKey,
        })
            .then(() => {
                ToggleSnackbar("top", "right", t('Communication is normal'), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const submitPolicy = (e) => {
        e.preventDefault();
        setLoading(true);

        const policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        // 处理存储策略
        if (useCDN === "false" || policy.IsOriginLinkEnable === "false") {
            policyCopy.BaseURL = "";
        }

        // 类型转换
        policyCopy.AutoRename = policyCopy.AutoRename === "true";
        policyCopy.IsOriginLinkEnable =
            policyCopy.IsOriginLinkEnable === "true";
        policyCopy.MaxSize = parseInt(policyCopy.MaxSize);
        policyCopy.IsPrivate = policyCopy.IsPrivate === "true";
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
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t('Storage Policy Already') + (props.policy ? t('save') : t('Add to')),
                    "success"
                );
                setActiveStep(5);
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
          <Typography variant={"h6"}>
            {props.policy ? t('Revise') : t('Add to')}{t('Slave Storage Strategy')}
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
                  <Alert severity="info" style={{ marginBottom: 10 }}>
                    {t(
                      'The slave storage policy allows you to use the server that also runs Cloudreve\nas the storage end, and the user upload and download traffic is directly transmitted via HTTP.'
                    )}
                  </Alert>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>1</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Copy the Cloudreve\nprogram of the same version as the master site to the server to be used as the slave.')}
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>2</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t(
                              'The following is the slave key randomly generated by the system for you. Generally, there is no need to change it. If you have custom requirements,\ncan fill in your key below:'
                            )}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Slave Key')}
                                  </InputLabel>
                                  <Input
                                      required
                                      inputProps={{
                                          minlength: 64,
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
                          <div className={classes.stepNumber}>3</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Modify the slave configuration file.')}
                            <br />
                            {t('Create a new directory in the same level directory of Cloudreve on the slave side')}
                            <code>conf.ini</code>
                            {t(
                              'File, fill in the slave configuration, start/restart Cloudreve on the slave side.\nThe following is a configuration example for reference, in which the key part has been filled in for you as the one generated in the previous step.'
                            )}
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
                              Secret = {policy.SecretKey}
                              <br />
                              <br />
                              [CORS]
                              <br />
                              AllowOrigins = *<br />
                              AllowMethods = OPTIONS,GET,POST
                              <br />
                              AllowHeaders = *<br />
                          </pre>
                          <Typography variant={"body2"}>
                            {t('The configuration file format of the slave is roughly the same as that of the master, the difference is: ')}
                            <ul>
                                <li>
                                  <code>System</code>
                                  {t('\\\\ under the partition')}
                                  <code>mode</code>
                                  {t('The field must be changed to ')}<code>slave</code>
                                </li>
                                <li>
                                  {t('Must specify ')}<code>Slave</code>{t('\\\\ under the partition')}
                                  <code>Secret</code>
                                  {t('The value of the field is the key filled in or generated in the second step.')}
                                </li>
                                <li>
                                  {t('Cross-domain configuration must be activated, ie ')}<code>CORS</code>
                                  {t(
                                    'For the content of the field,\ncan refer to the above examples or official documents. If the configuration is not correct, the user will not be able to upload files to the slave through the\nWeb terminal.'
                                  )}
                                </li>
                            </ul>
                          </Typography>
                      </div>
                  </div>

                  <div className={classes.subStepContainer}>
                      <div className={classes.stepNumberContainer}>
                          <div className={classes.stepNumber}>4</div>
                      </div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('Fill in the slave address.')}
                            <br />
                            {t(
                              'If the master has enabled\nHTTPS, the slave also needs to enable it, and fill in the address of the HTTPS\nprotocol below.'
                            )}
                          </Typography>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Slave address')}
                                  </InputLabel>
                                  <Input
                                      fullWidth
                                      required
                                      type={"url"}
                                      value={policy.Server}
                                      onChange={handleChange("Server")}
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
                            {t('After completing the above steps, you can click the test button below to test whether the communication is normal.')}
                          </Typography>
                          <div className={classes.form}>
                              <Button
                                  disabled={loading}
                                  onClick={() => testSlave()}
                                  variant={"outlined"}
                                  color={"primary"}
                              >
                                {t('Test slave communication')}
                              </Button>
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
                                      onChange={handleChange(
                                          "IsOriginLinkEnable"
                                      )}
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

                  <Collapse in={policy.IsOriginLinkEnable === "true"}>
                      <div className={classes.subStepContainer}>
                          <div className={classes.stepNumberContainer}>
                              <div className={classes.stepNumber}>2</div>
                          </div>
                          <div className={classes.subStepContent}>
                              <Typography variant={"body2"}>
                                {t('Do you want to use CDN for downloads/direct links?')}
                                <br />
                                {t(
                                  'When enabled, the domain name part of the URL\nwhen the user accesses the file will be replaced with the CDN domain name.'
                                )}
                              </Typography>

                              <div className={classes.form}>
                                  <FormControl required component="fieldset">
                                      <RadioGroup
                                          required
                                          value={useCDN}
                                          onChange={(e) => {
                                              if (
                                                  e.target.value === "false"
                                              ) {
                                                  setPolicy({
                                                      ...policy,
                                                      BaseURL: "",
                                                  });
                                              }
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
                                  <div className={classes.stepNumber}>3</div>
                              </div>
                              <div className={classes.subStepContent}>
                                  <Typography variant={"body2"}>
                                    {t('Select the protocol and fill in the CDN domain name')}
                                  </Typography>

                                  <div className={classes.form}>
                                      <DomainInput
                                          value={policy.BaseURL}
                                          onChange={handleChange("BaseURL")}
                                          required={
                                              policy.IsOriginLinkEnable ===
                                                  "true" && useCDN === "true"
                                          }
                                          label={t('CDN prefix')}
                                      />
                                  </div>
                              </div>
                          </div>
                      </Collapse>
                  </Collapse>

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
              <form
                  className={classes.stepContent}
                  onSubmit={(e) => {
                      e.preventDefault();
                      setActiveStep(4);
                  }}
              >
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
                      <div className={classes.stepNumberContainer}></div>
                      <div className={classes.subStepContent}>
                          <Typography variant={"body2"}>
                            {t('The last step, name this storage policy: ')}
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
                          color={"default"}
                          className={classes.button}
                          onClick={() => setActiveStep(3)}
                      >
                        {t('Previous')}
                      </Button>{" "}
                      <Button
                          disabled={loading}
                          type={"submit"}
                          variant={"contained"}
                          color={"primary"}
                      >
                        {t('Finish')}
                      </Button>
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
              isSlave
              onClose={() => setMagicVar("")}
          />
          <MagicVar
              open={magicVar === "path"}
              isSlave
              onClose={() => setMagicVar("")}
          />
      </div>
    );
}

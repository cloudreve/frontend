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

const useStyles = makeStyles(theme => ({
    stepContent: {
        padding: "16px 32px 16px 32px"
    },
    form: {
        maxWidth: 400,
        marginTop: 20
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px"
        }
    },
    subStepContainer: {
        display: "flex",
        marginBottom: 20,
        padding: 10,
        transition: theme.transitions.create("background-color", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        "&:focus-within": {
            backgroundColor: theme.palette.background.default
        }
    },
    stepNumber: {
        width: 20,
        height: 20,
        backgroundColor: lighten(theme.palette.secondary.light, 0.2),
        color: theme.palette.secondary.contrastText,
        textAlign: "center",
        borderRadius: " 50%"
    },
    stepNumberContainer: {
        marginRight: 10
    },
    stepFooter: {
        marginTop: 32
    },
    button: {
        marginRight: theme.spacing(1)
    },
    viewButtonLabel: { textTransform: "none" },
    "@global":{
        "code":{
            color: "rgba(0, 0, 0, 0.87)",
            display: "inline-block",
            padding: "2px 6px",
            fontFamily:" Consolas, \"Liberation Mono\", Menlo, Courier, monospace",
            borderRadius: "2px",
            backgroundColor: "rgba(255,229,100,0.1)",
        },
    },
}));

const steps = [
    {
        title: "应用授权",
        optional: false
    },
    {
        title: "上传路径",
        optional: false
    },
    {
        title: "上传限制",
        optional: false
    },
    {
        title: "账号授权",
        optional: false
    },
    {
        title: "完成",
        optional: false
    }
];

export default function OneDriveGuide(props) {
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [skipped,] = React.useState(new Set());
    const [magicVar, setMagicVar] = useState("");
    const [policy, setPolicy] = useState(props.policy
        ? props.policy
        : {
        Type: "onedrive",
        Name: "",
        BucketName:"",
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
            od_redirect:"",
        }
    });
    const [policyID,setPolicyID] = useState(props.policy?props.policy.ID:0);
    const [httpsAlert,setHttpsAlert] = useState(false);

    const handleChange = name => event => {
        setPolicy({
            ...policy,
            [name]: event.target.value
        });
    };

    const handleOptionChange = name => event => {
        setPolicy({
            ...policy,
            OptionsSerialized: {
                ...policy.OptionsSerialized,
                [name]: event.target.value
            }
        });
    };

    const isStepSkipped = step => {
        return skipped.has(step);
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(()=>{
        API.post("/admin/setting", {
            keys: ["siteURL"]
        })
            .then(response => {
                if (!response.data.siteURL.startsWith("https://")){
                    setHttpsAlert(true);
                }
                if (policy.OptionsSerialized.od_redirect === ""){
                    setPolicy({
                        ...policy,
                        OptionsSerialized:{
                            ...policy.OptionsSerialized,
                            od_redirect: new URL("/api/v3/callback/onedrive/auth", response.data.siteURL).toString(),
                        }
                    })
                }
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    },[]);

    const statOAuth = () =>{
        setLoading(true);
        API.get("/admin/policy/" + policyID + "/oauth", )
            .then(response => {
                window.location.href = response.data
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
                setLoading(false);
            });
    }

    const submitPolicy = e => {
        e.preventDefault();
        setLoading(true);

        const policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        // baseURL处理
        if (policyCopy.Server === "https://graph.microsoft.com/v1.0"){
            policyCopy.BaseURL = "https://login.microsoftonline.com/common/oauth2/v2.0"
        }else{
            policyCopy.BaseURL = "https://login.chinacloudapi.cn/common/oauth2"
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
            policy: policyCopy
        })
            .then(response => {
                ToggleSnackbar("top", "right", "存储策略已"+ (props.policy ? "保存" : "添加"), "success");
                setActiveStep(3);
                setPolicyID(response.data);
            })
            .catch(error => {
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
                onClose={()=>setHttpsAlert(false)}
                title={"警告"}
                msg={"您必须启用 HTTPS 才能使用 OneDrive 存储策略；启用后同步更改 参数设置 - 站点信息 - 站点URL。"}
            />
            <Typography variant={"h6"}>{props.policy ? "修改" : "添加"} OneDrive 存储策略</Typography>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (label.optional) {
                        labelProps.optional = (
                            <Typography variant="caption">可选</Typography>
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
                    onSubmit={e => {
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
                                前往
                                <Link
                                    href={"https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview"}
                                    target={"_blank"}
                                >
                                    Azure Active Directory 控制台 (国际版账号)
                                </Link>
                                {" "}或者{" "}
                                <Link
                                    href={"https://portal.azure.cn/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview"}
                                    target={"_blank"}
                                >
                                    Azure Active Directory 控制台 (世纪互联账号)
                                </Link>
                                 并登录，登录后进入<code>Azure Active Directory</code>管理面板。
                            </Typography>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>2</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                               进入左侧 <code>应用注册</code> 菜单，并点击 <code>新注册</code> 按钮。
                            </Typography>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>3</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                填写应用注册表单。其中，名称可任取；
                                <code>受支持的帐户类型</code> 选择为<code>任何组织目录(任何 Azure AD 目录 - 多租户)中的帐户</code>；
                                <code>重定向 URI (可选)</code>
                                请选择<code>Web</code>，并填写<code>{policy.OptionsSerialized.od_redirect}</code>；
                                其他保持默认即可
                            </Typography>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>4</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                创建完成后进入应用管理的<code>概览</code>页面，复制<code>应用程序(客户端) ID</code>
                                并填写在下方：
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        应用程序(客户端) ID
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
                                进入应用管理页面左侧的<code>证书和密码</code>菜单，点击
                                <code>新建客户端密码</code>
                                按钮，<code>截止期限</code>选择为<code>从不</code>。创建完成后将客户端密码的值填写在下方：
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        客户端密码
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
                                选择您的 OneDrive 账号类型：
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
                                            value={"https://graph.microsoft.com/v1.0/me/drive/"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="国际版"
                                        />
                                        <FormControlLabel
                                            value={"https://microsoftgraph.chinacloudapi.cn/v1.0/me/drive/"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="世纪互联版"
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
                                为此存储策略命名：
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        存储策略

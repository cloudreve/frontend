import {lighten, makeStyles} from "@material-ui/core/styles";
import React, {useCallback, useState} from "react";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import {useDispatch} from "react-redux";
import {toggleSnackbar} from "../../../../actions";
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
import SizeInput from "../../Common/SizeInput";
import {useHistory} from "react-router";

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
    viewButtonLabel: {textTransform: "none"},
    "@global": {
        "code": {
            color: "rgba(0, 0, 0, 0.87)",
            display: "inline-block",
            padding: "2px 6px",
            fontFamily: " Consolas, \"Liberation Mono\", Menlo, Courier, monospace",
            borderRadius: "2px",
            backgroundColor: "rgba(255,229,100,0.1)",
        },
    },
}));

const steps = [
    {
        title: "存储空间",
        optional: false
    },
    {
        title: "上传路径",
        optional: false
    },
    {
        title: "直链设置",
        optional: false
    },
    {
        title: "上传限制",
        optional: false
    },
    {
        title: "完成",
        optional: false
    }
];

export default function BOSGuide(props) {
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [skipped, setSkipped] = React.useState(new Set());
    const [magicVar, setMagicVar] = useState("");
    const [useCDN, setUseCDN] = useState("false");
    const [policy, setPolicy] = useState(props.policy ? props.policy : {
        Type: "bos",
        Name: "",
        BucketName:"",
        SecretKey: "",
        AccessKey: "",
        BaseURL: "",
        Server: "",
        IsPrivate: "true",
        DirNameRule: "{uid}/uploads/{year}/{month}/{day}",
        AutoRename: "true",
        FileNameRule: "{randomkey8}_{originname}",
        IsOriginLinkEnable: "false",
        MaxSize: "0",
        OptionsSerialized: {
            file_type: "",
        }
    });
    const [policyID, setPolicyID] = useState(props.policy ? props.policy.ID : 0);

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

    const submitPolicy = e => {
        e.preventDefault();
        setLoading(true);

        const policyCopy = {...policy};
        policyCopy.OptionsSerialized = {...policyCopy.OptionsSerialized};

        if (useCDN === "false") {
            policyCopy.BaseURL = ""
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
                ToggleSnackbar("top", "right", "存储策略已" + (props.policy ? "保存" : "添加"), "success");
                setActiveStep(4);
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

    const createCORS = () => {
        setLoading(true);
        API.post("/admin/policy/cors", {
            id: policyID
        })
            .then(response => {
                ToggleSnackbar("top", "right", "跨域策略已添加", "success");
                setActiveStep(5);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });

    }

    return (
        <div>
            <Typography variant={"h6"}>{props.policy ? "修改" : "添加"} Lambda BOS 存储策略</Typography>
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
                            <div className={classes.stepNumber}>0</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                在使用 Lambda BOS 存储策略前，请确保您在 参数设置 - 站点信息
                                - 站点URL 中填写的 地址与实际相符，并且
                                <strong>能够被外网正常访问</strong>。
                            </Typography>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                在下方填写您购买的存储空间对应的<code>订单 ID</code>：
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        订单 ID
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
                                获取 Lambda S3 Gateway 主机 <code>公网IP</code> 或 <code>域名</code>，结合 Lambda S3 Gateway
                                配置文件中的 <code>服务端口（默认9002）</code>，构成 <code>EndPoint</code>
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        EndPoint
                                    </InputLabel>
                                    <Input
                                        required
                                        value={policy.Server}
                                        onChange={handleChange("Server")}
                                        inputProps={{
                                            pattern: "http://[^\\s]*:\\d{1,5}",
                                            title: "格式不合法，请完整输入http://host:port"
                                        }}
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
                                从 Lambda S3 Gateway 配置文件中获取用户 AccessKey 和 SecretKey，并填写在下方。
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
                                            title: "不能含有空格"
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
                                            title: "不能含有空格"
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
                            <div className={classes.stepNumber}>4</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                为此存储策略命名：
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        存储策略名
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
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 1 && (
                <form
                    className={classes.stepContent}
                    onSubmit={e => {
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
                                请在下方输入文件的存储目录路径，可以为绝对路径或相对路径（相对于
                                从机的
                                Cloudreve）。路径中可以使用魔法变量，文件在上传时会自动替换这些变量为相应值；
                                可用魔法变量可参考{" "}
                                <Link
                                    color={"secondary"}
                                    href={"javascript:void()"}
                                    onClick={() => setMagicVar("path")}
                                >
                                    路径魔法变量列表
                                </Link>{" "}
                                。
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        存储目录
                                    </InputLabel>
                                    <Input
                                        required
                                        inputProps={{
                                            pattern: "\\{uid\\}/\\S+",
                                            title: "必须以 {uid}/ 开头"
                                        }}
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
                                是否需要对存储的物理文件进行重命名？此处的重命名不会影响最终呈现给用户的
                                文件名。文件名也可使用魔法变量，
                                可用魔法变量可参考{" "}
                                <Link
                                    color={"secondary"}
                                    href={"javascript:void()"}
                                    onClick={() => setMagicVar("file")}
                                >
                                    文件名魔法变量列表
                                </Link>{" "}
                                。
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
                                                <Radio color={"primary"}/>
                                            }
                                            label="开启重命名"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"}/>
                                            }
                                            label="不开启"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            <Collapse in={policy.AutoRename === "true"}>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            命名规则
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
                            上一步
                        </Button>
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 2 && (
                <form
                    className={classes.stepContent}
                    onSubmit={e => {
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
                                是否允许获取文件永久直链？
                                <br/>
                                开启后，用户可以请求获得能直接访问到文件内容的直链，适用于图床应用或自用。
                            </Typography>

                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={policy.IsOriginLinkEnable}
                                        onChange={e => {
                                            if (policy.IsPrivate === "true" && e.target.value === "true") {
                                                ToggleSnackbar("top", "right", "私有空间无法开启此功能", "warning");
                                                return
                                            }
                                            handleChange(
                                                "IsOriginLinkEnable"
                                            )(e)
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"}/>
                                            }
                                            label="允许"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"}/>
                                            }
                                            label="禁止"
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
                            上一步
                        </Button>{" "}
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 3 && (
                <form
                    className={classes.stepContent}
                    onSubmit={submitPolicy}
                >
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                是否限制上传的单文件大小？
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
                                        onChange={e => {
                                            if (e.target.value === "true") {
                                                setPolicy({
                                                    ...policy,
                                                    MaxSize: "10485760"
                                                });
                                            } else {
                                                setPolicy({
                                                    ...policy,
                                                    MaxSize: "0"
                                                });
                                            }
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"}/>
                                            }
                                            label="限制"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"}/>
                                            }
                                            label="不限制"
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
                                    输入限制：
                                </Typography>
                                <div className={classes.form}>
                                    <SizeInput
                                        value={policy.MaxSize}
                                        onChange={handleChange("MaxSize")}
                                        min={0}
                                        max={9223372036854775807}
                                        label={"单文件大小限制"}
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
                                是否限制上传文件扩展名？
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
                                        onChange={e => {
                                            if (e.target.value === "true") {
                                                setPolicy({
                                                    ...policy,
                                                    OptionsSerialized: {
                                                        ...policy.OptionsSerialized,
                                                        file_type:
                                                            "jpg,png,mp4,zip,rar"
                                                    }
                                                });
                                            } else {
                                                setPolicy({
                                                    ...policy,
                                                    OptionsSerialized: {
                                                        ...policy.OptionsSerialized,
                                                        file_type: ""
                                                    }
                                                });
                                            }
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"}/>
                                            }
                                            label="限制"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"}/>
                                            }
                                            label="不限制"
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
                                    输入允许上传的文件扩展名，多个请以半角逗号 ,
                                    隔开
                                </Typography>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            扩展名列表
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
                            上一步
                        </Button>{" "}
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 4 && (
                <>
                    <form className={classes.stepContent}>
                        <Typography>存储策略已{props.policy ? "保存" : "添加"}！</Typography>
                        <Typography variant={"body2"} color={"textSecondary"}>
                            要使用此存储策略，请到用户组管理页面，为相应用户组绑定此存储策略。
                        </Typography>
                    </form>
                    <div className={classes.stepFooter}>
                        <Button
                            color={"primary"}
                            className={classes.button}
                            onClick={() => history.push("/admin/policy")}
                        >
                            返回存储策略列表
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

import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
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
import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import FormHelperText from "@material-ui/core/FormHelperText";
import API from "../../../../middleware/Api";

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

export default function Aria2RPC(props) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const testAria2 = () => {
        setLoading(true);
        API.post("/admin/node/aria2/test", {
            type: props.node.Type,
            server: props.node.Server,
            secret: props.node.SlaveKey,
            rpc: props.node.Aria2OptionsSerialized.server,
            token: props.node.Aria2OptionsSerialized.token,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    "连接成功，Aria2 版本为：" + response.data,
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

    const mode = props.node.Type === 0 ? "从机" : "主机";

    return (
        <form
            className={classes.stepContent}
            onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit(e);
            }}
        >
            <Alert severity="info" style={{ marginBottom: 10 }}>
                <Typography variant="body2">
                    Cloudreve 的离线下载功能由{" "}
                    <Link href={"https://aria2.github.io/"} target={"_blank"}>
                        Aria2
                    </Link>{" "}
                    驱动。如需使用，请在目标节点服务器上以和运行 Cloudreve
                    相同的用户身份启动 Aria2， 并在 Aria2 的配置文件中开启 RPC
                    服务，
                    <Box component="span" fontWeight="fontWeightBold">
                        Aria2 需要和{mode} Cloudreve 进程共用相同的文件系统。
                    </Box>{" "}
                    更多信息及指引请参考文档的{" "}
                    <Link
                        href={"https://docs.cloudreve.org/use/aria2"}
                        target={"_blank"}
                    >
                        离线下载
                    </Link>{" "}
                    章节。
                </Typography>
            </Alert>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>1</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {props.node.Type === 0
                            ? "是否需要此节点接管离线下载任务？"
                            : "是否需要主机接管离线下载任务？"}
                        <br />
                        {props.node.Type === 0
                            ? "开启后，用户的离线下载请求可以被分流到此节点处理。"
                            : "开启后，用户的离线下载请求可以被分流到主机处理。"}
                    </Typography>

                    <div className={classes.form}>
                        <FormControl required component="fieldset">
                            <RadioGroup
                                required
                                value={props.node.Aria2Enabled}
                                onChange={props.handleTextChange(
                                    "Aria2Enabled"
                                )}
                                row
                            >
                                <FormControlLabel
                                    value={"true"}
                                    control={<Radio color={"primary"} />}
                                    label="启用"
                                />
                                <FormControlLabel
                                    value={"false"}
                                    control={<Radio color={"primary"} />}
                                    label="关闭"
                                />
                            </RadioGroup>
                        </FormControl>
                    </div>
                </div>
            </div>

            <Collapse in={props.node.Aria2Enabled === "true"}>
                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>2</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            {props.node.Type === 0
                                ? " 在目标节点服务器上与节点 "
                                : "在与 "}
                            Cloudreve 进程相同的文件系统环境下启动 Aria2
                            进程。在启动 Aria2 时，需要在其配置文件中启用 RPC
                            服务，并设定 RPC
                            Secret，以便后续使用。以下为一个供参考的配置：
                        </Typography>
                        <pre>
                            # 启用 RPC 服务
                            <br />
                            enable-rpc=true
                            <br />
                            # RPC 监听端口
                            <br />
                            rpc-listen-port=6800
                            <br />
                            # RPC 授权令牌，可自行设定
                            <br />
                            rpc-secret=
                            {props.node.Aria2OptionsSerialized.token}
                            <br />
                        </pre>
                        <Alert severity="info" style={{ marginBottom: 10 }}>
                            <Typography variant="body2">
                                推荐在日常启动流程中，先启动 Aria2，再启动节点
                                Cloudreve，这样节点 Cloudreve 可以向 Aria2
                                订阅事件通知，下载状态变更处理更及时。当然，如果没有这一流程，节点
                                Cloudreve 也会通过轮询追踪任务状态。
                            </Typography>
                        </Alert>
                    </div>
                </div>

                <div className={classes.subStepContainer}>
                    <div className={classes.stepNumberContainer}>
                        <div className={classes.stepNumber}>3</div>
                    </div>
                    <div className={classes.subStepContent}>
                        <Typography variant={"body2"}>
                            在下方填写{mode} Cloudreve 与 Aria2 通信的 RPC
                            服务地址。一般可填写为
                            <code>http://127.0.0.1:6800/</code>,其中端口号
                            <code>6800</code>与上文配置文件中
                            <code>rpc-listen-port</code>保持一致。
                        </Typography>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    RPC 服务器地址
                                </InputLabel>
                                <Input
                                    required
                                    type={"url"}
                                    value={
                                        props.node.Aria2OptionsSerialized.server
                                    }
                                    onChange={props.handleOptionChange(
                                        "server"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    包含端口的完整 RPC
                                    服务器地址，例如：http://127.0.0.1:6800/，留空表示不启用
                                    Aria2 服务
                                </FormHelperText>
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
                            RPC 授权令牌，与 Aria2 配置文件中
                            <code>rpc-secret</code>保持一致，未设置请留空。
                        </Typography>
                        <div className={classes.form}>
                            <Input
                                value={props.node.Aria2OptionsSerialized.token}
                                onChange={props.handleOptionChange("token")}
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
                            在下方填写 Aria2 用作临时下载目录的 节点上的
                            <strong>绝对路径</strong>，节点上的 Cloudreve
                            进程需要此目录的读、写、执行权限。
                        </Typography>
                        <div className={classes.form}>
                            <Input
                                value={
                                    props.node.Aria2OptionsSerialized.temp_path
                                }
                                onChange={props.handleOptionChange("temp_path")}
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
                            在下方按需要填写一些 Aria2 额外参数信息。
                        </Typography>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    状态刷新间隔 (秒)
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                    }}
                                    required
                                    value={
                                        props.node.Aria2OptionsSerialized
                                            .interval
                                    }
                                    onChange={props.handleOptionChange(
                                        "interval"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    Cloudreve 向 Aria2 请求刷新任务状态的间隔。
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    RPC 调用超时 (秒)
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                    }}
                                    required
                                    value={
                                        props.node.Aria2OptionsSerialized
                                            .timeout
                                    }
                                    onChange={props.handleOptionChange(
                                        "timeout"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    调用 RPC 服务时最长等待时间
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    全局任务参数
                                </InputLabel>
                                <Input
                                    multiline
                                    required
                                    value={
                                        props.node.Aria2OptionsSerialized
                                            .options
                                    }
                                    onChange={props.handleOptionChange(
                                        "options"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    创建下载任务时携带的额外设置参数，以 JSON
                                    编码后的格式书写，您可也可以将这些设置写在
                                    Aria2 配置文件里，可用参数请查阅官方文档
                                </FormHelperText>
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
                            完成以上步骤后，你可以点击下方的测试按钮测试
                            {mode}
                            Cloudreve 向 Aria2 通信是否正常。
                            {props.node.Type === 0 &&
                                "在进行测试前请先确保您已进行并通过上一页面中的“从机通信测试”。"}
                        </Typography>
                        <div className={classes.form}>
                            <Button
                                disabled={loading}
                                variant={"outlined"}
                                onClick={() => testAria2()}
                                color={"primary"}
                            >
                                测试 Aria2 通信
                            </Button>
                        </div>
                    </div>
                </div>
            </Collapse>

            <div className={classes.stepFooter}>
                {props.activeStep !== 0 && (
                    <Button
                        color={"default"}
                        className={classes.button}
                        onClick={props.onBack}
                    >
                        上一步
                    </Button>
                )}
                <Button
                    disabled={loading || props.loading}
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                    onClick={props.onSubmit}
                >
                    下一步
                </Button>
            </div>
        </form>
    );
}

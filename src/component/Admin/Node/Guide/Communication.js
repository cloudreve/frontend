import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../../actions";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import API from "../../../../middleware/Api";
import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";

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

export default function Communication(props) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const testSlave = () => {
        setLoading(true);

        // 测试路径是否可用
        API.post("/admin/policy/test/slave", {
            server: props.node.Server,
            secret: props.node.SlaveKey,
        })
            .then(() => {
                ToggleSnackbar("top", "right", "通信正常", "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    return (
        <form
            className={classes.stepContent}
            onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit(e);
            }}
        >
            <Alert severity="info" style={{ marginBottom: 10 }}>
                您可以添加同样运行了 Cloudreve 的服务器作为从机端，
                正常运行工作的从机端可以为主机分担某些异步任务（如离线下载）。
                请参考下面向导部署并配置连接 Cloudreve 从机节点。
                <Box fontWeight="fontWeightBold">
                    如果你已经在目标服务器上部署了从机存储策略，您可以跳过本页面的某些步骤，
                    只将从机密钥、服务器地址在这里填写并保持与从机存储策略中一致即可。
                </Box>
                在后续版本中，从机存储策略的相关配置会合并到这里。
            </Alert>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>1</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        将和主站相同版本的 Cloudreve
                        程序拷贝至要作为从机的服务器上。
                    </Typography>
                </div>
            </div>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>2</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        下方为系统为您随机生成的从机端密钥，一般无需改动，如果有自定义需求，
                        可将您的密钥填入下方：
                    </Typography>
                    <div className={classes.form}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="component-helper">
                                从机密钥
                            </InputLabel>
                            <Input
                                required
                                inputProps={{
                                    minlength: 64,
                                }}
                                value={props.node.SlaveKey}
                                onChange={props.handleTextChange("SlaveKey")}
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
                        修改从机配置文件。
                        <br />
                        在从机端 Cloudreve 的同级目录下新建
                        <code>conf.ini</code>
                        文件，填入从机配置，启动/重启从机端 Cloudreve。
                        以下为一个可供参考的配置例子，其中密钥部分已帮您填写为上一步所生成的。
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
                        Secret = {props.node.SlaveKey}
                        <br />
                    </pre>
                    <Typography variant={"body2"}>
                        从机端配置文件格式大致与主站端相同，区别在于：
                        <ul>
                            <li>
                                <code>System</code>
                                分区下的
                                <code>mode</code>
                                字段必须更改为<code>slave</code>
                            </li>
                            <li>
                                必须指定<code>Slave</code>分区下的
                                <code>Secret</code>
                                字段，其值为第二步里填写或生成的密钥。
                            </li>
                        </ul>
                        一个从机 Cloudreve 实例可以对接多个 Cloudreve
                        主节点，只需在所有主节点中添加此从机节点并保持密钥一致即可。
                    </Typography>
                </div>
            </div>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>4</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        填写从机地址。
                        <br />
                        如果主站启用了 HTTPS，从机也需要启用，并在下方填入 HTTPS
                        协议的地址。
                    </Typography>
                    <div className={classes.form}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="component-helper">
                                从机地址
                            </InputLabel>
                            <Input
                                fullWidth
                                required
                                type={"url"}
                                value={props.node.Server}
                                onChange={props.handleTextChange("Server")}
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
                        完成以上步骤后，你可以点击下方的测试按钮测试通信是否正常。
                    </Typography>
                    <div className={classes.form}>
                        <Button
                            disabled={loading}
                            variant={"outlined"}
                            onClick={() => testSlave()}
                            color={"primary"}
                        >
                            测试从机通信
                        </Button>
                    </div>
                </div>
            </div>

            <div className={classes.stepFooter}>
                <Button
                    disabled={loading || props.loading}
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                >
                    下一步
                </Button>
            </div>
        </form>
    );
}

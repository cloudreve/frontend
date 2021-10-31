import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";
import SizeInput from "../Common/SizeInput";

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

export default function UploadDownload() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        max_worker_num: "1",
        max_parallel_transfer: "1",
        temp_path: "",
        maxEditSize: "0",
        onedrive_chunk_retries: "0",
        archive_timeout: "0",
        download_timeout: "0",
        preview_timeout: "0",
        doc_preview_timeout: "0",
        upload_credential_timeout: "0",
        upload_session_timeout: "0",
        slave_api_timeout: "0",
        onedrive_monitor_timeout: "0",
        share_download_session_timeout: "0",
        onedrive_callback_check: "0",
        reset_after_upload_failed: "0",
        onedrive_source_timeout: "0",
        slave_node_retry: "0",
        slave_ping_interval: "0",
        slave_recover_interval: "0",
        slave_transfer_timeout: "0",
    });

    const handleCheckChange = (name) => (event) => {
        const value = event.target.checked ? "1" : "0";
        setOptions({
            ...options,
            [name]: value,
        });
    };

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
                setOptions(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        const option = [];
        Object.keys(options).forEach((k) => {
            option.push({
                key: k,
                value: options[k],
            });
        });
        API.patch("/admin/setting", {
            options: option,
        })
            .then(() => {
                ToggleSnackbar("top", "right", "设置已更改", "success");
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
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        存储与传输
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    Worker 数量
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={options.max_worker_num}
                                    onChange={handleChange("max_worker_num")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    任务队列最多并行执行的任务数，保存后需要重启
                                    Cloudreve 生效
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    中转并行传输
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={options.max_parallel_transfer}
                                    onChange={handleChange(
                                        "max_parallel_transfer"
                                    )}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    任务队列中转任务传输时，最大并行协程数
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    临时目录
                                </InputLabel>
                                <Input
                                    value={options.temp_path}
                                    onChange={handleChange("temp_path")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    用于存放打包下载、解压缩、压缩等任务产生的临时文件的目录路径
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <SizeInput
                                    value={options.maxEditSize}
                                    onChange={handleChange("maxEditSize")}
                                    required
                                    min={0}
                                    max={2147483647}
                                    label={"文本文件在线编辑大小"}
                                />
                                <FormHelperText id="component-helper-text">
                                    文本文件可在线编辑的最大大小，超出此大小的文件无法在线编辑
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    OneDrive 分片错误重试
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 0,
                                        step: 1,
                                    }}
                                    value={options.onedrive_chunk_retries}
                                    onChange={handleChange(
                                        "onedrive_chunk_retries"
                                    )}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    OneDrive
                                    存储策略分片上传失败后重试的最大次数，只适用于服务端上传或中转
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.reset_after_upload_failed ===
                                                "1"
                                            }
                                            onChange={handleCheckChange(
                                                "reset_after_upload_failed"
                                            )}
                                        />
                                    }
                                    label="上传校验失败时强制重置连接"
                                />
                                <FormHelperText id="component-helper-text">
                                    开启后，如果本次策略、头像等数据上传校验失败，服务器会强制重置连接
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        有效期 (秒)
                    </Typography>
                    <div className={classes.formContainer}>
                        {[
                            {
                                name: "打包下载",
                                field: "archive_timeout",
                            },
                            {
                                name: "下载会话",
                                field: "download_timeout",
                            },
                            {
                                name: "预览链接",
                                field: "preview_timeout",
                            },
                            {
                                name: "Office 文档预览连接",
                                field: "doc_preview_timeout",
                            },
                            {
                                name: "上传凭证",
                                field: "upload_credential_timeout",
                            },
                            {
                                name: "上传会话",
                                field: "upload_session_timeout",
                                des: "超出后不再处理此上传的回调请求",
                            },
                            {
                                name: "分享下载会话",
                                field: "share_download_session_timeout",
                                des:
                                    "设定时间内重复下载分享文件，不会被记入总下载次数",
                            },
                            {
                                name: "OneDrive 客户端上传监控间隔",
                                field: "onedrive_monitor_timeout",
                                des:
                                    "每间隔所设定时间，Cloudreve 会向 OneDrive 请求检查客户端上传情况已确保客户端上传可控",
                            },
                            {
                                name: "OneDrive 回调等待",
                                field: "onedrive_callback_check",
                                des:
                                    "OneDrive 客户端上传完成后，等待回调的最大时间，如果超出会被认为上传失败",
                            },
                            {
                                name: "OneDrive 下载请求缓存",
                                field: "onedrive_source_timeout",
                                des:
                                    "OneDrive 获取文件下载 URL 后可将结果缓存，减轻热门文件下载API请求频率",
                            },
                        ].map((input) => (
                            <div key={input.name} className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        {input.name}
                                    </InputLabel>
                                    <Input
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={options[input.field]}
                                        onChange={handleChange(input.field)}
                                        required
                                    />
                                    {input.des && (
                                        <FormHelperText id="component-helper-text">
                                            {input.des}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        节点通信
                    </Typography>
                    <div className={classes.formContainer}>
                        {[
                            {
                                name: "从机API请求超时（秒）",
                                field: "slave_api_timeout",
                                des: "主机等待从机API请求响应的超时时间",
                            },
                            {
                                name: "节点心跳间隔（秒）",
                                field: "slave_ping_interval",
                                des: "主机节点向从机节点发送心跳的间隔",
                            },
                            {
                                name: "心跳失败重试阈值",
                                field: "slave_node_retry",
                                des:
                                    "主机向从机发送心跳失败后，主机可最大重试的次数。重试失败后，节点会进入恢复模式",
                            },
                            {
                                name: "恢复模式心跳间隔（秒）",
                                field: "slave_recover_interval",
                                des:
                                    "节点因异常被主机标记为恢复模式后，主机尝试重新连接节点的间隔",
                            },
                            {
                                name: "从机中转超时（秒）",
                                field: "slave_transfer_timeout",
                                des: "从机执行文件中转任务可消耗的最长时间",
                            },
                        ].map((input) => (
                            <div key={input.name} className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        {input.name}
                                    </InputLabel>
                                    <Input
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={options[input.field]}
                                        onChange={handleChange(input.field)}
                                        required
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {input.des}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={classes.root}>
                    <Button
                        disabled={loading}
                        type={"submit"}
                        variant={"contained"}
                        color={"primary"}
                    >
                        保存
                    </Button>
                </div>
            </form>
        </div>
    );
}

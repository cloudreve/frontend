import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({}));

export default function Aria2Helper(props) {
    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"如何配置离线下载？"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Cloudreve 的离线下载支持主从分散模式。您可以配置多个
                    Cloudreve
                    从机节点，这些节点可以用来处理离线下载任务，分散主节点的压力。当然，您也可以配置只在主节点上处理离线下载任务，这是最简单的一种方式。
                    <ul>
                        <li>
                            如果您只需要为主机启用离线下载功能，请{" "}
                            <Link
                                component={RouterLink}
                                to={"/admin/node/edit/1"}
                            >
                                点击这里
                            </Link>{" "}
                            编辑主节点；
                        </li>
                        <li>
                            如果您想要在从机节点上分散处理离线下载任务，请{" "}
                            <Link component={RouterLink} to={"/admin/node/add"}>
                                点击这里
                            </Link>{" "}
                            添加并配置新节点。
                        </li>
                    </ul>
                    当你添加多个可用于离线下载的节点后，主节点会将离线下载请求轮流发送到这些节点处理。
                    节点离线下载配置完成后，您可能还需要{" "}
                    <Link component={RouterLink} to={"/admin/group"}>
                        到这里
                    </Link>{" "}
                    编辑用户组，为对应用户组开启离线下载权限。
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="primary" autoFocus>
                    关闭
                </Button>
            </DialogActions>
        </Dialog>
    );
}

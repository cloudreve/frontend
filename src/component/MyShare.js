import React, { Component } from "react";
import { connect } from "react-redux";
import { toggleSnackbar } from "../actions/index";
import axios from "axios";
import OpenIcon from "@material-ui/icons/OpenInNew";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import FolderIcon from "@material-ui/icons/Folder";
import LockIcon from "@material-ui/icons/Lock";
import UnlockIcon from "@material-ui/icons/LockOpen";
import EyeIcon from "@material-ui/icons/RemoveRedEye";
import DeleteIcon from "@material-ui/icons/Delete";

import {
    withStyles,
    Tooltip,
    Card,
    Avatar,
    CardHeader,
    CardActions,
    Typography,
    Grid,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField
} from "@material-ui/core";

const styles = theme => ({
    card: {
        maxWidth: 400,
        margin: "0 auto"
    },
    actions: {
        display: "flex"
    },
    layout: {
        width: "auto",
        marginTop: "50px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        }
    },
    shareTitle: {
        maxWidth: "200px"
    },
    avatarFile: {
        backgroundColor: theme.palette.primary.light
    },
    avatarFolder: {
        backgroundColor: theme.palette.secondary.light
    },
    gird: {
        marginTop: "30px"
    },
    loadMore: {
        textAlign: "center",
        marginTop: "20px",
        marginBottom: "20px"
    }
});
const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        }
    };
};

class MyShareCompoment extends Component {
    state = {
        page: 1,
        shareList: [],
        showPwd: null
    };

    componentDidMount = () => {
        this.loadList(1);
    };

    loadMore = () => {
        this.loadList(this.state.page + 1);
    };

    showPwd = pwd => {
        this.setState({ showPwd: pwd });
    };

    handleClose = () => {
        this.setState({ showPwd: null });
    };

    removeShare = id => {
        axios
            .post("/Share/Delete", {
                id: id
            })
            .then(response => {
                if (response.data.error !== 1) {
                    let oldList = this.state.shareList;
                    oldList = oldList.filter(value => {
                        return value.share_key !== id;
                    });
                    this.setState({
                        shareList: oldList
                    });
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        "分享已取消",
                        "success"
                    );
                }
            })
            .catch(error => {
                this.props.toggleSnackbar("top", "right", "请求失败", "error");
            });
    };

    changePermission = id => {
        axios
            .post("/Share/ChangePromission", {
                id: id
            })
            .then(response => {
                if (response.data.error !== 1) {
                    let oldList = this.state.shareList;
                    let shareIndex = oldList.findIndex(value => {
                        return value.share_key === id;
                    });
                    oldList[shareIndex].type =
                        oldList[shareIndex].type === "public"
                            ? "private"
                            : "public";
                    oldList[shareIndex].share_pwd = response.data.newPwd;
                    this.setState({
                        shareList: oldList
                    });
                }
            })
            .catch(error => {
                this.props.toggleSnackbar("top", "right", "请求失败", "error");
            });
    };

    loadList = page => {
        axios
            .post("/Share/ListMyShare", {
                page: page
            })
            .then(response => {
                if (response.data.length === 0) {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        "没有更多了",
                        "info"
                    );
                }
                this.setState({
                    page: page,
                    shareList: this.state.shareList.concat(response.data)
                });
            })
            .catch(error => {
                this.props.toggleSnackbar("top", "right", "加载失败", "error");
            });
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.layout}>
                <Typography color="textSecondary" variant="h3">
                    {" "}
                    我的分享{" "}
                </Typography>{" "}
                <Grid container spacing={24} className={classes.gird}>
                    {" "}
                    {this.state.shareList.map(value => (
                        <Grid item xs={12} sm={4} key={value.id}>
                            <Card className={classes.card}>
                                <CardHeader
                                    style={{ paddingBottom: "0px" }}
                                    avatar={
                                        <div>
                                            {" "}
                                            {value.source_type === "file" && (
                                                <Avatar
                                                    className={
                                                        classes.avatarFile
                                                    }
                                                >
                                                    <FileIcon />
                                                </Avatar>
                                            )}{" "}
                                            {value.source_type === "dir" && (
                                                <Avatar
                                                    className={
                                                        classes.avatarFolder
                                                    }
                                                >
                                                    <FolderIcon />
                                                </Avatar>
                                            )}
                                        </div>
                                    }
                                    title={
                                        <Tooltip
                                            placement="top"
                                            title={value.fileData}
                                        >
                                            {" "}
                                            <Typography
                                                noWrap
                                                className={classes.shareTitle}
                                            >
                                                {" "}
                                                {value.fileData}{" "}
                                            </Typography>
                                        </Tooltip>
                                    }
                                    subheader={value.share_time}
                                />
                                <CardActions
                                    disableActionSpacing
                                    style={{ textAlign: "right" }}
                                >
                                    <Tooltip placement="top" title="打开">
                                        <IconButton
                                            onClick={() =>
                                                window.open(
                                                    "/s/" + value.share_key
                                                )
                                            }
                                        >
                                            <OpenIcon />
                                        </IconButton>{" "}
                                    </Tooltip>{" "}
                                    {value.type === "private" && (
                                        <div>
                                            <Tooltip
                                                placement="top"
                                                title="变更为公开分享"
                                                onClick={() =>
                                                    this.changePermission(
                                                        value.share_key
                                                    )
                                                }
                                            >
                                                <IconButton>
                                                    <LockIcon />
                                                </IconButton>{" "}
                                            </Tooltip>{" "}
                                            <Tooltip
                                                placement="top"
                                                title="查看密码"
                                                onClick={() =>
                                                    this.showPwd(
                                                        value.share_pwd
                                                    )
                                                }
                                            >
                                                <IconButton>
                                                    <EyeIcon />
                                                </IconButton>{" "}
                                            </Tooltip>{" "}
                                        </div>
                                    )}{" "}
                                    {value.type === "public" && (
                                        <Tooltip
                                            placement="top"
                                            title="变更为私密分享"
                                            onClick={() =>
                                                this.changePermission(
                                                    value.share_key
                                                )
                                            }
                                        >
                                            <IconButton>
                                                <UnlockIcon />
                                            </IconButton>{" "}
                                        </Tooltip>
                                    )}
                                    <Tooltip
                                        placement="top"
                                        title="取消分享"
                                        onClick={() =>
                                            this.removeShare(value.share_key)
                                        }
                                    >
                                        <IconButton>
                                            <DeleteIcon />
                                        </IconButton>{" "}
                                    </Tooltip>
                                </CardActions>{" "}
                            </Card>{" "}
                        </Grid>
                    ))}{" "}
                </Grid>{" "}
                <div className={classes.loadMore}>
                    <Button
                        size="large"
                        className={classes.margin}
                        disabled={this.state.shareList.length < 18}
                        onClick={this.loadMore}
                    >
                        继续加载{" "}
                    </Button>{" "}
                </div>{" "}
                <Dialog
                    open={this.state.showPwd !== null}
                    onClose={this.handleClose}
                >
                    <DialogTitle> 分享密码 </DialogTitle>{" "}
                    <DialogContent>
                        <TextField
                            id="standard-name"
                            value={this.state.showPwd}
                            margin="normal"
                            autoFocus
                        />
                    </DialogContent>{" "}
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            关闭{" "}
                        </Button>{" "}
                    </DialogActions>{" "}
                </Dialog>{" "}
            </div>
        );
    }
}

const MyShare = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(MyShareCompoment));

export default MyShare;

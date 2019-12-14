import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    closeAllModals,
    toggleSnackbar,
    setModalsLoading,
    refreshFileList,
    refreshStorage,
    openLoadingDialog
} from "../../actions/index";
import PathSelector from "./PathSelector";
import axios from "axios";
import API from "../../middleware/Api";
import {
    withStyles,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    CircularProgress,
    Checkbox,
    FormControl,
    FormControlLabel
} from "@material-ui/core";
import Loading from "../Modals/Loading";
import CopyDialog from "../Modals/Copy";

const styles = theme => ({
    wrapper: {
        margin: theme.spacing(1),
        position: "relative"
    },
    buttonProgress: {
        color: theme.palette.secondary.light,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12
    },
    contentFix: {
        padding: "10px 24px 0px 24px"
    },
    shareUrl: {
        minWidth: "400px"
    },
    widthAnimation: {}
});

const mapStateToProps = state => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected,
        modalsStatus: state.viewUpdate.modals,
        modalsLoading: state.viewUpdate.modalsLoading,
        dirList: state.explorer.dirList,
        fileList: state.explorer.fileList,
        dndSignale: state.explorer.dndSignal,
        dndTarget: state.explorer.dndTarget,
        dndSource: state.explorer.dndSource,
        loading: state.viewUpdate.modals.loading,
        loadingText: state.viewUpdate.modals.loadingText
    };
};

const mapDispatchToProps = dispatch => {
    return {
        closeAllModals: () => {
            dispatch(closeAllModals());
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        setModalsLoading: status => {
            dispatch(setModalsLoading(status));
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        refreshStorage: () => {
            dispatch(refreshStorage());
        },
        openLoadingDialog: text => {
            dispatch(openLoadingDialog(text));
        }
    };
};

class ModalsCompoment extends Component {
    state = {
        newFolderName: "",
        newName: "",
        selectedPath: "",
        selectedPathName: "",
        secretShare: false,
        sharePwd: "",
        shareUrl: "",
        downloadURL: "",
        remoteDownloadPathSelect: false,
        source: ""
    };

    handleInputChange = e => {
        this.setState({
            [e.target.id]: e.target.value
        });
    };

    newNameSuffix = "";

    componentWillReceiveProps = nextProps => {
        if (this.props.dndSignale !== nextProps.dndSignale) {
            this.dragMove(nextProps.dndSource, nextProps.dndTarget);
            return;
        }
        if (this.props.loading !== nextProps.loading) {
            // 打包下载
            if (nextProps.loading === true) {
                if (nextProps.loadingText === "打包中...") {
                    this.archiveDownload();
                } else if (nextProps.loadingText === "获取下载地址...") {
                    this.Download();
                }
            }
            return;
        }
        if (this.props.modalsStatus.rename !== nextProps.modalsStatus.rename) {
            let name = nextProps.selected[0].name;
            this.setState({
                newName: name
            });
            return;
        }
        if (
            this.props.modalsStatus.getSource !==
                nextProps.modalsStatus.getSource &&
            nextProps.modalsStatus.getSource === true
        ) {
            API.get("/file/source/" + this.props.selected[0].id)
                .then(response => {
                    this.setState({
                        source: response.data.url
                    });
                })
                .catch(error => {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
    };

    Download = () => {
        let downloadPath =
            this.props.selected[0].path === "/"
                ? this.props.selected[0].path + this.props.selected[0].name
                : this.props.selected[0].path +
                  "/" +
                  this.props.selected[0].name;
        API.put("/file/download" + downloadPath)
            .then(response => {
                window.location.assign(response.data);
                this.onClose();
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.onClose();
            });
    };

    archiveDownload = () => {
        let dirs = [],
            items = [];
        this.props.selected.map(value => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.post("/file/archive", {
            items: items,
            dirs: dirs
        })
            .then(response => {
                if (response.rawData.code === 0) {
                    this.onClose();
                    window.location.assign(response.data);
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                this.onClose();
                this.props.refreshStorage();
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.onClose();
            });
    };

    submitShare = e => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        axios
            .post("/File/Share", {
                action: "share",
                item:
                    this.props.selected[0].path === "/"
                        ? this.props.selected[0].path +
                          this.props.selected[0].name
                        : this.props.selected[0].path +
                          "/" +
                          this.props.selected[0].name,
                shareType: this.state.secretShare ? "private" : "public",
                pwd: this.state.sharePwd
            })
            .then(response => {
                if (response.data.result !== "") {
                    this.setState({
                        shareUrl: response.data.result
                    });
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.result.error,
                        "warning"
                    );
                }
                this.props.setModalsLoading(false);
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    submitRemove = e => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        let dirs = [],
            items = [];
        // eslint-disable-next-line
        this.props.selected.map(value => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.delete("/object", {
            data: {
                items: items,
                dirs: dirs
            }
        })
            .then(response => {
                if (response.rawData.code == 0) {
                    this.onClose();
                    this.props.refreshFileList();
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                this.props.setModalsLoading(false);
                this.props.refreshStorage();
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    submitResave = e => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        axios
            .post("/Share/ReSave/" + window.shareInfo.shareId, {
                path:
                    this.state.selectedPath === "//"
                        ? "/"
                        : this.state.selectedPath
            })
            .then(response => {
                if (response.data.result.success) {
                    this.onClose();
                    this.props.refreshFileList();
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.result.error,
                        "warning"
                    );
                }
                this.props.setModalsLoading(false);
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    submitMove = e => {
        if (e != null) {
            e.preventDefault();
        }
        this.props.setModalsLoading(true);
        let dirs = [],
            items = [];
        // eslint-disable-next-line
        this.props.selected.map(value => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.patch("/object", {
            action: "move",
            src_dir: this.props.selected[0].path,
            src: {
                dirs: dirs,
                items: items
            },
            dst: this.DragSelectedPath
                ? this.DragSelectedPath
                : this.state.selectedPath === "//"
                ? "/"
                : this.state.selectedPath
        })
            .then(response => {
                this.onClose();
                this.props.refreshFileList();
                this.props.setModalsLoading(false);
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            })
            .finally(() => {
                this.props.closeAllModals();
            });
    };

    dragMove = (source, target) => {
        if (this.props.selected.length === 0) {
            this.props.selected[0] = source;
        }
        let doMove = true;
        this.props.selected.map(value => {
            // 根据ID过滤
            if (value.id === target.id && value.type === target.type) {
                doMove = false;
                return;
            }
            // 根据路径过滤
            if (
                value.path ===
                target.path + (target.path === "/" ? "" : "/") + target.name
            ) {
                doMove = false;
                return;
            }
        });
        if (doMove) {
            this.DragSelectedPath =
                target.path === "/"
                    ? target.path + target.name
                    : target.path + "/" + target.name;
            this.props.openLoadingDialog("处理中...");
            this.submitMove();
        }
    };

    submitRename = e => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        let newName = this.state.newName;

        let src = {
            dirs: [],
            items: []
        };

        if (this.props.selected[0].type == "dir") {
            src.dirs[0] = this.props.selected[0].id;
        } else {
            src.items[0] = this.props.selected[0].id;
        }

        // 检查重名
        if (
            this.props.dirList.findIndex((value, index) => {
                return value.name === newName;
            }) !== -1 ||
            this.props.fileList.findIndex((value, index) => {
                return value.name === newName;
            }) !== -1
        ) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "新名称与已有文件重复",
                "warning"
            );
            this.props.setModalsLoading(false);
        } else {
            API.post("/object/rename", {
                action: "rename",
                src: src,
                new_name: newName
            })
                .then(response => {
                    this.onClose();
                    this.props.refreshFileList();
                    this.props.setModalsLoading(false);
                })
                .catch(error => {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                    this.props.setModalsLoading(false);
                });
        }
    };

    submitCreateNewFolder = e => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        if (
            this.props.dirList.findIndex((value, index) => {
                return value.name === this.state.newFolderName;
            }) !== -1
        ) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "文件夹名称重复",
                "warning"
            );
            this.props.setModalsLoading(false);
        } else {
            API.put("/directory", {
                path:
                    (this.props.path === "/" ? "" : this.props.path) +
                    "/" +
                    this.state.newFolderName
            })
                .then(response => {
                    this.onClose();
                    this.props.refreshFileList();
                    this.props.setModalsLoading(false);
                })
                .catch(error => {
                    this.props.setModalsLoading(false);

                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
        //this.props.toggleSnackbar();
    };

    submitTorrentDownload = e => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        axios
            .post("/RemoteDownload/AddTorrent", {
                action: "torrentDownload",
                id: this.props.selected[0].id,
                savePath: this.state.selectedPath
            })
            .then(response => {
                if (response.data.result.success) {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        "任务已创建",
                        "success"
                    );
                    this.onClose();
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.result.error,
                        "warning"
                    );
                }
                this.props.setModalsLoading(false);
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    submitDownload = e => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        axios
            .post("/RemoteDownload/addUrl", {
                action: "remoteDownload",
                url: this.state.downloadURL,
                path: this.state.selectedPath
            })
            .then(response => {
                if (response.data.result.success) {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        "任务已创建",
                        "success"
                    );
                    this.onClose();
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.result.error,
                        "warning"
                    );
                }
                this.props.setModalsLoading(false);
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    setMoveTarget = folder => {
        let path =
            folder.path === "/"
                ? folder.path + folder.name
                : folder.path + "/" + folder.name;
        this.setState({
            selectedPath: path,
            selectedPathName: folder.name
        });
    };

    remoteDownloadNext = () => {
        this.props.closeAllModals();
        this.setState({
            remoteDownloadPathSelect: true
        });
    };

    onClose = () => {
        this.setState({
            newFolderName: "",
            newName: "",
            selectedPath: "",
            selectedPathName: "",
            secretShare: false,
            sharePwd: "",
            downloadURL: "",
            shareUrl: "",
            remoteDownloadPathSelect: false,
            source: ""
        });
        this.newNameSuffix = "";
        this.props.closeAllModals();
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };

    render() {
        const { classes } = this.props;

        const previewApi = "window.apiURL.preview";

        return (
            <div>
                <Loading />
                <Dialog
                    open={this.props.modalsStatus.getSource}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        获取文件外链
                    </DialogTitle>

                    <DialogContent>
                        <form onSubmit={this.submitCreateNewFolder}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="newFolderName"
                                label="外链地址"
                                type="text"
                                value={this.state.source}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>关闭</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.createNewFolder}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">新建文件夹</DialogTitle>

                    <DialogContent>
                        <form onSubmit={this.submitCreateNewFolder}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="newFolderName"
                                label="文件夹名称"
                                type="text"
                                value={this.state.newFolderName}
                                onChange={e => this.handleInputChange(e)}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitCreateNewFolder}
                                color="primary"
                                disabled={
                                    this.state.newFolderName === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                创建
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.rename}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle id="form-dialog-title">重命名</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            输入{" "}
                            <strong>
                                {this.props.selected.length === 1
                                    ? this.props.selected[0].name
                                    : ""}
                            </strong>{" "}
                            的新名称：
                        </DialogContentText>
                        <form onSubmit={this.submitRename}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="newName"
                                label="新名称"
                                type="text"
                                value={this.state.newName}
                                onChange={e => this.handleInputChange(e)}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitRename}
                                color="primary"
                                disabled={
                                    this.state.newName === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                确定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <CopyDialog
                    open={this.props.modalsStatus.copy}
                    onClose={this.onClose}
                    presentPath={this.props.path}
                    selected={this.props.selected}
                    modalsLoading={this.props.modalsLoading}
                />

                <Dialog
                    open={this.props.modalsStatus.move}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">移动至</DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                移动至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitMove}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                确定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.resave}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">保存至</DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                保存至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitResave}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                确定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.remove}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">删除对象</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            确定要删除
                            {this.props.selected.length === 1 && (
                                <strong> {this.props.selected[0].name} </strong>
                            )}
                            {this.props.selected.length > 1 && (
                                <span>
                                    这{this.props.selected.length}个对象
                                </span>
                            )}
                            吗？
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitRemove}
                                color="primary"
                                disabled={this.props.modalsLoading}
                            >
                                确定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.share}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                    className={classes.widthAnimation}
                >
                    <DialogTitle id="form-dialog-title">
                        创建分享链接
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            获取用于共享的链接
                        </DialogContentText>
                        {this.state.shareUrl === "" && (
                            <form onSubmit={this.submitShare}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.secretShare}
                                            onChange={this.handleChange(
                                                "secretShare"
                                            )}
                                            name="secretShare"
                                            value="false"
                                        />
                                    }
                                    label="使用密码保护链接"
                                />
                                {this.state.secretShare && (
                                    <FormControl margin="nonw" fullWidth>
                                        <TextField
                                            id="sharePwd"
                                            onChange={this.handleInputChange}
                                            label="分享密码"
                                            type="password"
                                            margin="none"
                                            autoFocus
                                            value={this.state.sharePwd}
                                            required
                                        />
                                    </FormControl>
                                )}
                            </form>
                        )}
                        {this.state.shareUrl !== "" && (
                            <TextField
                                id="shareUrl"
                                label="分享链接"
                                autoFocus
                                fullWidth
                                className={classes.shareUrl}
                                value={this.state.shareUrl}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>
                            {this.state.shareUrl === "" ? "取消" : "关闭"}
                        </Button>
                        {this.state.shareUrl === "" && (
                            <div className={classes.wrapper}>
                                <Button
                                    onClick={this.submitShare}
                                    color="primary"
                                    disabled={
                                        this.props.modalsLoading ||
                                        (this.state.secretShare &&
                                            this.state.sharePwd === "")
                                    }
                                >
                                    确定
                                    {this.props.modalsLoading && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </Button>
                            </div>
                        )}
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.music}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">音频播放</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            {this.props.selected.length !== 0 && (
                                <audio
                                    controls
                                    src={
                                        previewApi +
                                        "?action=preview&path=" +
                                        (this.props.selected[0].path === "/"
                                            ? this.props.selected[0].path +
                                              this.props.selected[0].name
                                            : this.props.selected[0].path +
                                              "/" +
                                              this.props.selected[0].name)
                                    }
                                ></audio>
                            )}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>关闭</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.remoteDownload}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="form-dialog-title">
                        新建离线下载任务
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            <TextField
                                label="文件地址"
                                autoFocus
                                fullWidth
                                id="downloadURL"
                                onChange={this.handleInputChange}
                                placeholder="输入文件下载地址，支持 HTTP(s)/FTP/磁力链"
                            ></TextField>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>关闭</Button>
                        <Button
                            onClick={this.remoteDownloadNext}
                            color="primary"
                            disabled={
                                this.props.modalsLoading ||
                                this.state.downloadURL === ""
                            }
                        >
                            下一步
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.remoteDownloadPathSelect}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        选择存储位置
                    </DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                下载至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitDownload}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                创建任务
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.torrentDownload}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        选择存储位置
                    </DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                下载至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitTorrentDownload}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                创建任务
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

ModalsCompoment.propTypes = {
    classes: PropTypes.object.isRequired
};

const Modals = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(ModalsCompoment));

export default Modals;

import {
    Divider,
    ListItemIcon,
    MenuItem,
    Typography,
    withStyles
} from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { Archive, Unarchive } from "@material-ui/icons";
import RenameIcon from "@material-ui/icons/BorderColor";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import UploadIcon from "@material-ui/icons/CloudUpload";
import NewFolderIcon from "@material-ui/icons/CreateNewFolder";
import DeleteIcon from "@material-ui/icons/Delete";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import OpenFolderIcon from "@material-ui/icons/FolderOpen";
import MoveIcon from "@material-ui/icons/Input";
import LinkIcon from "@material-ui/icons/InsertLink";
import OpenIcon from "@material-ui/icons/OpenInNew";
import ShareIcon from "@material-ui/icons/Share";
import { FolderUpload, MagnetOn, FilePlus } from "mdi-material-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
    openCompressDialog,
    openCreateFileDialog,
    refreshFileList
} from "../../actions";
import {
    changeContextMenu,
    navigateTo,
    openCopyDialog,
    openCreateFolderDialog,
    openDecompressDialog,
    openGetSourceDialog,
    openLoadingDialog,
    openMoveDialog,
    openMusicDialog,
    openRemoteDownloadDialog,
    openRemoveDialog,
    openRenameDialog,
    openShareDialog,
    openTorrentDownloadDialog,
    setNavigatorLoadingStatus,
    setSelectedTarget,
    showImgPreivew,
    toggleSnackbar
} from "../../actions/index";
import { isCompressFile, isPreviewable, isTorrent } from "../../config";
import Auth from "../../middleware/Auth";
import { allowSharePreview } from "../../utils/index";
import pathHelper from "../../utils/page";
import RefreshIcon from "@material-ui/icons/Refresh";

const styles = () => ({
    propover: {
        minWidth: "200px!important"
    },
    divider: {
        marginTop: 4,
        marginBottom: 4
    }
});

const mapStateToProps = state => {
    return {
        menuType: state.viewUpdate.contextType,
        menuOpen: state.viewUpdate.contextOpen,
        isMultiple: state.explorer.selectProps.isMultiple,
        withFolder: state.explorer.selectProps.withFolder,
        withFile: state.explorer.selectProps.withFile,
        path: state.navigator.path,
        selected: state.explorer.selected,
        keywords: state.explorer.keywords
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeContextMenu: (type, open) => {
            dispatch(changeContextMenu(type, open));
        },
        setNavigatorLoadingStatus: status => {
            dispatch(setNavigatorLoadingStatus(status));
        },
        setSelectedTarget: targets => {
            dispatch(setSelectedTarget(targets));
        },
        navigateTo: path => {
            dispatch(navigateTo(path));
        },
        openCreateFolderDialog: () => {
            dispatch(openCreateFolderDialog());
        },
        openCreateFileDialog: () => {
            dispatch(openCreateFileDialog());
        },
        openRenameDialog: () => {
            dispatch(openRenameDialog());
        },
        openMoveDialog: () => {
            dispatch(openMoveDialog());
        },
        openRemoveDialog: () => {
            dispatch(openRemoveDialog());
        },
        openShareDialog: () => {
            dispatch(openShareDialog());
        },
        showImgPreivew: first => {
            dispatch(showImgPreivew(first));
        },
        openMusicDialog: () => {
            dispatch(openMusicDialog());
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        openRemoteDownloadDialog: () => {
            dispatch(openRemoteDownloadDialog());
        },
        openTorrentDownloadDialog: () => {
            dispatch(openTorrentDownloadDialog());
        },
        openGetSourceDialog: () => {
            dispatch(openGetSourceDialog());
        },
        openCopyDialog: () => {
            dispatch(openCopyDialog());
        },
        openLoadingDialog: text => {
            dispatch(openLoadingDialog(text));
        },
        openDecompressDialog: () => {
            dispatch(openDecompressDialog());
        },
        openCompressDialog: () => {
            dispatch(openCompressDialog());
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        }
    };
};

class ContextMenuCompoment extends Component {
    X = 0;
    Y = 0;

    state = {};

    componentDidMount = () => {
        window.document.addEventListener("mousemove", this.setPoint);
    };

    setPoint = e => {
        this.Y = e.clientY;
        this.X = e.clientX;
    };

    openArchiveDownload = () => {
        this.props.changeContextMenu("file", false);
        this.props.openLoadingDialog("打包中...");
    };

    openDownload = () => {
        if (!allowSharePreview()) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "未登录用户无法预览",
                "warning"
            );
            this.props.changeContextMenu("file", false);
            return;
        }
        this.props.changeContextMenu("file", false);
        this.props.openLoadingDialog("获取下载地址...");
    };

    enterFolder = () => {
        this.props.navigateTo(
            this.props.path === "/"
                ? this.props.path + this.props.selected[0].name
                : this.props.path + "/" + this.props.selected[0].name
        );
    };

    clickUpload = id => {
        this.props.changeContextMenu("empty", false);
        const uploadButton = document.getElementsByClassName(id)[0];
        if (document.body.contains(uploadButton)) {
            uploadButton.click();
        } else {
            this.props.toggleSnackbar(
                "top",
                "right",
                "上传组件还未加载完成",
                "warning"
            );
        }
    };

    openPreview = () => {
        const isShare = pathHelper.isSharePage(this.props.location.pathname);
        if (isShare) {
            const user = Auth.GetUser();
            if (!Auth.Check() && user && !user.group.shareDownload) {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "请先登录",
                    "warning"
                );
                this.props.changeContextMenu("file", false);
                return;
            }
        }
        this.props.changeContextMenu("file", false);
        const previewPath =
            this.props.selected[0].path === "/"
                ? this.props.selected[0].path + this.props.selected[0].name
                : this.props.selected[0].path +
                  "/" +
                  this.props.selected[0].name;
        switch (isPreviewable(this.props.selected[0].name)) {
            case "img":
                this.props.showImgPreivew(this.props.selected[0]);
                return;
            case "msDoc":
                if (isShare) {
                    this.props.history.push(
                        this.props.selected[0].key +
                            "/doc?name=" +
                            encodeURIComponent(this.props.selected[0].name) +
                            "&share_path=" +
                            encodeURIComponent(previewPath)
                    );
                    return;
                }
                this.props.history.push(
                    "/doc?p=" +
                        encodeURIComponent(previewPath) +
                        "&id=" +
                        this.props.selected[0].id
                );
                return;
            case "audio":
                this.props.openMusicDialog();
                return;
            case "video":
                if (isShare) {
                    this.props.history.push(
                        this.props.selected[0].key +
                            "/video?name=" +
                            encodeURIComponent(this.props.selected[0].name) +
                            "&share_path=" +
                            encodeURIComponent(previewPath)
                    );
                    return;
                }
                this.props.history.push(
                    "/video?p=" +
                        encodeURIComponent(previewPath) +
                        "&id=" +
                        this.props.selected[0].id
                );
                return;
            case "pdf":
                if (isShare) {
                    this.props.history.push(
                        this.props.selected[0].key +
                            "/pdf?name=" +
                            encodeURIComponent(this.props.selected[0].name) +
                            "&share_path=" +
                            encodeURIComponent(previewPath)
                    );
                    return;
                }
                this.props.history.push(
                    "/pdf?p=" +
                        encodeURIComponent(previewPath) +
                        "&id=" +
                        this.props.selected[0].id
                );
                return;
            case "edit":
                if (isShare) {
                    this.props.history.push(
                        this.props.selected[0].key +
                            "/text?name=" +
                            encodeURIComponent(this.props.selected[0].name) +
                            "&share_path=" +
                            encodeURIComponent(previewPath)
                    );
                    return;
                }
                this.props.history.push(
                    "/text?p=" +
                        encodeURIComponent(previewPath) +
                        "&id=" +
                        this.props.selected[0].id
                );
                return;
            case "code":
                if (isShare) {
                    this.props.history.push(
                        this.props.selected[0].key +
                            "/code?name=" +
                            encodeURIComponent(this.props.selected[0].name) +
                            "&share_path=" +
                            encodeURIComponent(previewPath)
                    );
                    return;
                }
                this.props.history.push(
                    "/code?p=" +
                        encodeURIComponent(previewPath) +
                        "&id=" +
                        this.props.selected[0].id
                );
                return;
            default:
                return;
        }
    };

    render() {
        const { classes } = this.props;
        const user = Auth.GetUser();
        const isHomePage = pathHelper.isHomePage(this.props.location.pathname);

        return (
            <div>
                <Menu
                    keepMounted
                    open={this.props.menuOpen}
                    onClose={() =>
                        this.props.changeContextMenu(this.props.menuType, false)
                    }
                    anchorReference="anchorPosition"
                    anchorPosition={{ top: this.Y, left: this.X }}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                >
                    {this.props.menuType === "empty" && (
                        <div>
                            <MenuItem
                                onClick={() => {
                                    this.props.refreshFileList();
                                    this.props.changeContextMenu(
                                        this.props.menuType,
                                        false
                                    );
                                }}
                            >
                                <ListItemIcon>
                                    <RefreshIcon />
                                </ListItemIcon>
                                <Typography variant="inherit">刷新</Typography>
                            </MenuItem>
                            <Divider className={classes.divider} />
                            <MenuItem
                                onClick={() =>
                                    this.clickUpload("uploadFileForm")
                                }
                            >
                                <ListItemIcon>
                                    <UploadIcon />
                                </ListItemIcon>
                                <Typography variant="inherit">
                                    上传文件
                                </Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={() =>
                                    this.clickUpload("uploadFolderForm")
                                }
                            >
                                <ListItemIcon>
                                    <FolderUpload />
                                </ListItemIcon>
                                <Typography variant="inherit">
                                    上传目录
                                </Typography>
                            </MenuItem>
                            {user.group.allowRemoteDownload && (
                                <MenuItem
                                    onClick={() =>
                                        this.props.openRemoteDownloadDialog()
                                    }
                                >
                                    <ListItemIcon>
                                        <DownloadIcon />
                                    </ListItemIcon>
                                    <Typography variant="inherit">
                                        离线下载
                                    </Typography>
                                </MenuItem>
                            )}

                            <Divider className={classes.divider} />
                            <MenuItem
                                onClick={() =>
                                    this.props.openCreateFolderDialog()
                                }
                            >
                                <ListItemIcon>
                                    <NewFolderIcon />
                                </ListItemIcon>
                                <Typography variant="inherit">
                                    创建文件夹
                                </Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={() =>
                                    this.props.openCreateFileDialog()
                                }
                            >
                                <ListItemIcon>
                                    <FilePlus />
                                </ListItemIcon>
                                <Typography variant="inherit">
                                    创建文件
                                </Typography>
                            </MenuItem>
                        </div>
                    )}
                    {this.props.menuType !== "empty" && (
                        <div>
                            {!this.props.isMultiple && this.props.withFolder && (
                                <div>
                                    <MenuItem onClick={this.enterFolder}>
                                        <ListItemIcon>
                                            <OpenFolderIcon />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            进入
                                        </Typography>
                                    </MenuItem>
                                    {isHomePage && (
                                        <Divider className={classes.divider} />
                                    )}
                                </div>
                            )}
                            {!this.props.isMultiple &&
                                this.props.withFile &&
                                (!this.props.share ||
                                    this.props.share.preview) &&
                                isPreviewable(this.props.selected[0].name) && (
                                    <div>
                                        <MenuItem
                                            onClick={() => this.openPreview()}
                                        >
                                            <ListItemIcon>
                                                <OpenIcon />
                                            </ListItemIcon>
                                            <Typography variant="inherit">
                                                打开
                                            </Typography>
                                        </MenuItem>
                                    </div>
                                )}

                            {!this.props.isMultiple && this.props.withFile && (
                                <div>
                                    <MenuItem
                                        onClick={() => this.openDownload()}
                                    >
                                        <ListItemIcon>
                                            <DownloadIcon />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            下载
                                        </Typography>
                                    </MenuItem>
                                    {isHomePage && (
                                        <Divider className={classes.divider} />
                                    )}
                                </div>
                            )}

                            {(this.props.isMultiple || this.props.withFolder) &&
                                (user.group.allowArchiveDownload ||
                                    !isHomePage) && (
                                    <MenuItem
                                        onClick={() =>
                                            this.openArchiveDownload()
                                        }
                                    >
                                        <ListItemIcon>
                                            <DownloadIcon />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            打包下载
                                        </Typography>
                                    </MenuItem>
                                )}

                            {!this.props.isMultiple &&
                                this.props.withFile &&
                                isHomePage &&
                                user.policy.allowSource && (
                                    <MenuItem
                                        onClick={() =>
                                            this.props.openGetSourceDialog()
                                        }
                                    >
                                        <ListItemIcon>
                                            <LinkIcon />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            获取外链
                                        </Typography>
                                    </MenuItem>
                                )}

                            {!this.props.isMultiple &&
                                isHomePage &&
                                user.group.allowRemoteDownload &&
                                this.props.withFile &&
                                isTorrent(this.props.selected[0].name) && (
                                    <MenuItem
                                        onClick={() =>
                                            this.props.openTorrentDownloadDialog()
                                        }
                                    >
                                        <ListItemIcon>
                                            <MagnetOn />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            创建离线下载任务
                                        </Typography>
                                    </MenuItem>
                                )}
                            {!this.props.isMultiple &&
                                isHomePage &&
                                user.group.compress &&
                                this.props.withFile &&
                                isCompressFile(this.props.selected[0].name) && (
                                    <MenuItem
                                        onClick={() =>
                                            this.props.openDecompressDialog()
                                        }
                                    >
                                        <ListItemIcon>
                                            <Unarchive />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            解压缩
                                        </Typography>
                                    </MenuItem>
                                )}

                            {isHomePage && user.group.compress && (
                                <MenuItem
                                    onClick={() =>
                                        this.props.openCompressDialog()
                                    }
                                >
                                    <ListItemIcon>
                                        <Archive />
                                    </ListItemIcon>
                                    <Typography variant="inherit">
                                        创建压缩文件
                                    </Typography>
                                </MenuItem>
                            )}

                            {!this.props.isMultiple && isHomePage && (
                                <MenuItem
                                    onClick={() => this.props.openShareDialog()}
                                >
                                    <ListItemIcon>
                                        <ShareIcon />
                                    </ListItemIcon>
                                    <Typography variant="inherit">
                                        创建分享链接
                                    </Typography>
                                </MenuItem>
                            )}

                            {!this.props.isMultiple && isHomePage && (
                                <div>
                                    <MenuItem
                                        onClick={() =>
                                            this.props.openRenameDialog()
                                        }
                                    >
                                        <ListItemIcon>
                                            <RenameIcon />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            重命名
                                        </Typography>
                                    </MenuItem>
                                    {this.props.keywords === "" && (
                                        <MenuItem
                                            onClick={() =>
                                                this.props.openCopyDialog()
                                            }
                                        >
                                            <ListItemIcon>
                                                <FileCopyIcon />
                                            </ListItemIcon>
                                            <Typography variant="inherit">
                                                复制
                                            </Typography>
                                        </MenuItem>
                                    )}
                                </div>
                            )}
                            {isHomePage && (
                                <div>
                                    {this.props.keywords === "" && (
                                        <MenuItem
                                            onClick={() =>
                                                this.props.openMoveDialog()
                                            }
                                        >
                                            <ListItemIcon>
                                                <MoveIcon />
                                            </ListItemIcon>
                                            <Typography variant="inherit">
                                                移动
                                            </Typography>
                                        </MenuItem>
                                    )}

                                    <Divider className={classes.divider} />
                                    <MenuItem
                                        className={classes.propover}
                                        onClick={() =>
                                            this.props.openRemoveDialog()
                                        }
                                    >
                                        <ListItemIcon>
                                            <DeleteIcon />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            删除
                                        </Typography>
                                    </MenuItem>
                                </div>
                            )}
                        </div>
                    )}
                </Menu>
            </div>
        );
    }
}

ContextMenuCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    menuType: PropTypes.string.isRequired
};

const ContextMenu = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(ContextMenuCompoment)));

export default ContextMenu;

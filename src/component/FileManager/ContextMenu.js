import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    changeContextMenu,
    setNavigatorLoadingStatus,
    navitateTo,
    openCreateFolderDialog,
    openRenameDialog,
    openMoveDialog,
    openRemoveDialog,
    openShareDialog,
    showImgPreivew,
    openMusicDialog,
    toggleSnackbar,
    openRemoteDownloadDialog,
    openTorrentDownloadDialog,
    openGetSourceDialog,
    openCopyDialog,
    openLoadingDialog,
    setSelectedTarget
} from "../../actions/index";
import { isPreviewable, isTorrent } from "../../config";
import { allowSharePreview } from "../../untils/index";
import UploadIcon from "@material-ui/icons/CloudUpload";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import NewFolderIcon from "@material-ui/icons/CreateNewFolder";
import OpenFolderIcon from "@material-ui/icons/FolderOpen";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import ShareIcon from "@material-ui/icons/Share";
import RenameIcon from "@material-ui/icons/BorderColor";
import MoveIcon from "@material-ui/icons/Input";
import LinkIcon from "@material-ui/icons/InsertLink";
import DeleteIcon from "@material-ui/icons/Delete";
import OpenIcon from "@material-ui/icons/OpenInNew";
import { MagnetOn } from "mdi-material-ui";
import { baseURL } from "../../middleware/Api";
import {
    withStyles,
    Popover,
    Typography,
    MenuList,
    MenuItem,
    Divider,
    ListItemIcon
} from "@material-ui/core";
import pathHelper from "../../untils/page";
import { withRouter } from "react-router-dom";
import Auth from "../../middleware/Auth";

const styles = theme => ({
    propover: {
        minWidth: "200px!important"
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
        selected: state.explorer.selected
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
        navitateTo: path => {
            dispatch(navitateTo(path));
        },
        openCreateFolderDialog: () => {
            dispatch(openCreateFolderDialog());
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
        this.props.navitateTo(
            this.props.path === "/"
                ? this.props.path + this.props.selected[0].name
                : this.props.path + "/" + this.props.selected[0].name
        );
    };

    clickUpload = () => {
        this.props.changeContextMenu("empty", false);
        let uploadButton = document.getElementsByClassName("uploadForm")[0];
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
        let isShare = pathHelper.isSharePage(this.props.location.pathname);
        if (isShare) {
            let user = Auth.GetUser();
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
        let previewPath =
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
                this.props.history.push("/doc" + previewPath);
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
                this.props.history.push("/video" + previewPath);
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
                this.props.history.push("/text" + previewPath);
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
                <Popover
                    id="simple-popper"
                    open={this.props.menuOpen}
                    anchorReference="anchorPosition"
                    anchorPosition={{ top: this.Y, left: this.X }}
                    onClose={() =>
                        this.props.changeContextMenu(this.props.menuType, false)
                    }
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
                        <MenuList>
                            <MenuItem onClick={this.clickUpload}>
                                <ListItemIcon>
                                    <UploadIcon />
                                </ListItemIcon>
                                <Typography variant="inherit">
                                    上传文件
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

                            <Divider />
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
                        </MenuList>
                    )}
                    {this.props.menuType !== "empty" && (
                        <MenuList>
                            {!this.props.isMultiple && this.props.withFolder && (
                                <>
                                    <MenuItem onClick={this.enterFolder}>
                                        <ListItemIcon>
                                            <OpenFolderIcon />
                                        </ListItemIcon>
                                        <Typography variant="inherit">
                                            进入
                                        </Typography>
                                    </MenuItem>
                                    <Divider />
                                </>
                            )}
                            {!this.props.isMultiple &&
                                this.props.withFile &&
                                (!this.props.share ||
                                    this.props.share.preview) &&
                                isPreviewable(this.props.selected[0].name) && (
                                    <>
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
                                        <Divider />
                                    </>
                                )}

                            {!this.props.isMultiple && this.props.withFile && (
                                <MenuItem onClick={() => this.openDownload()}>
                                    <ListItemIcon>
                                        <DownloadIcon />
                                    </ListItemIcon>
                                    <Typography variant="inherit">
                                        下载
                                    </Typography>
                                </MenuItem>
                            )}

                            {(this.props.isMultiple || this.props.withFolder) &&
                                user.group.allowArchiveDownload && (
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
                                user.group.allowTorrentDownload &&
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

                            {!this.props.isMultiple && isHomePage && (
                                <MenuItem
                                    onClick={() => this.props.openShareDialog()}
                                >
                                    <ListItemIcon>
                                        <ShareIcon />
                                    </ListItemIcon>
                                    <Typography variant="inherit">
                                        分享
                                    </Typography>
                                </MenuItem>
                            )}

                            {!this.props.isMultiple && isHomePage && (
                                <>
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
                                </>
                            )}
                            {isHomePage && (
                                <div>
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
                                    <Divider />
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
                        </MenuList>
                    )}
                </Popover>
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

import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";
import ShareIcon from "@material-ui/icons/Share";
import MusicNote from "@material-ui/icons/MusicNote";
import BackIcon from "@material-ui/icons/ArrowBack";
import SdStorage from "@material-ui/icons/SdStorage";
import OpenIcon from "@material-ui/icons/OpenInNew";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import RenameIcon from "@material-ui/icons/BorderColor";
import MoveIcon from "@material-ui/icons/Input";
import DeleteIcon from "@material-ui/icons/Delete";
import MenuIcon from "@material-ui/icons/Menu";
import { isPreviewable } from "../../config";
import { changeThemeColor, sizeToString, vhCheck } from "../../utils";
import Uploader from "../Uploader/Uploader.js";
import pathHelper from "../../utils/page";
import SezrchBar from "./SearchBar";
import StorageBar from "./StorageBar";
import UserAvatar from "./UserAvatar";
import UserInfo from "./UserInfo";
import {
    FolderDownload,
    AccountArrowRight,
    AccountPlus,
    LogoutVariant,
} from "mdi-material-ui";
import { withRouter } from "react-router-dom";
import {
    AppBar,
    Drawer,
    Grow,
    Hidden,
    IconButton,
    List,
    ListItemIcon,
    ListItemText,
    SwipeableDrawer,
    Toolbar,
    Tooltip,
    Typography,
    withStyles,
    withTheme
} from "@material-ui/core";
import Auth from "../../middleware/Auth";
import API from "../../middleware/Api";
import FileTag from "./FileTags";
import { Assignment, Devices, MoreHoriz, Settings } from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
import SubActions from "../FileManager/Navigator/SubActions";
import {
    audioPreviewSetIsOpen,
    changeContextMenu,
    drawerToggleAction,
    navigateTo,
    openCreateFolderDialog,
    openLoadingDialog,
    openMoveDialog,
    openMusicDialog,
    openPreview,
    openRemoveDialog,
    openRenameDialog,
    openShareDialog,
    saveFile,
    setSelectedTarget,
    setSessionStatus,
    showImgPreivew,
    toggleSnackbar,
} from "../../redux/explorer";
import {
    startBatchDownload,
    startDirectoryDownload,
    startDownload,
} from "../../redux/explorer/action";
import PolicySwitcher from "./PolicySwitcher";
import { withTranslation } from "react-i18next";
import MuiListItem from "@material-ui/core/ListItem";

vhCheck();
const drawerWidth = 240;
const drawerWidthMobile = 270;

const ListItem = withStyles((theme) => ({
    root: {
        borderRadius:theme.shape.borderRadius,
    },
}))(MuiListItem);

const mapStateToProps = (state) => {
    return {
        desktopOpen: state.viewUpdate.open,
        selected: state.explorer.selected,
        isMultiple: state.explorer.selectProps.isMultiple,
        withFolder: state.explorer.selectProps.withFolder,
        withFile: state.explorer.selectProps.withFile,
        path: state.navigator.path,
        title: state.siteConfig.title,
        subTitle: state.viewUpdate.subTitle,
        loadUploader: state.viewUpdate.loadUploader,
        isLogin: state.viewUpdate.isLogin,
        shareInfo: state.viewUpdate.shareInfo,
        registerEnabled: state.siteConfig.registerEnabled,
        audioPreviewPlayingName: state.explorer.audioPreview.playingName,
        audioPreviewIsOpen: state.explorer.audioPreview.isOpen,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleDesktopToggle: (open) => {
            dispatch(drawerToggleAction(open));
        },
        setSelectedTarget: (targets) => {
            dispatch(setSelectedTarget(targets));
        },
        navigateTo: (path) => {
            dispatch(navigateTo(path));
        },
        openCreateFolderDialog: () => {
            dispatch(openCreateFolderDialog());
        },
        changeContextMenu: (type, open) => {
            dispatch(changeContextMenu(type, open));
        },
        saveFile: () => {
            dispatch(saveFile());
        },
        openMusicDialog: () => {
            dispatch(openMusicDialog());
        },
        showImgPreivew: (first) => {
            dispatch(showImgPreivew(first));
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
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
        openLoadingDialog: (text) => {
            dispatch(openLoadingDialog(text));
        },
        setSessionStatus: () => {
            dispatch(setSessionStatus());
        },
        openPreview: (share) => {
            dispatch(openPreview(share));
        },
        audioPreviewOpen: () => {
            dispatch(audioPreviewSetIsOpen(true));
        },
        startBatchDownload: (share) => {
            dispatch(startBatchDownload(share));
        },
        startDirectoryDownload: (share) => {
            dispatch(startDirectoryDownload(share));
        },
        startDownload: (share, file) => {
            dispatch(startDownload(share, file));
        },
    };
};

const styles = (theme) => ({
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.down("xs")]: {
            marginLeft: drawerWidthMobile,
        },
        zIndex: theme.zIndex.drawer + 1,
        transition: " background-color 250ms",
    },

    drawer: {
        width: 0,
        flexShrink: 0,
    },
    drawerDesktop: {
        width: drawerWidth,
        flexShrink: 0,
    },
    icon: {
        marginRight: theme.spacing(2),
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up("sm")]: {
            display: "none",
        },
    },
    menuButtonDesktop: {
        marginRight: 20,
        [theme.breakpoints.down("xs")]: {
            display: "none",
        },
    },
    menuIcon: {
        marginRight: 20,
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidthMobile,
    },
    drawerPaperDesktop: {
        width: drawerWidth,
    },
    upDrawer: {
        overflowX: "hidden",
        [theme.breakpoints.up("sm")]: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
        },
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: "hidden",
        width: 0,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    grow: {
        flexGrow: 1,
    },
    badge: {
        top: 1,
        right: -15,
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    sectionForFile: {
        display: "flex",
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    addButton: {
        marginLeft: "40px",
        marginTop: "25px",
        marginBottom: "15px",
    },
    fabButton: {
        borderRadius: "100px",
    },
    badgeFix: {
        right: "10px",
    },
    iconFix: {
        marginLeft: "16px",
    },
    dividerFix: {
        marginTop: "8px",
    },
    folderShareIcon: {
        verticalAlign: "sub",
        marginRight: "5px",
    },
    shareInfoContainer: {
        display: "flex",
        marginTop: "15px",
        marginBottom: "20px",
        marginLeft: "28px",
        textDecoration: "none",
    },
    shareAvatar: {
        width: "40px",
        height: "40px",
    },
    stickFooter: {
        bottom: "0px",
        position: "absolute",
        backgroundColor: theme.palette.background.paper,
        width: "100%",
    },
    ownerInfo: {
        marginLeft: "10px",
        width: "150px",
    },
    minStickDrawer: {
        overflowY: "auto",
    },
    paddingList:{
        padding:theme.spacing(1),
    }
});
class NavbarCompoment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobileOpen: false,
        };
        this.UploaderRef = React.createRef();
    }

    UNSAFE_componentWillMount() {
        this.unlisten = this.props.history.listen(() => {
            this.setState(() => ({ mobileOpen: false }));
        });
    }
    componentWillUnmount() {
        this.unlisten();
    }

    componentDidMount = () => {
        changeThemeColor(
            this.props.selected.length <= 1 &&
                !(!this.props.isMultiple && this.props.withFile)
                ? this.props.theme.palette.primary.main
                : this.props.theme.palette.background.default
        );
    };

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        if (
            (this.props.selected.length === 0) !==
            (nextProps.selected.length === 0)
        ) {
            changeThemeColor(
                !(this.props.selected.length === 0)
                    ? this.props.theme.palette.type === "dark"
                        ? this.props.theme.palette.background.default
                        : this.props.theme.palette.primary.main
                    : this.props.theme.palette.background.default
            );
        }
    };

    handleDrawerToggle = () => {
        this.setState((state) => ({ mobileOpen: !state.mobileOpen }));
    };

    openDownload = () => {
        this.props.startDownload(this.props.shareInfo, this.props.selected[0]);
    };

    openDirectoryDownload = (e) => {
        this.props.startDirectoryDownload(this.props.shareInfo);
    };

    archiveDownload = (e) => {
        this.props.startBatchDownload(this.props.shareInfo);
    };

    signOut = () => {
        API.delete("/user/session/")
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("login.loggedOut"),
                    "success"
                );
                Auth.signout();
                window.location.reload();
                this.props.setSessionStatus(false);
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "warning"
                );
            })
            .finally(() => {
                this.handleClose();
            });
    };

    render() {
        const { classes, t } = this.props;
        const user = Auth.GetUser(this.props.isLogin);
        const isHomePage = pathHelper.isHomePage(this.props.location.pathname);
        const isSharePage = pathHelper.isSharePage(
            this.props.location.pathname
        );

        const drawer = (
            <div id="container" className={classes.upDrawer}>
                {pathHelper.isMobile() && <UserInfo />}

                {Auth.Check(this.props.isLogin) && (
                    <>
                        <div className={classes.minStickDrawer}>
                            <FileTag />
                            <List className={classes.paddingList}>
                                <ListItem
                                    button
                                    key="我的分享"
                                    onClick={() =>
                                        this.props.history.push("/shares?")
                                    }
                                >
                                    <ListItemIcon>
                                        <ShareIcon
                                            className={classes.iconFix}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t("navbar.myShare")}
                                    />
                                </ListItem>
                                {user.group.allowRemoteDownload && (
                                    <ListItem
                                        button
                                        key="离线下载"
                                        onClick={() =>
                                            this.props.history.push("/aria2?")
                                        }
                                    >
                                        <ListItemIcon>
                                            <DownloadIcon
                                                className={classes.iconFix}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t("navbar.remoteDownload")}
                                        />
                                    </ListItem>
                                )}
                                <ListItem
                                    button
                                    key="容量配额"
                                    onClick={() =>
                                        this.props.history.push("/quota?")
                                    }
                                >
                                    <ListItemIcon>
                                        <SdStorage
                                            className={classes.iconFix}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={t("vas.quota")} />
                                </ListItem>
                                <ListItem
                                    button
                                    key="WebDAV"
                                    onClick={() =>
                                        this.props.history.push("/connect?")
                                    }
                                >
                                    <ListItemIcon>
                                        <Devices className={classes.iconFix} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t("navbar.connect")}
                                    />
                                </ListItem>

                                <ListItem
                                    button
                                    key="任务队列"
                                    onClick={() =>
                                        this.props.history.push("/tasks?")
                                    }
                                >
                                    <ListItemIcon>
                                        <Assignment
                                            className={classes.iconFix}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t("navbar.taskQueue")}
                                    />
                                </ListItem>
                                {pathHelper.isMobile() && (
                                    <>
                                        <Divider />
                                        <ListItem
                                            button
                                            key="个人设置"
                                            onClick={() =>
                                                this.props.history.push(
                                                    "/setting?"
                                                )
                                            }
                                        >
                                            <ListItemIcon>
                                                <Settings
                                                    className={classes.iconFix}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={t("navbar.setting")}
                                            />
                                        </ListItem>

                                        <ListItem
                                            button
                                            key="退出登录"
                                            onClick={this.signOut}
                                        >
                                            <ListItemIcon>
                                                <LogoutVariant
                                                    className={classes.iconFix}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={t("login.logout")}
                                            />
                                        </ListItem>
                                    </>
                                )}
                            </List>
                        </div>
                        <div>
                            <StorageBar></StorageBar>
                        </div>
                    </>
                )}

                {!Auth.Check(this.props.isLogin) && (
                    <div>
                        <ListItem
                            button
                            key="登录"
                            onClick={() => this.props.history.push("/login")}
                        >
                            <ListItemIcon>
                                <AccountArrowRight
                                    className={classes.iconFix}
                                />
                            </ListItemIcon>
                            <ListItemText primary={t("login.signIn")} />
                        </ListItem>
                        {this.props.registerEnabled && (
                            <ListItem
                                button
                                key="注册"
                                onClick={() =>
                                    this.props.history.push("/signup")
                                }
                            >
                                <ListItemIcon>
                                    <AccountPlus className={classes.iconFix} />
                                </ListItemIcon>
                                <ListItemText primary={t("login.signUp")} />
                            </ListItem>
                        )}
                    </div>
                )}
            </div>
        );
        const iOS =
            process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);
        return (
            <div>
                <AppBar
                    position="fixed"
                    className={classes.appBar}
                    color={
                        this.props.theme.palette.type !== "dark" &&
                        this.props.selected.length === 0
                            ? "primary"
                            : "default"
                    }
                >
                    <Toolbar>
                        {this.props.selected.length === 0 && (
                            <IconButton
                                color="inherit"
                                aria-label="Open drawer"
                                onClick={this.handleDrawerToggle}
                                className={classes.menuButton}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        {this.props.selected.length === 0 && (
                            <IconButton
                                color="inherit"
                                aria-label="Open drawer"
                                onClick={() =>
                                    this.props.handleDesktopToggle(
                                        !this.props.desktopOpen
                                    )
                                }
                                className={classes.menuButtonDesktop}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        {this.props.selected.length > 0 &&
                            (isHomePage ||
                                pathHelper.isSharePage(
                                    this.props.location.pathname
                                )) && (
                                <Grow in={this.props.selected.length > 0}>
                                    <IconButton
                                        color="inherit"
                                        className={classes.menuIcon}
                                        onClick={() =>
                                            this.props.setSelectedTarget([])
                                        }
                                    >
                                        <BackIcon />
                                    </IconButton>
                                </Grow>
                            )}
                        {this.props.selected.length === 0 && (
                            <Typography
                                variant="h6"
                                color="inherit"
                                style={{
                                    cursor: "pointer",
                                }}
                                noWrap
                                onClick={() => {
                                    this.props.history.push("/");
                                }}
                            >
                                {this.props.subTitle
                                    ? this.props.subTitle
                                    : this.props.title}
                            </Typography>
                        )}

                        {!this.props.isMultiple &&
                            (this.props.withFile || this.props.withFolder) &&
                            !pathHelper.isMobile() && (
                                <Typography variant="h6" color="inherit" noWrap>
                                    {this.props.selected[0].name}{" "}
                                    {this.props.withFile &&
                                        (isHomePage ||
                                            pathHelper.isSharePage(
                                                this.props.location.pathname
                                            )) &&
                                        "(" +
                                            sizeToString(
                                                this.props.selected[0].size
                                            ) +
                                            ")"}
                                </Typography>
                            )}

                        {this.props.selected.length > 1 &&
                            !pathHelper.isMobile() && (
                                <Typography variant="h6" color="inherit" noWrap>
                                    {t("navbar.objectsSelected", {
                                        num: this.props.selected.length,
                                    })}
                                </Typography>
                            )}
                        {this.props.selected.length === 0 && <SezrchBar />}
                        <div className={classes.grow} />
                        {this.props.selected.length > 0 &&
                            (isHomePage || isSharePage) && (
                                <div className={classes.sectionForFile}>
                                    {!this.props.isMultiple &&
                                        this.props.withFile &&
                                        isPreviewable(
                                            this.props.selected[0].name
                                        ) && (
                                            <Grow
                                                in={
                                                    !this.props.isMultiple &&
                                                    this.props.withFile &&
                                                    isPreviewable(
                                                        this.props.selected[0]
                                                            .name
                                                    )
                                                }
                                            >
                                                <Tooltip
                                                    title={t(
                                                        "fileManager.open"
                                                    )}
                                                >
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            this.props.openPreview(
                                                                this.props
                                                                    .shareInfo
                                                            )
                                                        }
                                                    >
                                                        <OpenIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grow>
                                        )}
                                    {!this.props.isMultiple &&
                                        this.props.withFile && (
                                            <Grow
                                                in={
                                                    !this.props.isMultiple &&
                                                    this.props.withFile
                                                }
                                            >
                                                <Tooltip
                                                    title={t(
                                                        "fileManager.download"
                                                    )}
                                                >
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            this.openDownload()
                                                        }
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grow>
                                        )}
                                    {(this.props.isMultiple ||
                                        this.props.withFolder) &&
                                        window.showDirectoryPicker &&
                                        window.isSecureContext && (
                                            <Grow
                                                in={
                                                    (this.props.isMultiple ||
                                                        this.props
                                                            .withFolder) &&
                                                    window.showDirectoryPicker &&
                                                    window.isSecureContext
                                                }
                                            >
                                                <Tooltip
                                                    title={t(
                                                        "fileManager.download"
                                                    )}
                                                >
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            this.openDirectoryDownload()
                                                        }
                                                    >
                                                        <FolderDownload />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grow>
                                        )}
                                    {(this.props.isMultiple ||
                                        this.props.withFolder) && (
                                        <Grow
                                            in={
                                                this.props.isMultiple ||
                                                this.props.withFolder
                                            }
                                        >
                                            <Tooltip
                                                title={t(
                                                    "fileManager.batchDownload"
                                                )}
                                            >
                                                <IconButton
                                                    color="inherit"
                                                    disableClickAway
                                                    onClick={() =>
                                                        this.archiveDownload()
                                                    }
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>
                                    )}
                                    {!this.props.isMultiple &&
                                        !pathHelper.isMobile() &&
                                        !isSharePage && (
                                            <Grow in={!this.props.isMultiple}>
                                                <Tooltip
                                                    title={t(
                                                        "fileManager.share"
                                                    )}
                                                >
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            this.props.openShareDialog()
                                                        }
                                                    >
                                                        <ShareIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grow>
                                        )}
                                    {!this.props.isMultiple && !isSharePage && (
                                        <Grow in={!this.props.isMultiple}>
                                            <Tooltip
                                                title={t("fileManager.rename")}
                                            >
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        this.props.openRenameDialog()
                                                    }
                                                >
                                                    <RenameIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>
                                    )}
                                    {!isSharePage && (
                                        <div style={{ display: "flex" }}>
                                            {!pathHelper.isMobile() && (
                                                <Grow
                                                    in={
                                                        this.props.selected
                                                            .length !== 0 &&
                                                        !pathHelper.isMobile()
                                                    }
                                                >
                                                    <Tooltip
                                                        title={t(
                                                            "fileManager.move"
                                                        )}
                                                    >
                                                        <IconButton
                                                            color="inherit"
                                                            onClick={() =>
                                                                this.props.openMoveDialog()
                                                            }
                                                        >
                                                            <MoveIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grow>
                                            )}

                                            <Grow
                                                in={
                                                    this.props.selected
                                                        .length !== 0
                                                }
                                            >
                                                <Tooltip
                                                    title={t(
                                                        "fileManager.delete"
                                                    )}
                                                >
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            this.props.openRemoveDialog()
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grow>

                                            {pathHelper.isMobile() && (
                                                <Grow
                                                    in={
                                                        this.props.selected
                                                            .length !== 0 &&
                                                        pathHelper.isMobile()
                                                    }
                                                >
                                                    <Tooltip
                                                        title={t(
                                                            "fileManager.moreActions"
                                                        )}
                                                    >
                                                        <IconButton
                                                            color="inherit"
                                                            onClick={() =>
                                                                this.props.changeContextMenu(
                                                                    "file",
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            <MoreHoriz />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grow>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        {this.props.selected.length <= 1 &&
                            !(!this.props.isMultiple && this.props.withFile) &&
                            this.props.audioPreviewPlayingName != null && (
                                <IconButton
                                    title={t("navbar.music")}
                                    className={classes.sideButton}
                                    onClick={this.props.audioPreviewOpen}
                                    color={"inherit"}
                                >
                                    <MusicNote fontSize={"default"} />
                                </IconButton>
                            )}

                        {this.props.selected.length === 0 && <UserAvatar />}
                        {this.props.selected.length === 0 &&
                            pathHelper.isMobile() && (
                                <>
                                    {isHomePage && <PolicySwitcher />}
                                    {(isHomePage || this.props.shareInfo) && (
                                        <SubActions inherit />
                                    )}
                                </>
                            )}
                    </Toolbar>
                </AppBar>
                <Uploader />

                <Hidden smUp implementation="css">
                    <SwipeableDrawer
                        container={this.props.container}
                        variant="temporary"
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        anchor="left"
                        open={this.state.mobileOpen}
                        onClose={this.handleDrawerToggle}
                        onOpen={() =>
                            this.setState(() => ({ mobileOpen: true }))
                        }
                        disableDiscovery={iOS}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </SwipeableDrawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaperDesktop,
                        }}
                        className={classNames(classes.drawer, {
                            [classes.drawerOpen]: this.props.desktopOpen,
                            [classes.drawerClose]: !this.props.desktopOpen,
                        })}
                        variant="persistent"
                        anchor="left"
                        open={this.props.desktopOpen}
                    >
                        <div className={classes.toolbar} />
                        {drawer}
                    </Drawer>
                </Hidden>
            </div>
        );
    }
}
NavbarCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

const Navbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    withTheme(
        withStyles(styles)(withRouter(withTranslation()(NavbarCompoment)))
    )
);

export default Navbar;

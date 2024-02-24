import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import ShareIcon from "@material-ui/icons/Share";
import NewFolderIcon from "@material-ui/icons/CreateNewFolder";
import RefreshIcon from "@material-ui/icons/Refresh";
import explorer, {
    drawerToggleAction,
    navigateTo,
    navigateUp,
    openCompressDialog,
    openCreateFileDialog,
    openCreateFolderDialog,
    openShareDialog,
    refreshFileList,
    setNavigatorError,
    setNavigatorLoadingStatus,
    setSelectedTarget,
} from "../../../redux/explorer";
import { fixUrlHash, setGetParameter } from "../../../utils/index";
import {
    Divider,
    ListItemIcon,
    Menu,
    MenuItem,
    withStyles,
} from "@material-ui/core";
import PathButton from "./PathButton";
import DropDown from "./DropDown";
import pathHelper from "../../../utils/page";
import classNames from "classnames";
import Auth from "../../../middleware/Auth";
import { Archive } from "@material-ui/icons";
import { FilePlus } from "mdi-material-ui";
import SubActions from "./SubActions";
import { setCurrentPolicy } from "../../../redux/explorer/action";
import { list } from "../../../services/navigate";
import { withTranslation } from "react-i18next";

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        refresh: state.navigator.refresh,
        drawerDesktopOpen: state.viewUpdate.open,
        viewMethod: state.viewUpdate.explorerViewMethod,
        search: state.explorer.search,
        sortMethod: state.viewUpdate.sortMethod,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        navigateToPath: (path) => {
            dispatch(navigateTo(path));
        },
        navigateUp: () => {
            dispatch(navigateUp());
        },
        setNavigatorError: (status, msg) => {
            dispatch(setNavigatorError(status, msg));
        },
        updateFileList: (list) => {
            dispatch(explorer.actions.updateFileList(list));
        },
        setNavigatorLoadingStatus: (status) => {
            dispatch(setNavigatorLoadingStatus(status));
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        setSelectedTarget: (target) => {
            dispatch(setSelectedTarget(target));
        },
        openCreateFolderDialog: () => {
            dispatch(openCreateFolderDialog());
        },
        openCreateFileDialog: () => {
            dispatch(openCreateFileDialog());
        },
        openShareDialog: () => {
            dispatch(openShareDialog());
        },
        handleDesktopToggle: (open) => {
            dispatch(drawerToggleAction(open));
        },
        openCompressDialog: () => {
            dispatch(openCompressDialog());
        },
        setCurrentPolicy: (policy) => {
            dispatch(setCurrentPolicy(policy));
        },
    };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const styles = (theme) => ({
    container: {
        [theme.breakpoints.down("xs")]: {
            display: "none",
        },
        backgroundColor: theme.palette.background.paper,
    },
    navigatorContainer: {
        display: "flex",
        justifyContent: "space-between",
    },
    nav: {
        height: "48px",
        padding: "5px 15px",
        display: "flex",
    },
    optionContainer: {
        paddingTop: "6px",
        marginRight: "10px",
    },
    rightIcon: {
        marginTop: "6px",
        verticalAlign: "top",
        color: "#868686",
    },
    expandMore: {
        color: "#8d8d8d",
    },
    roundBorder: {
        borderRadius: "4px 4px 0 0",
    },
});

class NavigatorComponent extends Component {
    search = undefined;
    currentID = 0;

    state = {
        hidden: false,
        hiddenFolders: [],
        folders: [],
        anchorEl: null,
        hiddenMode: false,
        anchorHidden: null,
    };

    constructor(props) {
        super(props);
        this.element = React.createRef();
    }

    componentDidMount = () => {
        const url = new URL(fixUrlHash(window.location.href));
        const c = url.searchParams.get("path");
        this.renderPath(c === null ? "/" : c);

        if (!this.props.isShare) {
            // 如果是在个人文件管理页，首次加载时打开侧边栏
            this.props.handleDesktopToggle(true);
        }

        // 后退操作时重新导航
        window.onpopstate = () => {
            const url = new URL(fixUrlHash(window.location.href));
            const c = url.searchParams.get("path");
            if (c !== null) {
                this.props.navigateToPath(c);
            }
        };
    };

    renderPath = (path = null) => {
        this.props.setNavigatorError(false, null);
        this.setState({
            folders:
                path !== null
                    ? path.substr(1).split("/")
                    : this.props.path.substr(1).split("/"),
        });
        const newPath = path !== null ? path : this.props.path;
        list(
            newPath,
            this.props.share,
            this.search ? this.search.keywords : "",
            this.search ? this.search.searchPath : ""
        )
            .then((response) => {
                this.currentID = response.data.parent;
                this.props.updateFileList(response.data.objects);
                this.props.setNavigatorLoadingStatus(false);
                if (!this.search) {
                    setGetParameter("path", encodeURIComponent(newPath));
                }
                if (response.data.policy) {
                    this.props.setCurrentPolicy({
                        id: response.data.policy.id,
                        name: response.data.policy.name,
                        type: response.data.policy.type,
                        maxSize: response.data.policy.max_size,
                        allowedSuffix: response.data.policy.file_type,
                    });
                }
            })
            .catch((error) => {
                this.props.setNavigatorError(true, error);
            });

        this.checkOverFlow(true);
    };

    redresh = (path) => {
        this.props.setNavigatorLoadingStatus(true);
        this.props.setNavigatorError(false, "error");
        this.renderPath(path);
    };

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        if (this.props.search !== nextProps.search) {
            this.search = nextProps.search;
        }
        if (this.props.path !== nextProps.path) {
            this.renderPath(nextProps.path);
        }
        if (this.props.refresh !== nextProps.refresh) {
            this.redresh(nextProps.path);
        }
    };

    componentWillUnmount() {
        this.props.updateFileList([]);
    }

    componentDidUpdate = (prevProps, prevStates) => {
        if (this.state.folders !== prevStates.folders) {
            this.checkOverFlow(true);
        }
        if (this.props.drawerDesktopOpen !== prevProps.drawerDesktopOpen) {
            delay(500).then(() => this.checkOverFlow());
        }
    };

    checkOverFlow = (force) => {
        if (this.overflowInitLock && !force) {
            return;
        }
        if (this.element.current !== null) {
            const hasOverflowingChildren =
                this.element.current.offsetHeight <
                    this.element.current.scrollHeight ||
                this.element.current.offsetWidth <
                    this.element.current.scrollWidth;
            if (hasOverflowingChildren) {
                this.overflowInitLock = true;
                this.setState({ hiddenMode: true });
            }
            if (!hasOverflowingChildren && this.state.hiddenMode) {
                this.setState({ hiddenMode: false });
            }
        }
    };

    navigateTo = (event, id) => {
        if (id === this.state.folders.length - 1) {
            //最后一个路径
            this.setState({ anchorEl: event.currentTarget });
        } else if (
            id === -1 &&
            this.state.folders.length === 1 &&
            this.state.folders[0] === ""
        ) {
            this.props.refreshFileList();
            this.handleClose();
        } else if (id === -1) {
            this.props.navigateToPath("/");
            this.handleClose();
        } else {
            this.props.navigateToPath(
                "/" + this.state.folders.slice(0, id + 1).join("/")
            );
            this.handleClose();
        }
    };

    handleClose = () => {
        this.setState({ anchorEl: null, anchorHidden: null, anchorSort: null });
    };

    showHiddenPath = (e) => {
        this.setState({ anchorHidden: e.currentTarget });
    };

    performAction = (e) => {
        this.handleClose();
        if (e === "refresh") {
            this.redresh();
            return;
        }
        const presentPath = this.props.path.split("/");
        const newTarget = [
            {
                id: this.currentID,
                type: "dir",
                name: presentPath.pop(),
                path: presentPath.length === 1 ? "/" : presentPath.join("/"),
            },
        ];
        //this.props.navitateUp();
        switch (e) {
            case "share":
                this.props.setSelectedTarget(newTarget);
                this.props.openShareDialog();
                break;
            case "newfolder":
                this.props.openCreateFolderDialog();
                break;
            case "compress":
                this.props.setSelectedTarget(newTarget);
                this.props.openCompressDialog();
                break;
            case "newFile":
                this.props.openCreateFileDialog();
                break;
            default:
                break;
        }
    };

    render() {
        const { classes, t } = this.props;
        const isHomePage = pathHelper.isHomePage(this.props.location.pathname);
        const user = Auth.GetUser();

        const presentFolderMenu = (
            <Menu
                id="presentFolderMenu"
                anchorEl={this.state.anchorEl}
                open={Boolean(this.state.anchorEl)}
                onClose={this.handleClose}
                disableAutoFocusItem={true}
            >
                <MenuItem onClick={() => this.performAction("refresh")}>
                    <ListItemIcon>
                        <RefreshIcon />
                    </ListItemIcon>
                    {t("fileManager.refresh")}
                </MenuItem>
                {!this.props.search && isHomePage && (
                    <div>
                        <Divider />
                        <MenuItem onClick={() => this.performAction("share")}>
                            <ListItemIcon>
                                <ShareIcon />
                            </ListItemIcon>
                            {t("fileManager.share")}
                        </MenuItem>
                        {user.group.compress && (
                            <MenuItem
                                onClick={() => this.performAction("compress")}
                            >
                                <ListItemIcon>
                                    <Archive />
                                </ListItemIcon>
                                {t("fileManager.compress")}
                            </MenuItem>
                        )}
                        <Divider />
                        <MenuItem
                            onClick={() => this.performAction("newfolder")}
                        >
                            <ListItemIcon>
                                <NewFolderIcon />
                            </ListItemIcon>
                            {t("fileManager.newFolder")}
                        </MenuItem>

                        <MenuItem onClick={() => this.performAction("newFile")}>
                            <ListItemIcon>
                                <FilePlus />
                            </ListItemIcon>
                            {t("fileManager.newFile")}
                        </MenuItem>
                    </div>
                )}
            </Menu>
        );

        return (
            <div
                className={classNames(
                    {
                        [classes.roundBorder]: this.props.isShare,
                    },
                    classes.container
                )}
                id={"drag-layer-inherit"}
            >
                <div className={classes.navigatorContainer}>
                    <div className={classes.nav} ref={this.element}>
                        <span>
                            <PathButton
                                folder="/"
                                path="/"
                                onClick={(e) => this.navigateTo(e, -1)}
                            />
                            <RightIcon className={classes.rightIcon} />
                        </span>
                        {this.state.hiddenMode && (
                            <span>
                                <PathButton
                                    more
                                    title={t("fileManager.showFullPath")}
                                    onClick={this.showHiddenPath}
                                />
                                <Menu
                                    id="hiddenPathMenu"
                                    anchorEl={this.state.anchorHidden}
                                    open={Boolean(this.state.anchorHidden)}
                                    onClose={this.handleClose}
                                    disableAutoFocusItem={true}
                                >
                                    <DropDown
                                        onClose={this.handleClose}
                                        folders={this.state.folders.slice(
                                            0,
                                            -1
                                        )}
                                        navigateTo={this.navigateTo}
                                    />
                                </Menu>
                                <RightIcon className={classes.rightIcon} />
                                <PathButton
                                    folder={this.state.folders.slice(-1)}
                                    path={
                                        "/" +
                                        this.state.folders
                                            .slice(0, -1)
                                            .join("/")
                                    }
                                    last={true}
                                    onClick={(e) =>
                                        this.navigateTo(
                                            e,
                                            this.state.folders.length - 1
                                        )
                                    }
                                />
                                {presentFolderMenu}
                            </span>
                        )}
                        {!this.state.hiddenMode &&
                            this.state.folders.map((folder, id, folders) => (
                                <span key={id}>
                                    {folder !== "" && (
                                        <span>
                                            <PathButton
                                                folder={folder}
                                                path={
                                                    "/" +
                                                    folders
                                                        .slice(0, id)
                                                        .join("/")
                                                }
                                                last={id === folders.length - 1}
                                                onClick={(e) =>
                                                    this.navigateTo(e, id)
                                                }
                                            />
                                            {id === folders.length - 1 &&
                                                presentFolderMenu}
                                            {id !== folders.length - 1 && (
                                                <RightIcon
                                                    className={
                                                        classes.rightIcon
                                                    }
                                                />
                                            )}
                                        </span>
                                    )}
                                </span>
                            ))}
                    </div>
                    <div className={classes.optionContainer}>
                        <SubActions isSmall />
                    </div>
                </div>
                <Divider />
            </div>
        );
    }
}

NavigatorComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
};

const Navigator = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(withTranslation()(NavigatorComponent))));

export default Navigator;

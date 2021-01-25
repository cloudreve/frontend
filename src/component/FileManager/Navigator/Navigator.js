import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import ViewListIcon from "@material-ui/icons/ViewList";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import ViewSmallIcon from "@material-ui/icons/ViewComfy";
import TextTotateVerticalIcon from "@material-ui/icons/TextRotateVertical";
import ShareIcon from "@material-ui/icons/Share";
import NewFolderIcon from "@material-ui/icons/CreateNewFolder";
import RefreshIcon from "@material-ui/icons/Refresh";
import {
    navigateTo,
    navigateUp,
    changeViewMethod,
    setNavigatorError,
    setNavigatorLoadingStatus,
    refreshFileList,
    setSelectedTarget,
    openCreateFolderDialog,
    openShareDialog,
    drawerToggleAction,
    setShareUserPopover,
    openResaveDialog,
    openCompressDialog
} from "../../../actions/index";
import explorer from "../../../redux/explorer";
import API from "../../../middleware/Api";
import { setCookie, setGetParameter, fixUrlHash } from "../../../utils/index";
import {
    withStyles,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    IconButton
} from "@material-ui/core";
import PathButton from "./PathButton";
import DropDown from "./DropDown";
import pathHelper from "../../../utils/page";
import classNames from "classnames";
import Auth from "../../../middleware/Auth";
import Avatar from "@material-ui/core/Avatar";
import { Archive } from "@material-ui/icons";
import { FilePlus } from "mdi-material-ui";
import { openCreateFileDialog } from "../../../actions";

const mapStateToProps = state => {
    return {
        path: state.navigator.path,
        refresh: state.navigator.refresh,
        drawerDesktopOpen: state.viewUpdate.open,
        viewMethod: state.viewUpdate.explorerViewMethod,
        keywords: state.explorer.keywords,
        sortMethod: state.viewUpdate.sortMethod
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigateToPath: path => {
            dispatch(navigateTo(path));
        },
        navigateUp: () => {
            dispatch(navigateUp());
        },
        changeView: method => {
            dispatch(changeViewMethod(method));
        },
        changeSort: method => {
            dispatch(explorer.actions.changeSortMethod(method));
        },
        setNavigatorError: (status, msg) => {
            dispatch(setNavigatorError(status, msg));
        },
        updateFileList: list => {
            dispatch(explorer.actions.updateFileList(list));
        },
        setNavigatorLoadingStatus: status => {
            dispatch(setNavigatorLoadingStatus(status));
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        setSelectedTarget: target => {
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
        handleDesktopToggle: open => {
            dispatch(drawerToggleAction(open));
        },
        setShareUserPopover: e => {
            dispatch(setShareUserPopover(e));
        },
        openResave: key => {
            dispatch(openResaveDialog(key));
        },
        openCompressDialog: () => {
            dispatch(openCompressDialog());
        }
    };
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const sortOptions = [
    "文件名称正序",
    "文件名称倒序",
    "上传时间正序",
    "上传时间倒序",
    "文件大小正序",
    "文件大小倒序"
];

const styles = theme => ({
    container: {
        [theme.breakpoints.down("xs")]: {
            display: "none"
        },
        height: "49px",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper
    },
    navigatorContainer: {
        display: "flex",
        justifyContent: "space-between"
    },
    nav: {
        height: "48px",
        padding: "5px 15px",
        display: "flex"
    },
    optionContainer: {
        paddingTop: "6px",
        marginRight: "10px"
    },
    rightIcon: {
        marginTop: "6px",
        verticalAlign: "top",
        color: "#868686"
    },
    expandMore: {
        color: "#8d8d8d"
    },
    sideButton: {
        padding: "8px",
        marginRight: "5px"
    },
    roundBorder: {
        borderRadius: "4px 4px 0 0"
    }
});

class NavigatorComponent extends Component {
    keywords = "";
    currentID = 0;

    state = {
        hidden: false,
        hiddenFolders: [],
        folders: [],
        anchorEl: null,
        hiddenMode: false,
        anchorHidden: null,
        anchorSort: null,
        selectedIndex: 0
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
                    : this.props.path.substr(1).split("/")
        });
        let newPath = path !== null ? path : this.props.path;
        const apiURL = this.props.share
            ? "/share/list/" + this.props.share.key
            : this.keywords === ""
            ? "/directory"
            : "/file/search/";
        newPath = this.keywords === "" ? newPath : this.keywords;

        API.get(apiURL + encodeURIComponent(newPath))
            .then(response => {
                this.currentID = response.data.parent;
                this.props.updateFileList(response.data.objects);
                this.props.setNavigatorLoadingStatus(false);
                const pathTemp = (path !== null
                    ? path.substr(1).split("/")
                    : this.props.path.substr(1).split("/")
                ).join(",");
                setCookie("path_tmp", encodeURIComponent(pathTemp), 1);
                if (this.keywords === "") {
                    setGetParameter("path", encodeURIComponent(newPath));
                }
            })
            .catch(error => {
                this.props.setNavigatorError(true, error);
            });

        this.checkOverFlow(true);
    };

    redresh = path => {
        this.props.setNavigatorLoadingStatus(true);
        this.props.setNavigatorError(false, "error");
        this.renderPath(path);
    };

    UNSAFE_componentWillReceiveProps = nextProps => {
        if (this.props.keywords !== nextProps.keywords) {
            this.keywords = nextProps.keywords;
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

    checkOverFlow = force => {
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

    showHiddenPath = e => {
        this.setState({ anchorHidden: e.currentTarget });
    };

    showSortOptions = e => {
        this.setState({ anchorSort: e.currentTarget });
    };

    performAction = e => {
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
                path: presentPath.length === 1 ? "/" : presentPath.join("/")
            }
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

    toggleViewMethod = () => {
        const newMethod =
            this.props.viewMethod === "icon"
                ? "list"
                : this.props.viewMethod === "list"
                ? "smallIcon"
                : "icon";
        Auth.SetPreference("view_method", newMethod);
        this.props.changeView(newMethod);
    };

    handleMenuItemClick = (e, index) => {
        this.setState({ selectedIndex: index, anchorEl: null });
        const optionsTable = {
            0: "namePos",
            1: "nameRev",
            2: "timePos",
            3: "timeRev",
            4: "sizePos",
            5: "sizeRes"
        };
        this.props.changeSort(optionsTable[index]);
        this.handleClose();
    };

    render() {
        const { classes } = this.props;
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
                    刷新
                </MenuItem>
                {this.props.keywords === "" && isHomePage && (
                    <div>
                        <Divider />
                        <MenuItem onClick={() => this.performAction("share")}>
                            <ListItemIcon>
                                <ShareIcon />
                            </ListItemIcon>
                            分享
                        </MenuItem>
                        {user.group.compress && (
                            <MenuItem
                                onClick={() => this.performAction("compress")}
                            >
                                <ListItemIcon>
                                    <Archive />
                                </ListItemIcon>
                                压缩
                            </MenuItem>
                        )}
                        <Divider />
                        <MenuItem
                            onClick={() => this.performAction("newfolder")}
                        >
                            <ListItemIcon>
                                <NewFolderIcon />
                            </ListItemIcon>
                            创建文件夹
                        </MenuItem>
                        <MenuItem onClick={() => this.performAction("newFile")}>
                            <ListItemIcon>
                                <FilePlus />
                            </ListItemIcon>
                            创建文件
                        </MenuItem>
                    </div>
                )}
            </Menu>
        );

        return (
            <div
                className={classNames(
                    {
                        [classes.roundBorder]: this.props.isShare
                    },
                    classes.container
                )}
            >
                <div className={classes.navigatorContainer}>
                    <div className={classes.nav} ref={this.element}>
                        <span>
                            <PathButton
                                folder="/"
                                path="/"
                                onClick={e => this.navigateTo(e, -1)}
                            />
                            <RightIcon className={classes.rightIcon} />
                        </span>
                        {this.state.hiddenMode && (
                            <span>
                                <PathButton
                                    more
                                    title="显示路径"
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
                                {/* <Button component="span" onClick={(e)=>this.navigateTo(e,this.state.folders.length-1)}>
                                    {this.state.folders.slice(-1)}  
                                    <ExpandMore className={classes.expandMore}/>
                                </Button> */}
                                <PathButton
                                    folder={this.state.folders.slice(-1)}
                                    path={
                                        "/" +
                                        this.state.folders
                                            .slice(0, -1)
                                            .join("/")
                                    }
                                    last={true}
                                    onClick={e =>
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
                                                onClick={e =>
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
                        {this.props.viewMethod === "icon" && (
                            <IconButton
                                title="列表展示"
                                className={classes.sideButton}
                                onClick={this.toggleViewMethod}
                            >
                                <ViewListIcon fontSize="small" />
                            </IconButton>
                        )}
                        {this.props.viewMethod === "list" && (
                            <IconButton
                                title="小图标展示"
                                className={classes.sideButton}
                                onClick={this.toggleViewMethod}
                            >
                                <ViewSmallIcon fontSize="small" />
                            </IconButton>
                        )}
                        {this.props.viewMethod === "smallIcon" && (
                            <IconButton
                                title="大图标展示"
                                className={classes.sideButton}
                                onClick={this.toggleViewMethod}
                            >
                                <ViewModuleIcon fontSize="small" />
                            </IconButton>
                        )}

                        <IconButton
                            title="排序方式"
                            className={classes.sideButton}
                            onClick={this.showSortOptions}
                        >
                            <TextTotateVerticalIcon fontSize="small" />
                        </IconButton>
                        <Menu
                            id="sort-menu"
                            anchorEl={this.state.anchorSort}
                            open={Boolean(this.state.anchorSort)}
                            onClose={this.handleClose}
                        >
                            {sortOptions.map((option, index) => (
                                <MenuItem
                                    key={option}
                                    selected={
                                        index === this.state.selectedIndex
                                    }
                                    onClick={event =>
                                        this.handleMenuItemClick(event, index)
                                    }
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </Menu>
                        {this.props.share && (
                            <IconButton
                                title={
                                    "由 " +
                                    this.props.share.creator.nick +
                                    " 创建"
                                }
                                className={classes.sideButton}
                                onClick={e =>
                                    this.props.setShareUserPopover(
                                        e.currentTarget
                                    )
                                }
                                style={{ padding: 5 }}
                            >
                                <Avatar
                                    style={{ height: 23, width: 23 }}
                                    src={
                                        "/api/v3/user/avatar/" +
                                        this.props.share.creator.key +
                                        "/s"
                                    }
                                />
                            </IconButton>
                        )}
                    </div>
                </div>
                <Divider />
            </div>
        );
    }
}

NavigatorComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired
};

const Navigator = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(NavigatorComponent)));

export default Navigator;

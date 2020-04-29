import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    navitateTo,
    changeContextMenu,
    navitateUp,
    setSelectedTarget,
    openRemoveDialog,
    changeSortMethod, refreshFileList
} from "../../actions/index";
import ObjectIcon from "./ObjectIcon";
import ContextMenu from "./ContextMenu";
import EmptyIcon from "@material-ui/icons/Unarchive";
import SadIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import classNames from "classnames";
import ImgPreivew from "./ImgPreview";
import UpIcon from "@material-ui/icons/ArrowUpward";
import pathHelper from "../../untils/page";
import { isMac } from "../../untils" 
import { withRouter } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    withStyles,
    Typography,
    Grid,
    CircularProgress,
    Paper,
    Button
} from "@material-ui/core";
import { GlobalHotKeys,  configure } from "react-hotkeys";
import TableSortLabel from "@material-ui/core/TableSortLabel";

const styles = theme => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: "center",
        color: theme.palette.text.secondary,
        margin: "10px"
    },
    root: {
        flexGrow: 1,
        padding: "10px",
        overflowY: "auto",
        height: "calc(100vh - 113px)",
        [theme.breakpoints.up("sm")]: {
            overflowY: "auto",
            height: "calc(100vh - 113px)"
        },
        [theme.breakpoints.down("sm")]: {
            height: "100%"
        }
    },
    rootTable: {
        padding: "0px",
        backgroundColor: theme.palette.background.paper.white,
        [theme.breakpoints.up("sm")]: {
            overflowY: "auto",
            height: "calc(100vh - 113px)"
        },
        [theme.breakpoints.down("sm")]: {
            height: "100%"
        }
    },
    typeHeader: {
        margin: "10px 25px",
        color: "#6b6b6b",
        fontWeight: "500"
    },
    loading: {
        justifyContent: "center",
        display: "flex",
        marginTop: "40px"
    },
    errorBox: {
        padding: theme.spacing(4)
    },
    errorMsg: {
        marginTop: "10px"
    },
    emptyContainer: {
        bottom: "0",
        height: "300px",
        margin: "50px auto",
        width: "300px",
        color: theme.palette.text.disabled,
        textAlign: "center",
        paddingTop: "20px"
    },
    emptyIcon: {
        fontSize: "160px"
    },
    emptyInfoBig: {
        fontSize: "25px",
        color: theme.palette.text.disabled
    },
    emptyInfoSmall: {
        color: theme.palette.text.hint
    },
    hideAuto: {
        [theme.breakpoints.down("sm")]: {
            display: "none"
        }
    },
    flexFix: {
        minWidth: 0
    },
    upButton: {
        marginLeft: "20px",
        marginTop: "10px",
        marginBottom: "10px"
    },
    clickAway: {
        height: "100%",
        width: "100%"
    },
    rootShare: {
        height: "100%",
        minHeight: 500
    },
    visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 20,
        width: 1
    }
});

const mapStateToProps = state => {
    return {
        path: state.navigator.path,
        drawerDesktopOpen: state.viewUpdate.open,
        viewMethod: state.viewUpdate.explorerViewMethod,
        sortMethod: state.viewUpdate.sortMethod,
        fileList: state.explorer.fileList,
        dirList: state.explorer.dirList,
        loading: state.viewUpdate.navigatorLoading,
        navigatorError: state.viewUpdate.navigatorError,
        navigatorErrorMsg: state.viewUpdate.navigatorErrorMsg,
        keywords: state.explorer.keywords,
        selected: state.explorer.selected
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigateToPath: path => {
            dispatch(navitateTo(path));
        },

        changeContextMenu: (type, open) => {
            dispatch(changeContextMenu(type, open));
        },
        navitateUp: () => {
            dispatch(navitateUp());
        },
        setSelectedTarget: targets => {
            dispatch(setSelectedTarget(targets));
        },
        openRemoveDialog: () => {
            dispatch(openRemoveDialog());
        },
        changeSort: method => {
            dispatch(changeSortMethod(method));
        }
    };
};

class ExplorerCompoment extends Component {
    constructor() {
        super();
        this.keyMap = {
            DELETE_FILE: "del",
            SELECT_ALL: `${isMac() ? 'command' : 'ctrl'}+a`
        };

        this.handlers = {
            DELETE_FILE: () => {
                if (this.props.selected.length > 0 && !this.props.share) {
                    this.props.openRemoveDialog();
                }
            },
            SELECT_ALL: e => {
                e.preventDefault();
                if (
                    this.props.selected.length >=
                    this.props.dirList.length + this.props.fileList.length
                ) {
                    this.props.setSelectedTarget([]);
                } else {
                    this.props.setSelectedTarget([
                        ...this.props.dirList,
                        ...this.props.fileList
                    ]);
                }
            }
        };

        configure({
            ignoreTags: ['input', 'select', 'textarea'],
        })
    }

    contextMenu = e => {
        e.preventDefault();
        if (
            this.props.keywords === null &&
            !pathHelper.isSharePage(this.props.location.pathname)
        ) {
            if (!this.props.loading) {
                this.props.changeContextMenu("empty", true);
            }
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.away = 0;
    }

    ClickAway = e => {
        let element = e.target;
        if (element.dataset.clickaway) {
            this.props.setSelectedTarget([]);
        }
    };

    render() {
        const { classes } = this.props;
        const isHomePage = pathHelper.isHomePage(this.props.location.pathname);

        return (
            <div
                onContextMenu={this.contextMenu}
                onClick={this.ClickAway}
                data-clickAway={"true"}
                className={classNames(
                    {
                        [classes.root]: this.props.viewMethod !== "list",
                        [classes.rootTable]: this.props.viewMethod === "list",
                        [classes.rootShare]: this.props.share
                    },
                    classes.button
                )}
            >
                <GlobalHotKeys handlers={this.handlers} keyMap={this.keyMap} />
                <ContextMenu share={this.props.share} />
                <ImgPreivew />
                {this.props.navigatorError && (
                    <Paper elevation={1} className={classes.errorBox}>
                        <Typography variant="h5" component="h3">
                            :( 请求时出现错误
                        </Typography>
                        <Typography
                            color={"textSecondary"}
                            className={classes.errorMsg}
                        >
                            {this.props.navigatorErrorMsg.message}
                        </Typography>
                    </Paper>
                )}

                {this.props.loading && !this.props.navigatorError && (
                    <div className={classes.loading}>
                        <CircularProgress />
                    </div>
                )}

                {this.props.keywords === null &&
                    isHomePage &&
                    this.props.dirList.length === 0 &&
                    this.props.fileList.length === 0 &&
                    !this.props.loading &&
                    !this.props.navigatorError && (
                        <div className={classes.emptyContainer}>
                            <EmptyIcon className={classes.emptyIcon} />
                            <div className={classes.emptyInfoBig}>
                                拖拽文件至此
                            </div>
                            <div className={classes.emptyInfoSmall}>
                                或点击右下方“上传文件”按钮添加文件
                            </div>
                        </div>
                    )}
                {((this.props.keywords !== null &&
                    this.props.dirList.length === 0 &&
                    this.props.fileList.length === 0 &&
                    !this.props.loading &&
                    !this.props.navigatorError) ||
                    (this.props.dirList.length === 0 &&
                        this.props.fileList.length === 0 &&
                        !this.props.loading &&
                        !this.props.navigatorError &&
                        !isHomePage)) && (
                    <div className={classes.emptyContainer}>
                        <SadIcon className={classes.emptyIcon} />
                        <div className={classes.emptyInfoBig}>
                            什么都没有找到
                        </div>
                    </div>
                )}

                {this.props.viewMethod !== "list" &&
                    (this.props.dirList.length !== 0 ||
                        this.props.fileList.length !== 0) &&
                    !this.props.loading && (
                        <div className={classes.flexFix}>
                            {this.props.dirList.length !== 0 &&
                                !this.props.loading && (
                                    <div>
                                        <Typography
                                            data-clickAway={"true"}
                                            variant="body2"
                                            className={classes.typeHeader}
                                        >
                                            文件夹
                                        </Typography>
                                        <Grid
                                            data-clickAway={"true"}
                                            container
                                            spacing={0}
                                            alignItems="flex-start"
                                        >
                                            {this.props.dirList.map(
                                                (value, index) => (
                                                    <Grid
                                                        item
                                                        xs={6}
                                                        md={3}
                                                        sm={4}
                                                        lg={2}
                                                    >
                                                        <ObjectIcon
                                                            file={value}
                                                        />
                                                    </Grid>
                                                )
                                            )}
                                        </Grid>
                                    </div>
                                )}
                            {this.props.fileList.length !== 0 &&
                                !this.props.loading && (
                                    <div>
                                        <Typography
                                            data-clickAway={"true"}
                                            variant="body2"
                                            className={classes.typeHeader}
                                        >
                                            文件
                                        </Typography>
                                        <Grid
                                            data-clickAway={"true"}
                                            container
                                            spacing={0}
                                            alignItems="flex-start"
                                        >
                                            {this.props.fileList.map(
                                                (value, index) => (
                                                    <Grid
                                                        item
                                                        xs={6}
                                                        md={3}
                                                        sm={4}
                                                        lg={2}
                                                    >
                                                        <ObjectIcon
                                                            file={value}
                                                        />
                                                    </Grid>
                                                )
                                            )}
                                        </Grid>
                                    </div>
                                )}
                        </div>
                    )}

                {this.props.viewMethod === "list" &&
                    (this.props.dirList.length !== 0 ||
                        this.props.fileList.length !== 0) &&
                    !this.props.loading && (
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={
                                                this.props.sortMethod ===
                                                    "namePos" ||
                                                this.props.sortMethod ===
                                                    "nameRev"
                                            }
                                            direction={
                                                this.props.sortMethod ===
                                                "namePos"
                                                    ? "asc"
                                                    : "des"
                                            }
                                            onClick={() => {
                                                this.props.changeSort(
                                                    this.props.sortMethod ===
                                                        "namePos"
                                                        ? "nameRev"
                                                        : "namePos"
                                                );
                                            }}
                                        >
                                            名称
                                            {this.props.sortMethod ===
                                                "namePos" ||
                                            this.props.sortMethod ===
                                                "nameRev" ? (
                                                <span
                                                    className={
                                                        classes.visuallyHidden
                                                    }
                                                >
                                                    {this.props.sortMethod ===
                                                    "nameRev"
                                                        ? "sorted descending"
                                                        : "sorted ascending"}
                                                </span>
                                            ) : null}
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell className={classes.hideAuto}>
                                        <TableSortLabel
                                            active={
                                                this.props.sortMethod ===
                                                "sizePos" ||
                                                this.props.sortMethod ===
                                                "sizeRes"
                                            }
                                            direction={
                                                this.props.sortMethod ===
                                                "sizePos"
                                                    ? "asc"
                                                    : "des"
                                            }
                                            onClick={() => {
                                                this.props.changeSort(
                                                    this.props.sortMethod ===
                                                    "sizePos"
                                                        ? "sizeRes"
                                                        : "sizePos"
                                                );
                                            }}
                                        >
                                            大小
                                            {this.props.sortMethod ===
                                            "sizePos" ||
                                            this.props.sortMethod ===
                                            "sizeRes" ? (
                                                <span
                                                    className={
                                                        classes.visuallyHidden
                                                    }
                                                >
                                                    {this.props.sortMethod ===
                                                    "sizeRes"
                                                        ? "sorted descending"
                                                        : "sorted ascending"}
                                                </span>
                                            ) : null}
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell className={classes.hideAuto}>
                                        <TableSortLabel
                                            active={
                                                this.props.sortMethod ===
                                                "timePos" ||
                                                this.props.sortMethod ===
                                                "timeRev"
                                            }
                                            direction={
                                                this.props.sortMethod ===
                                                "timePos"
                                                    ? "asc"
                                                    : "des"
                                            }
                                            onClick={() => {
                                                this.props.changeSort(
                                                    this.props.sortMethod ===
                                                    "timePos"
                                                        ? "timeRev"
                                                        : "timePos"
                                                );
                                            }}
                                        >
                                            日期
                                            {this.props.sortMethod ===
                                            "timePos" ||
                                            this.props.sortMethod ===
                                            "timeRev" ? (
                                                <span
                                                    className={
                                                        classes.visuallyHidden
                                                    }
                                                >
                                                    {this.props.sortMethod ===
                                                    "sizeRes"
                                                        ? "sorted descending"
                                                        : "sorted ascending"}
                                                </span>
                                            ) : null}
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pathHelper.isMobile() &&
                                    this.props.path !== "/" && (
                                        <ObjectIcon
                                            file={{
                                                type: "up",
                                                name: "上级目录"
                                            }}
                                        />
                                    )}
                                {this.props.dirList.map((value, index) => (
                                    <ObjectIcon file={value} />
                                ))}
                                {this.props.fileList.map((value, index) => (
                                    <ObjectIcon file={value} />
                                ))}
                            </TableBody>
                        </Table>
                    )}
            </div>
        );
    }
}

ExplorerCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired
};

const Explorer = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(ExplorerCompoment)));

export default Explorer;

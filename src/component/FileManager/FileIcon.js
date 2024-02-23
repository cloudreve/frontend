import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ContentLoader from "react-content-loader";
import { baseURL } from "../../middleware/Api";
import {
    ButtonBase,
    Divider,
    fade,
    Tooltip,
    Typography,
    withStyles,
} from "@material-ui/core";
import TypeIcon from "./TypeIcon";
import { withRouter } from "react-router";
import pathHelper from "../../utils/page";
import statusHelper from "../../utils/page";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import Grow from "@material-ui/core/Grow";
import FileName from "./FileName";

const styles = (theme) => ({
    container: {},

    selected: {
        "&:hover": {
            border: "1px solid #d0d0d0",
        },
        backgroundColor: fade(
            theme.palette.primary.main,
            theme.palette.type === "dark" ? 0.3 : 0.18
        ),
    },

    notSelected: {
        "&:hover": {
            backgroundColor: theme.palette.background.default,
            border: "1px solid #d0d0d0",
        },
        backgroundColor: theme.palette.background.paper,
    },

    button: {
        border: "1px solid " + theme.palette.divider,
        width: "100%",
        borderRadius: theme.shape.borderRadius,
        boxSizing: "border-box",
        transition:
            "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        alignItems: "initial",
        display: "initial",
    },
    folderNameSelected: {
        color:
            theme.palette.type === "dark" ? "#fff" : theme.palette.primary.dark,
        fontWeight: "500",
    },
    folderNameNotSelected: {
        color: theme.palette.text.secondary,
    },
    folderName: {
        marginTop: "15px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
        marginRight: "20px",
    },
    preview: {
        overflow: "hidden",
        height: "150px",
        width: "100%",
        borderRadius: "12px 12px 0 0",
        backgroundColor: theme.palette.background.default,
    },
    previewIcon: {
        overflow: "hidden",
        height: "149px",
        width: "100%",
        borderRadius: "12px 12px 0 0",
        backgroundColor: theme.palette.background.paper,
        paddingTop: "50px",
    },
    iconBig: {
        fontSize: 50,
    },
    picPreview: {
        objectFit: "cover",
        width: "100%",
        height: "100%",
    },
    fileInfo: {
        height: "50px",
        display: "flex",
    },
    icon: {
        margin: "10px 10px 10px 16px",
        height: "30px",
        minWidth: "30px",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "90%",
        paddingTop: "3px",
        color: theme.palette.text.secondary,
    },
    hide: {
        display: "none",
    },
    loadingAnimation: {
        borderRadius: "12px 12px 0 0",
        height: "100%",
        width: "100%",
    },
    shareFix: {
        marginLeft: "20px",
    },
    checkIcon: {
        color: theme.palette.primary.main,
    },
    noDrag: {
        userDrag: "none",
    },
});

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected,
        shareInfo: state.viewUpdate.shareInfo,
    };
};

const mapDispatchToProps = () => {
    return {};
};

class FileIconCompoment extends Component {
    static defaultProps = {
        share: false,
    };

    state = {
        loading: false,
        showPicIcon: false,
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const isSelectedCurrent =
            this.props.selected.findIndex((value) => {
                return value === this.props.file;
            }) !== -1;
        const isSelectedNext =
            nextProps.selected.findIndex((value) => {
                return value === this.props.file;
            }) !== -1;
        if (
            nextProps.selected !== this.props.selected &&
            isSelectedCurrent === isSelectedNext
        ) {
            return false;
        }

        return true;
    }

    render() {
        const { classes } = this.props;
        const isSelected =
            this.props.selected.findIndex((value) => {
                return value === this.props.file;
            }) !== -1;
        const isSharePage = pathHelper.isSharePage(
            this.props.location.pathname
        );
        const isMobile = statusHelper.isMobile();

        return (
            <div className={classes.container}>
                <ButtonBase
                    focusRipple
                    className={classNames(
                        {
                            [classes.selected]: isSelected,
                            [classes.notSelected]: !isSelected,
                        },
                        classes.button
                    )}
                >
                    {this.props.file.thumb && !this.state.showPicIcon && (
                            <div className={classes.preview}>
                                <LazyLoadImage
                                    className={classNames(
                                        {
                                            [classes.hide]: this.state.loading,
                                            [classes.picPreview]:
                                                !this.state.loading,
                                        },
                                        classes.noDrag
                                    )}
                                    src={
                                        baseURL +
                                        (isSharePage && this.props.shareInfo
                                            ? "/share/thumb/" +
                                              this.props.shareInfo.key +
                                              "/" +
                                              this.props.file.id +
                                              "?path=" +
                                              encodeURIComponent(
                                                  this.props.file.path
                                              )
                                            : "/file/thumb/" + this.props.file.id)
                                    }
                                    afterLoad={() =>
                                        this.setState({ loading: false })
                                    }
                                    beforeLoad={() =>
                                        this.setState({ loading: true })
                                    }
                                    onError={() =>
                                        this.setState({ showPicIcon: true })
                                    }
                                />
                                <ContentLoader
                                    height={150}
                                    width={170}
                                    className={classNames(
                                        {
                                            [classes.hide]: !this.state.loading,
                                        },
                                        classes.loadingAnimation
                                    )}
                                >
                                <rect x="0" y="0" width="100%" height="150" />
                                </ContentLoader>
                            </div>
                        )}
                    {(!this.props.file.thumb || this.state.showPicIcon) && (
                        <div className={classes.previewIcon}>
                            <TypeIcon
                                className={classes.iconBig}
                                fileName={this.props.file.name}
                            />
                        </div>
                    )}
                    {(!this.props.file.thumb || this.state.showPicIcon) && (
                        <Divider />
                    )}
                    <div className={classes.fileInfo}>
                        {!this.props.share && (
                            <div
                                onClick={this.props.onIconClick}
                                className={classNames(classes.icon, {
                                    [classes.iconSelected]: isSelected,
                                    [classes.iconNotSelected]: !isSelected,
                                })}
                            >
                                {!isSelected && (
                                    <TypeIcon fileName={this.props.file.name} />
                                )}
                                {isSelected && (
                                    <Grow in={isSelected}>
                                        <CheckCircleRoundedIcon
                                            className={classes.checkIcon}
                                        />
                                    </Grow>
                                )}
                            </div>
                        )}
                        <Tooltip
                            title={this.props.file.name}
                            aria-label={this.props.file.name}
                        >
                            <Typography
                                variant="body2"
                                className={classNames(classes.folderName, {
                                    [classes.folderNameSelected]: isSelected,
                                    [classes.folderNameNotSelected]: !isSelected,
                                    [classes.shareFix]: this.props.share,
                                })}
                            >
                                <FileName name={this.props.file.name} />
                            </Typography>
                        </Tooltip>
                    </div>
                </ButtonBase>
            </div>
        );
    }
}

FileIconCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
};

const FileIcon = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(FileIconCompoment)));

export default FileIcon;

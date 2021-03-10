import {
    ButtonBase,
    Divider,
    Tooltip,
    Typography,
    withStyles,
    fade
} from "@material-ui/core";
import { lighten } from "@material-ui/core/styles";
import classNames from "classnames";
import PropTypes from "prop-types";
import React, {Component} from "react";
import ContentLoader from "react-content-loader";
import {LazyLoadImage} from "react-lazy-load-image-component";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {baseURL} from "../../middleware/Api";
import pathHelper from "../../utils/page";
import TypeIcon from "./TypeIcon";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import statusHelper from "../../utils/page";
import Grow from "@material-ui/core/Grow";

const styles = theme => ({
    container: {
        padding: "7px"
    },

    selected: {
        "&:hover": {
            border: "1px solid #d0d0d0"
        },
        backgroundColor: fade(
            theme.palette.primary.main,
            theme.palette.type === "dark" ? 0.3 : 0.18
        )
    },
    picSelected: {
        "&:hover": {
            border: "1px solid #d0d0d0"
        },
        // backgroundColor:
        //     theme.palette.type === "dark"
        //         ? "#fff"
        //         : lighten(theme.palette.primary.main, 0.8),

        padding: "8px",
        border: "solid 1px #d0d0d0",
        backgroundColor: "#3f51b58f",
    },

    notSelected: {
        "&:hover": {
            backgroundColor: theme.palette.background.default,
            border: "1px solid #d0d0d0"
        },
        backgroundColor: theme.palette.background.paper
    },

    button: {
        border: "1px solid " + theme.palette.divider,
        width: "100%",
        borderRadius: "6px",
        boxSizing: "border-box",
        transition:
            "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        alignItems: "initial",
        display: "initial"
    },
    folderNameSelected: {
        color:
            theme.palette.type === "dark" ? "#fff" : theme.palette.primary.dark,
        fontWeight: "500"
    },
    folderNameNotSelected: {
        color: theme.palette.text.secondary
    },
    folderName: {
        marginTop: "15px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
        marginRight: "20px"
    },
    preview: {
        overflow: "hidden",
        height: "150px",
        width: "100%",
        borderRadius: "6px 6px 0 0",
        backgroundColor: theme.palette.background.default
    },
    previewIcon: {
        overflow: "hidden",
        height: "149px",
        width: "100%",
        borderRadius: "5px 5px 0 0",
        backgroundColor: theme.palette.background.paper,
        paddingTop: "50px"
    },
    iconBig: {
        fontSize: 50
    },
    picPreview: {
        objectFit: "cover",
        width: "100%",
        height: "100%"
    },
    fileInfo: {
        height: "50px",
        display: "flex"
    },
    icon: {
        margin: "10px 10px 10px 16px",
        height: "30px",
        minWidth: "30px",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "90%",
        paddingTop: "3px",
        color: theme.palette.text.secondary
    },
    hide: {
        display: "none"
    },
    loadingAnimation: {
        borderRadius: "6px 6px 0 0",
        height: "100%",
        width: "100%"
    },
    shareFix: {
        marginLeft: "20px"    },
    hiddenTitle:{
        display: "none"
    },
    resetPicParentContainer:{
        borderRadius: 0,
        height: "auto"
    },
    resetPicStyle: {
        position: "absolute",
        top:"0px",
        left:"0px",
        width:"100%",
        verticalAlign: "bottom"
    },
checkIcon: {
        color: theme.palette.primary.main
    }
});

const mapStateToProps = state => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected
    };
};

const mapDispatchToProps = () => {
    return {};
};

class FileIconCompoment extends Component {
    static defaultProps = {
        share: false
    };

    state = {
        loading: false,
        showPicIcon: false
    };

    render() {
        const { classes } = this.props;
        const isSelected =
            this.props.selected.findIndex(value => {
                return value === this.props.file;
            }) !== -1;
        const isSharePage = pathHelper.isSharePage(
            this.props.location.pathname
        );
        const isMobile = statusHelper.isMobile();

        const isPhotos = this.props.file.pic !== "" &&
            !this.state.showPicIcon &&
            this.props.file.pic !== " " &&
            this.props.file.pic !== "null,null";

        const viewMethod = this.props.viewMethod;
        const picArr = this.props.file.pic.split(',')
        const picPaddingBottom = picArr.length == 2 ? parseInt(picArr[1]) / parseInt(picArr[0]) * 100 : 0;
        const showPhotoAlbum = (viewMethod == "photoAlbum" && picPaddingBottom > 0) ? true : false;

        return (
            <div
                className={classNames({[classes.container]: !showPhotoAlbum})}
            >
                <ButtonBase
                    focusRipple
                    className={classNames(
                        {
                            [classes.selected]: !showPhotoAlbum && isSelected,
                            [classes.notSelected]:!showPhotoAlbum && !isSelected
                        },
                        classes.button
                    )}
                >
                    {this.props.file.pic !== "" &&
                        !this.state.showPicIcon &&
                        this.props.file.pic !== " " &&
                        this.props.file.pic !== "null,null" && (
                            <div className={classNames(classes.preview,{[classes.resetPicParentContainer]: showPhotoAlbum})} >
                                {showPhotoAlbum && (
                                    <i style={{display: "block", paddingBottom:picPaddingBottom+"%"}}></i>
                                )}
                                <LazyLoadImage
                                    className={classNames({
                                        [classes.hide]: this.state.loading,
                                        [classes.picPreview]: !this.state
                                            .loading
                                    },
                                        {
                                            [classes.picSelected]: isSelected,
                                            [classes.notSelected]: !isSelected,
                                            [classes.resetPicStyle]: showPhotoAlbum
                                        }
                                    )}
                                    src={
                                        baseURL +
                                        (isSharePage
                                            ? "/share/thumb/" +
                                              window.shareInfo.key +
                                              "/" +
                                              this.props.file.id +
                                              "?path=" +
                                              encodeURIComponent(
                                                  this.props.file.path
                                              )
                                            : "/file/thumb/" +
                                              this.props.file.id)
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
                                            [classes.hide]: !this.state.loading
                                        },
                                        classes.loadingAnimation
                                    )}
                                >
                                    <rect
                                        x="0"
                                        y="0"
                                        width="100%"
                                        height="150"
                                    />
                                </ContentLoader>
                            </div>
                        )}
                    {(this.props.file.pic === "" ||
                        this.state.showPicIcon ||
                        this.props.file.pic === " " ||
                        this.props.file.pic === "null,null") && (
                        <div className={classes.previewIcon}>
                            <TypeIcon
                                className={classes.iconBig}
                                fileName={this.props.file.name}
                            />
                        </div>
                    )}
                    {(this.props.file.pic === "" ||
                        this.state.showPicIcon ||
                        this.props.file.pic === " " ||
                        this.props.file.pic === "null,null") && <Divider />}
                    <div className={classNames(classes.fileInfo, {[classes.hiddenTitle]:showPhotoAlbum && isPhotos})}>
                        {!this.props.share && (
                            <div
                                onClick={this.props.onIconClick}
                                className={classNames(classes.icon, {
                                    [classes.iconSelected]: isSelected,
                                    [classes.iconNotSelected]: !isSelected
                                })}
                            >
                                {(!isSelected || !isMobile) && (
                                    <TypeIcon fileName={this.props.file.name} />
                                )}
                                {isSelected && isMobile && (
                                    <Grow in={isSelected && isMobile}>
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
                                    [classes.shareFix]: this.props.share
                                })}
                            >
                                {this.props.file.name}
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
    file: PropTypes.object.isRequired
};

const FileIcon = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(FileIconCompoment)));

export default FileIcon;

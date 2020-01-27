import React, { Component } from "react";
import { connect } from "react-redux";
import FileIcon from "../FileManager/FileIcon";
import PreviewIcon from "@material-ui/icons/RemoveRedEye";
import InfoIcon from "@material-ui/icons/Info";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import { allowSharePreview, sizeToString } from "../../untils";
import { toggleSnackbar } from "../../actions";
import { isPreviewable } from "../../config";
import Modals from "../FileManager/Modals";
import axios from "axios";
import {
    withStyles,
    Button,
    Popper,
    Typography,
    Fade,
    Paper,
    Avatar
} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import TypeIcon from "../FileManager/TypeIcon";
const styles = theme => ({
    layout: {
        width: "auto",
        marginTop: "90px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginTop: "90px",
            marginLeft: "auto",
            marginRight: "auto"
        },
        [theme.breakpoints.down("sm")]: {
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
        },
        justifyContent: "center",
        display: "flex"
    },
    player: {
        borderRadius: "4px"
    },
    fileCotainer: {
        width: "200px",
        margin: "0 auto"
    },
    buttonCotainer: {
        width: "400px",
        margin: "0 auto",
        textAlign: "center",
        marginTop: "20px"
    },
    paper: {
        padding: theme.spacing(2)
    },
    icon: {
        borderRadius: "10%",
        marginTop:2,
    },

    box: {
        width: "100%",
        maxWidth: 440,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 12,
        boxShadow: "0 8px 16px rgba(29,39,55,.25)",
        [theme.breakpoints.down("sm")]: {
            height: "calc(100vh - 56px)",
            borderRadius: 0,
            maxWidth: 1000,
        },
        display: "flex",
        flexDirection: "column",
    },
    boxHeader: {
        textAlign: "center",
        padding: 24
    },
    avatar: {
        backgroundColor: theme.palette.secondary.main,
        margin: "0 auto",
        width: 50,
        height: 50
    },
    shareDes: {
        marginTop: 12
    },
    shareInfo: {
        color: theme.palette.text.disabled,
        fontSize: 14
    },
    boxContent: {
        padding: 24,
        display: "flex",
        flex: "1",
    },
    fileName: {
        marginLeft: 20,
    },
    fileSize:{
        color: theme.palette.text.disabled,
        fontSize: 14
    },
    boxFooter:{
        display:"flex",
        padding: "20px 16px",
        justifyContent: "space-between",
    },
    downloadButton:{
        marginLeft:8,
    },
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

const allowDownload = allowSharePreview();

class SharedFileCompoment extends Component {
    state = {
        anchorEl: null,
        open: false
    };

    preview = () => {
        if (!allowDownload) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "未登录用户无法下载",
                "warning"
            );
            return;
        }
        switch (isPreviewable(this.props.share.source.name)) {
            case "img":
                window.open(window.apiURL.preview);
                return;
            case "msDoc":
                window.open(window.apiURL.docPreiview);
                return;
            case "audio":
                //this.props.openMusicDialog();
                return;
            case "open":
                window.open(window.apiURL.preview);
                return;
            case "video":
                window.location.href =
                    "/Viewer/Video?single=true&shareKey=" +
                    window.shareInfo.shareId +
                    "&path=/" +
                    window.shareInfo.fileName;
                return;
            case "edit":
                window.location.href =
                    "/Viewer/Markdown?single=true&shareKey=" +
                    window.shareInfo.shareId +
                    "&path=/" +
                    window.shareInfo.fileName;
                return;
            default:
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "此文件无法预览",
                    "warning"
                );
                return;
        }
    };

    download = () => {
        if (!allowDownload) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "未登录用户无法下载",
                "warning"
            );
            return;
        }
        axios
            .post("/Share/getDownloadUrl", {
                key: window.shareInfo.shareId
            })
            .then(response => {
                if (response.data.error !== 0) {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.msg,
                        "warning"
                    );
                } else {
                    window.location.href = response.data.result;
                }
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    handleOpen = event => {
        const { currentTarget } = event;
        this.setState(state => ({
            anchorEl: currentTarget,
            open: !state.open
        }));
    };

    getSecondDes = () => {
        if (this.props.share.expire > 0) {
            if (this.props.share.expire >= 24 * 3600) {
                return (
                    Math.round(this.props.share.expire / (24 * 3600)) +
                    " 天后到期"
                );
            }
            return Math.round(this.props.share.expire / 3600) + " 小时后到期";
        }
        return this.props.share.create_date;
    };

    render() {
        const { classes } = this.props;
        const file = {
            name: this.props.share.source.name,
            path: "/",
            type: "file",
            pic: ""
        };
        const id = this.state.open ? "simple-popper" : null;

        return (
            <div className={classes.layout}>
                <Modals />
                <div className={classes.box}>
                    <div className={classes.boxHeader}>
                        <Avatar
                            className={classes.avatar}
                            alt={this.props.share.creator.nick}
                            src={
                                "/Member/Avatar/1/" +
                                this.props.share.creator.key
                            }
                        />
                        <Typography variant="h6" className={classes.shareDes}>
                            {this.props.share.creator.nick} 向您分享了 1 个文件
                        </Typography>
                        <Typography className={classes.shareInfo}>
                            {this.props.share.views} 次浏览 • {this.props.share.downloads} 次下载
                           •{" "}
                            {this.getSecondDes()}
                        </Typography>
                    </div>
                    <Divider />
                    <div className={classes.boxContent}>
                        <TypeIcon
                            className={classes.icon}
                            isUpload
                            fileName={this.props.share.source.name}
                        />
                        <div className={classes.fileName}>
                            <Typography>
                                {this.props.share.source.name}
                            </Typography>
                            <Typography className={classes.fileSize}>
                                {sizeToString(this.props.share.source.size)}
                            </Typography>
                        </div>
                    </div>
                    <Divider/>
                    <div className={classes.boxFooter}>
                        <div className={classes.actionLeft}>
                            <Button color="secondary">保存到我的文件</Button>
                        </div>
                        <div className={classes.actions}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={this.download}
                            >
                                预览
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                className={classes.downloadButton}
                                onClick={this.download}
                            >
                              下载
                            </Button>
                        </div>
                    </div>
                </div>
                {/*<div className={classes.fileCotainer}>*/}
                {/*    <FileIcon file={file} share={true} />*/}
                {/*</div>*/}
                {/*<div className={classes.buttonCotainer}>*/}
                {/*    <Button*/}
                {/*        variant="outlined"*/}
                {/*        className={classes.button}*/}
                {/*        onClick={this.preview}*/}
                {/*    >*/}
                {/*        <PreviewIcon className={classes.icon} /> 预览*/}
                {/*    </Button>*/}
                {/*    <Button*/}
                {/*        variant="outlined"*/}
                {/*        className={classes.button}*/}
                {/*        onClick={this.handleOpen}*/}
                {/*    >*/}
                {/*        <InfoIcon className={classes.icon} /> 信息*/}
                {/*    </Button>*/}
                {/*    <Popper*/}
                {/*        id={id}*/}
                {/*        open={this.state.open}*/}
                {/*        anchorEl={this.state.anchorEl}*/}
                {/*        transition*/}
                {/*    >*/}
                {/*        {({ TransitionProps }) => (*/}
                {/*            <Fade {...TransitionProps} timeout={350}>*/}
                {/*                <Paper className={classes.paper}>*/}
                {/*                    <Typography>*/}
                {/*                        此分享被浏览{this.props.share.views}*/}
                {/*                        次，被下载{this.props.share.downloads}次*/}
                {/*                    </Typography>*/}
                {/*                </Paper>*/}
                {/*            </Fade>*/}
                {/*        )}*/}
                {/*    </Popper>*/}
                {/*</div>*/}
            </div>
        );
    }
}

const SharedFile = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(SharedFileCompoment));

export default SharedFile;

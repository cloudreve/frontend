import React, { Component } from "react";
import { connect } from "react-redux";
import FileIcon from "../FileManager/FileIcon";
import PreviewIcon from "@material-ui/icons/RemoveRedEye";
import InfoIcon from "@material-ui/icons/Info";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import { allowSharePreview, sizeToString } from "../../untils";
import {
    openMusicDialog, openResaveDialog,
    setSelectedTarget,
    showImgPreivew,
    toggleSnackbar
} from "../../actions";
import { isPreviewable } from "../../config";
import { withStyles, Button, Typography, Avatar } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import TypeIcon from "../FileManager/TypeIcon";
import Auth from "../../middleware/Auth";
import PurchaseShareDialog from "../Modals/PurchaseShare";
import API from "../../middleware/Api";
import { withRouter } from "react-router-dom";
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
            marginRight: 0
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
        marginTop: 2
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
            maxWidth: 1000
        },
        display: "flex",
        flexDirection: "column"
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
        flex: "1"
    },
    fileName: {
        marginLeft: 20
    },
    fileSize: {
        color: theme.palette.text.disabled,
        fontSize: 14
    },
    boxFooter: {
        display: "flex",
        padding: "20px 16px",
        justifyContent: "space-between"
    },
    downloadButton: {
        marginLeft: 8
    }
});
const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        openMusicDialog: () => {
            dispatch(openMusicDialog());
        },
        setSelectedTarget: targets => {
            dispatch(setSelectedTarget(targets));
        },
        showImgPreivew: first => {
            dispatch(showImgPreivew(first));
        },
        openResave: (key) => {
            dispatch(openResaveDialog(key));
        },
    };
};

const Modals = React.lazy(() => import("../FileManager/Modals"));
const ImgPreview = React.lazy(() => import("../FileManager/ImgPreview"));

class SharedFileCompoment extends Component {
    state = {
        anchorEl: null,
        open: false,
        purchaseCallback: null,
        loading: false
    };

    downloaded = false;

    preview = () => {
        switch (isPreviewable(this.props.share.source.name)) {
            case "img":
                this.props.showImgPreivew({
                    key: this.props.share.key,
                    name: this.props.share.source.name
                });
                return;
            case "msDoc":
                this.props.history.push(
                    this.props.share.key +
                    "/doc?name=" +
                    encodeURIComponent(this.props.share.source.name)
                );
                return;
            case "audio":
                this.props.setSelectedTarget([
                    {
                        key: this.props.share.key,
                        type: "share"
                    }
                ]);
                this.props.openMusicDialog();
                return;
            case "open":
                window.open(window.apiURL.preview);
                return;
            case "video":
                this.props.history.push(
                    this.props.share.key +
                        "/video?name=" +
                        encodeURIComponent(this.props.share.source.name)
                );
                return;
            case "edit":
                this.props.history.push(this.props.share.key +
                    "/text?name=" +
                    encodeURIComponent(this.props.share.source.name));
                return
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

    componentWillUnmount() {
        this.props.setSelectedTarget([]);
    }

    scoreHandle = callback => event => {
        if (this.props.share.score > 0) {
            if (!Auth.Check()) {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "登录后才能继续操作",
                    "warning"
                );
                return;
            }
            if (!Auth.GetUser().group.shareFree && !this.downloaded) {
                this.setState({
                    purchaseCallback: () => {
                        this.setState({
                            purchaseCallback: null
                        });
                        callback(event);
                    }
                });
                return;
            }
        }
        callback(event);
    };

    download = e => {
        this.setState({ loading: true });
        API.post("/share/download/" + this.props.share.key)
            .then(response => {
                this.downloaded = true;
                window.location.assign(response.data);
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "warning"
                );
            })
            .finally(() => {
                this.setState({ loading: false });
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
        const user = Auth.GetUser();
        const isLogin = Auth.Check();
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
                <ImgPreview />
                <PurchaseShareDialog
                    callback={this.state.purchaseCallback}
                    score={this.props.share.score}
                    onClose={() => this.setState({ purchaseCallback: null })}
                />
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
                            {this.props.share.views} 次浏览 •{" "}
                            {this.props.share.downloads} 次下载 •{" "}
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
                            <Typography style={{ wordBreak: "break-all" }}>
                                {this.props.share.source.name}
                            </Typography>
                            <Typography className={classes.fileSize}>
                                {sizeToString(this.props.share.source.size)}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                    <div className={classes.boxFooter}>
                        <div className={classes.actionLeft}>
                            <Button
                                onClick={()=>this.props.openResave(this.props.share.key)}
                                color="secondary"
                            >保存到我的文件</Button>
                        </div>
                        <div className={classes.actions}>
                            {this.props.share.preview && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={this.scoreHandle(this.preview)}
                                    disabled={this.state.loading}
                                >
                                    预览
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="secondary"
                                className={classes.downloadButton}
                                onClick={this.scoreHandle(this.download)}
                                disabled={this.state.loading}
                            >
                                下载
                                {this.props.share.score > 0 &&
                                    (!isLogin || !user.group.shareFree) &&
                                    " (" + this.props.share.score + "积分)"}
                                {this.props.share.score > 0 &&
                                    isLogin &&
                                    user.group.shareFree &&
                                    " (免积分)"}
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
)(withStyles(styles)(withRouter(SharedFileCompoment)));

export default SharedFile;

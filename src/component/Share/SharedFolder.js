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
import FileManager from "../FileManager/FileManager";
import Paper from "@material-ui/core/Paper";
const styles = theme => ({
    layout: {
        width: "auto",
        marginTop:30,
        marginBottom:30,
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

    },
    managerContainer:{
        flexGrow: 1,
        padding: theme.spacing(0),
        minWidth: 0,
    },

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

class SharedFolderComponent extends Component {
    state = {
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


    render() {
        const { classes } = this.props;
        const user = Auth.GetUser();
        const isLogin = Auth.Check();

        return (
            <div className={classes.layout}>
                <Paper className={classes.managerContainer}>
                    <FileManager isShare/>
                </Paper>
            </div>
        );
    }
}

const SharedFolder = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(SharedFolderComponent)));

export default SharedFolder;

import React, { Component } from "react";
import { connect } from "react-redux";
import {
    openMusicDialog,
    openResaveDialog,
    setSelectedTarget,
    setShareUserPopover,
    showImgPreivew,
    toggleSnackbar
} from "../../actions";
import { withStyles, Button, Typography, Avatar } from "@material-ui/core";
import Auth from "../../middleware/Auth";
import PurchaseShareDialog from "../Modals/PurchaseShare";
import API from "../../middleware/Api";
import { withRouter } from "react-router-dom";
import FileManager from "../FileManager/FileManager";
import Paper from "@material-ui/core/Paper";
import Popover from "@material-ui/core/Popover";
import Creator from "./Creator";
const styles = theme => ({
    layout: {
        width: "auto",
        marginTop: 30,
        marginBottom: 30,
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        },
        [theme.breakpoints.down("sm")]: {
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0
        }
    },
    managerContainer: {
        flexGrow: 1,
        padding: theme.spacing(0),
        minWidth: 0,
        overflowY: "auto"
    },
});
const mapStateToProps = state => {
    return {
        anchorEl: state.viewUpdate.shareUserPopoverAnchorEl
    };
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
        openResave: key => {
            dispatch(openResaveDialog(key));
        },
        setShareUserPopover: e => {
            dispatch(setShareUserPopover(e));
        }
    };
};

class SharedFolderComponent extends Component {
    state = {};

    componentWillMount() {
        window.shareInfo = this.props.share;
    }


    componentWillUnmount() {
        window.shareInfo = null;
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

        const id = this.props.anchorEl !== null ? "simple-popover" : undefined;

        return (
            <div className={classes.layout}>
                <Paper className={classes.managerContainer}>
                    <FileManager isShare share={this.props.share} />
                </Paper>
                <Popover
                    id={id}
                    open={this.props.anchorEl !== null}
                    anchorEl={this.props.anchorEl}
                    onClose={() => this.props.setShareUserPopover(null)}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "center"
                    }}
                >
                    <Typography>
                        <Creator isFolder share={this.props.share}/>
                    </Typography>
                </Popover>
            </div>
        );
    }
}

const SharedFolder = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(SharedFolderComponent)));

export default SharedFolder;

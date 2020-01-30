import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    LogoutVariant,
    HomeAccount,
    DesktopMacDashboard,
    AccountArrowRight,
    AccountPlus
} from "mdi-material-ui";
import {setSessionStatus, setUserPopover, toggleSnackbar} from "../../actions";
import { withRouter } from "react-router-dom";
import pathHelper from "../../untils/page";
import Auth from "../../middleware/Auth";
import {
    withStyles,
    Avatar,
    Popover,
    Typography,
    Chip,
    ListItemIcon,
    MenuItem,
    Divider
} from "@material-ui/core";
import API from "../../middleware/Api";

const mapStateToProps = state => {
    return {
        anchorEl: state.viewUpdate.userPopoverAnchorEl
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setUserPopover: anchor => {
            dispatch(setUserPopover(anchor));
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        setSessionStatus:status=>{
            dispatch(setSessionStatus(status));
        },
    };
};
const styles = theme => ({
    avatar: {
        width: "30px",
        height: "30px"
    },
    header: {
        display: "flex",
        padding: "20px 20px 20px 20px"
    },
    largeAvatar: {
        height: "90px",
        width: "90px"
    },
    info: {
        marginLeft: "10px",
        width: "139px"
    },
    badge: {
        marginTop: "10px"
    },
    visitorMenu: {
        width: 200
    }
});

class UserAvatarPopoverCompoment extends Component {
    handleClose = () => {
        this.props.setUserPopover(null);
    };

    openURL = url => {
        window.location.href = url;
    };

    sigOut = e => {
        API.delete("/user/session/")
            .then(response => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "您已退出登录",
                    "success"
                );
                Auth.signout();
                window.location.reload();
                this.props.setSessionStatus(false);
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
                this.handleClose();
            });
    };

    render() {
        const { classes } = this.props;
        const user = Auth.GetUser();
        return (
            <Popover
                open={this.props.anchorEl !== null}
                onClose={this.handleClose}
                anchorEl={this.props.anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}
            >
                {!Auth.Check() && (
                    <div className={classes.visitorMenu}>
                        <Divider />
                        <MenuItem onClick={() => this.openURL("/Login")}>
                            <ListItemIcon>
                                <AccountArrowRight />
                            </ListItemIcon>
                            登录
                        </MenuItem>
                        <MenuItem onClick={() => this.openURL("/Signup")}>
                            <ListItemIcon>
                                <AccountPlus />
                            </ListItemIcon>
                            注册
                        </MenuItem>
                    </div>
                )}
                {Auth.Check() && (
                    <div>
                        <div className={classes.header}>
                            <div className={classes.largeAvatarContainer}>
                                <Avatar
                                    className={classes.largeAvatar}
                                    src={"/Member/Avatar/" + user.id + "/l"}
                                />
                            </div>
                            <div className={classes.info}>
                                <Typography noWrap>{user.nickname}</Typography>
                                <Typography color="textSecondary" noWrap>
                                    {user.user_name}
                                </Typography>
                                <Chip
                                    className={classes.badge}
                                    color={
                                        user.group.id === 1
                                            ? "secondary"
                                            : "default"
                                    }
                                    label={user.group.name}
                                />
                            </div>
                        </div>
                        <div>
                            <Divider />
                            <MenuItem
                                onClick={() =>
                                    this.openURL("/Profile/" + user.id)
                                }
                            >
                                <ListItemIcon>
                                    <HomeAccount />
                                </ListItemIcon>
                                个人主页
                            </MenuItem>
                            {user.group.id === 1 && (
                                <MenuItem
                                    onClick={() => this.openURL("/Admin")}
                                >
                                    <ListItemIcon>
                                        <DesktopMacDashboard />
                                    </ListItemIcon>
                                    管理面板
                                </MenuItem>
                            )}

                            <MenuItem onClick={this.sigOut}>
                                <ListItemIcon>
                                    <LogoutVariant />
                                </ListItemIcon>
                                退出登录
                            </MenuItem>
                        </div>
                    </div>
                )}
            </Popover>
        );
    }
}

UserAvatarPopoverCompoment.propTypes = {
    classes: PropTypes.object.isRequired
};

const UserAvatarPopover = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(UserAvatarPopoverCompoment));

export default UserAvatarPopover;

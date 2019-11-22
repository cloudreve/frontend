import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import {
    LogoutVariant,
    HomeAccount,
    DesktopMacDashboard,
    AccountArrowRight,
    AccountPlus
} from 'mdi-material-ui'
import {
    setUserPopover
}from "../actions/index"

import {
    withStyles,
    Avatar,
    Popover,
    Typography,
    Chip,
    ListItemIcon,
    MenuItem,
    Divider,
} from '@material-ui/core';

const mapStateToProps = state => {
    return {
        anchorEl:state.viewUpdate.userPopoverAnchorEl,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setUserPopover:anchor=>{
            dispatch(setUserPopover(anchor))
        }
    }
}
const styles = theme => ({
    avatar:{
        width:"30px",
        height:"30px",
    },
    header:{
        display:"flex",
        padding: "20px 20px 20px 20px",
    },
    largeAvatar:{
        height:"90px",
        width:"90px",
    },
    info:{
        marginLeft: "10px",
        width: "139px",
    },
    badge:{
        marginTop:"10px",
    },
    visitorMenu:{
        width:200,
    }
})

class UserAvatarPopoverCompoment extends Component {




    handleClose=()=>{
        this.props.setUserPopover(null)
    }
    
    openURL = (url)=>{
        window.location.href=url;
    }

    render() {
        const { classes} = this.props;
        return (
                <Popover 
                open = {this.props.anchorEl!==null}
                onClose={this.handleClose}
                anchorEl={this.props.anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                >
                {window.userInfo.uid===-1&&
                     <div className={classes.visitorMenu}>
                     <Divider/>
                     <MenuItem onClick={()=>this.openURL("/Login")}>
                             <ListItemIcon><AccountArrowRight/></ListItemIcon>
                                 登录
                         </MenuItem>
                     <MenuItem onClick={()=>this.openURL("/Signup")}>
                         <ListItemIcon><AccountPlus/></ListItemIcon>
                             注册
                     </MenuItem>
                   </div>
                }
                {window.userInfo.uid!==-1&&
                <div>
                    <div className={classes.header}>
                        <div className={classes.largeAvatarContainer}>
                            <Avatar className={classes.largeAvatar} src={"/Member/Avatar/"+window.userInfo.uid+"/l"} />
                        </div>
                        <div className={classes.info}>
                            <Typography noWrap>{window.userInfo.nick}</Typography>
                            <Typography color="textSecondary" noWrap>{window.userInfo.email}</Typography>
                            <Chip
                                className={classes.badge}
                                color={window.userInfo.groupId === 1?"secondary":"default"}
                                label={window.userInfo.group}
                            />
                        </div>
                    </div>
                    <div>
                        <Divider/>
                        <MenuItem onClick={()=>this.openURL("/Profile/"+window.userInfo.uid)}>
                                <ListItemIcon><HomeAccount/></ListItemIcon>
                                    个人主页
                            </MenuItem>
                        {(window.userInfo.groupId === 1)&&
                            <MenuItem onClick={()=>this.openURL("/Admin")}>
                                <ListItemIcon><DesktopMacDashboard/></ListItemIcon>
                                    管理面板
                            </MenuItem>
                        }
                       
                        <MenuItem onClick={()=>this.openURL("/Member/LogOut")}>
                            <ListItemIcon><LogoutVariant/></ListItemIcon>
                                退出
                        </MenuItem>
                    </div></div>}
                </Popover>
        );
    }
}

UserAvatarPopoverCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
};

const UserAvatarPopover = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(UserAvatarPopoverCompoment))

export default UserAvatarPopover
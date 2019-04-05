import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grow from '@material-ui/core/Grow';
import { connect } from 'react-redux'
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import SettingIcon from '@material-ui/icons/Settings'
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import SaveIcon from '@material-ui/icons/Save';
import Tooltip from '@material-ui/core/Tooltip';
import {
    LogoutVariant,
    HomeAccount,
    DesktopMacDashboard,
    AccountCircle,
    AccountArrowRight,
    AccountPlus
} from 'mdi-material-ui'
import {
    openResaveDialog
}from "../actions/index"

const mapStateToProps = state => {
    return {
        selected:state.explorer.selected,
        isMultiple:state.explorer.selectProps.isMultiple,
        withFolder:state.explorer.selectProps.withFolder,
        withFile:state.explorer.selectProps.withFile,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        openResave:()=>{
            dispatch(openResaveDialog())
        }
    }
}

const styles = theme => ({
    mobileHidden:{
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
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

class UserAvatarCompoment extends Component {

    state={
        anchorEl:null,
    }

    showUserInfo = e=>{
        this.setState({
            anchorEl:e.currentTarget
        });
    }

    handleClose=()=>{
        this.setState({
            anchorEl:null,
        });
    }
    
    openURL = (url)=>{
        window.location.href=url;
    }

    render() {
        const { classes} = this.props;
        return (
            <div className={classes.mobileHidden}>
                
                <Grow in={((this.props.selected.length <=1) && !(!this.props.isMultiple&&this.props.withFile))}>
                       <div>
                       {(window.userInfo.uid!==-1 && window.isSharePage)&&<Tooltip title="保存到我的网盘"><IconButton onClick={()=>this.props.openResave()} color="inherit" 
                        >
                            <SaveIcon/>
                        </IconButton></Tooltip>}
                       {(window.userInfo.uid!==-1)&&<IconButton onClick={()=>window.location.href="/Member/Setting"} color="inherit" 
                        >
                            <SettingIcon/>
                        </IconButton>}
                      
                        <IconButton color="inherit" onClick={this.showUserInfo}>
                        {window.userInfo.uid===-1&&
                            <AccountCircle/>
                        }
                        {window.userInfo.uid!==-1&&<Avatar  src={"/Member/Avatar/"+window.userInfo.uid+"/s"} className={classes.avatar} />}
                        
                        </IconButton> </div>
                </Grow>
                <Popover 
                open = {this.state.anchorEl!==null}
                onClose={this.handleClose}
                anchorEl={this.state.anchorEl}
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
            </div>
        );
    }
}

UserAvatarCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
};

const UserAvatar = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(UserAvatarCompoment))
  
export default UserAvatar
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grow from '@material-ui/core/Grow';
import { connect } from 'react-redux'
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import SettingIcon from '@material-ui/icons/Settings'
import SaveIcon from '@material-ui/icons/Save';
import Tooltip from '@material-ui/core/Tooltip';
import UserAvatarPopover from './UserAvatarPopover';
import {
    AccountCircle,
} from 'mdi-material-ui'
import {
    openResaveDialog,
    setUserPopover
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
        },
        setUserPopover:anchor=>{
            dispatch(setUserPopover(anchor))
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
        this.props.setUserPopover(e.currentTarget);
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
              <UserAvatarPopover/>
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
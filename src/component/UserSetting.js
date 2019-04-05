import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import PhotoIcon from '@material-ui/icons/InsertPhoto'
import GroupIcon from '@material-ui/icons/Group'
import DateIcon from '@material-ui/icons/DateRange'
import EmailIcon from '@material-ui/icons/Email'
import HomeIcon from '@material-ui/icons/Home'
import LinkIcon from '@material-ui/icons/Phonelink'
import AlarmOff from '@material-ui/icons/AlarmOff'
import InputIcon from '@material-ui/icons/Input'
import SecurityIcon from '@material-ui/icons/Security'
import NickIcon from '@material-ui/icons/PermContactCalendar'
import LockIcon from '@material-ui/icons/Lock'
import VerifyIcon from '@material-ui/icons/VpnKey'
import ColorIcon from '@material-ui/icons/Palette'
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import { toggleSnackbar,}from "../actions/index"
import Typography from '@material-ui/core/Typography';
import axios from 'axios'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import List from '@material-ui/core/List';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import RightIcon from '@material-ui/icons/KeyboardArrowRight'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import blue from '@material-ui/core/colors/blue';
import yellow from '@material-ui/core/colors/yellow';
import { ListItemIcon } from '@material-ui/core';
import Backup from '@material-ui/icons/Backup'
import Switch from '@material-ui/core/Switch';
import SettingsInputHdmi from '@material-ui/icons/SettingsInputHdmi'
const styles = theme => ({

    layout: {
        width: 'auto',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
          width: 700,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
    sectionTitle:{
        paddingBottom: "10px",
        paddingTop: "30px",
    },
    rightIcon:{
        marginTop: "4px",
        marginRight: "10px",
        color:theme.palette.text.secondary,
    },
    uploadFromFile:{
        backgroundColor: blue[100],
        color: blue[600],
    },
    userGravatar:{
        backgroundColor: yellow[100],
        color: yellow[800],
    },
    infoText:{
        marginRight: "17px",
    },
    infoTextWithIcon:{
        marginRight: "17px",
        marginTop: "1px",
    },
    rightIconWithText:{
        marginTop: "0px",
        marginRight: "10px",
        color:theme.palette.text.secondary,
    },
    iconFix:{
        marginRight: "11px",
        marginLeft: "7px",
    },
    flexContainer:{
        display:"flex",
    },
    desenList:{
        paddingTop:0,
        paddingBottom:0,
    },
    flexContainerResponse:{
        display:"flex",
        [theme.breakpoints.down("sm")]: {
            display:"initial",
        },
    },
    desText:{
        marginTop:"10px",
    },
    secondColor:{
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.secondary.main,
        borderRadius: "50%",
        marginRight: "17px",
    },
    firstColor:{
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "50%",
        marginRight: "6px",
    },
    themeBlock:{
        height: "20px",
        width: "20px",
    },
    paddingBottom:{
        marginBottom:"30px",
    }
})
const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar:(vertical,horizontal,msg,color)=>{
            dispatch(toggleSnackbar(vertical,horizontal,msg,color))
        },
    }
}

class UserSettingCompoment extends Component {

    constructor(props){
        super(props);
        this.fileInput = React.createRef();
    }

    state={
        avatarModal:false,
        nickModal:false,
        changePassword:false,
        loading:"",
        oldPwd:"",
        newPwd:"",
        webdavPwd:"",
        newPwdRepeat:"",
        homePage:window.userInfo.homePage,
        nick:window.userInfo.nick,
        twoFactor:false,
        authCode:"",
        changeTheme:false,
        chosenTheme:null,
        showWebDavUrl:false,
        showWebDavUserName:false,
        changeWebDavPwd:false,
        groupBackModal:false,
        changePolicy:false,
    }

    handleClose = () => {
        this.setState({
            avatarModal: false,
            nickModal:false,
            changePassword:false,
            loading:"",
            twoFactor:false,
            changeTheme:false,
            showWebDavUrl:false,
            showWebDavUserName:false,
            changeWebDavPwd:false,
            groupBackModal:false,
            changePolicy:false,
        });
    };

    doChangeGroup = ()=>{
        axios.post('/Member/groupBack', {
            t:"comfirm",
        }).then( (response)=> {
            this.props.toggleSnackbar("top","right","解约成功，更改会在数分钟后生效" ,"success");
            this.handleClose();
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
        });
    }

    useGravatar = ()=>{
        this.setState({
            loading:"gravatar",
        })
        axios.post('/Member/SetGravatar', {
            t:"comfirm",
        }).then( (response)=> {
            window.location.reload();
            this.setState({
                loading:"",
            })
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            })
        });
    }

    changePolicy = id =>{
        axios.post('/Member/ChangePolicy', {
            id:id,
        }).then( (response)=> {
            if(response.data.error==="1"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"error");
            }else{
                window.location.reload();
            }
            this.setState({
                loading:"",
            })
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            })
        });
    }

    changeNick = ()=>{
        this.setState({
            loading:"nick",
        })
        axios.post('/Member/Nick', {
            nick:this.state.nick,
        }).then( (response)=> {
            if(response.data.error==="1"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"error");
            }else{
                window.location.reload();
            }
            this.setState({
                loading:"",
            })
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            })
        });
    }

    uploadAvatar = ()=>{
        this.setState({
            loading:"avatar",
        })
        var formData = new FormData();
        formData.append("avatar", this.fileInput.current.files[0]);
        axios.post('/Member/SaveAvatar', formData, {
            headers: {
            'Content-Type': 'multipart/form-data'
            }
        }).then( (response)=> {
            if(response.data.result==="error"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"warning");
            }else{
                window.location.reload();
            }
            this.setState({
                loading:"",
            })
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            })
        });
    }

    handleToggle = () =>{
        axios.post('/Member/HomePage', {
            status:this.state.homePage==="1"?"false":"true",
        }).then( (response)=> {
            if(response.data.error==="1"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"error");
            }else{
                this.props.toggleSnackbar("top","right","设置已保存" ,"success");
            }
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
        });
        this.setState({
            homePage:this.state.homePage==="1"?"0":"1",
        });
    }

    changhePwd =()=>{
        if(this.state.newPwd!==this.state.newPwdRepeat){
            this.props.toggleSnackbar("top","right","两次密码输入不一致" ,"warning");
        }
        this.setState({
            loading:"changePassword",
        });
        axios.post('/Member/ChangePwd', {
            origin: this.state.oldPwd,
            new: this.state.newPwd
        }).then( (response)=> {
            if(response.data.error==="1"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"error");
                this.setState({
                    loading:"",
                });
            }else{
                window.location.reload();
            }
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            });
        });
    }

    changeTheme = ()=>{
        this.setState({
            loading:"changeTheme",
        });
        axios.post('/Member/ChangeThemeColor', {
            theme:this.state.chosenTheme,
        }).then( (response)=> {
            if(response.data.error==="1"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"error");
                this.setState({
                    loading:"",
                });
            }else{
                window.location.reload();
            }
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            });
        });
    }

    changheWebdavPwd = ()=>{
        this.setState({
            loading:"changheWebdavPwd",
        });
        axios.post('/Member/setWebdavPwd', {
            pwd: this.state.webdavPwd,
        }).then( (response)=> {
            if(response.data.error==="1"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"error");
                this.setState({
                    loading:"",
                });
            }else{
                this.props.toggleSnackbar("top","right",response.data.msg ,"success");
                this.setState({
                    loading:"",
                    changeWebDavPwd:false,
                });
            }
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            });
        });
    }

    twoFactor = ()=>{
        this.setState({
            loading:"twoFactor",
        });
        axios.post('/Member/TwoFactorConfirm', {
            code:this.state.authCode,
        }).then( (response)=> {
            if(response.data.error==="1"){
                this.props.toggleSnackbar("top","right",response.data.msg ,"error");
                this.setState({
                    loading:"",
                });
            }else{
                window.location.reload();
            }
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
            this.setState({
                loading:"",
            });
        });
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    handleAlignment = (event, chosenTheme) => this.setState({ chosenTheme });

    render() {
        const { classes } = this.props;
      

        return (
            <div>
                <div className={classes.layout}>
                <Typography className={classes.sectionTitle} variant="subtitle2">个人资料</Typography>
                <Paper>
                        
                        <List className={classes.desenList}>
                        <ListItem button onClick={()=>this.setState({avatarModal:true})}>
                            <ListItemAvatar>
                            <Avatar src={'/Member/Avatar/'+window.userInfo.uid+"/l?cache=no"}/>
                            </ListItemAvatar>
                            <ListItemText primary="头像" />
                            <ListItemSecondaryAction>
                                <RightIcon className={classes.rightIcon}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button>
                           <ListItemIcon className={classes.iconFix}><FingerprintIcon/></ListItemIcon>
                            <ListItemText primary="UID" />
                            
                            <ListItemSecondaryAction>
                                <Typography className={classes.infoTextWithIcon} color="textSecondary">{window.userInfo.uid}</Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={()=>this.setState({nickModal:true})}>
                           <ListItemIcon className={classes.iconFix}><NickIcon/></ListItemIcon>
                            <ListItemText primary="昵称" />
                            
                            <ListItemSecondaryAction className={classes.flexContainer}>
                            <Typography className={classes.infoTextWithIcon} color="textSecondary">{window.userInfo.nick}</Typography><RightIcon className={classes.rightIconWithText}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button>
                           <ListItemIcon className={classes.iconFix}><EmailIcon/></ListItemIcon>
                            <ListItemText primary="Email" />
                            
                            <ListItemSecondaryAction>
                            <Typography className={classes.infoText} color="textSecondary">{window.userInfo.email}</Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={()=>window.location.href="/Home/Quota?buyGroup=1"}>
                           <ListItemIcon className={classes.iconFix}><GroupIcon/></ListItemIcon>
                            <ListItemText primary="用户组" />
                            
                            <ListItemSecondaryAction>
                            <Typography className={classes.infoText} color="textSecondary">{window.userInfo.group}{window.userInfo.expired>0&&
                                <span>(还有{Math.ceil(window.userInfo.expired / 86400)}天)</span>
                            }</Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                        {window.userInfo.expired>0&&
                        <div>
                            <Divider/>
                            <ListItem button onClick={()=>this.setState({groupBackModal:true})}>
                                <ListItemIcon className={classes.iconFix}><AlarmOff/></ListItemIcon>
                                <ListItemText primary="手动解约当前用户组" />
                                
                                <ListItemSecondaryAction>
                                <RightIcon className={classes.rightIcon}/>
                            </ListItemSecondaryAction>
                            </ListItem></div>
                        }
                        <Divider/>
                        <ListItem button onClick={()=>window.location.href=(window.userInfo.qqBind?"/Member/UnbindQQ":"/Member/BindQQ")}>
                           <ListItemIcon className={classes.iconFix}><SettingsInputHdmi/></ListItemIcon>
                            <ListItemText primary="QQ账号" />
                            
                            <ListItemSecondaryAction className={classes.flexContainer}>
                            <Typography className={classes.infoTextWithIcon} color="textSecondary">{window.userInfo.qqBind?"解除绑定":"绑定"}</Typography><RightIcon className={classes.rightIconWithText}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={()=>this.setState({changePolicy:true})}>
                           <ListItemIcon className={classes.iconFix}><Backup/></ListItemIcon>
                            <ListItemText primary="上传策略" />
                            
                            <ListItemSecondaryAction className={classes.flexContainer}>
                            <Typography className={classes.infoTextWithIcon} color="textSecondary">{window.userInfo.policy}</Typography><RightIcon className={classes.rightIconWithText}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button>
                           <ListItemIcon className={classes.iconFix}><DateIcon/></ListItemIcon>
                            <ListItemText primary="注册时间" />
                            
                            <ListItemSecondaryAction>
                            <Typography className={classes.infoText} color="textSecondary">{window.userInfo.regTime}</Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                        </List>
                    </Paper>
                <Typography className={classes.sectionTitle} variant="subtitle2">安全隐私</Typography>
                <Paper>    
                    <List className={classes.desenList}>
                        <ListItem button>
                           <ListItemIcon className={classes.iconFix}><HomeIcon/></ListItemIcon>
                            <ListItemText primary="个人主页" />
                            
                            <ListItemSecondaryAction>
                                <Switch
                                onChange={this.handleToggle}
                                checked={this.state.homePage==="1"}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={()=>this.setState({changePassword:true})}>
                           <ListItemIcon className={classes.iconFix}><LockIcon/></ListItemIcon>
                            <ListItemText primary="登录密码" />
                            
                            <ListItemSecondaryAction className={classes.flexContainer}>
                            <RightIcon className={classes.rightIcon}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={()=>window.userInfo.twoFactor==="0"?this.setState({twoFactor:true}):""}>
                           <ListItemIcon className={classes.iconFix}><VerifyIcon/></ListItemIcon>
                            <ListItemText primary="二步验证" />
                            
                            <ListItemSecondaryAction className={classes.flexContainer}>
                            <Typography className={classes.infoTextWithIcon} color="textSecondary">{window.userInfo.twoFactor==="0"?"未开启":"已开启"}</Typography><RightIcon className={classes.rightIconWithText}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        </List>
                    </Paper>

                    <Typography className={classes.sectionTitle} variant="subtitle2">个性化</Typography>
                <Paper>    
                    <List className={classes.desenList}>
                        <ListItem button onClick={()=>this.setState({changeTheme:true})}>
                           <ListItemIcon className={classes.iconFix}><ColorIcon/></ListItemIcon>
                            <ListItemText primary="主题配色" />
                            
                            <ListItemSecondaryAction className={classes.flexContainer}>
                                <div className={classes.firstColor}></div>
                                <div className={classes.secondColor}></div>
                            </ListItemSecondaryAction>
                        </ListItem>
                        </List>
                    </Paper>
                    {window.userInfo.webdav==="1"&&<div>
                    <Typography className={classes.sectionTitle} variant="subtitle2">WebDAV</Typography>
                <Paper>    
                    <List className={classes.desenList}>
                        <ListItem button onClick={()=>this.setState({showWebDavUrl:true})}>
                            <ListItemIcon className={classes.iconFix}><LinkIcon/></ListItemIcon>
                                <ListItemText primary="连接地址" />
                                
                                <ListItemSecondaryAction className={classes.flexContainer}>
                                <RightIcon className={classes.rightIcon}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={()=>this.setState({showWebDavUserName:true})}>
                            <ListItemIcon className={classes.iconFix}><InputIcon/></ListItemIcon>
                                <ListItemText primary="用户名" />
                                
                                <ListItemSecondaryAction className={classes.flexContainer}>
                                <RightIcon className={classes.rightIcon}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={()=>this.setState({changeWebDavPwd:true})}>
                            <ListItemIcon className={classes.iconFix}><SecurityIcon/></ListItemIcon>
                                <ListItemText primary="登录密码" />
                                
                                <ListItemSecondaryAction className={classes.flexContainer}>
                                <RightIcon className={classes.rightIcon}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        </List>
                    </Paper>
                    </div>}
                    <div className={classes.paddingBottom}></div>

                </div>
                <Dialog
                open={this.state.changePolicy}
                onClose={this.handleClose}
                >
                <DialogTitle>切换上传策略</DialogTitle>
                <List>
                    {window.userInfo.policyOption.map((value,index)=>(
                        <ListItem button component="label" key={index} onClick={()=>this.changePolicy(value.id)}>
                        <Avatar className={classes.uploadFromFile}>
                                <Backup />
                            </Avatar>
                        <ListItemText primary={value.name} />
                    </ListItem>
                    ))}
                </List>
                </Dialog>
                <Dialog
                open={this.state.avatarModal}
                onClose={this.handleClose}
                >
                <DialogTitle>修改头像</DialogTitle>
                <List>
                    <ListItem button component="label" disabled={(this.state.loading==="avatar")}>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            ref={this.fileInput}
                            onChange={this.uploadAvatar}
                        />
                        <ListItemAvatar>
                            <Avatar className={classes.uploadFromFile}>
                                <PhotoIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="从文件上传" />
                    </ListItem>
                    <ListItem button onClick={this.useGravatar} disabled={(this.state.loading==="gravatar")}>
                        <ListItemAvatar>
                            <Avatar className={classes.userGravatar}>
                                <FingerprintIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="使用Gravatar头像" />
                    </ListItem>
                </List>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                    取消
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.nickModal}
                onClose={this.handleClose}
                >
                <DialogTitle>修改昵称</DialogTitle>
                <DialogContent>
                <TextField
                    id="standard-name"
                    label="昵称"
                    className={classes.textField}
                    value={this.state.nick}
                    onChange={this.handleChange('nick')}
                    margin="normal"
                    autoFocus
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        取消
                    </Button>
                    <Button onClick={this.changeNick} color="primary" disabled={this.state.loading==="nick"||this.state.nick===""}>
                        保存
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.groupBackModal}
                onClose={this.handleClose}
                >
                <DialogTitle>解约用户组</DialogTitle>
                <DialogContent>

                    将要退回到初始用户组，且所支付金额无法退还，确定要继续吗？

                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        取消
                    </Button>
                    <Button onClick={this.doChangeGroup} color="primary" >
                        确定
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.changePassword}
                onClose={this.handleClose}
                >
                <DialogTitle>修改登录密码</DialogTitle>
                <DialogContent>
                    <div>
                    <TextField
                        id="standard-name"
                        label="原密码"
                        type="password"
                        className={classes.textField}
                        value={this.state.oldPwd}
                        onChange={this.handleChange('oldPwd')}
                        margin="normal"
                        autoFocus
                    /></div>
                    <div>
                    <TextField
                        id="standard-name"
                        label="新密码"
                        type="password"
                        className={classes.textField}
                        value={this.state.newPwd}
                        onChange={this.handleChange('newPwd')}
                        margin="normal"
                    /></div>
                    <div>
                    <TextField
                        id="standard-name"
                        label="确认新密码"
                        type="password"
                        className={classes.textField}
                        value={this.state.newPwdRepeat}
                        onChange={this.handleChange('newPwdRepeat')}
                        margin="normal"
                    /></div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        取消
                    </Button>
                    <Button onClick={this.changhePwd} color="primary" disabled={this.state.loading==="changePassword"||this.state.oldPwd===""||this.state.newPwdRepeat===""||this.state.newPwd===""}>
                        保存
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.twoFactor}
                onClose={this.handleClose}
                >
                <DialogTitle>启用二步验证</DialogTitle>
                <DialogContent>
                    <div className={classes.flexContainerResponse}>
                        <img alt="qrcode" src="/Member/EnableTwoFactor"></img>
                        <div className={classes.desText}>
                        <Typography>请使用任意二步验证APP或者支持二步验证的密码管理软件扫描左侧二维码添加本站。扫描完成后请填写二步验证APP给出的6位验证码以开启二步验证。</Typography>
                        <TextField
                        id="standard-name"
                        label="6位验证码"
                        type="number"
                        className={classes.textField}
                        value={this.state.authCode}
                        onChange={this.handleChange('authCode')}
                        margin="normal"
                        autoFocus
                        fullWidth
                    />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        取消
                    </Button>
                    <Button onClick={this.twoFactor} color="primary" disabled={this.state.loading==="twoFactor"||this.state.authCode===""}>
                        开启二步验证
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.changeTheme}
                onClose={this.handleClose}
                >
                <DialogTitle>更改主题配色</DialogTitle>
                <DialogContent>
                    <ToggleButtonGroup value={this.state.chosenTheme} exclusive onChange={this.handleAlignment}>
                        {Object.keys(window.colorThemeOptions).map((value,key)=>(
                            <ToggleButton value={value} key={key}>
                                <div 
                                className={classes.themeBlock}
                                style={{backgroundColor:value}}
                                ></div>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        取消
                    </Button>
                    <Button onClick={this.changeTheme} color="primary" disabled={this.state.loading==="changeTheme"||this.state.chosenTheme===null}>
                        保存
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.showWebDavUrl}
                onClose={this.handleClose}
                >
                <DialogTitle>WebDAV连接地址</DialogTitle>
                <DialogContent>
                <TextField
                    id="standard-name"
                    className={classes.textField}
                    value={window.siteUrl+"WebDav/Api/uid/"+window.userInfo.uid}
                    margin="normal"
                    autoFocus
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        关闭
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.showWebDavUserName}
                onClose={this.handleClose}
                >
                <DialogTitle>WebDAV用户名</DialogTitle>
                <DialogContent>
                <TextField
                    id="standard-name"
                    className={classes.textField}
                    value={window.userInfo.email}
                    margin="normal"
                    autoFocus
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        关闭
                    </Button>
                </DialogActions>
                </Dialog>
                <Dialog
                open={this.state.changeWebDavPwd}
                onClose={this.handleClose}
                >
                <DialogTitle>修改/设置WebDAV密码</DialogTitle>
                <DialogContent>
                <TextField
                    id="standard-name"
                    className={classes.textField}
                    value={this.state.webdavPwd}
                    margin="normal"
                    type="password"
                    onChange={this.handleChange('webdavPwd')}
                    autoFocus
                    fullWidth
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                        取消
                    </Button>
                    <Button onClick={this.changheWebdavPwd} color="primary" disabled={this.state.loading==="changheWebdavPwd"||this.state.webdavPwd===""}>
                        保存
                    </Button>
                </DialogActions>
                </Dialog>
             </div>
        );
    }

}

const UserSetting = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(UserSettingCompoment))
  
export default UserSetting

import React, { Component } from 'react'
import { connect } from 'react-redux'
import RegIcon from '@material-ui/icons/AssignmentIndOutlined';
import EmailIcon from '@material-ui/icons/EmailOutlined';
import { toggleSnackbar, } from "../../actions/index"
import axios from 'axios'

import {
    withStyles,
    Button,
    FormControl,
    Divider,
    Link,
    Input,
    InputLabel,
    Paper,
    Avatar,
    Typography,
} from '@material-ui/core';

const styles = theme => ({
    layout: {
        width: 'auto',
        marginTop: '110px',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    avatarSuccess:{
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    link: {
        marginTop: "10px",
        display:"flex",
        width: "100%",
        justifyContent: "space-between",
    },
    captchaContainer:{
        display:"flex",
        marginTop: "10px",
    }
})
const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color))
        },
    }
}

const sleep= (time)=> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

class RegisterFormCompoment extends Component {

    state={
        email:"",
        pwd:"",
        pwdRepeat:"",
        captcha:"",
        loading:false,
        captchaUrl:"/captcha?initial",
        showStatue:"loginForm",
    }

    refreshCaptcha = ()=>{
        this.setState({
            captchaUrl:"/captcha?"+Math.random(),
        });
    }

    register = e=>{
        e.preventDefault();
        if(this.state.pwdRepeat !== this.state.pwd){
            this.props.toggleSnackbar("top","right","两次密码输入不一致","warning");
            return;
        }
        this.setState({
            loading:true,
        });
        axios.post('/Member/Register',{
            "username-reg":this.state.email,
            "password-reg":this.state.pwd,
            captchaCode:this.state.captcha,
        }).then( (response)=> {
            if(response.data.code!=="200"){
                this.setState({
                    loading:false,
                });
                this.props.toggleSnackbar("top","right",response.data.message,"warning");
                this.refreshCaptcha();
            }else{
                if(response.data.message==="ec"){
                    this.setState({
                        showStatue:"email",
                    });
                }else{
                    this.props.toggleSnackbar("top","right","注册成功","success");
                    sleep(1000).then(() => {
                        window.location.href="/Home";
                        this.setState({
                            loading:false,
                        });
                    })
                }
            }
        })
        .catch((error) =>{
            this.setState({
                loading:false,
            });
            this.props.toggleSnackbar("top","right",error.message,"error");
            
            
        });
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };
    

    render() {
        const { classes } = this.props;


        return (
            <div className={classes.layout}>
                {this.state.showStatue==="loginForm"&&<Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <RegIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        注册{window.siteInfo.mainTitle}
                    </Typography>
                    <form className={classes.form} onSubmit={this.register}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="email">电子邮箱</InputLabel>
                            <Input 
                            id="email" 
                            type="email" 
                            name="email" 
                            onChange={this.handleChange("email")} 
                            autoComplete
                            value={this.state.email}
                            autoFocus />
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="password">密码</InputLabel>
                            <Input 
                            name="password" 
                            onChange={this.handleChange("pwd")} 
                            type="password" 
                            id="password" 
                            value={this.state.pwd}
                            autoComplete />
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="password">密码</InputLabel>
                            <Input 
                            name="pwdRepeat" 
                            onChange={this.handleChange("pwdRepeat")} 
                            type="password" 
                            id="pwdRepeat" 
                            value={this.state.pwdRepeat}
                            autoComplete />
                        </FormControl>
                        {window.regCaptcha==="1"&&
                        <div className={classes.captchaContainer}>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="captcha">验证码</InputLabel>
                                <Input 
                                name="captcha" 
                                onChange={this.handleChange("captcha")} 
                                type="text" 
                                id="captcha" 
                                value={this.state.captcha}
                                autoComplete />
                               
                            </FormControl> <div>
                                <img alt="captcha" src={this.state.captchaUrl} onClick={this.refreshCaptcha}></img>
                            </div>
                        </div>
                        }
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={this.state.loading}
                            className={classes.submit}
                        >
                            注册账号
                        </Button>  </form>                          <Divider/>
                        <div className={classes.link}>
                            <div>
                                <Link href={"/Login"}>
                                    返回登录
                                </Link>
                            </div>
                            <div>
                                <Link href={"/Member/FindPwd"}>
                                    忘记密码
                                </Link>
                            </div>
                        </div>
                    
                </Paper>}

                {this.state.showStatue==="email"&&<Paper className={classes.paper}>
                    <Avatar className={classes.avatarSuccess}>
                        <EmailIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        邮件激活
                    </Typography>
                      <Typography style={{marginTop:"10px"}}>一封激活邮件已经发送至您的邮箱，请访问邮件中的链接以继续完成注册。</Typography>
                    
                </Paper>}

            </div>
        );
    }

}

const RegisterForm = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(RegisterFormCompoment))

export default RegisterForm

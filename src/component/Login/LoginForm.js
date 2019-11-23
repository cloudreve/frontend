import React, { Component } from 'react'
import { connect } from 'react-redux'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { toggleSnackbar, } from "../../actions/index"
import Placeholder from "../placeholder/captcha"
import {withRouter} from  'react-router-dom'
import API from "../../middleware/Api"
import Auth from "../../middleware/Auth"
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
    },
    captchaPlaceholder:{
        width:200,
    },
})
const mapStateToProps = state => {
    return {
        loginCaptcha: state.siteConfig.loginCaptcha,
        title: state.siteConfig.title,
        regCaptcha: state.siteConfig.regCaptcha,
        forgetCaptcha: state.siteConfig.forgetCaptcha,
        emailActive: state.siteConfig.emailActive,
        QQLogin: state.siteConfig.QQLogin,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color))
        },
    }
}

class LoginFormCompoment extends Component {

    state={
        email:"",
        pwd:"",
        captcha:"",
        loading:false,
        captchaData:null,
    }

    refreshCaptcha = ()=>{
        API.get("/Captcha").then((response) =>{
            this.setState({
                captchaData:response.data,
            });
        }).catch((error)=> {
            this.props.toggleSnackbar("top", "right", "无法加载验证码：" + error.message, "error");
        });
        
    }

    componentDidMount = ()=>{
        this.refreshCaptcha()
    }

    login = e=>{
        e.preventDefault();
        this.setState({
            loading:true,
        });
        API.post('/User/Session',{
            userName:this.state.email,
            Password:this.state.pwd,
            captchaCode:this.state.captcha,
        }).then( (response)=> {
            // console.log(response);
            // if(response.data.code!=="200"){
            //     this.setState({
            //         loading:false,
            //     });
            //     if(response.data.message==="tsp"){
            //         window.location.href="/Member/TwoStep";
            //     }else{
            //         this.props.toggleSnackbar("top","right",response.data.message,"warning");
            //         this.refreshCaptcha();
            //     }
            // }else{
                this.setState({
                    loading:false,
                });
                Auth.authenticate(response.data);
                this.props.history.push('/Home')
                this.props.toggleSnackbar("top","right","登录成功","success");
            // }
        })
        .catch((error) =>{
            this.setState({
                loading:false,
            });
            this.props.toggleSnackbar("top","right",error.message,"warning");    
            this.refreshCaptcha(); 
        });
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };
    

    render() {
        const { classes } = this.props;


        return (
            <div className={classes.layout}>
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        登录{this.props.title}
                    </Typography>
                    <form className={classes.form} onSubmit={this.login}>
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
                        {this.props.loginCaptcha&&
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
                                {this.state.captchaData ===null && <div className={classes.captchaPlaceholder}><Placeholder/></div>}
                                {this.state.captchaData !==null && <img src={this.state.captchaData} alt="captcha" onClick={this.refreshCaptcha}></img>}
                            </div>
                        </div>
                        }
                        {this.props.QQLogin&&
                            <div>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={this.state.loading}
                                    className={classes.submit}
                                >
                                    登录
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    style={{marginLeft:"10px"}}
                                    disabled={this.state.loading}
                                    className={classes.submit}
                                    onClick={()=>window.location.href="/Member/QQLogin"}
                                >
                                    使用QQ登录
                                </Button>
                            </div>
                        }
                        {!this.props.QQLogin&&
                            <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={this.state.loading}
                            className={classes.submit}
                        >
                            登录
                        </Button>
                        }
                      </form>                          <Divider/>
                        <div className={classes.link}>
                            <div>
                                <Link href={"/Member/FindPwd"}>
                                    忘记密码
                                </Link>
                            </div>
                            <div>
                                <Link href={"/SignUp"}>
                                    注册账号
                                </Link>
                            </div>
                        </div>
                    
                </Paper>
            </div>
        );
    }

}

const LoginForm = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(LoginFormCompoment)))

export default LoginForm

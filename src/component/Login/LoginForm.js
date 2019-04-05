import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { toggleSnackbar, } from "../../actions/index"
import Typography from '@material-ui/core/Typography';
import axios from 'axios'
const styles = theme => ({
    layout: {
        width: 'auto',
        marginTop: '110px',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
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

class LoginFormCompoment extends Component {

    state={
        email:"",
        pwd:"",
        captcha:"",
        loading:false,
        captchaUrl:"/captcha?initial",
    }

    refreshCaptcha = ()=>{
        this.setState({
            captchaUrl:"/captcha?"+Math.random(),
        });
    }

    login = e=>{
        e.preventDefault();
        this.setState({
            loading:true,
        });
        axios.post('/Member/Login',{
            userMail:this.state.email,
            userPass:this.state.pwd,
            captchaCode:this.state.captcha,
        }).then( (response)=> {
            if(response.data.code!=="200"){
                this.setState({
                    loading:false,
                });
                if(response.data.message==="tsp"){
                    window.location.href="/Member/TwoStep";
                }else{
                    this.props.toggleSnackbar("top","right",response.data.message,"warning");
                    this.refreshCaptcha();
                }
            }else{
                this.setState({
                    loading:false,
                });
                window.location.href="/Home";
                this.props.toggleSnackbar("top","right","登录成功","success");
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
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        登录{window.siteInfo.mainTitle}
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
                        {window.captcha==="1"&&
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
                                <img src={this.state.captchaUrl} alt="captcha" onClick={this.refreshCaptcha}></img>
                            </div>
                        </div>
                        }
                        {window.qqLogin&&
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
                        {!window.qqLogin&&
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
)(withStyles(styles)(LoginFormCompoment))

export default LoginForm

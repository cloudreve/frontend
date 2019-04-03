import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import VpnIcon from '@material-ui/icons/VpnKeyOutlined';
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

class TwoStepCompoment extends Component {

    state={
        code:"",
        loading:false,
    }

    login = e=>{
        e.preventDefault();
        this.setState({
            loading:true,
        });
        axios.post('/Member/TwoStepCheck',{
            code:this.state.code,
        }).then( (response)=> {
            if(response.data.code!=="200"){
                this.setState({
                    loading:false,
                });
                this.props.toggleSnackbar("top","right","验证代码不正确","warning");
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
                        <VpnIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        二步验证
                    </Typography>
                    <form className={classes.form} onSubmit={this.login}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="code">请输入六位二步验证代码</InputLabel>
                            <Input 
                            id="code" 
                            type="number" 
                            name="code" 
                            onChange={this.handleChange("code")} 
                            autoComplete
                            value={this.state.code}
                            autoFocus />
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={this.state.loading}
                            className={classes.submit}
                        >
                            继续登录
                        </Button>  </form>                          <Divider/>
                    
                </Paper>
            </div>
        );
    }

}

const TwoStep = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(TwoStepCompoment))

export default TwoStep

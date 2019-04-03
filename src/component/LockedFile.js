import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import { toggleSnackbar,}from "../actions/index"
import axios from 'axios'
const styles = theme => ({
    card: {
        maxWidth: 400,
        margin: "0 auto",
      },
    actions: {
        display: 'flex',
    },
    layout: {
        width: 'auto',
        marginTop:'110px',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
          width: 1100,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
      continue:{
          marginLeft:"auto",
          marginRight: "10px",
          marginRottom: "10px",
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

class LockedFileCompoment extends Component {

    state = {
       pwd:"",
       loading:false,
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    submit = e=>{
        e.preventDefault();
        if(this.state.pwd===""){
            return;
        }
        this.setState({
            loading:true,
        });
        axios.post("/Share/chekPwd",{
            key: window.shareInfo.shareId,
            password: this.state.pwd
        })
        .then( (response)=> {
            if(response.data.error!==0){
                this.setState({
                    loading:false,
                });
                this.props.toggleSnackbar("top","right",response.data.msg ,"warning");
            }else{
                window.location.reload();
            }
            
        })
        .catch((error) =>{
            this.setState({
                loading:false,
            });
            this.props.toggleSnackbar("top","right",error.message ,"error");
        });
    }
   
    render() {
        const { classes } = this.props;
      

        return (
             <div className={classes.layout}>
                 <Card className={classes.card}>
                    <CardHeader
                    avatar={
                        <Avatar aria-label="Recipe" src={"/Member/Avatar/1/"+window.shareInfo.ownerUid}>
                        </Avatar>
                    }
                    title={window.shareInfo.ownerNick+" 的加密分享"}
                    subheader={window.shareInfo.shareDate}
                    />
                    <Divider/>
                    <CardContent>
                        <form onSubmit={this.submit}>
                        <TextField
                        id="pwd"
                        label="输入分享密码"
                        value={this.state.pwd}
                        onChange={this.handleChange('pwd')}
                        margin="normal"
                        type="password"
                        autoFocus
                        fullWidth
                        color="secondary"
                        />
                        </form>
                    </CardContent>
                    <CardActions className={classes.actions} disableActionSpacing>
                        <Button onClick={this.submit} color="secondary" className={classes.continue} variant="contained" disabled={this.state.pwd==="" || this.state.loading}>继续</Button>
                    </CardActions>
                </Card>
             </div>
        );
    }

}

const LockedFile = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(LockedFileCompoment))
  
export default LockedFile

import React, { Component } from 'react'
import { connect } from 'react-redux'
import EmailIcon from '@material-ui/icons/EmailOutlined';
import { toggleSnackbar, } from "../../actions/index"
import { withStyles, Button, Paper, Avatar, Typography } from '@material-ui/core';

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

class EmailActivicationCompoment extends Component {

    state={
    }


    render() {
        const { classes } = this.props;


        return (
            <div className={classes.layout}>
              <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <EmailIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        激活成功
                    </Typography>
                    <Typography style={{marginTop:"20px"}}>您的账号已被成功激活。</Typography>
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={()=>window.location.href="/Login"}
                    >
                            返回登录
                        </Button>
                    
                </Paper>

            </div>
        );
    }

}

const EmailActivication = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(EmailActivicationCompoment))

export default EmailActivication

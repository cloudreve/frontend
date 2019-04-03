import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import EmailIcon from '@material-ui/icons/EmailOutlined';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { toggleSnackbar, } from "../../actions/index"
import Typography from '@material-ui/core/Typography';

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
    avatarSuccess:{
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.primary.main,
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

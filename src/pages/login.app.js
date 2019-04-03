import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Navbar from "../component/Navbar.js"
import AlertBar from "../component/Snackbar"
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import LoginForm from "../component/Login/LoginForm"
import TwoStep from "../component/Login/TwoStep"
import RegisterForm from "../component/Login/RegisterForm"
import EmailActivication from "../component/Login/EmailActivication"
import ResetPwd from "../component/Login/ResetPwd"
import ResetPwdForm from "../component/Login/ResetPwdForm"

const theme = createMuiTheme(window.colorTheme);
const styles = theme => ({

	root: {
		display: 'flex',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing.unit * 0,
		minWidth: 0,
	},
	toolbar: theme.mixins.toolbar,
});

class LoginApp extends Component {

	render() {
		const { classes } = this.props;
		return (
			<React.Fragment>
				<MuiThemeProvider theme={theme}>
					<div className={classes.root} id="container">
						<CssBaseline />
						<AlertBar/>
						<Navbar />
						<main className={classes.content}>
							<div className={classes.toolbar} />
							{window.pageId==="login"&&<LoginForm/>}
							{window.pageId==="TwoStep"&&<TwoStep/>}
							{window.pageId==="register"&&<RegisterForm/>}
							{window.pageId==="emailActivate"&&<EmailActivication/>}
							{window.pageId==="resetPwd"&&<ResetPwd/>}
							{window.pageId==="resetPwdForm"&&<ResetPwdForm/>}
						</main>
					</div></MuiThemeProvider>
			</React.Fragment>
		);
	}
}

LoginApp.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoginApp);

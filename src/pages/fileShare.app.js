import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Navbar from "../component/Navbar.js"
import AlertBar from "../component/Snackbar"
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import SharedFile from '../component/SharedFile'
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

class FileShareApp extends Component {

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
							<SharedFile/>
						</main>
					</div></MuiThemeProvider>
			</React.Fragment>
		);
	}
}

FileShareApp.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileShareApp);

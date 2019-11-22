import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Navbar from "../component/Navbar.js"
import AlertBar from "../component/Snackbar"
import { createMuiTheme } from '@material-ui/core/styles';
import Search from '../component/Search'
import { CssBaseline, withStyles, MuiThemeProvider } from '@material-ui/core';
const theme = createMuiTheme(window.colorTheme);
const styles = theme => ({

	root: {
		display: 'flex',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(0),
		minWidth: 0,
	},
	toolbar: theme.mixins.toolbar,
});

class SearchApp extends Component {

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
							<Search/>
						</main>
					</div></MuiThemeProvider>
			</React.Fragment>
		);
	}
}

SearchApp.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SearchApp);

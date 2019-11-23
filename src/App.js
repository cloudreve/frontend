import React, { Component, Suspense } from "react";
import AuthRoute from "./middleware/AuthRoute";
import Navbar from "./component/Navbar.js";
import AlertBar from "./component/Snackbar";
import { createMuiTheme } from "@material-ui/core/styles";
import { connect, useSelector } from "react-redux";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";

import { CssBaseline, makeStyles, ThemeProvider } from "@material-ui/core";

const LoginForm = React.lazy(() => import("./component/Login/LoginForm"));

export default function App() {
    const themeConfig = useSelector(state => state.siteConfig.theme);
    let theme = createMuiTheme(themeConfig);
    const useStyles = makeStyles(theme => ({
        root: {
            display: "flex"
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing.unit * 0,
            minWidth: 0
        },
        toolbar: theme.mixins.toolbar
    }));

    const classes = useStyles();

    let { path, url } = useRouteMatch();
    return (
        <React.Fragment>
            <ThemeProvider theme={theme}>
                <div className={classes.root} id="container">
                    <CssBaseline />
                    <AlertBar />
                    <Navbar />
                    <main className={classes.content}>
                        <div className={classes.toolbar} />
                        <Switch>
                            <AuthRoute exact path={path}>
                                我是私有页面
                            </AuthRoute>
							<AuthRoute path={`${path}Home`}>
                                我是私有Home页面
                            </AuthRoute>
                            <Route path={`${path}Login`}>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <LoginForm />
                                </Suspense>
                            </Route>
                        </Switch>
                    </main>
                </div>
            </ThemeProvider>
        </React.Fragment>
    );
}

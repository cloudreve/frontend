import React, { Suspense } from "react";
import AuthRoute from "./middleware/AuthRoute";
import Navbar from "./component/Navbar/Navbar.js";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AlertBar from "./component/Snackbar";
import { createMuiTheme } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    useRouteMatch
} from "react-router-dom";
import Auth from "./middleware/Auth";
import { CssBaseline, makeStyles, ThemeProvider } from "@material-ui/core";

// Lazy loads
const LoginForm = React.lazy(() => import("./component/Login/LoginForm"));
const FileManager = React.lazy(() => import ("./component/FileManager/FileManager.js" ));

export default function App() {
    const themeConfig = useSelector(state => state.siteConfig.theme);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = React.useMemo(
        () =>{
            themeConfig.palette.type =  prefersDarkMode ? 'dark' : 'light';
            let prefer = Auth.GetPreference("theme_mode");
            if (prefer){
                themeConfig.palette.type = prefer;
            }
            return createMuiTheme(themeConfig);
        },
        [prefersDarkMode,themeConfig],
    );

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

    let { path } = useRouteMatch();
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
							<AuthRoute path={`${path}home`}>
								<Suspense fallback={<div>Loading...</div>}>
                               		<FileManager/>
								</Suspense>
                            </AuthRoute>
                            <Route path={`${path}login`}>
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

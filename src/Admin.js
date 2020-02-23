import React, {Suspense, useEffect, useState} from "react";
import {CssBaseline, makeStyles} from "@material-ui/core";
import AlertBar from "./component/Common/Snackbar";
import Dashboard from "./component/Admin/Dashboard";
import {useHistory} from "react-router";
import Auth from "./middleware/Auth";
import {Route, Switch} from "react-router-dom";
import PageLoading from "./component/Placeholder/PageLoading";
import {ThemeProvider} from "@material-ui/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";

const Index = React.lazy(() => import("./component/Admin/Index"));
const SiteInformation = React.lazy(() => import("./component/Admin/Setting/SiteInformation"));
const Access = React.lazy(() => import("./component/Admin/Setting/Access"));
const Mail = React.lazy(() => import("./component/Admin/Setting/Mail"));

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

const theme = createMuiTheme({
    palette: {
        background:{
        }
    },
});


export default function Admin() {
    const classes = useStyles();
    const history = useHistory();
    const [show,setShow] = useState(false);

    useEffect(()=>{
        let user = Auth.GetUser();
        if (user && user.group){
            if (user.group.id !== 1){
                history.push("/home");
                return
            }
            setShow(true);
            return
        }
        history.push("/login")
        // eslint-disable-next-line
    },[])

    return (

        <React.Fragment>
            <ThemeProvider theme={theme}>
                <div className={classes.root}>
                    <CssBaseline />
                    <AlertBar />
                    {show&&<Dashboard content={
                        (path)=>(

                            <Switch>
                                <Route path={`${path}`} exact>
                                    <Suspense fallback={<PageLoading />}>
                                        <Index/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/basic`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <SiteInformation/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/access`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <Access/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/mail`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <Mail/>
                                    </Suspense>
                                </Route>

                            </Switch>
                        )
                    }/>}

                </div>
            </ThemeProvider>
        </React.Fragment>
    )
}
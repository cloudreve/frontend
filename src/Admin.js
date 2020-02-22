import React, {Suspense, useEffect} from "react";
import {CssBaseline, makeStyles} from "@material-ui/core";
import AlertBar from "./component/Common/Snackbar";
import Dashboard from "./component/Admin/Dashboard";
import {useHistory} from "react-router";
import Auth from "./middleware/Auth";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import PageLoading from "./component/Placeholder/PageLoading";

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

export default function Admin() {
    const classes = useStyles();
    const history = useHistory();

    useEffect(()=>{
        let user = Auth.GetUser();
        if (user && user.group){
            if (user.group.id !== 1){
                history.push("/home");
                return
            }
            return
        }
        history.push("/login")
    },[])

    return (

        <React.Fragment>
            <div className={classes.root}>
                <CssBaseline />
                <AlertBar />
                <Dashboard content={
                    (path)=>(

                            <Switch>
                                <Route path={`${path}`} exact>
                                    <h1>home</h1>
                                </Route>
                                <Route path={`${path}/basic`}>
                                    <h1>basic</h1>
                                </Route>
                            </Switch>
                    )
                }/>
            </div>
        </React.Fragment>
    )
}
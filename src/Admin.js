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
import { zhCN } from '@material-ui/core/locale';

const Index = React.lazy(() => import("./component/Admin/Index"));
const SiteInformation = React.lazy(() => import("./component/Admin/Setting/SiteInformation"));
const Access = React.lazy(() => import("./component/Admin/Setting/Access"));
const Mail = React.lazy(() => import("./component/Admin/Setting/Mail"));
const UploadDownload = React.lazy(() => import("./component/Admin/Setting/UploadDownload"));
const VAS = React.lazy(() => import("./component/Admin/Setting/VAS"));
const Theme = React.lazy(() => import("./component/Admin/Setting/Theme"));
const Aria2 = React.lazy(() => import("./component/Admin/Setting/Aria2"));
const ImageSetting = React.lazy(() => import("./component/Admin/Setting/Image"));
const Policy = React.lazy(() => import("./component/Admin/Policy/Policy"));
const AddPolicy = React.lazy(() => import("./component/Admin/Policy/AddPolicy"));
const EditPolicyPreload = React.lazy(() => import("./component/Admin/Policy/EditPolicy"));

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex"
    },
    content: {
        flexGrow: 1,
        padding: 0,
        minWidth: 0
    },
    toolbar: theme.mixins.toolbar
}));

const theme = createMuiTheme({
    palette: {
        background:{
        }
    },
},zhCN);


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
                                <Route path={`${path}/home`} exact>
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

                                <Route path={`${path}/upload`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <UploadDownload/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/vas`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <VAS/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/theme`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <Theme/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/aria2`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <Aria2/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/image`}>
                                    <Suspense fallback={<PageLoading />}>
                                        <ImageSetting/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/policy`} exact>
                                    <Suspense fallback={<PageLoading />}>
                                        <Policy/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/policy/add/:type`} exact>
                                    <Suspense fallback={<PageLoading />}>
                                        <AddPolicy/>
                                    </Suspense>
                                </Route>

                                <Route path={`${path}/policy/edit/:mode/:id`} exact>
                                    <Suspense fallback={<PageLoading />}>
                                        <EditPolicyPreload/>
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
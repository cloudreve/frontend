import React, {Suspense} from "react";
import ReactDOM from 'react-dom';
import * as serviceWorker from "./serviceWorker";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import App from "./App";
import cloureveApp from "./reducers";
import { InitSiteConfig, UpdateSiteConfig } from "./middleware/Init";
import ErrorBoundary from "./component/Placeholder/ErrorBoundary";
import PageLoading from "./component/Placeholder/PageLoading";
const Admin = React.lazy(() => import("./Admin"));

serviceWorker.register();

const defaultStatus = InitSiteConfig({
    siteConfig: {
        title: "Cloudreve",
        loginCaptcha: false,
        regCaptcha: false,
        forgetCaptcha: false,
        emailActive: false,
        QQLogin: false,
        themes:null,
        authn:false,
        theme: {
            palette: {
                common: { black: "#000", white: "#fff" },
                background: { paper: "#fff", default: "#fafafa" },
                primary: {
                    light: "#7986cb",
                    main: "#3f51b5",
                    dark: "#303f9f",
                    contrastText: "#fff"
                },
                secondary: {
                    light: "#ff4081",
                    main: "#f50057",
                    dark: "#c51162",
                    contrastText: "#fff"
                },
                error: {
                    light: "#e57373",
                    main: "#f44336",
                    dark: "#d32f2f",
                    contrastText: "#fff"
                },
                text: {
                    primary: "rgba(0, 0, 0, 0.87)",
                    secondary: "rgba(0, 0, 0, 0.54)",
                    disabled: "rgba(0, 0, 0, 0.38)",
                    hint: "rgba(0, 0, 0, 0.38)"
                },
                explorer: {
                    filename: "#474849",
                    icon: "#8f8f8f",
                    bgSelected: "#D5DAF0",
                    emptyIcon: "#e8e8e8"
                }
            }
        }
    },
    navigator: {
        path: "/",
        refresh: true
    },
    viewUpdate: {
        isLogin:false,
        loadUploader:false,
        open: false,
        explorerViewMethod: "icon",
        sortMethod: "timePos",
        subTitle:null,
        contextType: "none",
        menuOpen: false,
        navigatorLoading: true,
        navigatorError: false,
        navigatorErrorMsg: null,
        modalsLoading: false,
        storageRefresh: false,
        userPopoverAnchorEl: null,
        shareUserPopoverAnchorEl: null,
        modals: {
            createNewFolder: false,
            rename: false,
            move: false,
            remove: false,
            share: false,
            music: false,
            remoteDownload: false,
            torrentDownload: false,
            getSource: false,
            copy:false,
            resave: false,
            compress:false,
            decompress:false,
        },
        snackbar: {
            toggle: false,
            vertical: "top",
            horizontal: "center",
            msg: "",
            color: ""
        }
    },
    explorer: {
        dndSignal:false,
        dndTarget:null,
        dndSource:null,
        fileList: [],
        dirList: [],
        selected: [],
        selectProps: {
            isMultiple: false,
            withFolder: false,
            withFile: false
        },
        imgPreview: {
            first: null,
            other: []
        },
        keywords: null
    }
});

let store = createStore(cloureveApp, defaultStatus,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
UpdateSiteConfig(store);

ReactDOM.render(
    <ErrorBoundary>
    <Provider store={store}>
        <Router>
            <Switch>
                <Route path="/admin">
                    <Suspense fallback={"Loading..."}>
                        <Admin />
                    </Suspense>
                </Route>
                <Route exact path="">
                    <App />
                </Route>
            </Switch>
        </Router>
    </Provider></ErrorBoundary>,
    document.getElementById("root")
);

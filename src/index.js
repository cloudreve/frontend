import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import {
    HashRouter as Router,
    Switch,
    Route,
  } from "react-router-dom";
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from "./App"
import cloureveApp from './reducers'

serviceWorker.register();

const defaultStatus = {
    navigator:{
        path:window.path,
        refresh:true,
    },
    viewUpdate:{
        open:true,
        explorerViewMethod: "icon",
        sortMethod:"timePos",
        contextType:"none",  
        menuOpen:false,
        navigatorLoading:true,
        navigatorError:false,
        navigatorErrorMsg:null,
        modalsLoading:false,
        storageRefresh:false,
        userPopoverAnchorEl:null,
        modals:{
            createNewFolder:false,
            rename:false,
            move:false,
            remove:false,
            share:false,
            music:false,
            remoteDownload:false,
            torrentDownload:false,
            getSource:false,
            resave:false,
        },
        snackbar:{
            toggle:false,
            vertical:"top",
            horizontal:"center",
            msg:"",
            color:"",
        }
    },
    explorer:{
        fileList:[],
        dirList:[
        ],
        selected:[],
        selectProps:{
            isMultiple:false,
            withFolder:false,
            withFile:false,
        },
        imgPreview:{
            first:null,
            other:[],
        },
        keywords:null,
    }
};
let store = createStore(cloureveApp,defaultStatus)

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>
                <Route path="">
                    <App/>
                </Route>
            </Switch>
        </Router>
    </Provider>
, document.getElementById('root'));


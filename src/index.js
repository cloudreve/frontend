import React, {Suspense} from "react";
import ReactDOM from 'react-dom';
import * as serviceWorker from "./serviceWorker";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from 'redux-thunk'
import App from "./App";
import cloureveApp from "./reducers";
import { UpdateSiteConfig } from "./middleware/Init";
import ErrorBoundary from "./component/Placeholder/ErrorBoundary";
import PageLoading from "./component/Placeholder/PageLoading";
const Admin = React.lazy(() => import("./Admin"));

serviceWorker.register();

const middlewares = [thunk]
// TODO: 仅在dev模式下添加devtools
const store = createStore(cloureveApp, 
  compose(
    applyMiddleware(...middlewares),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  ));
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

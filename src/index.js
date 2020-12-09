import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import App from "./App";
import Home from "./component/Home/Home";
import cloureveApp from "./reducers";
import { UpdateSiteConfig } from "./middleware/Init";
import ErrorBoundary from "./component/Placeholder/ErrorBoundary";
const Admin = React.lazy(() => import("./Admin"));

if (window.location.hash !== "") {
    window.location.href = window.location.hash.split("#")[1];
}

serviceWorker.register();

let reduxEnhance = applyMiddleware(thunk);
if (
    process.env.NODE_ENV === "development" &&
    window.__REDUX_DEVTOOLS_EXTENSION__
) {
    reduxEnhance = compose(reduxEnhance, window.__REDUX_DEVTOOLS_EXTENSION__());
}
const store = createStore(cloureveApp, reduxEnhance);
UpdateSiteConfig(store);

ReactDOM.render(
    <ErrorBoundary>
<<<<<<< HEAD
    <Provider store={store}>
        <Router>
            <Switch>
                <Route path="/admin">
                    <Suspense fallback={"Loading..."}>
                        <Admin />
                    </Suspense>
                </Route>
                <Route exact path="/">
                    <Home />
                </Route>
                <Route exact path="">
                    <App />
                </Route>
            </Switch>
        </Router>
    </Provider></ErrorBoundary>,
=======
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
        </Provider>
    </ErrorBoundary>,
>>>>>>> 397bf4569cee2152d6663fc5dd2bcff4ea84a954
    document.getElementById("root")
);

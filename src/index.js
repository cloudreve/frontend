import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import App from "./App";
import cloureveApp from "./reducers";
import { UpdateSiteConfig } from "./middleware/Init";
import ErrorBoundary from "./component/Placeholder/ErrorBoundary";
import { createBrowserHistory } from "history";
import { ConnectedRouter, routerMiddleware } from "connected-react-router";

const Admin = React.lazy(() => import("./Admin"));

if (window.location.hash !== "") {
    window.location.href = window.location.hash.split("#")[1];
}

serviceWorker.register({
    onUpdate: (registration) => {
        alert("当前页面有新版本可用，准备刷新。");
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        window.location.reload();
    },
});

export const history = createBrowserHistory();
let reduxEnhance = applyMiddleware(routerMiddleware(history), thunk);
if (
    process.env.NODE_ENV === "development" &&
    window.__REDUX_DEVTOOLS_EXTENSION__
) {
    reduxEnhance = compose(reduxEnhance, window.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = createStore(cloureveApp(history), reduxEnhance);
UpdateSiteConfig(store);

ReactDOM.render(
    <ErrorBoundary>
        <Provider store={store}>
            <ConnectedRouter history={history}>
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
            </ConnectedRouter>
        </Provider>
    </ErrorBoundary>,
    document.getElementById("root")
);

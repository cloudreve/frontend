import React from "react";
import Auth from "./Auth";
import { Route, Redirect } from "react-router-dom";

function AuthRoute({ children, ...rest }) {
    return (
        <Route
            {...rest}
            render={({ location }) =>
                Auth.Check(rest.isLogin) ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    );
}

<<<<<<< HEAD
export default AuthRoute
=======
export default AuthRoute;
>>>>>>> 397bf4569cee2152d6663fc5dd2bcff4ea84a954

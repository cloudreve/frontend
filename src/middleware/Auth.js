const Auth = {
    isAuthenticated: false,
    authenticate(cb) {
        localStorage.setItem("user", JSON.stringify(cb));
        Auth.isAuthenticated = true;
    },
    GetUser(){
        return JSON.parse(localStorage.getItem("user"))
    },
    Check() {
        if (Auth.isAuthenticated) {
            return true;
        }
        if (localStorage.getItem("user") !== null) {
            return true;
        }
        return false;
    },
    signout(cb) {
        localStorage.removeItem("user");
        Auth.isAuthenticated = false;
    }
};

export default Auth;

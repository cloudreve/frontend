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
    signout() {
        localStorage.removeItem("user");
        Auth.isAuthenticated = false;
    },
    SetPreference(key,value){
        let preference = JSON.parse(localStorage.getItem("user_preference"));
        preference = (preference == null) ? {} : preference;
        preference[key] = value;
        localStorage.setItem("user_preference", JSON.stringify(preference));
    },
    GetPreference(key){
        let preference = JSON.parse(localStorage.getItem("user_preference"));
        if (preference && preference[key]){
            return preference[key];
        }
        return null;
    },
};

export default Auth;

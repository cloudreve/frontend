const Auth = {
    isAuthenticated: false,
    authenticate(cb) {
      Auth.isAuthenticated = true;
    },
    signout(cb) {
      Auth.isAuthenticated = false;
    },
};

export default Auth
function getValueWithDefault(key, defaultValue) {
    try {
        return JSON.parse(localStorage.getItem(key) as string) || defaultValue;
    } catch (e) {
        return defaultValue;
    }
}
const Auth = {
    isAuthenticated: false,
    _user: getValueWithDefault("user", { anonymous: true, group: {}, tags: [] }),
    _preference: getValueWithDefault("preference", {}),
    authenticate(cb: any) {
        Auth.SetUser(cb);
        Auth.isAuthenticated = true;
    },
    GetUser() {
        return Auth._user;
    },
    SetUser(newUser: any) {
        Auth._user = newUser;
        localStorage.setItem("user", JSON.stringify(newUser));
    },
    Check(): boolean {
        return Auth.isAuthenticated || !Auth.GetUser().anonymous;
    },
    signout() {
        Auth.isAuthenticated = false;
        const oldUser = Auth.GetUser();
        oldUser.id = 0;
        Auth.SetUser(oldUser);
    },
    SetPreference(key: string, value: any) {
        Auth._preference[key] = value;
        localStorage.setItem("user_preference", JSON.stringify(Auth._preference));
    },
    GetPreference(key: string): any | null {
        return Auth._preference[key] ?? null;
    },
    GetPreferenceWithDefault(key: string, defaultVal: any): any {
        return Auth.GetPreference(key) ?? defaultVal;
    },
};

export default Auth;

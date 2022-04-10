const statusHelper = {
    isHomePage(path: string) {
        return path === "/home";
    },
    isSharePage(path: string) {
        return path && path.startsWith("/s/");
    },
    isAdminPage(path: string) {
        return path && path.startsWith("/admin");
    },
    isLoginPage(path: string) {
        return path && path.startsWith("/login");
    },
    isMobile() {
        return window.innerWidth < 600;
    },
};
export default statusHelper;

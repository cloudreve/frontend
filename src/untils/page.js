const statusHelper = {

    isHomePage(path){
        return path == "/home"
    },
    isSharePage(path){
        return path == "/share"
    },
    isMobile(){
        return window.innerWidth < 600;
    },
}
export default statusHelper
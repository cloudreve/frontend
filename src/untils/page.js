const statusHelper = {

    isHomePage(path){
        return path == "/Home"
    },
    isSharePage(path){
        return path == "/Share"
    },
    isMobile(){
        return window.innerWidth < 600;
    },
}
export default statusHelper
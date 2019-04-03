export const sizeToString = (bytes) => {
    if (bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]; 
}

export const setCookie = (name,value,days)=>{
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
    }
    document.cookie = name + "=" + (value || "") +"; path=/"; 
}

export const setGetParameter = (paramName, paramValue) =>{
    var url = window.location.href;
    var hash = window.location.hash;
    url = url.replace(hash, '');
    if (url.indexOf(paramName + "=") >= 0)
    {
        var prefix = url.substring(0, url.indexOf(paramName));
        var suffix = url.substring(url.indexOf(paramName));
        suffix = suffix.substring(suffix.indexOf("=") + 1);
        suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
        url = prefix + paramName + "=" + paramValue + suffix;
    }
    else
    {
    if (url.indexOf("?") < 0)
        url += "?" + paramName + "=" + paramValue;
    else
        url += "&" + paramName + "=" + paramValue;
    }
    if(url===window.location.href){
        return;
    }
    window.history.pushState(null, null, url);
}

export const allowSharePreview=()=>{
    if(!window.isSharePage){
        return true;
    }
    if(window.isSharePage){
        if(window.shareInfo.allowPreview){
            return true;
        }
        if(window.userInfo.uid===-1){
            return false;
        }
        return true;
    }
}

export const checkGetParameters= field=>{
    var url = window.location.href;
    if(url.indexOf('?' + field + '=') !== -1)
        return true;
    else if(url.indexOf('&' + field + '=') !== -1)
        return true;
    return false
}

export const changeThemeColor = color=>{
    var metaThemeColor = window.document.querySelector("meta[name=theme-color]");
    metaThemeColor.setAttribute("content", color);
}
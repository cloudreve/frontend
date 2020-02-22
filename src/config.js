export const imgPreviewSuffix = ["bmp","png","gif","jpg","jpeg","svg","webp"];
export const msDocPreviewSuffix = ["ppt","pptx","pps","doc","docx","xlsx","xls"];
export const audioPreviewSuffix = ["mp3","ogg"];
export const videoPreviewSuffix = ["mp4"];
export const directOpenPreviewSuffix = ["pdf"];
export const editSuffix = ["md","html","sql","go","py","js","json","c","cpp","css","txt"];
export const mediaType = {
    audio:["mp3","flac","ape","wav","acc","ogg"],
    video:["mp4","flv","avi","wmv","mkv","rm","rmvb","mov","ogv"],
    image:["bmp","iff","png","gif","jpg","jpeg","psd","svg","webp"],
    pdf:["pdf"],
    word:["doc","docx"],
    ppt:["ppt","pptx"],
    excel:["xls","xlsx","csv"],
    text:["txt","md","html"],
    torrent:["torrent"],
    zip:["zip","gz","tar","rar","7z"],
    excute:["exe"],
    android:["apk"],
    php:["php"],
    go:["go"],
    python:["py"],
    cpp:["cpp"],
    c:["c"],
    js:["js","jsx"],
};
export const isPreviewable = name=>{
    let suffix = name.split(".").pop().toLowerCase();
    if(imgPreviewSuffix.indexOf(suffix)!==-1){
        return "img";
    }else if(msDocPreviewSuffix.indexOf(suffix)!==-1){
        return "msDoc";
    }else if(audioPreviewSuffix.indexOf(suffix)!==-1){
        return "audio";
    }else if(videoPreviewSuffix.indexOf(suffix)!==-1){
        return "video";
    }else if(editSuffix.indexOf(suffix)!==-1){
        return "edit";
    }
    return false;
}
export const isTorrent = name=>{
    let suffix = name.split(".").pop().toLowerCase();
    if(mediaType.torrent.indexOf(suffix)!==-1){
        return true;
    }
    return false;
}

export const isCompressFile = name=>{
    let suffix = name.split(".").pop().toLowerCase();
    return suffix === "zip"
}

const taskStatus = ["排队中","处理中","失败","取消","已完成"];
const taskType = ["压缩","解压缩","文件中转"];
const taskProgress = ["等待中","压缩中","解压缩中","下载中","转存中"];

export const getTaskStatus = status =>{
    return taskStatus[status];
}

export const getTaskType = status =>{
    return taskType[status];
}

export const getTaskProgress = (type,status) =>{
    if (type === 2){
        return "已完成 " + (status+1) + " 个文件"
    }
    return taskProgress[status];
}
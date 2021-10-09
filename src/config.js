import i18next from 'i18next';
export const imgPreviewSuffix = [
    "bmp",
    "png",
    "gif",
    "jpg",
    "jpeg",
    "svg",
    "webp",
];
export const msDocPreviewSuffix = [
    "ppt",
    "pptx",
    "pps",
    "doc",
    "docx",
    "xlsx",
    "xls",
];
export const audioPreviewSuffix = ["mp3", "ogg"];
export const videoPreviewSuffix = ["mp4", "mkv", "webm"];
export const pdfPreviewSuffix = ["pdf"];
export const editSuffix = ["md", "txt"];
export const codePreviewSuffix = {
    json: "json",
    php: "php",
    py: "python",
    bat: "bat",
    cpp: "cpp",
    c: "cpp",
    h: "cpp",
    cs: "csharp",
    css: "css",
    dockerfile: "dockerfile",
    go: "go",
    html: "html",
    ini: "ini",
    java: "java",
    js: "javascript",
    jsx: "javascript",
    less: "less",
    lua: "lua",
    sh: "shell",
    sql: "sql",
    xml: "xml",
    yaml: "yaml",
};
export const mediaType = {
    audio: ["mp3", "flac", "ape", "wav", "acc", "ogg"],
    video: ["mp4", "flv", "avi", "wmv", "mkv", "rm", "rmvb", "mov", "ogv"],
    image: ["bmp", "iff", "png", "gif", "jpg", "jpeg", "psd", "svg", "webp"],
    pdf: ["pdf"],
    word: ["doc", "docx"],
    ppt: ["ppt", "pptx"],
    excel: ["xls", "xlsx", "csv"],
    text: ["txt", "md", "html"],
    torrent: ["torrent"],
    zip: ["zip", "gz", "tar", "rar", "7z"],
    excute: ["exe"],
    android: ["apk"],
    php: ["php"],
    go: ["go"],
    python: ["py"],
    cpp: ["cpp"],
    c: ["c"],
    js: ["js", "jsx"],
};
export const policyTypeMap = {
    local: i18next.t('Local'),
    remote: i18next.t('Slave'),
    qiniu: i18next.t('Qiniu'),
    upyun: i18next.t('UpYun'),
    oss: i18next.t('Alibaba Cloud OSS'),
    cos: i18next.t('Tencent Cloud'),
    onedrive: "OneDrive",
    s3: "Amazon S3",
};
export const isPreviewable = (name) => {
    const suffix = name.split(".").pop().toLowerCase();
    if (imgPreviewSuffix.indexOf(suffix) !== -1) {
        return "img";
    } else if (msDocPreviewSuffix.indexOf(suffix) !== -1) {
        return "msDoc";
    } else if (audioPreviewSuffix.indexOf(suffix) !== -1) {
        return "audio";
    } else if (videoPreviewSuffix.indexOf(suffix) !== -1) {
        return "video";
    } else if (editSuffix.indexOf(suffix) !== -1) {
        return "edit";
    } else if (pdfPreviewSuffix.indexOf(suffix) !== -1) {
        return "pdf";
    } else if (Object.keys(codePreviewSuffix).indexOf(suffix) !== -1) {
        return "code";
    }
    return false;
};
export const isTorrent = (name) => {
    const suffix = name.split(".").pop().toLowerCase();
    if (mediaType.torrent.indexOf(suffix) !== -1) {
        return true;
    }
    return false;
};

export const isCompressFile = (name) => {
    const suffix = name.split(".").pop().toLowerCase();
    return suffix === "zip";
};

const taskStatus = [i18next.t('in the line'), i18next.t('Processing'), i18next.t('fail'), i18next.t('Cancel'), i18next.t('completed')];
const taskType = [i18next.t('compression'), i18next.t('unzip'), i18next.t('File transfer'), i18next.t('Import external directory')];
const taskProgress = [
    i18next.t('Waiting'),
    i18next.t('Compressing'),
    i18next.t('Unzipping'),
    i18next.t('downloading'),
    i18next.t('Transferring'),
    i18next.t('In the index'),
    i18next.t('Insert'),
];

export const getTaskStatus = (status) => {
    return taskStatus[status];
};

export const getTaskType = (status) => {
    return taskType[status];
};

export const getTaskProgress = (type, status) => {
    if (type === 2) {
        return i18next.t('completed ') + (status + 1) + i18next.t('Files');
    }
    return taskProgress[status];
};

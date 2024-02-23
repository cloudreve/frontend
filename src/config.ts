import i18next from "./i18n";

export const imgPreviewSuffix = [
    "bmp",
    "png",
    "gif",
    "jpg",
    "jpeg",
    "svg",
    "webp",
    "jfif",
];
export let msDocPreviewSuffix = [
    "ppt",
    "pptx",
    "pps",
    "doc",
    "docx",
    "xlsx",
    "xls",
];
export const subtitleSuffix = ["ass", "srt", "vtt"];
export const audioPreviewSuffix = ["mp3", "ogg", "wav", "flac", "m4a", "aac"];
export const videoPreviewSuffix = ["mp4", "mkv", "webm", "avi", "m3u8", "mov"];
export const pdfPreviewSuffix = ["pdf"];
export const editSuffix = ["md", "txt"];
export const epubSuffix = ["epub"];
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
    audio: ["mp3", "flac", "ape", "wav", "aac", "ogg", "m4a"],
    video: ["mp4", "flv", "avi", "wmv", "mkv", "rm", "rmvb", "mov", "ogv"],
    image: [
        "bmp",
        "iff",
        "png",
        "gif",
        "jpg",
        "jpeg",
        "psd",
        "svg",
        "webp",
        "heif",
        "heic",
        "tiff",
        "avif",
    ],
    pdf: ["pdf"],
    word: ["doc", "docx"],
    ppt: ["ppt", "pptx"],
    excel: ["xls", "xlsx", "csv"],
    text: ["txt", "md", "html"],
    torrent: ["torrent"],
    zip: ["zip", "gz", "xz", "tar", "rar", "7z"],
    excute: ["exe"],
    android: ["apk"],
    php: ["php"],
    go: ["go"],
    python: ["py"],
    cpp: ["cpp"],
    c: ["c"],
    js: ["js", "jsx"],
    epub: epubSuffix,
};
export const isPreviewable = (name: any) => {
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
    } else if (epubSuffix.indexOf(suffix) !== -1) {
        return "epub";
    }
    return false;
};
export const isTorrent = (name: any) => {
    const suffix = name.split(".").pop().toLowerCase();
    if (mediaType.torrent.indexOf(suffix) !== -1) {
        return true;
    }
    return false;
};

export const isCompressFile = (name: any) => {
    const suffix = name.split(".").pop().toLowerCase();
    return suffix !== "7z" && mediaType["zip"].indexOf(suffix) !== -1;
};

export const encodingRequired = (name: any) => {
    const suffix = name.split(".").pop().toLowerCase();
    return suffix === "zip";
};

const taskStatus = [
    "setting.queueing",
    "setting.processing",
    "setting.failed",
    "setting.canceled",
    "setting.finished",
];
const taskType = [
    "fileManager.compress",
    "fileManager.decompress",
    "setting.fileTransfer",
    "setting.importFiles",
    "vas.migrateStoragePolicy",
    "setting.fileRecycle",
];
const taskProgress = [
    "setting.waiting",
    "setting.compressing",
    "setting.decompressing",
    "setting.downloading",
    "setting.transferring",
    "setting.indexing",
    "setting.listing",
];

export const getTaskStatus = (status: any) => {
    return i18next.t(taskStatus[status]);
};

export const getTaskType = (status: any) => {
    return i18next.t(taskType[status]);
};

export const getTaskProgress = (type: any, status: any) => {
    if (type === 2) {
        return i18next.t("setting.transferProgress", {
            num: status,
        });
    }
    return i18next.t(taskProgress[status]);
};

export const reportReasons = [
    "vas.nsfw",
    "vas.malware",
    "vas.copyright",
    "vas.inappropriateStatements",
    "vas.other",
];

export const setWopiExts = (exts: string[]) => {
    msDocPreviewSuffix = exts;
};

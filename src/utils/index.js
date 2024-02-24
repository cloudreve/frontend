export const sizeToString = (bytes) => {
    if (bytes === 0 || bytes === "0") return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

export const fixUrlHash = (path) => {
    return path;
};

export const setCookie = (name, value, days) => {
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    }
    document.cookie = name + "=" + (value || "") + "; path=/";
};

export const setGetParameter = (paramName, paramValue) => {
    let url = window.location.href;

    if (url.indexOf(paramName + "=") >= 0) {
        const prefix = url.substring(0, url.indexOf(paramName));
        let suffix = url.substring(url.indexOf(paramName));
        suffix = suffix.substring(suffix.indexOf("=") + 1);
        suffix =
            suffix.indexOf("&") >= 0
                ? suffix.substring(suffix.indexOf("&"))
                : "";
        url = prefix + paramName + "=" + paramValue + suffix;
    } else {
        if (url.indexOf("?") < 0) url += "?" + paramName + "=" + paramValue;
        else url += "&" + paramName + "=" + paramValue;
    }
    if (url === window.location.href) {
        return;
    }
    window.history.pushState(null, null, url);
};

export const checkGetParameters = (field) => {
    const url = window.location.href;
    if (url.indexOf("?" + field + "=") !== -1) return true;
    else if (url.indexOf("&" + field + "=") !== -1) return true;
    return false;
};

export const changeThemeColor = (color) => {
    const metaThemeColor = window.document.querySelector(
        "meta[name=theme-color]"
    );
    metaThemeColor.setAttribute("content", color);
};

export function bufferDecode(value) {
    return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

// ArrayBuffer to URLBase64
export function bufferEncode(value) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(value)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

export function pathBack(path) {
    const folders =
        path !== null
            ? path.substr(1).split("/")
            : this.props.path.substr(1).split("/");
    return "/" + folders.slice(0, folders.length - 1).join("/");
}

export function filePath(file) {
    return file.path === "/"
        ? file.path + file.name
        : file.path + "/" + file.name;
}

export function hex2bin(hex) {
    return parseInt(hex, 16).toString(2).padStart(8, "0");
}

export function pathJoin(parts, sep) {
    const separator = sep || "/";
    parts = parts.map((part, index) => {
        if (index) {
            part = part.replace(new RegExp("^" + separator), "");
        }
        if (index !== parts.length - 1) {
            part = part.replace(new RegExp(separator + "$"), "");
        }
        return part;
    });
    return parts.join(separator);
}

export function basename(path) {
    if (!path) {
        return "";
    }
    const pathList = path.split("/");
    pathList.pop();
    return pathList.join("/") === "" ? "/" : pathList.join("/");
}

export function filename(path) {
    const pathList = path.split("/");
    return pathList.pop();
}

export function fileNameNoExt(filename) {
    return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

export function randomStr(length) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

export function getNumber(base, conditions) {
    conditions.forEach((v) => {
        if (v) {
            base++;
        }
    });
    return base;
}

export const isMac = () => {
    return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

export const isMobileSafari = () => {
    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const webkit = !!ua.match(/WebKit/i);
    return iOS && webkit && !ua.match(/CriOS/i);
};

export function vhCheck() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}

export const getSelectItemStyles = (name, personName, theme) => {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
};

export const removeI18nCache = () => {
    Object.keys(localStorage).forEach(function (key) {
        if (key && key.startsWith("i18next_res_")) {
            localStorage.removeItem(key);
        }
    });
};

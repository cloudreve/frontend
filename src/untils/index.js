export const sizeToString = bytes => {
    if (bytes === 0 || bytes==="0") return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

export const fixUrlHash = path => {
    var relativePath = path.split("#");
    var url = new URL("http://example.com/" + relativePath[1]);
    return url.toString();
};

export const setCookie = (name, value, days) => {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    }
    document.cookie = name + "=" + (value || "") + "; path=/";
};

export const setGetParameter = (paramName, paramValue) => {
    var url = window.location.href;

    if (url.indexOf(paramName + "=") >= 0) {
        var prefix = url.substring(0, url.indexOf(paramName));
        var suffix = url.substring(url.indexOf(paramName));
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

export const allowSharePreview = () => {
    if (!window.isSharePage) {
        return true;
    }
    if (window.isSharePage) {
        if (window.shareInfo.allowPreview) {
            return true;
        }
        if (window.userInfo.uid === -1) {
            return false;
        }
        return true;
    }
};

export const checkGetParameters = field => {
    var url = window.location.href;
    if (url.indexOf("?" + field + "=") !== -1) return true;
    else if (url.indexOf("&" + field + "=") !== -1) return true;
    return false;
};

export const changeThemeColor = color => {
    var metaThemeColor = window.document.querySelector(
        "meta[name=theme-color]"
    );
    metaThemeColor.setAttribute("content", color);
};

export const decode = c => {
    var e = c.height,
        a = c.width,
        b = document.createElement("canvas");
    b.height = e;
    b.width = a;
    b = b.getContext("2d");
    b.drawImage(c, 0, 0);
    c = b.getImageData(0, 0, a, e);
    b = [];
    for (var d = 0; d < a * e * 4; d += 4)
        0 != (d + 4) % (4 * a) &&
            [].push.apply(b, [].slice.call(c.data, d, d + 3));
    c = e = 0;
    for (
        a = "";
        c < b.length &&
        (16 >= c ||
            (0 == b[c] % 2 ? (e++, (a += "1")) : ((e = 0), (a += "0")),
            17 != e));
        c++
    );
    a = a.slice(0, -16);
    a = a.replace(/[\s]/g, "").replace(/(\d{16})(?=\d)/g, "$1 ");
    e = "";
    a = a.split(" ");
    for (c = 0; c < a.length; c++) {
        b = a[c];
        if (16 == b.length) {
            b = parseInt(b, 2);
            e += String.fromCharCode(b);
        }
    }
    return e;
};
export function bufferDecode(value) {
    return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

// ArrayBuffer to URLBase64
export function bufferEncode(value) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(value)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

export function pathBack(path) {
    let folders =
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

export function hex2bin(hex){
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}
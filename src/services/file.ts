import API from "../middleware/Api";

export async function getDownloadURL(file: any): Promise<any> {
    let reqURL = "";
    if (file.key) {
        const downloadPath =
            file.path === "/"
                ? file.path + file.name
                : file.path + "/" + file.name;
        reqURL =
            "/share/download/" +
            file.key +
            "?path=" +
            encodeURIComponent(downloadPath);
    } else {
        reqURL = "/file/download/" + file.id;
    }

    return API.put(reqURL);
}

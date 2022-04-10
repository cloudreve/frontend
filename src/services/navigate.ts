import API from "../middleware/Api";

export async function list(
    path: string,
    share: any,
    keywords: string
): Promise<any> {
    const apiURL = share
        ? "/share/list/" + share.key
        : keywords === ""
        ? "/directory"
        : "/file/search/";
    path = keywords === "" ? path : keywords;
    return API.get(apiURL + encodeURIComponent(path));
}

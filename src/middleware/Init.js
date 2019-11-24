import { setSiteConfig, toggleSnackbar } from "../actions/index"
import { fixUrlHash } from "../untils/index"
import API from "./Api"
export var InitSiteConfig = (rawStore) => {
    // 从缓存获取默认配置
    let configCache = JSON.parse(localStorage.getItem('siteConfigCache'));
    if (configCache != null) {
        rawStore.siteConfig = configCache
    }
    // 检查是否有path参数
    var url = new URL(fixUrlHash(window.location.href));
    var c = url.searchParams.get("path");
    rawStore.navigator.path = c===null?"/":c;
    return rawStore
}

export async function UpdateSiteConfig(store) {
    API.get("/site/config").then(function(response) {
        let themes = JSON.parse(response.data.themes);
        response.data.theme = themes[response.data.defaultTheme]
        store.dispatch(setSiteConfig(response.data));
        localStorage.setItem('siteConfigCache', JSON.stringify(response.data));
    }).catch(function(error) {
        store.dispatch(toggleSnackbar("top", "right", "无法加载站点配置：" + error.message, "error"));
    });
}
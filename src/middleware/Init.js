
import {setSiteConfig,toggleSnackbar} from "../actions/index"
import API from "./Api"
export var InitSiteConfig = (rawStore)=>{
    let configCache = localStorage.getItem('siteConfigCache');
    if (configCache != null){
        rawStore.siteConfig = configCache
    }
    return rawStore
}

export async function UpdateSiteConfig(store){
    API.get("/Site/Config").then(function (response) {
        let themes = JSON.parse(response.data.themes);
        response.data.theme = themes[response.data.defaultTheme]
        store.dispatch(setSiteConfig(response.data));
        localStorage.setItem('siteConfigCache',response.data);
    }).catch(function (error) {
        store.dispatch(toggleSnackbar("top","right","无法加载站点配置："+error.message,"error"));
    });
}

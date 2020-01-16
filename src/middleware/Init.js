import { setSiteConfig, toggleSnackbar,enableLoadUploader } from "../actions/index"
import { fixUrlHash } from "../untils/index"
import API from "./Api"
import Auth from "./Auth"
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
    // 初始化用户个性配置
    rawStore.siteConfig = initUserConfig(rawStore.siteConfig)
    return rawStore
}

const initUserConfig = (siteConfig) => {
    if (siteConfig.user!==undefined && siteConfig.user.id !==0){
        let themes = JSON.parse(siteConfig.themes);
        let user = siteConfig.user;
        delete siteConfig.user
    
        //更换用户自定配色
        if (user["preferred_theme"] !== "" && themes[user["preferred_theme"]] !== undefined){
            siteConfig.theme = themes[user["preferred_theme"]]
        }

        // 更新登录态
        Auth.authenticate(user);
    }
    return siteConfig
}

export function enableUploaderLoad(){
    // 开启上传组件加载
    let user = Auth.GetUser();
    window.policyType = user!==null?user.policy.saveType : "local";
    window.uploadConfig = user!==null?user.policy:{};
    window.pathCache = [];
}

export async function UpdateSiteConfig(store) {
    API.get("/site/config").then(function(response) {
        let themes = JSON.parse(response.data.themes);
        response.data.theme = themes[response.data.defaultTheme]
        response.data = initUserConfig(response.data)
        store.dispatch(setSiteConfig(response.data));
        localStorage.setItem('siteConfigCache', JSON.stringify(response.data));
    }).catch(function(error) {
        store.dispatch(toggleSnackbar("top", "right", "无法加载站点配置：" + error.message, "error"));
    }).finally(function () {
        enableUploaderLoad(store);
        store.dispatch(enableLoadUploader())
    });
}
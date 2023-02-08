import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import ChainedBackend, { ChainedBackendOptions } from "i18next-chained-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import LocalStorageBackend from "i18next-localstorage-backend";

declare let ASSETS_VERSION: string;

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
i18n.use(ChainedBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en-US",
        debug: true,
        ns: ["common", "application"],
        load: "currentOnly",
        defaultNS: "application",
        interpolation: {
            escapeValue: false,
        },
        backend: {
            backends:
                process.env.NODE_ENV === "development"
                    ? [Backend]
                    : [LocalStorageBackend, Backend],
            backendOptions: [
                {
                    expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
                },
                {
                    queryStringParams: { v: ASSETS_VERSION },
                    loadPath: "/locales/{{lng}}/{{ns}}.json",
                },
            ],
        },
    });

i18n.on("languageChanged", (lng) => {
    document.documentElement.setAttribute("lang", lng);
});

export const languages = [
    {
        code: "en-US",
        displayName: "English",
    },
    {
        code: "zh-CN",
        displayName: "简体中文",
    },
    {
        code: "zh-TW",
        displayName: "繁體中文",
    },
];

export default i18n;

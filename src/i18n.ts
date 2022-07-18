import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "zh-CN",
        debug: true,
        ns: ["common", "application"],
        load: "currentOnly",
        defaultNS: "application",
        interpolation: {
            escapeValue: false,
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
];

export default i18n;

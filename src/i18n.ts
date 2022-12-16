import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
    // and extend them!
    interface CustomTypeOptions {
        returnNull: false;
        // custom namespace type if you changed it
        defaultNS: 'application';
        // custom resources type
        resources: {
            common: typeof import("../public/locales/en-US/common.json");
            application: typeof import("../public/locales/en-US/application.json");
            dashboard: typeof import("../public/locales/en-US/dashboard.json");
        };
    }
}

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        returnNull: false,
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

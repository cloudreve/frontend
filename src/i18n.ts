import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import LanguageDetector from "i18next-browser-languagedetector";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";

const isDev = process.env.NODE_ENV === "development";
isDev && console.log("i18next: set to development mode, localStorage backend disabled.");

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
  {
    code: "ja-JP",
    displayName: "日本語",
  },
  {
    code: "ru-RU",
    displayName: "Русский",
  },
  {
    code: "de-DE",
    displayName: "Deutsch",
  },
  {
    code: "fr-FR",
    displayName: "Français",
  },
  {
    code: "es-ES",
    displayName: "Español",
  },
  {
    code: "pt-BR",
    displayName: "Português",
  },
  {
    code: "it-IT",
    displayName: "Italiano",
  },
  {
    code: "ko-KR",
    displayName: "한국어",
  },
];

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
i18n
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: languages[0].code,
    supportedLngs: languages.map((l) => l.code),
    debug: isDev,
    ns: ["common", "application", "dashboard"],
    load: "currentOnly",
    defaultNS: "application",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      // https://www.i18next.com/how-to/caching#browser-caching-with-local-storage
      // https://github.com/i18next/i18next-localstorage-backend#cache-backend-options
      backends: isDev ? [Backend] : [LocalStorageBackend, Backend],
      backendOptions: isDev
        ? [
            {
              /* HttpApi */
              loadPath: "/locales/{{lng}}/{{ns}}.json",
            },
          ]
        : [
            {
              /* LocalStorageBackend */
              expirationTime: 365 * 24 * 60 * 60 * 1000, // 365 days, cache managed by version control
              defaultVersion: __BUILD_TIMESTAMP__,
            },
            {
              /* HttpApi */
              loadPath: "/locales/{{lng}}/{{ns}}.json",
            },
          ],
    },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.setAttribute("lang", lng);
});

export default i18n;

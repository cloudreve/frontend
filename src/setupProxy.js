/* eslint-disable @typescript-eslint/no-var-requires */
const proxy = require("http-proxy-middleware");
module.exports = function (app) {
    app.use(
        "/api",
        proxy({
            target: "http://101.132.46.115",
            changeOrigin: true,
        })
    );

    app.use(
        "/custom",
        proxy({
            target: "http://101.132.46.115",
            changeOrigin: true,
        })
    );
};

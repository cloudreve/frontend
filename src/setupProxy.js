/* eslint-disable @typescript-eslint/no-var-requires */
const proxy = require("http-proxy-middleware");
module.exports = function (app) {
    app.use(
        "/api",
        proxy({
            target: "https://pan.huang1111.cn",
            changeOrigin: true,
        })
    );

    app.use(
        "/custom",
        proxy({
            target: "https://pan.huang1111.cn",
            changeOrigin: true,
        })
    );
};

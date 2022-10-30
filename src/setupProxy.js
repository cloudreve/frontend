/* eslint-disable @typescript-eslint/no-var-requires */
const proxy = require("http-proxy-middleware");
module.exports = function (app) {
    ["/api","/custom","/f"].map(p=>app.use(
        p,
        proxy({
            target: "http://localhost:5212",
            changeOrigin: true,
        })
    ))
};

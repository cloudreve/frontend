const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/File', proxy({
    target: 'https://lite.aoaoao.me',
    changeOrigin: true,
    onProxyReq (proxyReq, req) {
            // 将本地请求的头信息复制一遍给代理。
            // 包含cookie信息，这样就能用登录后的cookie请求相关资源
        Object.keys(req.headers).forEach(function (key) {
            proxyReq.setHeader(key, req.headers[key])
        })
    },
    onProxyRes (proxyRes, req, res) {
        // 将服务器返回的头信息，复制一遍给本地请求的响应。
        // 这样就能实现 执行完登录后，本地的返回请求中也有相关cookie，从而实现登录功能代理。
        Object.keys(proxyRes.headers).forEach(function (key) {
            res.append(key, proxyRes.headers[key])
        })
    }

  }));
  app.use('/static/js/uploader', proxy({
    target: 'https://lite.aoaoao.me',
    changeOrigin: true,
  }));
  app.use('/static/js/uploader', proxy({
    target: 'https://lite.aoaoao.me',
    changeOrigin: true,
  }));
  app.use('/Member', proxy({
    target: 'https://lite.aoaoao.me',
    changeOrigin: true,
  }));
}; 
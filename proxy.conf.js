const PROXY_CONFIG = [
    {
        context: ['/api'],
        target: 'http://cmpaas.org/v1/',
        secure: false,
        logLevel: 'debug',
        pathRewrite: { '^/api': ''}
    }
];

module.exports = PROXY_CONFIG;
const PROXY_CONFIG = [
    {
        context: ['/api'],
        target: 'https://cmpaas-nest.herokuapp.com/v1',
        secure: false,
        logLevel: 'debug',
        pathRewrite: { '^/api': ''}
    }
];

module.exports = PROXY_CONFIG;
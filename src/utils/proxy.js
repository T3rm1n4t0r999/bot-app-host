class proxy{
    static async getProxyAgent(){
        const proxyUrl = process.env.SOCKS_PROXY;
        let agent = null;

        if (proxyUrl) {
            // Формат прокси: socks5://username:password@host:port
            // Или можно собрать URL из отдельных переменных
            const proxyOptions = {
                host: process.env.SOCKS_PROXY_HOST,
                port: process.env.SOCKS_PROXY_PORT,
                username: process.env.SOCKS_PROXY_USERNAME,
                password: process.env.SOCKS_PROXY_PASSWORD
            };

            // Используем либо полный URL, либо собираем из компонентов
            if (proxyUrl.includes('://')) {
                agent = new SocksProxyAgent(proxyUrl);
            } else if (proxyOptions.host && proxyOptions.port) {
                const auth = proxyOptions.username && proxyOptions.password
                    ? `${encodeURIComponent(proxyOptions.username)}:${encodeURIComponent(proxyOptions.password)}@`
                    : '';
                const constructedProxyUrl = `socks5://${auth}${proxyOptions.host}:${proxyOptions.port}`;
                agent = new SocksProxyAgent(constructedProxyUrl);
            }

            if (agent) {
                console.log('SOCKS5 прокси с аутентификацией настроен');
            }
        }
        return agent;
    }

}

module.exports = proxy;
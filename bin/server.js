import config from '../config';
import server from '../server/main';
import _debug from 'debug';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

const debug = _debug('app:bin:server');
const port = config.server_port;
const host = config.server_host;

if (!config.server_ssl) {
    // serve over HTTP
    http.createServer(server.callback()).listen(port);
    debug(`Server is now running at http://${host}:${port}`);
}
else {

    // serve over HTTPS
    const certPath = path.join(__dirname, 'sslcert', 'server');
    const httpsOptions = {
        key: fs.readFileSync(path.join(certPath, "server.key.pem")),
        ca: [fs.readFileSync(path.join(certPath, "private-root-ca.crt.pem"))],
        cert: fs.readFileSync(path.join(certPath, "server.crt.pem")),
    };
    https.createServer(httpsOptions, server.callback()).listen(port);
    debug(`Server is now running at https://${host}:${port}`);
}

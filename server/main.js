import Koa from 'koa';
import convert from 'koa-convert';
import webpack from 'webpack';
import webpackConfig from '../build/webpack.config';
import historyApiFallback from 'koa-connect-history-api-fallback';
import serve from 'koa-static';
import _debug from 'debug';
import config from '../config';
import webpackProxyMiddleware from './middleware/webpack-proxy';
import webpackDevMiddleware from './middleware/webpack-dev';
import webpackHMRMiddleware from './middleware/webpack-hmr';

const debug = _debug('app:server');
const paths = config.utils_paths;
const app = new Koa();

// Install a handler for /api requests
app.use(async (ctx, next) => {
    const request = ctx.request;
    if (request.method === "GET" && request.path === "/api") {
        const page = request.query.page || "0";

        // just sleep a little while then return the value
        await new Promise(resolve => setTimeout(resolve, 200));
        ctx.response.body = { data: `This is the data for page ${page}` };
        return;
    }

    await next();
});

// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement isomorphic
// rendering, you'll want to remove this middleware.
app.use(convert(historyApiFallback({
    verbose: false
})));

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
    const compiler = webpack(webpackConfig);

  // Enable webpack-dev and webpack-hot middleware
    const { publicPath } = webpackConfig.output;

    if (config.proxy && config.proxy.enabled) {
        const options = config.proxy.options;
        app.use(convert(webpackProxyMiddleware(options)));
    }

    app.use(webpackDevMiddleware(compiler, publicPath));
    app.use(webpackHMRMiddleware(compiler));

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
    app.use(convert(serve(paths.client('static'))));
}
else {
    debug(
    'Server is being run outside of live development mode. This starter kit ' +
    'does not provide any production-ready server functionality. To learn ' +
    'more about deployment strategies, check out the "deployment" section ' +
    'in the README.'
  );

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
    app.use(convert(serve(paths.base(config.dir_dist))));
}

export default app;

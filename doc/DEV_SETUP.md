Instructions for new developers to work with this repo

## Add local.server.com to your hosts file

When developing the app, you will be using a local web server to serve the assets to your browser via HTTPS.
For various reasons, HTTPS shouldn't be served over the `localhost` DNS name.
Thus, the content is served via the `local.server.com` domain.

You need to add a line to your `hosts` file to map `local.server.com` to `127.0.0.1` otherwise your
browser will not be able to resolve the URL.

Exactly how to do this is OS-dependent

### Windows 10 Instructions

* Open your favorite Text Editor *as Administrator*
 * Example: Start -> Type `notepad` -> Right click on the Notepad app and choose `Run as administrator`
* Once the editor is open, open `C:\Windows\System32\drivers\etc\hosts` (note there is NO EXTENSION on this file)
* Add this line:
 * `127.0.0.1 local.server.com`
* Save the file

## Install Node

Install [nodejs](https://nodejs.org) on your computer.

The most recent version of node 6 is recommended since it is the current long term support release. The latest version should also work. Versions 6.9.5 and 7.5.0 have been tested with this starter kit.

## Verify Node and NPM versions

`node -v` should report `v6.9.5` or similar
`npm -v` should report `3.10.10` or similar.

## Clone repo

Clone the repo to your local computer

## Update your Git Author

Go into the repo and ensure that your git author name and email are set to your company email

```bash
cd opendoor-trading
git config --local user.email "you@experoinc.com"
git config --local user.name "Your Name"
```
## Install dependencies

Run `npm install` and let it cook for a while to download and install all of the dependencies for this app

## See if it works

Run `npm start` and wait for it to build and start the test server.  Eventually it will say `webpack: bundle is now VALID.`

Open a web browser and navigate to [https://local.server.com:3000/](https://local.server.com:3000/) and see if the app loads

Kill the webserver and try `npm run test` to see if the unit tests run

## Learn the build commands

* `npm start` - Spins up Koa server to serve your app at `localhost:3000`. Hot Module Reload will be enabled in development. (your webpage will update in place as you edit your React components)
* `npm run compile` - Compiles the application to disk (`~/dist` by default).
* `npm run dev` - Same as `npm start`, but enables nodemon to automatically restart the server when server-related code is changed.
* `npm run dev:nw` - Same as `npm run dev`, but opens the redux devtools in a new window.
* `npm run dev:no-debug` - Same as `npm run dev` but disables redux devtools.
* `npm run test` - Runs unit tests with Karma and generates a coverage report.
* `npm run test:dev` - Runs Karma and watches for changes to re-run tests; does not generate coverage reports.
* `npm run deploy`- Runs linter, tests, and then, on success, compiles your application to disk.
* `npm run lint`- Lint all `.js` files.
* `npm run lint:fix` - Lint and fix all `.js` files. [Read more on this](http://eslint.org/docs/user-guide/command-line-interface.html#fix).

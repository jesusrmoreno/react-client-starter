# Developer Guide

Make sure you've [setup](DEV_SETUP.md) your machine correctly.

## Build Commands

| Command | Description | Runs lint? | Defined Constants |
| --- | --- | --- | --- |
| npm start | builds and runs hot-reload server.  The app is hosted at http://local.server:3000/ | :no: | `__DEV__`, `__CHECK__` |
| npm run start:quiet | just like `start` but does not log Redux actions to console | :no: | `__DEV__`, `__CHECK__` |
| npm run start:debug | just like `start` but enables Redux Dev Tools | :no: | `__DEV__`, `__CHECK__` |
| npm run lint | Does not build the app.  just runs eslint on it. | :yes: | `__DEV__`, `__CHECK__` |
| npm run test | Builds the app and runs the unit tests | :yes: | `__DEV__`, `__CHECK__`, `__TEST__` |
| npm run deploy | Builds the app in production mode and stores the built assets in the `dist` folder | :yes: | `__PROD__`, `__CHECK__`, `__TEST__` |
| npm run deployprod | Just like `deploy` but disables `__CHECK__` which effectively turns off your invariant checks | :yes: | `__PROD__`, `__TEST__` |
| npm run clean | Deletes the `dist` folder | :no: | - |

## Defined Constants

You can access the following compile-time constants in your code.  The boolean constants are useful because any
code gated on them will be eliminated as dead code when the application is built with that constant set to `false`.
This makes it handy to have extra code in `__DEV__` mode or `__CHECK__` mode.

| Constant | Purpose |
| --- | --- |
| `__DEV__` | true if the app is in developer mode (e.g. your local build).  The app is not minified in this mode |
| `__PROD__` | true if the app is in production mode (e.g. the deployed version).  The app is minified in this mode.  Only one of `__DEV__` or `__PROD__` is ever true |
| `__TEST__` | true if the app is being run as part of unit tests |
| `__CHECK__` | true if the app is built with invariant testing enabled.  Use this to gate your invariant tests: `if (__CHECK__) { invariant(...); }` |
| `__LOG__` | true if the Redux actions are being logged to the console |
| `__DEBUG__` | true if the Redux Dev Tools are enabled |
| `__APPTITLE__` | the name of the application (a string) |
| `__BASENAME__` | The root path of the application (usually `/`) |


## Typical dev workflow

* `git pull` to get latest code
* `npm install` to install any new packages (you can defer this until you get an error about missing packages)
* `npm start` to build and start the hot-reload server
* visit http://local.server:3000/
* Edit the code and save
* If your edits were to styling or rendered html, the page will just update automatically.
* If your edits were to redux reducers, you probably need to Refresh the browser page
* `npm run lint` to check your changes (if you use WebStorm, it will run it continuously as you type and put red squiggles under lint errors)
* `git add && git commit && git push` commit your changes and push them to the repo

## Where do image assets go?

Read about that [here](IMAGE_ASSETS.md).

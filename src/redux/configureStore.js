import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import rootReducer from './rootReducer';
import norecurse from './utils/norecurse';
import timetravel from './utils/timetravel';

function getReduxLogger() {
    if (__LOG__) {
        return applyMiddleware(require('redux-logger')({
            collapsed: true,
            duration: true,
            timestamp: true,
            logErrors: false, // false if  you need to use "break on errors" in the debugger
            level: action => action.error ? "warn" : "log",
            predicate: (getState, action) => true,
        }));
    }

    return createStore => createStore;
}

export default function configureStore (initialState = {}) {
    // Compose final middleware and use devtools in debug environment
    let middleware = compose(applyMiddleware(thunk, promiseMiddleware()), norecurse, getReduxLogger());

    if (__DEBUG__) {
        const devTools = window.devToolsExtension
      ? window.devToolsExtension()
      : require('containers/DevTools').default.instrument();
        middleware = compose(timetravel, middleware, devTools);
    }

    // Create final store and subscribe router in debug env ie. for devtools
    const store = middleware(createStore)(rootReducer, initialState);

    if (module.hot) {
        module.hot.accept('./rootReducer', () => {
            const nextRootReducer = require('./rootReducer').default;

            store.replaceReducer(nextRootReducer);
        });
    }
    return store;
}

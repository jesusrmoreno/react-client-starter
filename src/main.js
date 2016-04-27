import React from 'react';
import {render} from 'react-dom';
import getHistory from 'util/history';
import makeRoutes from './routes';
import Root from './containers/Root';
import configureStore from './redux/configureStore';
import { syncHistoryWithStore } from 'react-router-redux';

function init() {
    // Create the Redux store
    const initialState = {};
    const store = configureStore(initialState);

    // Create an enhanced history that syncs with the Redux store
    const history = getHistory();
    const syncedHistory = syncHistoryWithStore(history, store, {selectLocationState: state => state.router});

    const routes = makeRoutes(store);

    // Render the React application to the DOM
    const root = document.getElementById("root");
    if (!root) {
        throw new Error("#root element not found in DOM");
    }

    render(<Root history={syncedHistory} routes={routes} store={store}/>, root);
}

// Wait until the DOM has finished loading before initializing the application.
// Note: Some browsers do not fire DOMContentLoaded if it has already loaded, so check if we are already loaded first
if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}

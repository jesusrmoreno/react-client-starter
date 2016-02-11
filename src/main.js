import React from 'react';
import ReactDOM from 'react-dom';
import { useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import makeRoutes from './routes';
import Root from './containers/Root';
import configureStore from './redux/configureStore';
import { syncHistoryWithStore } from 'react-router-redux';

// Create the Redux store
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);

// Create the History component
const history = useRouterHistory(createHistory)({ basename: __BASENAME__ });

// Create an enhanced history that syncs with the Redux store
const syncedHistory = syncHistoryWithStore(history, store, {selectLocationState: state => state.router});

const routes = makeRoutes(store);

// Render the React application to the DOM
ReactDOM.render(
  <Root history={syncedHistory} routes={routes} store={store} />,
  document.getElementById('root')
);

import { combineReducers } from 'redux';
import {makeAction, createReducer} from '../utils/redux-helpers';
import createAsyncCacheStore from '../utils/async-cache';

function prefix (type) { return `sample/${type}`; }
function getSampleState(state) { return state.sample; }

/**
 * Issue ajax call to get data for this page.
 * Use the new browser fetch API (this project has a polyfill installed for older browsers)
 * @param page
 * @returns {*}
 */
async function fetchDataAsync(page) {
    const response = await fetch(`/api?page=${page}`);
    if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
    }

    const json = await response.json();
    return json.data;
}

// Create a set of actions, reducers, etc that retrieves and caches data from server
const apiDataStore = createAsyncCacheStore({
    // the generated actions will have this prefix
    actionPrefix: prefix("cache"),
    // the number of stale results to keep in the LRU cache
    maxCacheSize: 4,
    // given the root Redux store, returns the piece of the store where this cached data will be located
    getLocalState: state => getSampleState(state).api,
    // given the set of arguments to fetchData, return a single string key to be used as the cache key for the data
    getKey: page => `${page}`,
    // Called when new data needs to be fetched from the server
    fetchData: fetchDataAsync,
});

// ------------------------------------
// Action Types
// ------------------------------------
export const actionTypes = {
    SET_CURRENT_PAGE: prefix("SET_CURRENT_PAGE"),
    // include the action types used by the api data cache
    ...apiDataStore.actionTypes,
};

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
    setCurrentPage: page => (dispatch, getState) => {
        // see if the page is actually different
        const currentPage = getSampleState(getState()).currentPage;
        if (currentPage !== page) {
            dispatch(makeAction(actionTypes.SET_CURRENT_PAGE, { page }));
        }
    },
    /* apiDataStore exposes subscribe/unsubscribe actions that we could expose like so:

        subscribePageData: apiDataStore.actions.subscribe, // subscribePageData(pageNumber)
        unsubscribePageData: apiDataStore.actions.unsubscribe, // unsubscribePageData(pageNumber)

     * but rather than use these actions directly, we rely upon util.observe, which we call from databind()
     */
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const initialState = {
    currentPage: 0,
    // put the cached store in the "api" key.  (this must match getLocalState() definition above
    api: apiDataStore.initialState,
};

const ACTION_HANDLERS = {
    currentPage: createReducer(initialState.currentPage, {
        [actionTypes.SET_CURRENT_PAGE]: (state, {payload}) => payload.page,
    }),
    // create the apiDataStore reducer
    api: createReducer(initialState.api, apiDataStore.handlers),
};

// ------------------------------------
// Reducer
// ------------------------------------
export default combineReducers(ACTION_HANDLERS);

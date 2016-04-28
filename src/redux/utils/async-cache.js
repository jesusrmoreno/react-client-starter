/**
 * Created by bwallace on 4/27/2016.
 */
import {makeAction, makePromise, handlePromise, LOADING} from './redux-helpers';
import * as lru from 'util/lru';
import invariant from 'invariant';
import Disposable from 'rx.disposables/disposable';

function hasProperty (object, name) {
    return Object.prototype.hasOwnProperty.call(object, name);
}

export default function createAsyncCacheStore ({
    actionPrefix,
    maxCacheSize = 10,
    getLocalState,
    getKey,
    fetchData,
}) {
    const actionTypes = {
        /**
         * prefix for loading data from server.  Actual actions will have a suffix of _PENDING, _FULFILLED, _REJECTED
         */
        LOAD: `${actionPrefix}_LOAD`,
        /**
         * action for when the data is being pulled from the cache
         */
        LOAD_FROM_CACHE: `${actionPrefix}_LOAD_FROM_CACHE`,
        /**
         * action for when someone wants to express interest or disinterest in a value
         */
        MONITOR: `${actionPrefix}_MONITOR`,
    };

    const initialState = {
        entries: {},
        numSubscribers: {},
        cache: lru.create(maxCacheSize),
    };

    const actions = {
        subscribe: (...keyArgs) => (dispatch, getState) => {
            const state = getState();
            const {entries, cache} = getLocalState(state);
            const key = getKey(...keyArgs);
            if (key == null) {
                return;
            }
            if (hasProperty(entries, key)) {
                // This object is already loaded (or loading).
                // just increment the subscriber count
                dispatch(makeAction(actionTypes.MONITOR, {key, change: 1}));
            }
            else {
                // No current subscribers for this value
                // Do we have the value cached?
                if (lru.has(cache, key)) {
                    // we found it in the cache
                    dispatch(makeAction(actionTypes.LOAD_FROM_CACHE, key));
                }
                else {
                    // Not in the cache.  Issue a load request
                    const promise = fetchData(state, ...keyArgs);
                    __CHECK__ && invariant(promise && promise.then, "fetchData must return a promise");
                    dispatch(makePromise(actionTypes.LOAD, promise, key));
                }
            }
        },
        unsubscribe: (...keyArgs) => (dispatch, getState) => {
            const key = getKey(...keyArgs);
            if (key != null) {
                dispatch(makeAction(actionTypes.MONITOR, {key: getKey(...keyArgs), change: -1}));
            }
        },
    };

    const handlers = {
        [actionTypes.LOAD_FROM_CACHE]: (localState, {payload: key}) => {
            // Remove the entry from the cache and add as an entry with 1 subscriber
            const {item: entry, lru: newCache} = lru.remove(localState.cache, key);
            const newNumSubscribers = {...localState.numSubscribers, [key]: 1};
            const newEntries = {...localState.entries, [key]: entry};

            return {entries: newEntries, numSubscribers: newNumSubscribers, cache: newCache};
        },

        [actionTypes.MONITOR]: (localState, {payload: {key, change}}) => {
            // update numSubscribers
            const {[key]: currentNumSubscribers, ...newNumSubscribers} = localState.numSubscribers;
            const numSubscribers = currentNumSubscribers + change;
            if (numSubscribers <= 0) {
                // no one is interested in this anymore.  Remove the entry
                // and place it in the cache if the entry is not an error
                const {[key]: entry, ...newEntries} = localState.entries;
                const cache = entry.error ? localState.cache : lru.add(localState.cache, key, entry);
                return {entries: newEntries, numSubscribers: newNumSubscribers, cache};
            }
            else {
                // There is still interest in this entry.  We just need to update the subscriber count
                newNumSubscribers[key] = numSubscribers;
                return {entries: localState.entries, numSubscribers: newNumSubscribers, cache: localState.cache};
            }
        },
        ...handlePromise(actionTypes.LOAD,
            ({cache, entries, numSubscribers}, {meta: key}) => {
                // Add a "loading" entry with 1 subscriber
                return {
                    entries: {...entries, [key]: LOADING},
                    cache,
                    numSubscribers: {...numSubscribers, [key]: 1}
                };
            },
            ({cache, entries, numSubscribers}, {meta: key, payload: data}) => {
                // load finished
                if (hasProperty(entries, key)) {
                    // set the value
                    return {
                        entries: {...entries, [key]: {data}},
                        cache,
                        numSubscribers
                    };
                }
                else {
                    // Subscriber left before load finished.  Throw the result
                    // into the cache
                    return {
                        entries,
                        cache: lru.add(cache, key, {data}),
                        numSubscribers
                    };
                }
            },
            (localState, {meta: key, payload: error}) => {
                // Load request failed
                const {cache, entries, numSubscribers} = localState;
                if (hasProperty(entries, key)) {
                    return {
                        entries: {...entries, [key]: {error}},
                        cache,
                        numSubscribers
                    };
                }
                else {
                    // they stopped watching before the load finished
                    // do NOT put errors into the cache...
                    return localState;
                }
            }),
    };

    const util = {
        /**
         * Gets the entry indicated by keyArgs.
         * Returns {loading: true} if the entry is still being fetched
         * Returns {error: ErrorObject} if an error occurred while fetching
         * Returns {data: theData} if the data is ready
         * @param state
         * @param keyArgs
         * @returns {*}
         */
        getEntry(state, ...keyArgs) {
            const key = getKey(...keyArgs);
            const entries = getLocalState(state).entries;
            const hasEntry = (key != null) && hasProperty(entries, key);
            return hasEntry ? entries[key] : LOADING;
        },
        /**
         * Expresses interest in a value, which causes the value to be loaded and remain in memory.
         * Dispose of the returned disposable when you are no longer interested in this value.
         * @param dispatch
         * @param keyArgs
         * @returns {Object}
         */
        observe(dispatch, ...keyArgs) {
            dispatch(actions.subscribe(...keyArgs));
            return Disposable.create(() => dispatch(actions.unsubscribe(...keyArgs)));
        }
    };

    return {actionTypes, initialState, actions, handlers, util};
}

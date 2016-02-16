import {makeAction, makePromise, handlePromise, createReducer} from '../utils/redux-helpers';

function prefix (type) { return `counter/${type}`; }

// ------------------------------------
// Action Types
// ------------------------------------
export const actionTypes = {
    COUNTER_INCREMENT: prefix('COUNTER_INCREMENT'),
    COUNTER_DOUBLE: prefix('COUNTER_DOUBLE'),
};

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
    increment: (value = 1) => makeAction(actionTypes.COUNTER_INCREMENT, value),
    // Makes use of the thunk middleware and the promise middleware
    doubleAsync: () => (dispatch, getState) => {
        const promise = new Promise(resolve => setTimeout(resolve, 200));
        dispatch(makePromise(actionTypes.COUNTER_DOUBLE, promise));
    },
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [actionTypes.COUNTER_INCREMENT]: (state, {payload}) => state + payload,
    ...handlePromise(actionTypes.COUNTER_DOUBLE, null, state => state * 2, null)
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = 0;
export default createReducer(initialState, ACTION_HANDLERS);

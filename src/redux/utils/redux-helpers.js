/** Global LOADING object to use to indicate loading */
export const LOADING = { loading: true };

/** Global EMPTY object to use for an empty object */
export const EMPTY = {};

/**
 * Takes an initial state and map of action handlers (keyed by action type) and produces a single action handler
 * that dispatches the action
 * to the matching handler.  If there is no matching handler, then the state is not modified
 * @param initialState The state to use if the store doesn't yet have state
 * @param handlers The map of handlers, keyed by action.type
 * @returns {update} A single reducer that dispatches to the supplied handlers
 */
export function createReducer (initialState, handlers) {
    return function update (state = initialState, action) {
        const {type} = action;
        return handlers.hasOwnProperty(type) ? handlers[type](state, action) : state;
    };
}

/**
 * Creates an FSA-compliant action (https://github.com/acdlite/flux-standard-action)
 * @param type The action type
 * @param payload The data for this action.  If payload is an Error instance, then the action.error property will be
 * set to true
 * @param meta Additional metadata for this action
 */
export function makeAction (type, payload, meta) {
    const result = Object.create(null);
    result.type = type;
    if (payload !== undefined) { result.payload = payload; }
    if (meta !== undefined) { result.meta = meta; }
    if (payload instanceof Error) { result.error = true; }
    return result;
}

/**
 * Creates an FSA-compliant action with a Promise for its payload to be processed by promise middleware
 * This action will generate an immediate action of ${type}_PENDING and then will eventually generate either
 * ${type}_FULFILLED or ${type}_REJECTED when the promise resolves or rejects
 * @param type The action type
 * @param promise The promise to await
 * @param meta Any metadata associated with the request.  The FULFILLED/REJECTED/PENDING reducers may use this metadata
 */
export function makePromise (type, promise, meta) {
    return makeAction(type, { promise }, meta);
}

/**
 * Creates an object with 1-3 handlers for the different phases of a promise
 * @param type The action type containing the promise
 * @param pending If supplied, the handler to call when the promise action is first dispatched.
 * @param fulfilled If supplied, the handler to call when the promise action resolves successfully.  payload will have
 * the promise result
 * @param rejected If supplied, the handler to call when the promise action is rejected.  payload will have the error.
 * @returns {null}
 */
export function handlePromise (type, pending, fulfilled, rejected) {
    const result = Object.create(null);
    if (pending) {
        result[`${type}_PENDING`] = pending;
    }

    if (fulfilled) {
        result[`${type}_FULFILLED`] = fulfilled;
    }

    if (rejected) {
        result[`${type}_REJECTED`] = rejected;
    }

    return result;
}

/**
 * Standard set of handlers for a promise that is loading data.
 * It handles the PENDING action by setting the state to { loading: true }
 * It handles the FULFILLED action by setting the state to { data: resultOfPromise }
 * It handles the REJECTED action by setting the state to { error: errorFromPromise }
 * @param type
 * @param stateMutator Function to mutate state.  Its signature is: function(state, payload, meta) : newState
 * @returns {null}
 */
export function handleLoadingPromise (type, stateMutator) {
    return handlePromise(type,
        (state, { meta }) => stateMutator(state, LOADING, meta),
        (state, { meta, payload }) => stateMutator(state, { data: payload }, meta),
        (state, { meta, payload }) => stateMutator(state, { error: payload }, meta));
}

/**
 * Dispatches the action if the new value is different than the current state value
 * @param getStateValue function to get the current value from state.  function(state: State) : value
 * @param getAction function to create the action:  function(newValue, state: State) : action
 * @returns {Function}
 */
export function dispatchIfDifferent (getStateValue, getAction) {
    return (newValue, ...args) => (dispatch, getState) => {
        const state = getState();
        const oldValue = getStateValue(state, ...args);
        if (newValue !== oldValue) {
            dispatch(getAction(newValue, ...args, state));
        }
    };
}

/**
 * Created by bwallace on 4/27/2016.
 */
/*
 By default, calling store.dispatch() will synchronously notify store subscribers
 If those subscribers dispatch more actions, you get into a recursive nesting of
 dispatch -> notify -> dispatch -> notify -> ...
 This messes up some things that assume another dispatch/reduce will not run while we are still dispatching
 Lets change it so that subscribers are only notified when the outer most call to dispatch
 completes
 This middleware should be installed AFTER promises and thunks, but before anything like logging
 */
export default function norecurse (next) {
    return (...args) => {
        const store = next(...args);
        const listeners = [];
        let dispatchLevel = 0;
        let notificationPending = false;
        let unsubscribeUnderlying;

        function notifyListeners() {
            if (notificationPending && dispatchLevel === 0) {
                notificationPending = false;
                listeners.slice().forEach(listener => listener());
            }
        }

        function onStoreUpdate() {
            notificationPending = true;
            notifyListeners();
        }

        function subscribe (listener) {
            listeners.push(listener);

            if (!unsubscribeUnderlying) {
                notificationPending = false;
                unsubscribeUnderlying = store.subscribe(onStoreUpdate);
            }

            return function unsubscribe () {
                const index = listeners.indexOf(listener);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }

                if (listeners.length === 0) {
                    unsubscribeUnderlying();
                    unsubscribeUnderlying = undefined;
                }
            };
        }

        function dispatch (...args) {
            ++dispatchLevel;
            try {
                store.dispatch(...args);
            }
            finally {
                --dispatchLevel;
                notifyListeners();
            }
        }

        return {...store, dispatch, subscribe};
    };
}

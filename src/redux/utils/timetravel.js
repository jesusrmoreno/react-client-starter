/**
 * Created by bwallace on 4/27/2016.
 */
let timetravel;

if (__DEBUG__) {
    let timeTravelling = false;

    // expose global method dev can use to turn on time travelling
    window.hgwells = function () {
        timeTravelling = !timeTravelling;
        if (timeTravelling) {
            console.log("Time travelling enabled.  Beware the morlocks");
        }
        else {
            console.log("Time travelling disabled");
        }
    };

    // Store enhancer that just throws away all dispatched actions.  Install it such that it captures
    // thunks as well!
    timetravel = next => (...args) => {
        const store = next(...args);

        function dispatch(...args) {
            if (!timeTravelling) {
                return store.dispatch(...args);
            }
        }

        return {...store, dispatch};
    };
}

export default timetravel;

/**
 * Created by bwallace on 4/27/2016.
 */
import { createHistory } from 'history';
import { useRouterHistory } from 'react-router';

let history;

function create () {
    /*
     Give it the base path of the app so that
     we can use urls like "/foo" in our app and they will get mapped to
     __BASENAME__/foo
     */

    // if __BASENAME__ is "/", then do not supply it because it is not needed.
    const options = (__BASENAME__ === "/") ? {} : {basename: __BASENAME__};
    return useRouterHistory(createHistory)(options);
}

/**
 * Returns the global History object
 * @returns {*}
 */
export default function getHistory () {
    // Create the history object if it does not yet exist
    return history || (history = create());
};

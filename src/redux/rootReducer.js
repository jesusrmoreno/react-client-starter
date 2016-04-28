import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './modules/counter';
import sample from './modules/sample';

export default combineReducers({
    counter,
    sample,
    router
});

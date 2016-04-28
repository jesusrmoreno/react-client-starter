/**
 * Created by bwallace on 4/28/2016.
 */
import React, {PropTypes} from 'react';
import databind from 'redux/utils/databind';
import Slider from 'material-ui/Slider';
import CircularProgress from 'material-ui/CircularProgress';
import AlertError from 'material-ui/svg-icons/alert/error';
import css from './SampleDataViewer.scss';
import {actions as sampleActions, getPageData, observePageData} from 'redux/modules/sample';

// testable class without redux connection
export class SampleDataViewer extends React.Component {
    static propTypes = {
        // standard props

        // from databind
        currentPage: PropTypes.number.isRequired,
        maxPages: PropTypes.number.isRequired,
        pageData: PropTypes.object.isRequired,

        // actions
        setCurrentPage: PropTypes.func.isRequired,
    };

    /* @databind finds this method and passes it to Redux connect() as the mapStateToProps method */
    static databind (state) {
        const maxPages = state.counter + 1;
        const currentPage = Math.min(state.sample.currentPage, maxPages);
        const pageData = getPageData(state, currentPage);
        return {maxPages, currentPage, pageData};
    }

    /* @databind finds this property and passes it to Redux connect() as the mapActionsToProps method */
    static actions = {
        setCurrentPage: sampleActions.setCurrentPage,
    };

    /* @databind finds this method and calls it when mounting or when props change.
       Use this as an opportunity to subscribe to data (aka make ajax requests)
     */
    static observe() {
        /*
         return an array of {prop,observe} objects.

            prop - the 'prop' property is a function which takes as inputs the props passed to this component
                    and returns as output the subset of the props which are inputs into the data query
            observe - the 'observe' property is a function which takes as inputs the props passed to this component
                    (hopefully just the same subset as returned by the props method),
                    as well as the Redux dispatch method.
                    It should issue ajax calls (or Redux actions to trigger ajax calls)
                    It should return an IDisposable object that, when disposed, can issue new Redux actions to signal
                    the data is no longer needed

          In componentDidMount(), all of the prop methods in the array will be called and their results saved.
          Then all of the observe methods will be called.
          In componentDidUpdate(), it will call all of the props methods again.  If any of those methods return
          different values than the previous call, then their corresponding observe() method will be called.
          Then the old corresponding Disposable will be called (to unobserve the old data from the old props).
          In componentWillUnmount(), all of the disposables are disposed to unobserve all data.
         */

        return [
            {
                // whenever these props change
                props: ({currentPage}) => ({currentPage}),
                // call this method
                observe: ({currentPage, dispatch}) => observePageData(dispatch, currentPage),
            },
        ];
    }

    onSliderChange = (ev, value) => this.props.setCurrentPage(value);

    renderPageData(pageData) {
        if (pageData.loading) {
            return <CircularProgress />;
        }

        if (pageData.error) {
            return (
                <div className={css.error}>
                    <AlertError />
                    {pageData.error.message}
                </div>
            );
        }

        return <div>{pageData.data}</div>;
    }

    render () {
        const {currentPage, maxPages, pageData} = this.props;

        return (
            <div>
                {/*
                    note slider does not update correctly when maxPages changes due to Material UI bug:
                    https://github.com/callemall/material-ui/issues/4114
                */}
                <Slider step={1} min={0} max={maxPages} value={currentPage} onChange={this.onSliderChange} />
                {this.renderPageData(pageData)}
            </div>
        );
    }
}

// default export with redux connection
export default databind(SampleDataViewer);

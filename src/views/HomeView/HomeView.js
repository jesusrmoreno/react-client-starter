import React, {PropTypes} from 'react';
import databind from 'redux/utils/databind';
import {Link} from 'react-router';
import {actions as counterActions} from '../../redux/modules/counter';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import css from './HomeView.scss';
import DocumentTitle from 'components/DocumentTitle';
import SampleDataViewer from 'components/SampleDataViewer';
import classnames from 'classnames';

// testable class without redux connection
export class HomeView extends React.Component {
    static propTypes = {
        counter: PropTypes.number.isRequired,
        doubleAsync: PropTypes.func.isRequired,
        increment: PropTypes.func.isRequired
    };

    /* @databind finds this method and passes it to Redux connect() */
    static databind ({counter}) {
        return {counter};
    }

    /* @databind finds this property and passes it to Redux connect() */
    static actions = {
        increment: counterActions.increment,
        doubleAsync: counterActions.doubleAsync,
    };

    incrementByOne = () => this.props.increment(1);

    render () {
        const isEven = (this.props.counter % 2) === 0;
        const counterClass = classnames(css.counter, isEven ? css.even : css.odd);
        return (
            <DocumentTitle title="Home">
                <Paper className={css.main}>
                    <div className={css.duck} />
                    <h1>Welcome to the React Redux Starter Kit</h1>
                    <h2>
                        Sample Counter:
                        {' '}
                        <span className={counterClass}>{this.props.counter}</span>
                    </h2>
                    <RaisedButton label="Increment" onClick={this.incrementByOne} />
                    {' '}
                    <RaisedButton label="Double (async)" onClick={this.props.doubleAsync} />
                    <p>
                        Move the slider to load pages of data from the server.  Use the counter buttons above
                        to increase the number of pages available
                    </p>
                    <SampleDataViewer />
                    <hr />
                    <Link to="/404">Go to 404 Page</Link>
                </Paper>
            </DocumentTitle>
        );
    }
}

// default export with redux connection
export default databind(HomeView);

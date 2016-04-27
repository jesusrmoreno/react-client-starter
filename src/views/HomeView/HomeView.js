import React, {PropTypes} from 'react';
import databind from 'redux/utils/databind';
import {Link} from 'react-router';
import {actions as counterActions} from '../../redux/modules/counter';
import DuckImage from './Duck.jpg';
import classes from './HomeView.scss';
import DocumentTitle from 'components/DocumentTitle';

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
    static actions = counterActions;

    incrementByOne = () => this.props.increment(1);

    render () {
        return (
            <DocumentTitle title="Home">
                <div className="container text-center">
                    <div className="row">
                        <div className="col-xs-2 col-xs-offset-5">
                            <img className={classes.duck} src={DuckImage}
                                alt="This is a duck, because Redux." />
                        </div>
                    </div>
                    <h1>Welcome to the React Redux Starter Kit</h1>
                    <h2>
                        Sample Counter:
                        {' '}
                        <span className={classes['counter--green']}>{this.props.counter}</span>
                    </h2>
                    <button className="btn btn-default"
                        onClick={this.incrementByOne}>
                        Increment
                    </button>
                    {' '}
                    <button className="btn btn-default"
                        onClick={this.props.doubleAsync}>
                        Double (Async)
                    </button>
                    <hr />
                    <Link to="/404">Go to 404 Page</Link>
                </div>
            </DocumentTitle>
        );
    }
}

// default export with redux connection
export default databind(HomeView);

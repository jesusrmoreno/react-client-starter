import React from 'react';
import { Link } from 'react-router';
import Paper from 'material-ui/Paper';
import DocumentTitle from 'components/DocumentTitle';
import css from './NotFound.scss';

export class NotFoundView extends React.Component {
    render () {
        return (
            <DocumentTitle title="Not Found">
                <Paper className={css.main}>
                    <h1>This is a demo 404 page!</h1>
                    <hr />
                    <Link to="/">Back To Home View</Link>
                </Paper>
            </DocumentTitle>
        );
    }
}

export default NotFoundView;

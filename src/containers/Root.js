import React, {PropTypes} from 'react';
import {Provider} from 'react-redux';
import {Router} from 'react-router';
import DocumentTitle from 'react-document-title';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class Root extends React.Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
        routes: PropTypes.element.isRequired,
        store: PropTypes.object.isRequired
    };

    get content () {
        return (
            <Router history={this.props.history}>
                {this.props.routes}
            </Router>
        );
    }

    get devTools () {
        if (__DEBUG__) {
            if (__DEBUG_NEW_WINDOW__) {
                if (!window.devToolsExtension) {
                    require('../redux/utils/createDevToolsWindow').default(this.props.store);
                }
                else {
                    window.devToolsExtension.open();
                }
            }
            else if (!window.devToolsExtension) {
                const DevTools = require('containers/DevTools').default;
                return <DevTools />;
            }
        }
    }

    render () {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <Provider store={this.props.store}>
                    <DocumentTitle title={__APPTITLE__}>
                        <div style={{ height: '100%' }}>
                            {this.content}
                            {this.devTools}
                        </div>
                    </DocumentTitle>
                </Provider>
            </MuiThemeProvider>
        );
    }
}

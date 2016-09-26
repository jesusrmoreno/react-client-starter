import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ReactContext from 'react/lib/ReactContext';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Provider} from 'react-redux';
import { bindActionCreators } from 'redux';
import HomeView from 'views/HomeView/HomeView';
import { mount } from 'enzyme';
import configureStore from 'redux/configureStore';
import {actions} from 'redux/modules/counter';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

function shallowRender (store, makeComponent) {
    const context = {muiTheme: getMuiTheme(), store};
    ReactContext.current = context;
    const renderer = TestUtils.createRenderer();
    renderer.render(makeComponent(), context);
    ReactContext.current = {};
    return renderer.getRenderOutput();
}

function renderWithProps (store, props = {}) {
    const c = (
        <MuiThemeProvider muiTheme={getMuiTheme()}>
            <Provider store={store}>
                <HomeView {...props} />
            </Provider>
        </MuiThemeProvider>
    );
    return TestUtils.renderIntoDocument(c);
}

function shallowRenderWithProps (store, props = {}) {
    return shallowRender(store, () => <HomeView {...props} />);
}

function mountWithContext(store, props = {}) {
    const c = (
        <MuiThemeProvider muiTheme={getMuiTheme()}>
            <Provider store={store}>
                <HomeView {...props} />
            </Provider>
        </MuiThemeProvider>
    );

    return mount(c);
}

describe('(View) Home', function () {
    let _rendered, _props, _spies, _store;

    beforeEach(function () {
        _spies = {};
        _store = configureStore({});
        _props = {
            counter: 0,
            ...bindActionCreators({
                doubleAsync: (_spies.doubleAsync = sinon.spy()),
                increment: (_spies.increment = sinon.spy())
            }, _spies.dispatch = sinon.spy())
        };

        shallowRenderWithProps(_store, _props);
        _rendered = renderWithProps(_store, _props);
    });

    it('Should include an <h1> with welcome text.', function () {
        const h1 = TestUtils.findRenderedDOMComponentWithTag(_rendered, 'h1');

        expect(h1).to.exist;
        expect(h1.textContent).to.match(/Welcome to the React Redux Starter Kit/);
    });

    it('Should render with an <h2> that includes Sample Counter text.', function () {
        const h2 = TestUtils.findRenderedDOMComponentWithTag(_rendered, 'h2');

        expect(h2).to.exist;
        expect(h2.textContent).to.match(/Sample Counter/);
    });

    it('Should render props.counter at the end of the sample counter <h2>.', function () {
        _store.dispatch(actions.increment(5));
        const h2 = TestUtils.findRenderedDOMComponentWithTag(
      renderWithProps(_store, { ..._props, counter: 5 }), 'h2'
    );

        expect(h2).to.exist;
        expect(h2.textContent).to.match(/5$/);
    });

    it('Should render exactly two buttons.', function () {
        const wrapper = mountWithContext(_store);

        expect(wrapper).to.have.descendants('button');
    });

    describe('An increment button...', function () {
        let _btn;

        beforeEach(() => {
            _btn = TestUtils.scryRenderedDOMComponentsWithTag(_rendered, 'button')
        .filter(a => /Increment/.test(a.textContent))[0];
        });

        it('should be rendered.', function () {
            expect(_btn).to.exist;
        });

        it('should dispatch an action when clicked.', function () {
            TestUtils.Simulate.click(_btn);
            expect(_store.getState().counter).to.equal(1);
        });
    });

    /*
    // TODO: figure this out
    describe('A Double (Async) button...', function () {
        let _btn;

        beforeEach(() => {
            _btn = TestUtils.scryRenderedDOMComponentsWithTag(_rendered, 'button')
        .filter(a => /Double/.test(a.textContent))[0];
        });

        it('should be rendered.', function () {
            expect(_btn).to.exist;
        });

        it('should dispatch an action when clicked.', function () {
            _spies.dispatch.should.have.not.been.called;
            TestUtils.Simulate.click(_btn);
            _spies.dispatch.should.have.been.called;
        });
    });
    */
});

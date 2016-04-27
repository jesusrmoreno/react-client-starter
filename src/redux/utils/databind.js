import React from 'react';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import shallowEqual from 'react-redux/lib/utils/shallowEqual';
import hoistStatics from 'hoist-non-react-statics';
import SerialDisposable from 'rx.disposables/serialdisposable';
import Disposable from 'rx.disposables/disposable';
import invariant from 'invariant';

function hasProperty (object, name) { return Object.prototype.hasOwnProperty.call(object, name); }

/**
 * Uses the component's static databind method as the state selector to pass to @connect
 * @param Component
 * @returns {*}
 */
export default function databind (Component) {
    const selectState = Component.databind;
    const name = Component.displayName || Component.name || 'Component';
    if (typeof selectState !== 'function') {
        throw new Error(`${name} does not have static databind () method`);
    }

    if (true /* __CLIENT__ */) {
        const observe = hasProperty(Component, 'observe') && Component.observe;
        if (typeof observe === 'function') {
            const observers = observe();
            // Create a new component that checks observers when mounted or when props change
            // and unobserves when unmounted.
            class Observe extends React.Component {
                componentDidMount () {
                    const { props } = this;

                    // Create serial disposables to hold the observer disposables
                    const d = this.disposables = observers.map(observer => new SerialDisposable());

                    // Get the initial keys
                    this.keys = observers.map(observer => observer.props(props));

                    // Now get the initial observer disposables
                    observers.forEach((observer, i) => {
                        const o = observer.observe(props);
                        if (__CHECK__) {
                            invariant(Disposable.isDisposable(o), "your observe method must return a Disposable");
                        }
                        d[i].setDisposable(o);
                    });
                }

                componentDidUpdate () {
                    const { props, keys: prevKeys, disposables } = this;
                    // Check each observer and see if its keys changed and if they have, make a new observation
                    observers.forEach((observer, i) => {
                        const key = observer.props(props);
                        const prevKey = prevKeys[i];

                        if (!shallowEqual(key, prevKey)) {
                            // key has changed.  re-observe
                            prevKeys[i] = key;
                            const o = observer.observe(props);
                            if (__CHECK__) {
                                invariant(Disposable.isDisposable(o), "your observe method must return a Disposable");
                            }
                            disposables[i].setDisposable(o);
                        }
                    });
                }

                componentWillUnmount () {
                    this.disposables.forEach(d => d.dispose());
                }

                render () {
                    return <Component {...this.props} />;
                }
            }

            Observe.displayName = `Observe(${name})`;

            let actions = Component.actions;
            if (actions) {
                // need to ensure dispatch gets injected also.
                actions = (dispatch) => {
                    const props = bindActionCreators(Component.actions, dispatch);
                    props.dispatch = dispatch;
                    return props;
                };
            }

            return connect(selectState, actions)(hoistStatics(Observe, Component));
        }
    }

    return connect(selectState, Component.actions)(Component);
}

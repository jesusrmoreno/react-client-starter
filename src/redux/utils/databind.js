import React from 'react';
import { connect } from 'react-redux';
import shallowEqual from 'react-redux/lib/utils/shallowEqual';
import hoistStatics from 'hoist-non-react-statics';
import { SerialDisposable } from 'rx.disposables';

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
                    observers.forEach((observer, i) => d[i].setDisposable(observer.observe(props)));
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
                            disposables[i].setDisposable(observer.observe(props));
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

            return connect(selectState, Component.actions)(hoistStatics(Observe, Component));
        }
    }

    return connect(selectState, Component.actions)(Component);
}

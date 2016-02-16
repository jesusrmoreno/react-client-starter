import {
    actionTypes,
    actions,
    default as counterReducer
} from 'redux/modules/counter';

describe('(Redux Module) Counter', function () {
    it('Should export a constant COUNTER_INCREMENT.', function () {
        expect(actionTypes.COUNTER_INCREMENT).to.equal('counter/COUNTER_INCREMENT');
    });

    it('Should export a constant COUNTER_INCREMENT.', function () {
        expect(actionTypes.COUNTER_DOUBLE).to.equal('counter/COUNTER_DOUBLE');
    });

    describe('(Reducer)', function () {
        it('Should be a function.', function () {
            expect(counterReducer).to.be.a('function');
        });

        it('Should initialize with a state of 0 (Number).', function () {
            expect(counterReducer(undefined, {})).to.equal(0);
        });

        it('Should return the previous state if an action was not matched.', function () {
            let state = counterReducer(undefined, {});
            expect(state).to.equal(0);
            state = counterReducer(state, {type: '@@@@@@@'});
            expect(state).to.equal(0);
            state = counterReducer(state, actions.increment(5));
            expect(state).to.equal(5);
            state = counterReducer(state, {type: '@@@@@@@'});
            expect(state).to.equal(5);
        });
    });

    describe('(Action Creator) increment', function () {
        it('Should be exported as a function.', function () {
            expect(actions.increment).to.be.a('function');
        });

        it('Should return an action with type "COUNTER_INCREMENT".', function () {
            expect(actions.increment()).to.have.property('type', actionTypes.COUNTER_INCREMENT);
        });

        it('Should assign the first argument to the "payload" property.', function () {
            expect(actions.increment(5)).to.have.property('payload', 5);
        });

        it('Should default the "payload" property to 1 if not provided.', function () {
            expect(actions.increment()).to.have.property('payload', 1);
        });
    });

    describe('(Action Creator) doubleAsync', function () {
        let _globalState;
        let _dispatchSpy;
        let _getStateSpy;

        beforeEach(function () {
            _globalState = {
                counter: counterReducer(undefined, {})
            };
            _dispatchSpy = sinon.spy((action) => {
                _globalState = {
                    ..._globalState,
                    counter: counterReducer(_globalState.counter, action)
                };
            });
            _getStateSpy = sinon.spy(() => {
                return _globalState;
            });
        });

        it('Should be exported as a function.', function () {
            expect(actions.doubleAsync).to.be.a('function');
        });

        it('Should return a function (is a thunk).', function () {
            expect(actions.doubleAsync()).to.be.a('function');
        });

        it('Should dispatch a promise from that thunk that gets fulfilled.', function () {
            actions.doubleAsync()(_dispatchSpy, _getStateSpy);
            _dispatchSpy.should.have.been.calledOnce;
            _getStateSpy.should.not.have.been.called;
            expect(_dispatchSpy.args[0][0]).to.have.property('type', actionTypes.COUNTER_DOUBLE);
            _dispatchSpy.args[0][0].payload.promise.should.eventually.be.fulfilled;
        });
    });

  // NOTE: if you have a more complex state, you will probably want to verify
  // that you did not mutate the state. In this case our state is just a number
  // (which cannot be mutated).
    describe('(Action Handler) COUNTER_INCREMENT', function () {
        it('Should increment the state by the action payload\'s "value" property.', function () {
            let state = counterReducer(undefined, {});
            expect(state).to.equal(0);
            state = counterReducer(state, actions.increment(1));
            expect(state).to.equal(1);
            state = counterReducer(state, actions.increment(2));
            expect(state).to.equal(3);
            state = counterReducer(state, actions.increment(-3));
            expect(state).to.equal(0);
        });
    });

    describe('(Action Handler) COUNTER_DOUBLE', () => {
        it('Should double the state', () => {
            let state = counterReducer(10, {});
            expect(state).to.equal(10);
            state = counterReducer(state, {type: actionTypes.COUNTER_DOUBLE + '_FULFILLED'});
            expect(state).to.equal(20);
        });
    });
});

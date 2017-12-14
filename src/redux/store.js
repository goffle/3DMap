import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducers from '../redux/reducers';
import rootSaga from '../redux/sagas';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware];

const store = createStore(
  combineReducers({
    ...reducers
  }),
  compose(applyMiddleware(...middlewares))
);
sagaMiddleware.run(rootSaga);
export { store };

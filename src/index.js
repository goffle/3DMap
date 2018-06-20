import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import './index.css';
import WorldMap from './worldMap';
import registerServiceWorker from './registerServiceWorker';

const store = createStore(() => { });

ReactDOM.render(
    <Provider store={store}>
        <WorldMap
            lat={1.339560}
            lon={103.844943}
            topo={true}
            onSelectedBuilding={() => { console.log('Building selected') }}
        />
    </Provider>
    , document.getElementById('root'));
registerServiceWorker();


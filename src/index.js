import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ShadowDOM from 'react-shadow';
import { store } from './redux/store';
import './index.css';

import App from './App';

const version = require('../package.json').version;
console.log('Loading MAP ' + version)


ReactDOM.render(<App />, document.getElementById('root'));

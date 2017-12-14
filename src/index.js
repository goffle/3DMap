import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ShadowDOM from 'react-shadow';
import { store } from './redux/store';
import App from './App';

const version = require('../package.json').version;
console.log('Loading MAP ' + version)

console.log('COUCOU')

ReactDOM.render(
    <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,100italic,300,300italic,400,400italic,500,500italic,700,700italic,900,900italic&subset=latin,latin-ext,cyrillic,cyrillic-ext,greek-ext,greek,vietnamese" />

        <ShadowDOM include={[__STYLE__]}>
            <div>
                <Provider store={store}>
                    <App apikey={document.getElementById("chadvise_script").getAttribute("apikey")} />
                </Provider>
            </div>
        </ShadowDOM > 
    </div >
    , document.getElementById('chadvise'));


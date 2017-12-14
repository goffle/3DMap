import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ShadowDOM from 'react-shadow';

import { store } from './redux/store';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');

  ReactDOM.render(
    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,100italic,300,300italic,400,400italic,500,500italic,700,700italic,900,900italic&subset=latin,latin-ext,cyrillic,cyrillic-ext,greek-ext,greek,vietnamese" />
      <ShadowDOM include={['https://storage.googleapis.com/chadvisesdk/latest/main.css']}>
        <div>
          <Provider store={store}>
            <App apikey={'Zq9Jdj0qfk2O2dYS93n1'} />
          </Provider>
        </div>
      </ShadowDOM >
    </div >
    , div);
});


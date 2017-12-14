import React, { Component } from 'react';
import { connect } from 'react-redux';

import './index.css';

import { login } from './redux/auth/actions'

// import Menu from './scenes/menu';
// import Rule from './scenes/rule';
// import Chat from './scenes/chat';
// import Map from './scenes/map';

class App extends Component {

  componentWillMount() {
    debugger;
    console.log('Loading : ' + this.props.apikey);
    //this.props.login(this.props.apikey);
  }

  render() {
    // if (!this.props.auth.userId || !this.props.auth.organisationId) {
    //   return <div />;
    // }

    return (
      <div className="app">
        SEB
      </div>
    );
  }
}

const mapStateToProps = ({ step, auth }) => {
  return { step: step.step, auth };
}
export default connect(mapStateToProps, { login })(App);
import React, { Component } from 'react';
import { connect } from 'react-redux';

import './index.css';

//import { login } from './redux/auth/actions'

import WorldMap from './scenes/worldMap';
// import Rule from './scenes/rule';
// import Chat from './scenes/chat';
// import Map from './scenes/map';


console.log('SEB')

class App extends Component {

  componentWillMount() {
    console.log('Loading : ' + this.props.apikey);
    //this.props.login(this.props.apikey);
  }

  render() {
    // if (!this.props.auth.userId || !this.props.auth.organisationId) {
    //   return <div />;
    // }


    return (
      <WorldMap />
    );
  }
}

const mapStateToProps = ({ step, auth }) => {
  return {};
}
export default connect(mapStateToProps, {})(App);


// componentWillMount() {
//   getCurrentLocation((position) => {
//       if (Object.keys(position).length) {
//           this.setState({ position, defaultPosition: position });
//       } else {
//           for (let i = 0; i < this.props.locations.length; i++) {
//               const latitude = parseFloat(this.props.locations[i].latitude);
//               const longitude = parseFloat(this.props.locations[i].longitude);
//               this.setState({ position: null, defaultPosition: { latitude, longitude } });
//               return;
//           }
//       }
//   })
// }

// function getCurrentLocation(cb) {
//   if ((!window.chrome || window.isSecureContext) && navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//           (position) => {
//               cb({ latitude: position.coords.latitude, longitude: position.coords.longitude });
//           },
//           (error) => { cb({}); console.log(error) }
//       );
//   } else {
//       cb({});
//       console.log("Geolocation is not supported by this website.")
//   }
// }

import React, { Component } from 'react';
import { connect } from 'react-redux';

import WorldMap from './scenes/worldMap';
import EditableMap from './scenes/editableMap'

export default class App extends Component {

  state = {
    editBuilding: false,
    editBuildingId: 0,
    display3D: true
  }

  componentWillMount() {
    console.log('Loading : ' + this.props.apikey);
    //this.props.login(this.props.apikey);
  }


  editBuilding(b) {
    this.setState({ editBuilding: true, editBuildingId: b })
  }

  render() {
    return (
      <div>
        <EditBuilding
          visible={this.state.editBuilding}
          id={this.state.editBuildingId}
          edit={() => { this.setState({ display3D: false }) }}
          cancel={() => { this.setState({ editBuilding: false }) }}
        />
        <WorldMap
          lat={1.339560}
          lon={103.844943}
          topo={this.state.display3D}
          onSelectedBuilding={this.editBuilding.bind(this)}
        />
        <EditableMap />
      </div >
    );
  }
}

const EditBuilding = (props) => {
  if (!props.visible) {
    return <div />
  }
  return (
    <div className='overlay' onClick={(event) => { event.stopPropagation ? event.stopPropagation() : null }}>
      <div className='dialog'>
        <h2>Edit Building {props.id} ? </h2>
        <button className='button' onClick={() => { props.edit() }}>Yes</button>
        <button className='button' onClick={() => { props.cancel() }}>No</button>
      </div>
    </div>
  )

}


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

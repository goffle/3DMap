import React, { Component } from 'react';
import { connect } from 'react-redux';

const cheese = 'https://cdn-images-1.medium.com/max/1600/1*W1IPZj18aerIffSO321a2w.png'

class Canvas extends Component {
    componentDidMount() {
        // const mapElement = this.refs.map
        // var mymap = L.map(mapElement).setView([51.505, -0.09], 13);

        // L.tileLayer('http[s]://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        //     maxZoom: 18,
        //     attribution: ''
        // }).addTo(mymap);
    }
    render() {
        return (
            <div ref="map" />
        )
    }
}

const mapStateToProps = () => {
    return {};
}
export default connect(mapStateToProps, {})(Canvas);


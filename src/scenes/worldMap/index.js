import React, { Component } from 'react';
import { connect } from 'react-redux';
import CameraController from './engine/camera/controller';
import { latLon as LatLon } from './engine/geo/LatLon';
import World from './engine/world';
import Tiles from './engine/tiles';
import ReactResizeDetector from 'react-resize-detector';
import { googleMap } from '../../config.js';


var camera, scene, renderer, tiles, element, mouse = new THREE.Vector2();
var dataGroup = new THREE.Group();
var objects = [];

        
class WorldMap extends Component {
       componentDidMount(){
            console.log('1');
            this.init(1.339560, 103.844943);
            animate();
        }

  render() {
      console.log('2');
        return (
            <div className='map' ref={(elt) => { this.mapElement = elt; }} >

<ReactResizeDetector handleWidth handleHeight onResize={this._onResize} />
            </div>
        );
    }

    _onResize = (width,height) => {
      if(renderer){
      renderer.setSize(width,height);

      }
     
    }

    init(lat, lon) {

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 10000000);
        camera.position.x = 200; 
        camera.position.y = 365;
        camera.position.z = 200;

        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ antialias: true });

        element = this.mapElement;
        element.appendChild(renderer.domElement);
        renderer.setSize(800,600);
        renderer.setClearColor(0xE0EAF1, 1); // the default

        var light1 = new THREE.DirectionalLight(0x131313, 0.7);
        light1.position.set(100, 100, 100);
        scene.add(light1);

        var light2 = new THREE.DirectionalLight(0x131313, 0.7);
          light2.position.set(-100, 100, 100);
        scene.add(light2);
         
        scene.add(new THREE.AmbientLight(0x131313));

        CameraController.init(camera, renderer);

        World.setView(LatLon(lat, lon));

        scene.add(dataGroup);

        tiles = new Tiles(scene);
        tiles.createTopoTiles('https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-JEvUQFv');
        tiles.createImageTiles('http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png');

    renderer.render(scene, camera);
    }





}

const mapStateToProps = () => {
    return {};
}
export default connect(mapStateToProps, {})(WorldMap);


function animate() {
    requestAnimationFrame(animate);
    tiles.update();
    TWEEN.update();
    renderer.render(scene, camera);
}


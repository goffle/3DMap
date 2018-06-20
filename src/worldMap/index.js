import React, { Component } from 'react';
import * as THREE from 'three'

import world from './engine/world';
import clickController from './engine/click';
import tiles from './engine/tiles';
import cameraController from './engine/camera/controller';
import { latLon as LatLon } from './engine/geo/LatLon';

export default class Scene extends Component {
  constructor(props) {
    super(props)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
  }

  componentDidMount() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new window.THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 20, 10000000);
    camera.position.x = 200;
    camera.position.y = 365;
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setClearColor(0xE0EAF1, 1); // the default

    var light1 = new window.THREE.DirectionalLight(0x131313, 0.7);
    light1.position.set(100, 100, 100);
    scene.add(light1);

    var light2 = new window.THREE.DirectionalLight(0x131313, 0.7);
    light2.position.set(-100, 100, 100);
    scene.add(light2);

    scene.add(new window.THREE.AmbientLight(0x131313));

    renderer.setSize(width, height);
    cameraController.init(camera, renderer);


    const tilesController = new tiles(scene);

    tilesController.createTopoTiles('https://storage.googleapis.com/dmap-7724a.appspot.com/v1/{z}/{x}/{y}/map.topojson');
    tilesController.createImageTiles('http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png');
    //tilesController.createDataTiles('http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png');


    clickController.init(renderer, tilesController, () => {
      console.log('CLICK')
    });


    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.tilesController = tilesController;



    this.mount.appendChild(this.renderer.domElement)

    world.setView(LatLon(this.props.lat, this.props.lon));

    var dataGroup = new window.THREE.Group();
    scene.add(dataGroup);

    this.start()
  }


  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId)
  }

  animate() {
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
    this.tilesController.update();
    window.TWEEN.update();
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return (
      <div style={{ width: '100%', height: '1200px' }} ref={(mount) => { this.mount = mount }} />
    )
  }
}
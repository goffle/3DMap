import React, { Component } from 'react';
import * as THREE from 'three'

import world from './engine/world';
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



    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.tilesController = tilesController

    this.mouse = new window.THREE.Vector2();

    this.mount.appendChild(this.renderer.domElement)


    document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
    document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);


    world.setView(LatLon(this.props.lat, this.props.lon));

    var dataGroup = new window.THREE.Group();
    scene.add(dataGroup);

    this.start()
  }


  onDocumentMouseDown(event) {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  onDocumentMouseUp(event) {
    const val = 10;

    if (event.which !== 1)
      return;

    if ((Math.abs(event.x - this.mouse.x) > val) || (Math.abs(event.y - this.mouse.y) > val)) {
      //drag
      return;
    }

    const position = new window.THREE.Vector2();
    position.x = (event.clientX / this.renderer.getSize().width) * 2 - 1;
    position.y = - (event.clientY / this.renderer.getSize().height) * 2 + 1;


    let obj = this.tilesController._tiles[0].getObject(position);
    if (!obj) {
      obj = this.getObject(position);
    }

    if (obj) {
      const polygonMaterial = new window.THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, emissive: 0xD4DADC, side: window.THREE.BackSide });
      obj.object.material = polygonMaterial;
      cameraController.flyToPoint(obj.point, 90, 200, () => {
        this.props.onSelectedBuilding(obj.object.id);
      });
    }
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
    console.log('render')
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
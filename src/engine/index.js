//var THREE = require('three');

import OrbitControls from "./camera/OrbitControls";
import World from './world';
import { latLon as LatLon } from './geo/LatLon';

import TileControler from './tileControler';


var camera, scene, renderer, controls;

init();
runMapBox();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 10000000);
    camera.position.x = 110;
    camera.position.y = 572;
    camera.position.z = 1000;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('world').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);


    World.setView(LatLon([1.339560, 103.844943]));

}

function runMapBox() {

    //http://tile.mapzen.com/mapzen/vector/v1/{layers}/{z}/{x}/{y}.{format}?api_key=mapzen-WKzBDto
    //http://tile.mapzen.com/mapzen/vector/v1/{layers}/{z}/{x}/{y}.{format}?api_key=mapzen-WKzBDto


    //https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-WKzBDto

    const r = new TileControler('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', camera, scene);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
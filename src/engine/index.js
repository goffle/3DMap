//var THREE = require('three');

import OrbitControls from "./camera/OrbitControls";
import World from './world';
import { latLon as LatLon } from './geo/LatLon';

import TileControler from './tileControler';


var camera, scene, renderer, controls, imageTile, topoTile;

init();
runTiles();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 10000000);
    camera.position.x = 20;
    camera.position.y = 580;
    camera.position.z = 300;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xE0EAF1, 1); // the default
    document.getElementById('world').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);


    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);

    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 1, 0).normalize();
    scene.add(light);

    World.setView(LatLon([1.339560, 103.844943]));

}

function runTiles() {

    const ImageOptions = {
        maxDistance: 200000,
        maxLOD: 16,
        minLOD: 1
    }
    imageTile = new TileControler('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', 'image', camera, controls, scene, ImageOptions);

    const topoOptions = {
        maxDistance: 1000,
        maxLOD: 16,
        minLOD: 16
    }
    topoTile = new TileControler('https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-JEvUQFv', 'topo', camera, controls, scene, topoOptions);
}

function animate() {
    requestAnimationFrame(animate);
    topoTile.update();
    imageTile.update();
    renderer.render(scene, camera);
}
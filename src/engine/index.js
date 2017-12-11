//var THREE = require('three');

import OrbitControls from "./camera/OrbitControls";
import World from './world';
import { latLon as LatLon } from './geo/LatLon';

import TileControler from './tiles/controler';


var camera, scene, renderer, controls, tiles = [];

init(1.339560, 103.844943);
runTiles();
//generateShadows();
animate();

function init(lat, lon) {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 10000000);
    camera.position.x = 200;
    camera.position.y = 365;
    camera.position.z = 200;


    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });


    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xE0EAF1, 1); // the default
    document.getElementById('world').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    var light1 = new THREE.DirectionalLight(0x131313, 0.7);
    light1.position.set(100, 100, 100);
    scene.add(light1);

    var light2 = new THREE.DirectionalLight(0x131313, 0.7);
    light2.position.set(-100, 100, 100);
    scene.add(light2);


    scene.add(new THREE.AmbientLight(0x131313));


    World.setView(LatLon(lat, lon));


}

function generateShadows() {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    renderer.shadowMapSoft = false;
    renderer.shadowCameraNear = camera.near;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = camera.fov;

    // renderer.shadowMapBias = 0.0039;
    // renderer.shadowMapDarkness = 0.5;
    // renderer.shadowMapWidth = 1024;
    // renderer.shadowMapHeight = 1024;

    const size = 2000;

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.x = -100;
    light.position.y = 150;
    light.position.z = 150;
    light.castShadow = true;
    light.shadowCameraLeft = -size;
    light.shadowCameraRight = size;
    light.shadowCameraTop = size;
    light.shadowCameraBottom = -size;
    scene.add(light);

}


function runTiles() {

    const imageTileOptions = {
        maxDistance: 200000,
        maxLOD: 18,
        minLOD: 1
    }

    const imageTile = new TileControler(
        'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'image',
        camera,
        controls,
        scene,
        imageTileOptions);


    const topoTileOptions = {
        maxDistance: 1000,
        maxLOD: 15,
        minLOD: 15
    }

    const topoTile = new TileControler(
        'https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-JEvUQFv',
        'topo',
        camera,
        controls,
        scene,
        topoTileOptions
    )

    const colorTile = new TileControler(
        '',
        'color',
        camera,
        controls,
        scene
    )

    //tiles.push(colorTile);
    tiles.push(topoTile);
    tiles.push(imageTile);

}

function animate() {
    requestAnimationFrame(animate);
    tiles.forEach((tile) => {
        tile.update();
    })
    renderer.render(scene, camera);
}
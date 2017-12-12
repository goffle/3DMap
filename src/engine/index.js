//var THREE = require('three');

import CameraController from "./camera/controller";
import World from './world';
import { latLon as LatLon } from './geo/LatLon';
import Tiles from './tiles';


var camera, scene, renderer, tiles;

var dataGroup = new THREE.Group();
var objects = [];


init(1.339560, 103.844943);
//generateShadows();
animate();

setTimeout(() => {
    addObject(1.339775, 103.846778);
    addObject(1.339689, 103.842840);
    addObject(1.339549, 103.846134);
    addObject(1.346435, 103.849935);

}, 1000);

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


    var light1 = new THREE.DirectionalLight(0x131313, 0.7);
    light1.position.set(100, 100, 100);
    scene.add(light1);

    var light2 = new THREE.DirectionalLight(0x131313, 0.7);
    light2.position.set(-100, 100, 100);
    scene.add(light2);


    scene.add(new THREE.AmbientLight(0x131313));

    CameraController.init(camera, renderer);

    World.setView(LatLon(lat, lon));

    document.addEventListener('mousedown', onDocumentMouseDown, false);

    scene.add(dataGroup);

    tiles = new Tiles(scene);

    tiles.setImage('http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png');
    tiles.setTopo('https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-JEvUQFv')
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
        CameraController.flyToPoint(intersects[0].point);
    }
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


function addObject(lat, lon) {

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var geometry = new THREE.BoxGeometry(10, 50, 10);
    var cube = new THREE.Mesh(geometry, material);
    const pt = World.latLonToPoint(LatLon(lat, lon));
    cube.position.x = pt.x;
    cube.position.y = 20;
    cube.position.z = pt.y;

    objects.push(cube);
    dataGroup.add(cube);
}

function animate() {
    requestAnimationFrame(animate);
    tiles.update();
    TWEEN.update();
    renderer.render(scene, camera);
}
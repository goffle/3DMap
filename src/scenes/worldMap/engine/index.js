import { latLon as LatLon } from './geo/LatLon';

import CameraController from "./camera/controller";
import World from './world';
import Tiles from './tiles';


var camera, scene, renderer, tiles, element, mouse = new THREE.Vector2();


var dataGroup = new THREE.Group();
var objects = [];


init(1.339560, 103.844943);
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

    element = document.getElementById('world');
    element.appendChild(renderer.domElement);
    renderer.setSize(element.clientWidth, element.clientHeight);
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

    // document.addEventListener('mousedown', onDocumentMouseDown, false);
    // document.addEventListener('touchstart', onDocumentTouchStart, false);
    // document.addEventListener('resize', onElementResize, false);
    // document.addEventListener('mousemove', onDocumentMouseMove, false);

    tiles = new Tiles(scene);
    tiles.createTopoTiles('https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-JEvUQFv');
    tiles.createImageTiles('http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png');
}


/*
function onElementResize() {
    camera.aspect = element.clientWidth / element.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(element.clientWidth, element.clientHeight);
}

function onDocumentTouchStart(event) {
    event.preventDefault();
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown(event);
}

function onDocumentMouseMove(event) {
    // update the mouse variable
    mouse.x = (event.clientX / element.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / element.clientHeight) * 2 + 1;
    const obj = getObject(mouse);
    if (obj) {
        obj.object.material.color.setHex(Math.random() * 0xffffff);
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    let obj = tiles._tiles[0].getObject(mouse);
    if (!obj) {
        obj = getObject(mouse);
    }
    if (obj) {

        const polygonMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, emissive: 0xD4DADC, side: THREE.BackSide });

        obj.object.material = polygonMaterial;
        CameraController.flyToPoint(obj.point, 90, 200);
    }
}
*/

function getObject(pos) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pos, camera);
    var intersects = raycaster.intersectObjects(objects);
    return (intersects.length > 0) ? intersects[0] : null;
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


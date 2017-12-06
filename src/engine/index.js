var THREE = require('three');
import OrbitControls from "./camera/OrbitControls";

import imageMap from './imageMap';


var camera, scene, renderer, controls;
var geometry, material, mesh;

init();
initMap();
animate();
runMapBox();

function runMapBox() {
    const r = new imageMap('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', camera, scene);
}


function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    camera.position.z = 1;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(0.1, 0.2, 0.2);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('world').appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function initMap() {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    var context = canvas.getContext('2d');
    context.fillStyle = '#f5f5f3';
    context.fillRect(0, 0, canvas.width, canvas.height);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const materialTexture = new THREE.MeshBasicMaterial({
        map: texture,
        depthWrite: false
    });

    var geom = new THREE.PlaneBufferGeometry(2, 2, 1);
    var mesh = new THREE.Mesh(geom, materialTexture);
    mesh.renderOrder = 0;
    mesh.rotation.x = -90 * Math.PI / 180;
    scene.add(mesh);
}

function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    renderer.render(scene, camera);
}
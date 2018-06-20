import React, { Component } from 'react';
import { connect } from 'react-redux';
import cameraController from './engine/camera/controller';
import { latLon as LatLon } from './engine/geo/LatLon';
import World from './engine/world';
import Tiles from './engine/tiles';
import ReactResizeDetector from 'react-resize-detector';

var camera, scene, renderer, tiles, element, mouse = new window.THREE.Vector2();
var dataGroup = new window.THREE.Group();
var objects = [];


class WorldMap extends Component {
    componentDidMount() {
        this.init();
        animate();
        document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
        document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
    }

    onDocumentMouseDown(event) {

        mouse.x = event.clientX;
        mouse.y = event.clientY;

    }

    onDocumentMouseUp(event) {
        const val = 10;

        if (event.which !== 1)
            return;

        if ((Math.abs(event.x - mouse.x) > val) || (Math.abs(event.y - mouse.y) > val)) {
            //drag
            return;
        }

        const position = new window.THREE.Vector2();
        position.x = (event.clientX / renderer.getSize().width) * 2 - 1;
        position.y = - (event.clientY / renderer.getSize().height) * 2 + 1;


        let obj = tiles._tiles[0].getObject(position);
        if (!obj) {
            obj = this.getObject(position);
        }

        if (obj) {
            const polygonMaterial = new window.THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, emissive: 0xD4DADC, side: window.THREE.BackSide });
            obj.object.material = polygonMaterial;
            CameraController.flyToPoint(obj.point, 90, 200, () => {
                this.props.onSelectedBuilding(obj.object.id);
            });
        }
    }

    getObject(pos) {
        const raycaster = new window.THREE.Raycaster();
        raycaster.setFromCamera(pos, camera);
        var intersects = raycaster.intersectObjects(objects);
        return (intersects.length > 0) ? intersects[0] : null;
    }

    render() {
        return (
            <div className='map' ref={(elt) => { this.mapElement = elt; }} >
                {/* <ReactResizeDetector handleWidth handleHeight onResize={this._onResize} /> */}
            </div>
        );
    }

    _onResize = (width, height) => {
        if (renderer) {
            renderer.setSize(width, height);
        }
    }

    init() {
        camera = new window.THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 20, 10000000);
        camera.position.x = 200;
        camera.position.y = 365;
        camera.position.z = 200;

        scene = new window.THREE.Scene();
        renderer = new window.THREE.WebGLRenderer({ antialias: true });

        element = this.mapElement;
        element.appendChild(renderer.domElement);
        renderer.setSize(1920, 1080);
        renderer.setClearColor(0xE0EAF1, 1); // the default

        var light1 = new window.THREE.DirectionalLight(0x131313, 0.7);
        light1.position.set(100, 100, 100);
        scene.add(light1);

        var light2 = new window.THREE.DirectionalLight(0x131313, 0.7);
        light2.position.set(-100, 100, 100);
        scene.add(light2);

        scene.add(new window.THREE.AmbientLight(0x131313));

        CameraController.init(camera, renderer);

        World.setView(LatLon(this.props.lat, this.props.lon));

        scene.add(dataGroup);

        tiles = new Tiles(scene);

        tiles.createTopoTiles('https://storage.googleapis.com/dmap-7724a.appspot.com/v1/{z}/{x}/{y}/map.topojson');
        tiles.createImageTiles('http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png');
        //tiles.createDebugTiles();

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
    window.TWEEN.update();
    renderer.render(scene, camera);
}


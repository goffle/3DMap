import React, { Component } from 'react';
import { connect } from 'react-redux';
import CameraController from './engine/camera/controller';
import { latLon as LatLon } from './engine/geo/LatLon';
import World from './engine/world';
import Tiles from './engine/tiles';
import ReactResizeDetector from 'react-resize-detector';

var camera, scene, renderer, tiles, element, mouse = new window.THREE.Vector2();
var dataGroup = new window.THREE.Group();
var objects = [];


class WorldMap extends Component {

    constructor(props) {
        super(props)

        this._camera = new window.THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 20, 10000000);
        this._camera.position.x = 200;
        this._camera.position.y = 365;
        this._camera.position.z = 200;

        this._scene = new window.THREE.Scene();
        this._renderer = new window.THREE.WebGLRenderer({ antialias: true });

        this._renderer.setSize(1920, 1080);
        this._renderer.setClearColor(0xE0EAF1, 1); // the default

        var light1 = new window.THREE.DirectionalLight(0x131313, 0.7);
        light1.position.set(100, 100, 100);
        this._scene.add(light1);

        var light2 = new window.THREE.DirectionalLight(0x131313, 0.7);
        light2.position.set(-100, 100, 100);
        this._scene.add(light2);

        this._scene.add(new window.THREE.AmbientLight(0x131313));

        CameraController.init(this._camera, this._renderer);

        World.setView(LatLon(this.props.lat, this.props.lon));

        this._scene.add(dataGroup);

        this._tiles = new Tiles(this._scene);

        this._tiles.createTopoTiles('https://storage.googleapis.com/dmap-7724a.appspot.com/v1/{z}/{x}/{y}/map.topojson');
        this._tiles.createImageTiles('http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png');
        //tiles.createDebugTiles();

        this._renderer.render(this._scene, this._camera);

    }

    componentDidMount() {
        this.mapElement.appendChild(this._renderer.domElement);

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
        raycaster.setFromCamera(pos, this._camera);
        var intersects = raycaster.intersectObjects(objects);
        return (intersects.length > 0) ? intersects[0] : null;
    }

    render() {
        this._tiles.update();

        window.TWEEN.update();
        this._renderer.render(this._scene, this._camera);

        console.log('RENDER');
        return (
            <div className='map' ref={(elt) => { this.mapElement = elt; }} >
                {/* <ReactResizeDetector handleWidth handleHeight onResize={this._onResize} /> */}
            </div>
        );
    }

    _onResize = (width, height) => {
        if (this._renderer) {
            this._renderer.setSize(width, height);
        }
    }

}

const mapStateToProps = () => {
    return {};
}

export default connect(mapStateToProps, {})(WorldMap);





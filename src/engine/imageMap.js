import { setInterval } from 'core-js/library/web/timers';
import ImageTile from './imageTile'

var THREE = require('three');


export default class TileLayer {
    constructor(url, camera, scene) {
        this._camera = camera;
        this._url = url;
        this._tiles = new THREE.Group();
        this._frustum = new THREE.Frustum();

        scene.add(this._tiles);

        this._calculateLOD();

        setInterval(() => {
            this._calculateLOD();
        }, 5000);
    }

    _updateFrustum() {
        var projScreenMatrix = new THREE.Matrix4();
        projScreenMatrix.multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse);
        this._frustum.setFromMatrix(this._camera.projectionMatrix);
        this._frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse));
    }

    _calculateLOD() {

        this._updateFrustum();


        var checkList = [];
        checkList.push(new ImageTile('0'));
        checkList.push(new ImageTile('1'));
        checkList.push(new ImageTile('2'));
        checkList.push(new ImageTile('3'));

        console.log(checkList)


    
        


     /*   this._frustum.planes.forEach((plane) => {

            // for (var i = this._tiles.children.length - 1; i >= 0; i--) {
            //     this._tiles.remove(this._tiles.children[i]);
            // }

            const { x, y, z } = plane.normal;
            const geometry = new THREE.PlaneGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshNormalMaterial();
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            this._tiles.add(mesh);
        });*/



    }
    }
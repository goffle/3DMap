import ImageTile from './tileImage';
import TopoTile from './tileTopo';
import ColorTile from './tileColor';

import TileCache from './cache';

export default class TileControler {
    constructor(url, type, camera, controls, scene, options = {}) {

        this._camera = camera;
        this._controls = controls;
        this._type = type;
        this._url = url;
        this._tiles = new THREE.Group();
        this._frustum = new THREE.Frustum();
        this._tileList = [];

        this._maxLOD = options.maxLOD ? options.maxLOD : 23;
        this._minLOD = options.minLOD ? options.minLOD : 1;
        this._maxDistance = options.maxDistance ? options.maxDistance : 5000;

        this._tileCache = new TileCache(1000, tile => {
            //this._destroyTile(tile);
        });
        scene.add(this._tiles);
    }


    update() {
        this._calculateLOD();
        this._outputTiles();
    }

    _updateFrustum() {
        this._frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse));
    }

    _getTile(quadcode) {
        var tile = this._tileCache.getTile(quadcode);
        if (!tile) {
            if (this._type === 'image') {
                tile = new ImageTile(quadcode, this._url);
            } else if (this._type === 'topo') {
                tile = new TopoTile(quadcode, this._url);
            } else if (this._type === 'color') {
                tile = new ColorTile(quadcode);
            }
            // Add tile to cache, though it won't be ready yet as the data is being
            // requested from various places asynchronously
            this._tileCache.setTile(quadcode, tile);
        }

        return tile;
    }

    _outputTiles() {

        // Remove all tiles from layer
        if (!this._tiles || !this._tiles.children) {
            return;
        }

        var count = 0;
        for (var i = 0; i < this._tiles.children.length; i++) {
            count += this._tiles.children[i].children.length;
        }

        for (var i = this._tiles.children.length - 1; i >= 0; i--) {
            this._tiles.remove(this._tiles.children[i]);
        }

        // Add / re-add tiles
        this._tileList.forEach(tile => {
            // Are the mesh and texture ready?
            if (!tile.isReady()) {
                return;
            }
            this._tiles.add(tile.getMesh());
        });
    }

    _calculateLOD() {

        this._updateFrustum();

        var checkList = [];
        checkList.push(this._getTile('0'));
        checkList.push(this._getTile('1'));
        checkList.push(this._getTile('2'));
        checkList.push(this._getTile('3'));

        this._divide(checkList);

        checkList.sort((a, b) => {
            return a._quadcode.length < b._quadcode.length;
        });

        this._tileList = checkList.filter((tile, index) => {
            if (!tile.isInit()) {
                tile.requestTileAsync();
            }
            return true;
        });

    }

    _divide(checkList) {
        var count = 0;
        var currentItem;
        var quadcode;
        // 1. Loop until count equals check list length
        while (count != checkList.length) {
            currentItem = checkList[count];
            quadcode = currentItem.getQuadCode();

            // 2. Increase count and continue loop if quadcode equals max LOD / zoom
            if (quadcode.length >= this._maxLOD) {
                count++;
                continue;
            }

            // 3. Else, calculate screen-space error metric for quadcode

            if (!this._tileInDistance(currentItem) || !this._tileInFrustum(currentItem)) {
                checkList.splice(count, 1);
            } else if (this._screenSpaceError(currentItem)) {
                // 4. If error is sufficient...

                // 4a. Remove parent item from the check list
                checkList.splice(count, 1);

                // 4b. Add 4 child items to the check list
                checkList.push(this._getTile(quadcode + '0'));
                checkList.push(this._getTile(quadcode + '1'));
                checkList.push(this._getTile(quadcode + '2'));
                checkList.push(this._getTile(quadcode + '3'));

                // 4d. Continue the loop without increasing count
                continue;
            } else {

                count++;
            }
        }
    }

    _tileInFrustum(tile) {
        var bounds = tile.getBounds();
        return this._frustum.intersectsBox(new THREE.Box3(new THREE.Vector3(bounds[0], 0, bounds[3]), new THREE.Vector3(bounds[2], 0, bounds[1])));
    }

    _tileInDistance(tile) {
        const cameraVec2 = new THREE.Vector2(this._controls.target.x, this._controls.target.z);
        const center = new THREE.Vector2(tile.getCenter()[0], tile.getCenter()[1]);
        const round = (tile.getSide() / Math.sqrt(2));
        const dist = cameraVec2.distanceTo(center);

        if ((dist - round) < this._maxDistance) {
            return true;
        }

        return false;
    }

    _screenSpaceError(tile) {
        var quadcode = tile.getQuadCode();

        // Tweak this value to refine specific point that each quad is subdivided
        //
        // It's used to multiple the dimensions of the tile sides before
        // comparing against the tile distance from camera
        var quality = 1.2;

        // 1. Return false if quadcode length equals maxDepth (stop dividing)
        if (quadcode.length >= this._maxLOD) {
            return false;
        }

        if (quadcode.length <= this._minLOD) {
            return true;
        }

        // 4. Calculate screen-space error metric
        // TODO: Use closest distance to one of the 4 tile corners
        var center = tile.getCenter();
        var dist = (new THREE.Vector3(center[0], 0, center[1])).sub(this._camera.position).length();
        var error = quality * tile.getSide() / dist;

        if (error < 1) {
            return false;
        }

        return true;

    }

}
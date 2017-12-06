import { setInterval } from 'core-js/library/web/timers';
import ImageTile from './imageTile'

export default class TileLayer {
    constructor(url, camera, scene) {

        this._camera = camera;
        this._url = url;
        this._tiles = new THREE.Group();
        this._frustum = new THREE.Frustum();
        this._tileList = [];
        
        this._maxLOD = 23;

        scene.add(this._tiles);

        setInterval(() => {
            this._calculateLOD();
            this._outputTiles();
        }, 1000);
    }

    _updateFrustum() {
        var projScreenMatrix = new THREE.Matrix4();
        projScreenMatrix.multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse);
        this._frustum.setFromMatrix(this._camera.projectionMatrix);
        this._frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse));
    }

    _removeTiles() {
        if (!this._tiles || !this._tiles.children) {
            return;
        }

        for (var i = this._tiles.children.length - 1; i >= 0; i--) {
            this._tiles.remove(this._tiles.children[i]);
        }

    }

    _outputTiles() {

        // Remove all tiles from layer
        this._removeTiles();

        // Add / re-add tiles
        this._tileList.forEach(tile => {
            // Are the mesh and texture ready?

            // if (!tile.isReady()) {
            //     return;
            // }

            // Add tile to layer (and to scene) if not already there
            this._tiles.add(tile.getMesh());
        });
    }

    _calculateLOD() {

        this._updateFrustum();

        var checkList = [];
        checkList.push(new ImageTile('0', this._url));
        checkList.push(new ImageTile('1', this._url));
        checkList.push(new ImageTile('2', this._url));
        checkList.push(new ImageTile('3', this._url));

        console.log('before', checkList);
        this._divide(checkList);
        console.log('after', checkList);

        this._tileList = checkList.filter((tile, index) => {

            if (!this._tileInFrustum(tile)) {
                return false;
            }
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
            if (currentItem.length === this._maxLOD) {
                count++;
                continue;
            }

            // 3. Else, calculate screen-space error metric for quadcode
            if (this._screenSpaceError(currentItem)) {
                // 4. If error is sufficient...

                // 4a. Remove parent item from the check list
                checkList.splice(count, 1);

                // 4b. Add 4 child items to the check list
                checkList.push(new ImageTile(quadcode + '0', this._url));
                checkList.push(new ImageTile(quadcode + '1', this._url));
                checkList.push(new ImageTile(quadcode + '2', this._url));
                checkList.push(new ImageTile(quadcode + '3', this._url));

                // 4d. Continue the loop without increasing count
                continue;
            } else {
                // 5. Else, increase count and continue loop
                count++;
            }
        }
    }

    _tileInFrustum(tile) {
        var bounds = tile.getBounds();
        return this._frustum.intersectsBox(new THREE.Box3(new THREE.Vector3(bounds[0], 0, bounds[3]), new THREE.Vector3(bounds[2], 0, bounds[1])));
    }


    _screenSpaceError(tile) {
        var minDepth = this._minLOD;
        var maxDepth = this._maxLOD;

        var quadcode = tile.getQuadCode();

        // Tweak this value to refine specific point that each quad is subdivided
        //
        // It's used to multiple the dimensions of the tile sides before
        // comparing against the tile distance from camera
        var quality = 3.0;

        // 1. Return false if quadcode length equals maxDepth (stop dividing)
        if (quadcode.length === maxDepth) {
            return false;
        }

        // 2. Return true if quadcode length is less than minDepth
        if (quadcode.length < minDepth) {
            return true;
        }

        // 3. Return false if quadcode bounds are not in view frustum
        if (!this._tileInFrustum(tile)) {
            return false;
        }

        var center = tile.getCenter();

        // 4. Calculate screen-space error metric
        // TODO: Use closest distance to one of the 4 tile corners
        var dist = (new THREE.Vector3(center[0], 0, center[1])).sub(this._camera.position).length();

        var error = quality * tile.getSide() / dist;

        // 5. Return true if error is greater than 1.0, else return false
        return (error > 1.0);
    }

}
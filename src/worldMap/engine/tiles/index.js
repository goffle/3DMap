

import TileControler from './controler';

import ImageTile from './tileImage';
import TopoTile from './tileTopo';
import ColorTile from './tileColor';
import DataTile from './tileData';

export default class Tiles {
    constructor(scene) {
        this._scene = scene;
        this._tiles = [];
    }

    update() {
        this._tiles.forEach((tile) => {
            tile.update();
        })
    }

    createImageTiles(url) {
        const imageTileOptions = { maxDistance: 200000, maxLOD: 18, minLOD: 1 }
        const imageTileController = new TileControler(url, ImageTile, imageTileOptions);

        this._tiles.push(imageTileController);

        const mesh = imageTileController.getTilesGroup();
        this._scene.add(mesh);

        return mesh;
    }

    createTopoTiles(url) {
        const topoTileOptions = { maxDistance: 10, maxLOD: 15, minLOD: 15 }
        const topoTileController = new TileControler(url, TopoTile, topoTileOptions);
        this._tiles.push(topoTileController);

        const mesh = topoTileController.getTilesGroup();
        this._scene.add(mesh);

        return mesh;
    }

    createDataTiles(url) {
        const TileOptions = { maxDistance: 100, maxLOD: 15, minLOD: 15 }
        const TileController = new TileControler(url, DataTile, TileOptions);
        this._tiles.push(TileController);

        const mesh = TileController.getTilesGroup();
        this._scene.add(mesh);

        return mesh;
    }


    createDebugTiles() {
        const imageTileOptions = { maxDistance: 200000, maxLOD: 18, minLOD: 1 }
        const colorTileController = new TileControler('', ColorTile, imageTileOptions)
        this._tiles.push(colorTileController);

        const mesh = colorTileController.getTilesGroup();
        this._scene.add(mesh);
        return mesh;

    }
}




import TileControler from './controler';

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
        const imageTile = new TileControler(
            url,
            'image',
            imageTileOptions);

        this._tiles.push(imageTile);


        const mesh = imageTile.getTilesGroup();
        this._scene.add(mesh);

        return mesh;
    }

    createTopoTiles(url) {
        const topoTileOptions = {
            maxDistance: 1000,
            maxHeight: 800,
            maxLOD: 15,
            minLOD: 15
        }

        const topoTile = new TileControler(
            url,
            'topo',
            topoTileOptions
        );
        this._tiles.push(topoTile);

        const mesh = topoTile.getTilesGroup();
        this._scene.add(mesh);

        return mesh;
    }

    createDebugTiles() {
        const colorTile = new TileControler(
            '',
            'color'
        )
        this._tiles.push(colorTile);

        const mesh = colorTile.getTilesGroup();
        this._scene.add(mesh);
        return mesh;

    }
}


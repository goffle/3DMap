

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

    setImage(url) {
        const imageTileOptions = { maxDistance: 200000, maxLOD: 18, minLOD: 1 }
        const imageTile = new TileControler(
            url,
            'image',
            this._scene,
            imageTileOptions);

        this._tiles.push(imageTile);
    }

    setTopo(url) {
        const topoTileOptions = {
            maxDistance: 1000,
            maxLOD: 15,
            minLOD: 15
        }

        const topoTile = new TileControler(
            url,
            'topo',
            this._scene,
            topoTileOptions
        );
        this._tiles.push(topoTile);
    }

    setDebug() {
        const colorTile = new TileControler(
            '',
            'color',
            this._scene
        )
        this._tiles.push(colorTile);
    }
}


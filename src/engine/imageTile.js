import THREE from 'three';

import helper from './helper';

// TODO: Make sure nothing is left behind in the heap after calling destroy()

class ImageTile {
  constructor(quadcode, path) {
    this._tile = helper.quadcodeToVec3(quadcode);
    this._boundsLatLon = helper.tileBoundsWGS84(this._tile);
    this._boundsWorld = helper.tileBoundsFromWGS84(this._boundsLatLon);
  }


  requestTileAsync() {
    // Making this asynchronous really speeds up the LOD framerate
    setTimeout(() => {
      if (!this._mesh) {
        this._mesh = this.createMesh();
        this._requestTile();
      }
    }, 0);
  }

  createMesh() {
    // Something went wrong and the tile
    //
    // Possibly removed by the cache before loaded
    if (!this._center) {
      return;
    }

    var mesh = new THREE.Object3D();
    var geom = new THREE.PlaneBufferGeometry(this._side, this._side, 1);

    var material = new THREE.MeshBasicMaterial({
      depthWrite: false
    });


    var localMesh = new THREE.Mesh(geom, material);
    localMesh.rotation.x = -90 * Math.PI / 180;

    localMesh.receiveShadow = true;

    mesh.add(localMesh);
    mesh.renderOrder = 0.1;

    mesh.position.x = this._center[0];
    mesh.position.z = this._center[1];

    return mesh;
  }

  _requestTile() {
    var urlParams = {
      x: this._tile[0],
      y: this._tile[1],
      z: this._tile[2]
    };

    var url = this._getTileURL(urlParams);

    var image = document.createElement('img');

    image.addEventListener('load', event => {
      var texture = new THREE.Texture();

      texture.image = image;
      texture.needsUpdate = true;

      // Silky smooth images when tilted
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipMapLinearFilter;

      // TODO: Set this to renderer.getMaxAnisotropy() / 4
      texture.anisotropy = 4;

      texture.needsUpdate = true;

      // Something went wrong and the tile or its material is missing
      //
      // Possibly removed by the cache before the image loaded
      if (!this._mesh || !this._mesh.children[0] || !this._mesh.children[0].material) {
        return;
      }

      this._mesh.children[0].material.map = texture;
      this._mesh.children[0].material.needsUpdate = true;

      this._texture = texture;
      this._ready = true;
    }, false);

    // image.addEventListener('progress', event => {}, false);
    // image.addEventListener('error', event => {}, false);

    image.crossOrigin = '';

    // Load image
    image.src = url;

    this._image = image;
  }

  _abortRequest() {
    if (!this._image) {
      return;
    }

    this._image.src = '';
  }
}




export default ImageTile;

var noNew = function (quadcode, path, layer) {
  return new ImageTile(quadcode, path, layer);
};

// Initialise without requiring new keyword
export { noNew as imageTile };

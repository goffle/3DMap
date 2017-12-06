import { point as Point } from './geo/Point';
import { latLon as LatLon } from './geo/LatLon';

import world from './world';
import helper from './helper';

// TODO: Make sure nothing is left behind in the heap after calling destroy()



class ImageTile {
  constructor(quadcode, path) {
    this._path = path;
    this._quadcode = quadcode;
    this._tile = helper.quadcodeToVec3(quadcode);
    this._boundsLatLon = helper.tileBoundsWGS84(this._tile);


    this._boundsWorld = helper.tileBoundsFromWGS84(this._boundsLatLon);
    this._center = helper.boundsToCenter(this._boundsWorld);
    this._centerLatlon = world.pointToLatLon(Point(this._center[0], this._center[1]));
    this._side = this._getSide(this._boundsWorld);
    this._pointScale = world.pointScale(this._centerLatlon);

    this._mesh = new THREE.Object3D();
    this._isInit = false;
    this._ready = false;
  }

  getBounds() {
    return this._boundsWorld;
  }

  getCenter() {
    return this._center;
  }

  isInit(){
    return this._isInit;
  }

  isReady(){
    return this._ready;
  }

  getSide() {
    return this._side;
  }

  getMesh() {
    return this._mesh;
  }

  getQuadCode() {
    return this._quadcode;
  }




  requestTileAsync() {
    // Making this asynchronous really speeds up the LOD framerate
    setTimeout(() => {
      if (!this._isInit) {
        this._createMesh();
        this._requestTile();
      }
    }, 0);
  }

  _getSide(bounds) {
    return (new THREE.Vector3(bounds[0], 0, bounds[3])).sub(new THREE.Vector3(bounds[0], 0, bounds[1])).length();
  }




  _createMesh() {
    // Something went wrong and the tile
    //
    // Possibly removed by the cache before loaded
    if (!this._center) {
      return;
    }

    var geom = new THREE.PlaneBufferGeometry(this._side, this._side, 1);

    var material = new THREE.MeshBasicMaterial({
      depthWrite: false
    });


    var localMesh = new THREE.Mesh(geom, material);
    localMesh.rotation.x = -90 * Math.PI / 180;

    //localMesh.receiveShadow = true;

    this._mesh.add(localMesh);
    this._mesh.renderOrder = 0.1;

    this._mesh.position.x = this._center[0];
    this._mesh.position.z = this._center[1];

    this._isInit = true;
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


  _getTileURL(urlParams) {
    if (!urlParams.s) {
      // Default to a random choice of a, b or c
      urlParams.s = String.fromCharCode(97 + Math.floor(Math.random() * 3));
    }
    var tileURLRegex = /\{([szxy])\}/g;
    tileURLRegex.lastIndex = 0;
    return this._path.replace(tileURLRegex, (value, key) => {
      // Replace with paramter, otherwise keep existing value
      return urlParams[key];
    });
  }

  _abortRequest() {
    if (!this._image) {
      return;
    }

    this._image.src = '';
  }
}

export default ImageTile;

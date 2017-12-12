import reqwest from 'reqwest';

import { point as Point } from './../geo/Point';
import { latLon as LatLon } from './../geo/LatLon';

import world from './../world';
import helper from './../util/helper';

export default class TileAbstract {

  constructor(quadcode, path) {

    this._quadcode = quadcode;
    this._tile = helper.quadcodeToVec3(quadcode);
    this._boundsLatLon = helper.tileBoundsWGS84(this._tile);
    this._boundsWorld = helper.tileBoundsFromWGS84(this._boundsLatLon);
    this._center = helper.boundsToCenter(this._boundsWorld);
    this._centerLatlon = world.pointToLatLon(Point(this._center[0], this._center[1]));
    this._side = (new THREE.Vector3(this._boundsWorld[0], 0, this._boundsWorld[3])).sub(new THREE.Vector3(this._boundsWorld[0], 0, this._boundsWorld[1])).length();
    this._pointScale = world.pointScale(this._centerLatlon);

    this._mesh = new THREE.Group();
    this._isInit = false;
    this._isReady = false;
  }

  getBounds() {
    return this._boundsWorld;
  }

  getCenter() {
    return this._center;
  }

  isInit() {
    return this._isInit;
  }

  isReady() {
    return this._isReady;
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
        this._isInit = true;
        this._requestTile().then((mesh) => {
          this._isReady = true;
          this._mesh.add(mesh);
        });
      }
    }, 0);
  }



}


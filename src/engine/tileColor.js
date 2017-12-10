import geojsonMerge from 'geojson-merge';
import * as topojson from 'topojson';


import { point as Point } from './geo/Point';
import { latLon as LatLon } from './geo/LatLon';


import createPolygon from './geometry/Polygon';

import reqwest from 'reqwest';

import world from './world';
import helper from './helper';
import { feature } from 'topojson';

class ColorTile {
  constructor(quadcode, path) {

    this._quadcode = quadcode;
    this._tile = helper.quadcodeToVec3(quadcode);
    this._boundsLatLon = helper.tileBoundsWGS84(this._tile);
    this._boundsWorld = helper.tileBoundsFromWGS84(this._boundsLatLon);
    this._center = helper.boundsToCenter(this._boundsWorld);
    this._centerLatlon = world.pointToLatLon(Point(this._center[0], this._center[1]));
    this._side = this._getSide(this._boundsWorld);
    this._pointScale = world.pointScale(this._centerLatlon);

    this._mesh = new THREE.Group();
    this._isInit = false;
    this._isReady = true;
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
        this._createMesh();
        this._requestTile();
      }
    }, 0);
  }

  _getSide(bounds) {
    return (new THREE.Vector3(bounds[0], 0, bounds[3])).sub(new THREE.Vector3(bounds[0], 0, bounds[1])).length();
  }

  _createMesh() {
    if (!this._center) {
      return;
    }

    this._isInit = true;
  }

  _getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  _requestTile() {
    var geometry = new THREE.PlaneGeometry(this._side, this._side);
    var material = new THREE.MeshBasicMaterial({ color: this._getRandomColor(), side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.x = this._center[0];
    plane.position.y = 0;
    plane.position.z = this._center[1];
    plane.rotation.x = -90 * Math.PI / 180;
    this._mesh.add(plane);
  }

  _abortRequest() {

  }
}

export default ColorTile;

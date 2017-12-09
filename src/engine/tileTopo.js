import geojsonMerge from 'geojson-merge';
import * as topojson from 'topojson';


import { point as Point } from './geo/Point';
import { latLon as LatLon } from './geo/LatLon';


import createPolygon from './geometry/Polygon';

import reqwest from 'reqwest';

import world from './world';
import helper from './helper';

class TopoTile {
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

  _requestData(url) {
    this._request = reqwest({
      url: url,
      type: 'json',
      crossOrigin: true
    }).then(res => {
      // Clear request reference
      this._request = null;
      this._processData(res);
    }).catch(err => {
      console.error(err);

      // Clear request reference
      this._request = null;
    });
  }

  _processData(data) {
    var collections = [];
    for (var tk in data.objects) {
      collections.push(topojson.feature(data, data.objects[tk]));
    }
    const geojson = geojsonMerge(collections);

    const meshs = [];

    const features = geojson.features;
    features.forEach(feature => {
      var mesh = this.getMeshFromFeature(feature);
      if (mesh) {
        meshs.push(mesh);
      }
    });

    meshs.forEach(mesh => {
      this._mesh.add(mesh);
    })
  }

  getMeshFromFeature(feature) {
    var geometry = feature.geometry;
    var coordinates = (geometry.coordinates) ? geometry.coordinates : null;
    var height = feature.properties.height;
    var mesh = null;

    if (!coordinates || !geometry) {
      return;
    }

    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      mesh = createPolygon(coordinates, height);
    }

    return mesh;

  }


  _requestTile() {

    var urlParams = {
      x: this._tile[0],
      y: this._tile[1],
      z: this._tile[2]
    };

    var url = this._getTileURL(urlParams);
    this._requestData(url);

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

  }
}

export default TopoTile;

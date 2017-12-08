import geojsonMerge from 'geojson-merge';
import * as topojson from 'topojson';


import { point as Point } from './geo/Point';
import { latLon as LatLon } from './geo/LatLon';


import createPolygon from  './geometry/Polygon';
import PolygonLayer from './geometry/PolygonLayer';
// import PolylineLayer from './geometry/PolylineLayer';
// import PointLayer from './geometry/PointLayer';

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

  // _requestData(url) {
  //   fetch(url).then(res => {
  //     res.blob().then(data => {
  //       this._processData(data);
  //     })
  //   }).catch(err => {
  //     console.error(err);
  //   });
  // }

  _collectFeatures(data) {
    var collections = [];
    for (var tk in data.objects) {
      collections.push(topojson.feature(data, data.objects[tk]));
    }
    return geojsonMerge(collections);
  };


  _processData(data) {

    // Also converts TopoJSON to GeoJSON if instructed

    const geojson = this._collectFeatures(data);
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


    //console.log(meshs);
    // If merging layers do that now, otherwise skip as the geometry layers
    // should have already outputted themselves
    // if (!this.isOutput()) {
    //   return;
    // }

    // From here on we can assume that we want to merge the layers

    // var polygonAttributes = [];
    // var polygonFlat = true;

    // var polylineAttributes = [];
    // var pointAttributes = [];

    // layers.forEach(layer => {
    //   if (layer instanceof PolygonLayer) {
    //     polygonAttributes.push(layer.getBufferAttributes());

    //     if (polygonFlat && !layer.isFlat()) {
    //       polygonFlat = false;
    //     }
    //   } else if (layer instanceof PolylineLayer) {
    //     polylineAttributes.push(layer.getBufferAttributes());
    //   } else if (layer instanceof PointLayer) {
    //     pointAttributes.push(layer.getBufferAttributes());
    //   }
    // });

    // if (polygonAttributes.length > 0) {
    //   var mergedPolygonAttributes = Buffer.mergeAttributes(polygonAttributes);
    //   this._setPolygonMesh(mergedPolygonAttributes, polygonFlat);
    //   this.add(this._polygonMesh);
    // }

    // if (polylineAttributes.length > 0) {
    //   var mergedPolylineAttributes = Buffer.mergeAttributes(polylineAttributes);
    //   this._setPolylineMesh(mergedPolylineAttributes);
    //   this.add(this._polylineMesh);
    // }

    // if (pointAttributes.length > 0) {
    //   var mergedPointAttributes = Buffer.mergeAttributes(pointAttributes);
    //   this._setPointMesh(mergedPointAttributes);
    //   this.add(this._pointMesh);
    // }

    // Clean up layers
    //
    // TODO: Are there ever situations where the unmerged buffer attributes
    // and coordinates would still be required?

    // layers.forEach(layer => {
    //   layer.clearBufferAttributes();
    //   layer.clearCoordinates();
    // });
  }



  getMeshFromFeature(feature) {
    var geometry = feature.geometry;
    var coordinates = (geometry.coordinates) ? geometry.coordinates : null;
    var mesh = null;

    if (!coordinates || !geometry) {
      return;
    }

    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {

      mesh = createPolygon(coordinates);
     // mesh = new PolygonLayer(coordinates).getMesh();
    }


    return mesh;

    // if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
    //   // Pass onBufferAttributes callback, if defined
    //   if (typeof this._options.onPolylineBufferAttributes === 'function') {
    //     options.onBufferAttributes = this._options.onPolylineBufferAttributes;
    //   }
    //   return new PolylineLayer(coordinates, options);
    // }

    // if (geometry.type === 'Point' || geometry.type === 'MultiPoint') {
    //   if (typeof this._options.onPointMesh === 'function') {
    //     options.onMesh = this._options.onPointMesh;
    //   }
    //   return new PointLayer(coordinates, options);
    // }



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

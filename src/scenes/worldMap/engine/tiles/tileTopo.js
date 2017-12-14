import geojsonMerge from 'geojson-merge';
import { feature } from 'topojson';

import TileAbstract from './tileAbstract';

import createPolygon from './../geometry/Polygon';

import reqwest from 'reqwest';

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xEAEAEA, linewidth: 1 });
const polygonMaterial = new THREE.MeshLambertMaterial({ color: 0xEBF3ED, emissive: 0xD4DADC, side: THREE.BackSide });


export default class TileTopo extends TileAbstract {
  constructor(quadcode, path) {
    super(quadcode);
    this._path = path;
    this._request = null;
  }

  _requestTile() {
    return new Promise((resolve, reject) => {
      var urlParams = {
        x: this._tile[0],
        y: this._tile[1],
        z: this._tile[2]
      };
      var url = this.getTileURL(urlParams, this._path);

      reqwest({
        url: url,
        type: 'json',
        crossOrigin: true
      }).then(res => {
        const mesh = this.getMeshFromTopo(res);
        if (mesh) {
          resolve(mesh);
        } else {
          reject();
        }
      }).catch(err => {
        console.error(err);
      });
    });
  }


  getUnMergedMesh(features) {

    const g = new THREE.Group();
    let tag = false;

    features.forEach(feature => {
      const { type, coordinates } = feature.geometry;
      var height = feature.properties.height;

      if (!coordinates) {
        return;
      }

      if (type === 'Polygon' || type === 'MultiPolygon') {
        var geometry = createPolygon(coordinates, height);

        var buildingMesh = new THREE.Mesh(geometry, polygonMaterial);
        var geo = new THREE.EdgesGeometry(geometry);
        var wireframe = new THREE.LineSegments(geo, lineMaterial);
        buildingMesh.add(wireframe);
        g.add(buildingMesh);
        tag = true;
      }
    });

    if (!tag) {
      return null;
    }

    return g;
  }


  getMergedMesh(features) {

    const tmpGeometry = new THREE.Geometry();

    let tag = false;

    features.forEach(feature => {
      const { type, coordinates } = feature.geometry;
      var height = feature.properties.height;

      if (!coordinates) {
        return;
      }

      if (type === 'Polygon' || type === 'MultiPolygon') {
        var geometry = createPolygon(coordinates, height);

        var pxTmpGeometry = new THREE.Geometry().fromBufferGeometry(geometry);
        tmpGeometry.merge(pxTmpGeometry);
        tag = true;
      }
    });

    if (!tag) {
      return null;
    }

    tmpGeometry.computeBoundingBox();
    var buildingMesh = new THREE.Mesh(tmpGeometry, polygonMaterial);
    // buildingMesh.castShadow = true; //default is false
    // buildingMesh.receiveShadow = true; //default

    var geo = new THREE.EdgesGeometry(tmpGeometry);
    var wireframe = new THREE.LineSegments(geo, lineMaterial);
    buildingMesh.add(wireframe);

    return buildingMesh;

  }

  getMeshFromTopo(data) {

    if (!data) {
      return null;
    }
    var collections = [];
    for (var tk in data.objects) {
      collections.push(feature(data, data.objects[tk]));
    }

    const { features } = geojsonMerge(collections);

    return this.getUnMergedMesh(features);

  }


  getTileURL(urlParams, url) {
    if (!urlParams.s) {
      // Default to a random choice of a, b or c
      urlParams.s = String.fromCharCode(97 + Math.floor(Math.random() * 3));
    }
    var tileURLRegex = /\{([szxy])\}/g;
    tileURLRegex.lastIndex = 0;
    return url.replace(tileURLRegex, (value, key) => {
      // Replace with paramter, otherwise keep existing value
      return urlParams[key];
    });
  }
}



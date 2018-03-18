import geojsonMerge from 'geojson-merge';
import { feature } from 'topojson';

import TileAbstract from './tileAbstract';

import createPolygon from './../geometry/Polygon';

import reqwest from 'reqwest';

const lineMaterial = new window.THREE.LineBasicMaterial({ color: 0xEAEAEA, linewidth: 1 });
const polygonMaterial = new window.THREE.MeshLambertMaterial({ color: 0xEBF3ED, emissive: 0xD4DADC, side: window.THREE.DoubleSide });

export default class TileTopo extends TileAbstract {
  constructor(quadcode, path) {
    super(quadcode);
    this._path = path;
    this._request = null;
  }

  // _requestTile() {
  //   return new Promise((resolve, reject) => {
  //     if(!mesh){
  //       const file =require('./../../../../assets/map.topojson');
  //       var request = new XMLHttpRequest();
  //       request.open("GET", file, false);
  //       request.send(null)
  //       console.log('START PARSE')
  //       var obj = JSON.parse(request.responseText);
  //       console.log('GET MESH')
  //       mesh = this.getMeshFromTopo(obj);
  //     }
  //     console.log('MESH ',mesh)
  //     resolve(mesh);
  //   });
  // }


  _requestTile() {
    return new Promise((resolve, reject) => {
      var urlParams = {
        x: this._tile[0],
        y: this._tile[1],
        z: this._tile[2]
      };

      var url = this.getTileURL(urlParams, this._path);

      console.log(url);
      reqwest({ url: url, type: 'json', crossOrigin: true })
        .then(res => {
          //       reject('OK ' + url);
          const mesh = this.getMeshFromTopo(res);
          if (mesh) {
            resolve(mesh);
          } else {
            reject();
          }
        }).catch((err) => {
          reject('KO ' + url);
          // reject();
          // console.error(err);
        });

    });
  }


  getUnMergedMesh(features) {

    const g = new window.THREE.Group();
    let tag = false;

    features.forEach(feature => {
      const { type, coordinates } = feature.geometry;

      var height = feature.properties.height;

      if (!coordinates) {
        return;
      }

      if (type === 'Polygon' || type === 'MultiPolygon') {
        var geometry = createPolygon(coordinates, height);

        var buildingMesh = new window.THREE.Mesh(geometry, polygonMaterial);
        var geo = new window.THREE.EdgesGeometry(geometry);
        var wireframe = new window.THREE.LineSegments(geo, lineMaterial);
        // buildingMesh.add(wireframe);
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

    const tmpGeometry = new window.THREE.Geometry();

    let tag = false;

    features.forEach(feature => {
      const { type, coordinates } = feature.geometry;
      var height = feature.properties.height;

      if (!coordinates) {
        return;
      }

      if (type === 'Polygon' || type === 'MultiPolygon') {
        var geometry = createPolygon(coordinates, 20);

        var pxTmpGeometry = new window.THREE.Geometry().fromBufferGeometry(geometry);
        tmpGeometry.merge(pxTmpGeometry);
        tag = true;
      }
    });

    if (!tag) {
      return null;
    }

    tmpGeometry.computeBoundingBox();
    var buildingMesh = new window.THREE.Mesh(tmpGeometry, polygonMaterial);
    // buildingMesh.castShadow = true; //default is false
    // buildingMesh.receiveShadow = true; //default

    var geo = new window.THREE.EdgesGeometry(tmpGeometry);
    var wireframe = new window.THREE.LineSegments(geo, lineMaterial);
    // buildingMesh.add(wireframe);

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



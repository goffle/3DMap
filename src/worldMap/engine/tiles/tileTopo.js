import geojsonMerge from 'geojson-merge';
import { feature } from 'topojson';

import TileAbstract from './tileAbstract';

import createPolygon from './../geometry/Polygon';

import reqwest from 'reqwest';

const lineMaterial = new window.THREE.LineBasicMaterial({ color: 0xEAEAEA, linewidth: 1 });



function _getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '0x';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


export default class TileTopo extends TileAbstract {
  constructor(quadcode, path) {
    super(quadcode);
    this._path = path;
    this._request = null;

    var color = parseInt(_getRandomColor());
    // console.log('New color : ', color)
    this._polygonMaterial = new window.THREE.MeshLambertMaterial({ color: color, emissive: color, side: window.THREE.DoubleSide });


  }

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

        var buildingMesh = new window.THREE.Mesh(geometry, this._polygonMaterial);
        var geo = new window.THREE.EdgesGeometry(geometry);
        var wireframe = new window.THREE.LineSegments(geo, lineMaterial);
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
    var buildingMesh = new window.THREE.Mesh(tmpGeometry, this._polygonMaterial);
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

    let { features } = geojsonMerge(collections);
    console.log('got features 1 ', features.length)

    // features = features.filter((e) => e.geometry.type === 'Polygon' );
    features = features.filter((e) => {
      if (e.geometry.type === 'Polygon') {
        if (e.properties.building) {
          return true
        } else {
          return false
        }
      }
      return false
    });
    console.log('got features 2', features.length)

    // {
    //   console.log('eee', e.geometry.type);
    //   return true;
    // }) //e.properties.geometry.type === 'polygon')

    // features = features.filter((e) => e.properties.geometry.type === 'polygon');

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



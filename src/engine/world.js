import THREE from 'three';
import Geo from './geo/geo';
import { point as Point } from './geo/Point';
import { latLon as LatLon } from './geo/LatLon';

class World {
  constructor() {
    console.log('New world')
  }

  setView(latlon) {
    this._originLatlon = latlon;
    this._originPoint = this.project(latlon);
  }

  project(LatLon) {
    return Geo.latLonToPoint(LatLon);
  }

  unproject(point) {
    return Geo.pointToLatLon(Point(point));
  }

  pointScale(latlon, accurate) {
    return Geo.pointScale(latlon, accurate);
  }

  latLonToPoint(LatLon) {
    var projectedPoint = this.project(LatLon);
    return projectedPoint._subtract(this._originPoint);
  }

  pointToLatLon(point) {
    var projectedPoint = Point(point).add(this._originPoint);
    return this.unproject(projectedPoint);
  }

}

const w = new World();
export default w;


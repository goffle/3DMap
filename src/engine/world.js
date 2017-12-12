
import { point as Point } from './geo/Point';
import { latLon as LatLon } from './geo/LatLon';

// Radius / WGS84 semi-major axis
const R = 6378137;
const MAX_LATITUDE = 85.0511287798;

// WGS84 eccentricity
const ECC = 0.081819191;
const ECC2 = 0.081819191 * 0.081819191;

class World {

  setView(latlon) {
    this._originLatlon = latlon;
    this._originPoint = this.project(latlon);
  }

  latLonToPoint(latlon) {
    var projectedPoint = this.project(latlon);;
    return projectedPoint._subtract(this._originPoint);
  }

  pointToLatLon(point) {
    var _point = Point(point.x, point.y * -1);
    return this.unproject(_point);
  }

  project(latlon) {
    var d = Math.PI / 180;
    var max = MAX_LATITUDE;
    var lat = Math.max(Math.min(max, latlon.lat), -max);
    var sin = Math.sin(lat * d);
    const pt = Point(
      R * latlon.lon * d,
      R * Math.log((1 + sin) / (1 - sin)) / 2
    );
    pt.y *= -1;
    return pt;
  }

  unproject(point) {
    var d = 180 / Math.PI;
    return LatLon(
      (2 * Math.atan(Math.exp(point.y / R)) - (Math.PI / 2)) * d,
      point.x * d / R
    );
  }

  pointScale(latlon, accurate) {
    var rad = Math.PI / 180;

    var k;

    if (!accurate) {
      k = 1 / Math.cos(latlon.lat * rad);

      // [scaleX, scaleY]
      return [k, k];
    } else {
      var lat = latlon.lat * rad;
      var lon = latlon.lon * rad;

      var a = R;

      var sinLat = Math.sin(lat);
      var sinLat2 = sinLat * sinLat;

      var cosLat = Math.cos(lat);

      // Radius meridian
      var p = a * (1 - ECC2) / Math.pow(1 - ECC2 * sinLat2, 3 / 2);

      // Radius prime meridian
      var v = a / Math.sqrt(1 - ECC2 * sinLat2);

      // Scale N/S
      var h = (a / p) / cosLat;

      // Scale E/W
      k = (a / v) / cosLat;

      // [scaleX, scaleY]
      return [k, h];
    }
  }
}

const w = new World();
export default w;


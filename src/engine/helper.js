import { latLon as LatLon } from './geo/LatLon';
import world from './world';


function quadcodeToVec3(quadcode) {
    var x = 0;
    var y = 0;
    var z = quadcode.length;
    for (var i = z; i > 0; i--) {
        var mask = 1 << (i - 1);
        var q = +quadcode[z - i];
        if (q === 1) {
            x |= mask;
        }
        if (q === 2) {
            y |= mask;
        }
        if (q === 3) {
            x |= mask;
            y |= mask;
        }
    }
    return [x, y, z];
}

function tileBoundsFromWGS84(boundsWGS84) {
    var sw = world.latLonToPoint(LatLon(boundsWGS84[1], boundsWGS84[0]));
    var ne = world.latLonToPoint(LatLon(boundsWGS84[3], boundsWGS84[2]));
    return [sw.x, sw.y, ne.x, ne.y];
}


function tileBoundsWGS84(tile) {
    var e = tile2lon(tile[0] + 1, tile[2]);
    var w = tile2lon(tile[0], tile[2]);
    var s = tile2lat(tile[1] + 1, tile[2]);
    var n = tile2lat(tile[1], tile[2]);
    return [w, s, e, n];
}

function tile2lon(x, z) {
    return x / Math.pow(2, z) * 360 - 180;
}

function tile2lat(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    var r2d = 180 / Math.PI;
    return r2d * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function boundsToCenter(bounds) {
    var x = bounds[0] + (bounds[2] - bounds[0]) / 2;
    var y = bounds[1] + (bounds[3] - bounds[1]) / 2;
    return [x, y];
}

export default {
    quadcodeToVec3,
    tileBoundsWGS84,
    tileBoundsFromWGS84,
    boundsToCenter
}
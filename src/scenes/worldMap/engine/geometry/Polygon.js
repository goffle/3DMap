// TODO: Move duplicated logic between geometry layrs into GeometryLayer

// TODO: Look at ways to drop unneeded references to array buffers, etc to
// reduce memory footprint

// TODO: Support dynamic updating / hiding / animation of geometry
//
// This could be pretty hard as it's all packed away within BufferGeometry and
// may even be merged by another layer (eg. GeoJSONLayer)
//
// How much control should this layer support? Perhaps a different or custom
// layer would be better suited for animation, for example.

// TODO: Allow _setBufferAttributes to use a custom function passed in to
// generate a custom mesh

import { latLon as LatLon } from '../geo/LatLon';
import earcut from 'earcut';
import extrudePolygon from '../util/extrudePolygon';
import Buffer from '../util/Buffer';
import world from './../world';


export default function createPolygon(originalCoordinates, height = 16) {

  const coordinates = isSingle(originalCoordinates) ? [originalCoordinates] : originalCoordinates;

  var projectedCoordinates = projectandconverteCoordinates(coordinates);

  const buffersAttributes = getBufferAttributes(projectedCoordinates, height);
  return createGeometry(buffersAttributes);
}


function getBufferAttributes(projectedCoordinates, height) {

  var attributes;

  var colour = new THREE.Color(0x666666);

  // Light and dark colours used for poor-mans AO gradient on object sides
  var light = new THREE.Color(0xffffff);
  var shadow = new THREE.Color(0x666666);

  // For each polygon
  attributes = projectedCoordinates.map(projectedCoordinate => {
    // Convert coordinates to earcut format
    var earcut = toEarcut(projectedCoordinate);

    // Triangulate faces using earcut
    var faces = triangulate(earcut.vertices, earcut.holes, earcut.dimensions);

    var groupedVertices = [];
    for (var i = 0, il = earcut.vertices.length; i < il; i += earcut.dimensions) {
      groupedVertices.push(earcut.vertices.slice(i, i + earcut.dimensions));
    }

    var extruded = extrudePolygon(groupedVertices, faces, {
      bottom: 0,
      top: height
    });

    var topColor = colour.clone().multiply(light);
    var bottomColor = colour.clone().multiply(shadow);

    var _vertices = extruded.positions;
    var _faces = [];
    var _colours = [];

    var _colour;
    extruded.top.forEach((face, fi) => {
      _colour = [];

      _colour.push([colour.r, colour.g, colour.b]);
      _colour.push([colour.r, colour.g, colour.b]);
      _colour.push([colour.r, colour.g, colour.b]);

      _faces.push(face);
      _colours.push(_colour);
    });


    if (extruded.sides) {
      // Set up colours for every vertex with poor-mans AO on the sides
      extruded.sides.forEach((face, fi) => {
        _colour = [];

        // First face is always bottom-bottom-top
        if (fi % 2 === 0) {
          _colour.push([bottomColor.r, bottomColor.g, bottomColor.b]);
          _colour.push([bottomColor.r, bottomColor.g, bottomColor.b]);
          _colour.push([topColor.r, topColor.g, topColor.b]);
          // Reverse winding for the second face
          // top-top-bottom
        } else {
          _colour.push([topColor.r, topColor.g, topColor.b]);
          _colour.push([topColor.r, topColor.g, topColor.b]);
          _colour.push([bottomColor.r, bottomColor.g, bottomColor.b]);
        }

        _faces.push(face);
        _colours.push(_colour);
      });
    }

    // Skip bottom as there's no point rendering it
    // allFaces.push(extruded.faces);

    var polygon = {
      vertices: _vertices,
      faces: _faces,
      colours: _colours,
      facesCount: _faces.length
    };

    // Convert polygon representation to proper attribute arrays
    return toAttributes(polygon);
  });

  return Buffer.mergeAttributes(attributes);
}

function toAttributes(polygon) {
  // Three components per vertex per face (3 x 3 = 9)
  var vertices = new Float32Array(polygon.facesCount * 9);
  var normals = new Float32Array(polygon.facesCount * 9);
  var colours = new Float32Array(polygon.facesCount * 9);

  var pA = new THREE.Vector3();
  var pB = new THREE.Vector3();
  var pC = new THREE.Vector3();

  var cb = new THREE.Vector3();
  var ab = new THREE.Vector3();

  var index;

  var _faces = polygon.faces;
  var _vertices = polygon.vertices;
  var _colour = polygon.colours;


  var lastIndex = 0;

  for (var i = 0; i < _faces.length; i++) {
    // Array of vertex indexes for the face
    index = _faces[i][0];

    var ax = _vertices[index][0];
    var ay = _vertices[index][1];
    var az = _vertices[index][2];

    var c1 = _colour[i][0];

    index = _faces[i][1];

    var bx = _vertices[index][0];
    var by = _vertices[index][1];
    var bz = _vertices[index][2];

    var c2 = _colour[i][1];

    index = _faces[i][2];

    var cx = _vertices[index][0];
    var cy = _vertices[index][1];
    var cz = _vertices[index][2];

    var c3 = _colour[i][2];

    // Flat face normals
    // From: http://threejs.org/examples/webgl_buffergeometry.html
    pA.set(ax, ay, az);
    pB.set(bx, by, bz);
    pC.set(cx, cy, cz);

    cb.subVectors(pC, pB);
    ab.subVectors(pA, pB);
    cb.cross(ab);

    cb.normalize();

    var nx = cb.x;
    var ny = cb.y;
    var nz = cb.z;

    vertices[lastIndex * 9 + 0] = ax;
    vertices[lastIndex * 9 + 1] = ay;
    vertices[lastIndex * 9 + 2] = az;

    normals[lastIndex * 9 + 0] = nx;
    normals[lastIndex * 9 + 1] = ny;
    normals[lastIndex * 9 + 2] = nz;

    colours[lastIndex * 9 + 0] = c1[0];
    colours[lastIndex * 9 + 1] = c1[1];
    colours[lastIndex * 9 + 2] = c1[2];

    vertices[lastIndex * 9 + 3] = bx;
    vertices[lastIndex * 9 + 4] = by;
    vertices[lastIndex * 9 + 5] = bz;

    normals[lastIndex * 9 + 3] = nx;
    normals[lastIndex * 9 + 4] = ny;
    normals[lastIndex * 9 + 5] = nz;

    colours[lastIndex * 9 + 3] = c2[0];
    colours[lastIndex * 9 + 4] = c2[1];
    colours[lastIndex * 9 + 5] = c2[2];

    vertices[lastIndex * 9 + 6] = cx;
    vertices[lastIndex * 9 + 7] = cy;
    vertices[lastIndex * 9 + 8] = cz;

    normals[lastIndex * 9 + 6] = nx;
    normals[lastIndex * 9 + 7] = ny;
    normals[lastIndex * 9 + 8] = nz;

    colours[lastIndex * 9 + 6] = c3[0];
    colours[lastIndex * 9 + 7] = c3[1];
    colours[lastIndex * 9 + 8] = c3[2];

    lastIndex++;
  }

  var attributes = {
    vertices: vertices,
    normals: normals,
    colours: colours
  };

  return attributes;
}

function createGeometry(attributes) {
  var geometry = new THREE.BufferGeometry();

  // itemSize = 3 because there are 3 values (components) per vertex
  geometry.addAttribute('position', new THREE.BufferAttribute(attributes.vertices, 3));
  geometry.addAttribute('normal', new THREE.BufferAttribute(attributes.normals, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(attributes.colours, 3));

  geometry.computeBoundingBox();
  return geometry;
}

function isSingle(coordinates) {
  return !Array.isArray(coordinates[0][0][0]);
}

function projectandconverteCoordinates(coordinates) {
  return coordinates.map(coordinates2 => {
    return coordinates2.map(ring => {
      return ring.map(coordinate => {
        return world.latLonToPoint(LatLon(coordinate[1], coordinate[0]));
      });
    });
  });
}

function triangulate(contour, holes, dim) {
  var faces = earcut(contour, holes, dim);
  var result = [];

  for (var i = 0, il = faces.length; i < il; i += 3) {
    result.push(faces.slice(i, i + 3));
  }
  return result;
}


function toEarcut(coordinates) {
  var dim = 2;
  var result = { vertices: [], holes: [], dimensions: dim };
  var holeIndex = 0;

  for (var i = 0; i < coordinates.length; i++) {
    for (var j = 0; j < coordinates[i].length; j++) {
      result.vertices.push(coordinates[i][j].x);
      result.vertices.push(coordinates[i][j].y);
    }
    if (i > 0) {
      holeIndex += coordinates[i - 1].length;
      result.holes.push(holeIndex);
    }
  }
  return result;
}






import TileAbstract from './tileAbstract'


export default class TileColor extends TileAbstract {
  constructor(quadcode) {
    super(quadcode);
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
    return new Promise((resolve, reject) => {
      var geometry = new THREE.PlaneGeometry(this._side, this._side);
      var material = new THREE.MeshBasicMaterial({ color: this._getRandomColor(), side: THREE.DoubleSide });
      var plane = new THREE.Mesh(geometry, material);
      plane.position.x = this._center[0];
      plane.position.y = 0;
      plane.position.z = this._center[1];
      plane.rotation.x = -90 * Math.PI / 180;
      resolve(plane);
    });
  }

}

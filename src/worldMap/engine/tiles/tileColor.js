import TileAbstract from './tileAbstract'

export default class TileColor extends TileAbstract {
 
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
      var geometry = new window.THREE.PlaneGeometry(this._side, this._side);
      var material = new window.THREE.MeshBasicMaterial({ color: this._getRandomColor(), side: window.THREE.FrontSide });
      var plane = new window.THREE.Mesh(geometry, material);
      plane.position.x = this._center[0];
      plane.position.y = 0;
      plane.position.z = this._center[1];
      plane.rotation.x = -90 * Math.PI / 180;
      plane.receiveShadow = true;
      resolve(plane);
    });
  }

}

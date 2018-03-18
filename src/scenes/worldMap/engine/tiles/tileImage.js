import TileAbstract from './tileAbstract';

export default class TileImage extends TileAbstract {
  constructor(quadcode, path) {
    super(quadcode);
    this._path = path;
  }

  _requestTile() {
    return new Promise((resolve, reject) => {

      var urlParams = {
        x: this._tile[0],
        y: this._tile[1],
        z: this._tile[2]
      };

      var url = this.getTileURL(urlParams, this._path);

      const planeMesh = this.createMesh();
      var image = document.createElement('img');
      image.addEventListener('load', event => {
        var texture = new window.THREE.Texture();

        texture.image = image;
        texture.needsUpdate = true;

        // Silky smooth images when tilted
        texture.magFilter = window.THREE.LinearFilter;
        texture.minFilter = window.THREE.LinearMipMapLinearFilter;

        // TODO: Set this to renderer.getMaxAnisotropy() / 4
        texture.anisotropy = 4;
        texture.needsUpdate = true;

        // //
        // // Possibly removed by the cache before the image loaded
        // if (!this._mesh || !this._mesh.children[0] || !this._mesh.children[0].material) {
        //   return;
        // }

        planeMesh.material.map = texture;
        planeMesh.material.needsUpdate = true;


        resolve(planeMesh)
      }, false);

      image.crossOrigin = '';
      image.src = url;    // Load image
    });

  }

  createMesh() {
    var geom = new window.THREE.PlaneBufferGeometry(this._side, this._side, 1);

    var material = new window.THREE.MeshBasicMaterial({
      depthWrite: false
    });

    var localMesh = new window.THREE.Mesh(geom, material);
    localMesh.rotation.x = -90 * Math.PI / 180;

    localMesh.receiveShadow = true;

    localMesh.position.x = this._center[0];
    localMesh.position.z = this._center[1];
    localMesh.renderOrder = 0.1;

    return localMesh;
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

import TileAbstract from './tileAbstract';

var material = new window.THREE.MeshBasicMaterial({ color: 0xff0000 });

export default class TileImage extends TileAbstract {
  constructor(quadcode, path) {
    super(quadcode);
    this._path = path;
  }

  _requestTile() {
    console.log('yo',this._pointScale)
    return this.search(this._centerLatlon.lat, this._centerLatlon.lon);
  }

  createMarker(lat, lon) {
    var geometry = new window.THREE.BoxGeometry(10, 100, 10);
    var cube = new window.THREE.Mesh(geometry, material);
    // const pt = world.pointToLatLon(LatLon(lat, lon));
    // cube.position.x = pt.x;
    // cube.position.z = pt.y;
    // cube.position.y = 0;
    return cube;
  }
  search(lat, lon) {

    return new Promise((resolve, reject) => {
      const clientId = 'HL5RWIE230MJVF1ZHXZ12WCQBR2YBBD1ZJMD2U1MRW3NFCCI';
      const clientSecret = 'XHRP5GG20KRXYOAHHMHZIWPHNLRXOFEMIJBI5JZYKWKLK5CJ';
      const url = `https://api.foursquare.com/v2/venues/search?v=20161016&ll=${lat},${lon}&query=coffee&intent=checkin&client_id=${clientId}&client_secret=${clientSecret}`;

      fetch(url)
        .then((v) => {
          v.json().then((vv) => {
            const arr = (vv.response && vv.response.venues) ? vv.response.venues : []
            if (arr.length) {
              const groupMesh = new window.THREE.Group();
              arr.forEach((element) => {
                groupMesh.add(this.createMarker(element.location.lat, element.location.lng));
              });

              resolve(groupMesh);
            } else {
              reject();
            }
          })
            .catch((e) => {
              reject();
              console.log(e)
            });
        })
        .catch((e) => {
          reject();
          console.log(e)
        });
    });
  }

}

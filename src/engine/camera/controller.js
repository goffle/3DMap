import OrbitControls from "./orbitControls"

//https://threejs.org/examples/canvas_interactive_cubes.html

class CameraController {
    constructor() {
        this._camera = null;
        this._controls = null;
    }

    init(camera, renderer) {
        this._camera = camera;
        this._camera.position.set(0, 300, 0);
        this._camera.lookAt(new THREE.Vector3(0, 0, 0));
        this._camera.updateProjectionMatrix();
        this._controls = new THREE.OrbitControls(this._camera, renderer.domElement);
    }

    getControls() { return this._controls; }


    flyToLatLon(LatLon, zoom = 200) {

    }

    flyToPoint(point, zoom = 200) {
        const animationDuration = 600;
        let from = {
            positionx: this._camera.position.x,
            positiony: this._camera.position.y,
            positionz: this._camera.position.z,
            targetx: this._controls.target.x,
            targety: this._controls.target.y,
            targetz: this._controls.target.z
        };

        let to = {
            positionx: point.x,
            positiony: point.y + 100,
            positionz: point.z + zoom,
            targetx: point.x,
            targety: point.y,
            targetz: point.z
        };

        //console.log(from, to);


        new TWEEN.Tween(from).to(to, animationDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this._camera.lookAt(from.targetx, from.targety, from.targetz);
                this._camera.position.set(from.positionx, from.positiony, from.positionz);
                this._controls.target.set(from.targetx, from.targety, from.targetz);

                this._camera.updateProjectionMatrix();
                this._controls.update();
            })
            .onComplete(() => {
                // this._camera.lookAt(to.positionx,to.positiony,to.positionz);
                // this._controls.center.set(to.targetx,to.targety,to.targetz);
            })
            .start();
    }

    // Center on an Object
    centerOn(selectedObject, zoom = 200) {

    }
}

const c = new CameraController();
export default c;
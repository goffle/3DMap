import OrbitControls from "./orbitControls"

//https://threejs.org/examples/canvas_interactive_cubes.html

class CameraController {
    constructor() {
        this.camera = null;
        this.controls = null;
    }

    init(camera, renderer) {
        this.camera = camera;
        this.camera.position.set(0, 300, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();
        this.controls = new THREE.OrbitControls(this.camera, renderer.domElement);
    }

    flyToLatLon(LatLon, zoom = 200) {

    }

    flyToPoint(point, zoom = 200) {
        const animationDuration = 600;
        let from = {
            positionx: this.camera.position.x,
            positiony: this.camera.position.y,
            positionz: this.camera.position.z,
            targetx: this.controls.target.x,
            targety: this.controls.target.y,
            targetz: this.controls.target.z
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
                this.camera.lookAt(from.targetx, from.targety, from.targetz);
                this.camera.position.set(from.positionx, from.positiony, from.positionz);
                this.controls.target.set(from.targetx, from.targety, from.targetz);

                this.camera.updateProjectionMatrix();
                this.controls.update();
            })
            .onComplete(() => {
                // this.camera.lookAt(to.positionx,to.positiony,to.positionz);
                // this.controls.center.set(to.targetx,to.targety,to.targetz);
            })
            .start();
    }

    // Center on an Object
    centerOn(selectedObject, zoom = 200) {

    }
}

const c = new CameraController();
export default c;
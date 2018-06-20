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
        this.camera.lookAt(new window.THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();
        this.controls = new window.THREE.OrbitControls(this.camera, renderer.domElement);
    }

    flyToLatLon(LatLon, degree = 45, zoom = 200) {

    }

    flyToPoint(point, degree = 45, dist = 500, cb) {

        const a = dist * Math.sin(degree * Math.PI / 180);
        const o = dist * Math.cos(degree * Math.PI / 180);


        const animationDuration = 1000;
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
            positiony: point.y + a,
            positionz: point.z + o,
            targetx: point.x,
            targety: point.y,
            targetz: point.z
        };

        new window.TWEEN.Tween(from).to(to, animationDuration)
            .easing(window.TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.camera.lookAt(from.targetx, from.targety, from.targetz);
                this.camera.position.set(from.positionx, from.positiony, from.positionz);
                this.controls.target.set(from.targetx, from.targety, from.targetz);

                this.camera.updateProjectionMatrix();
                this.controls.update();
            })
            .onComplete(() => {
                this.camera.lookAt(to.targetx, to.targety, to.targetz);
                this.camera.position.set(to.positionx, to.positiony, to.positionz);
                this.controls.target.set(to.targetx, to.targety, to.targetz);
                cb();
            })
            .start();
    }
}

const c = new CameraController();
export default c;
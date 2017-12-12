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
            positiony: point.y + 100,
            positionz: point.z + zoom,
            targetx: point.x,
            targety: point.y,
            targetz: point.z
        };

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

}



/*
			function render() {

				theta += 0.1;

				camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
				camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
				camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}*/

const c = new CameraController();
export default c;
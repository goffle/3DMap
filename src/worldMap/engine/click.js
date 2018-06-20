class Click {
    constructor() {
        this.renderer = null;
        this.tilesController = null;
        this.cb = null;
        this.mouse = new window.THREE.Vector2();

        document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
        document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
    }

    init(renderer, tilesController, cb) {
        this.renderer = renderer;
        this.tilesController = tilesController;
        this.cb = cb;
    }

    onDocumentMouseDown(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }

    onDocumentMouseUp(event) {
        const val = 10;

        if (event.which !== 1)
            return;

        if ((Math.abs(event.x - this.mouse.x) > val) || (Math.abs(event.y - this.mouse.y) > val)) {
            //drag
            return;
        }

        const position = new window.THREE.Vector2();
        position.x = (event.clientX / this.renderer.getSize().width) * 2 - 1;
        position.y = - (event.clientY / this.renderer.getSize().height) * 2 + 1;


        // if (this.cb) {
        //     this.cb()
        // }

        let obj = this.tilesController._tiles[0].getObject(position);
        console.log('OBJ',obj)
        if (!obj) {
            console.log('OBJ',obj)
            // obj = this.getObject(position);
        }

        if (obj) {
            const polygonMaterial = new window.THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, emissive: 0xD4DADC, side: window.THREE.BackSide });
            obj.object.material = polygonMaterial;
            // cameraController.flyToPoint(obj.point, 90, 200, () => {
            //     this.props.onSelectedBuilding(obj.object.id);
            // });
        }
    }
}

const c = new Click();
export default c;
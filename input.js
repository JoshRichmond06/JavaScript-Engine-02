import {Vec} from './vector.js';

export class Input {
    constructor(canv, win, dt, onShapeRelease) {
        this.canv = canv; // Canvas element
        this.window = win; // Window object
        this.dt = dt; // Delta time for velocity calculation
        this.onShapeRelease = onShapeRelease; // Callback when a shape is released

        // Initializing input states with extended functionality
        this.inputs = {
            mouse: {position: new Vec(0, 0), velocity: new Vec(0, 0), movedObject: null}, 
            lclick: false, rclick: false, space: false, touches: 0
        };
        
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);
    }

    addListeners() {
        this.canv.addEventListener("mousedown", this.mouseDown);
        this.canv.addEventListener("mouseup", this.mouseUp);
        this.canv.addEventListener('contextmenu', this.onContextMenu);
        this.canv.addEventListener('mousemove', this.mouseMove);
        this.window.addEventListener('resize', this.resizeCanvas, false);
    }

    mouseDown(e) {
        if (e.button==0) {
            this.inputs.lclick = true;
            
        } else if (e.button==2)	{
            this.inputs.rclick = true;
        }
    }

    mouseUp(e) {
        if (e.button==0) {
            this.inputs.lclick = false;
            if (this.onShapeRelease) {
                this.onShapeRelease(this.inputs.mouse.velocity);
            }
        } else if (e.button == 2) {
            this.inputs.rclick = false;
        }
        
    }
    
    onContextMenu(e) {
        e.preventDefault();
    }

    mouseMove(e) {
        let newPosition = new Vec(e.pageX - this.canv.offsetLeft, e.pageY - this.canv.offsetTop);
        let newVelocity = newPosition.clone().subtract(this.inputs.mouse.position).divide(this.dt);
        this.inputs.mouse.velocity = newVelocity;
        this.inputs.mouse.position = newPosition;
    }
    
    // Adjusts canvas size on window resize
    resizeCanvas() {
        this.canv.width = this.window.innerWidth;
        this.canv.height = this.window.innerHeight;
    }
}
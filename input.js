import {Vec} from './vector.js';

export class Input {
    constructor(canv, win, dt) {
        this.canv = canv;
        this.window = win;
        this.dt = dt;
        this.inputs = {
            mouse: {position: new Vec(0, 0), velocity: new Vec(0, 0), movedObject: null}, 
            lclick: false, rclick: false, space: false, touches: 0
        };

        // Sets up event listeners for user interactions
        this.addListeners();
    }

    // Adds event listeners to handle mouse and window events
    addListeners() {
        // Listens for mouse down events and updates button states accordingly
        this.canv.addEventListener("mousedown", (e) => this.mouseButtonChange(e, true));

        // Listens for mouse up events and updates button states accordingly
        this.canv.addEventListener("mouseup", (e) => this.mouseButtonChange(e, false));

        // Prevents the default context menu from showing on right-click over the canvas
        this.canv.addEventListener('contextmenu', (e) => e.preventDefault());

        // Updates the stored mouse position on mouse movement
        this.canv.addEventListener('mousemove', (e) => this.mouseMove(e));

        // Adjusts the canvas size on window resize, debounced to reduce frequency
        this.window.addEventListener('resize', this.debounce(this.resizeCanvas, 100));
    }

    // Handles changes in mouse button state, setting flags for left and right click
    mouseButtonChange = (e, isDown) => {
        const button = e.button === 0 ? 'lclick' : e.button === 2 ? 'rclick' : null;
        if (button) this.inputs[button] = isDown; // Sets the state based on the mouse event
    }

    // makes context menu not pop up when rclick
    onContextMenu(e) {
        e.preventDefault();
    }

     // Updates the mouse position state based on the latest mousemove event
    mouseMove(e) {
        this.window.clearTimeout(this.inputs.mouseTimer);

        const x = e.pageX - this.canv.offsetLeft;
        const y = e.pageY - this.canv.offsetTop;

        const dx = x - this.inputs.mouse.position.x;
        const dy = y - this.inputs.mouse.position.y;
        this.inputs.mouse.velocity.x = dx / this.dt;
        this.inputs.mouse.velocity.y = dy / this.dt;

        this.inputs.mouse.position.x = x;
        this.inputs.mouse.position.y = y;
        
        this.inputs.mouseTimer = this.window.setTimeout(function () {
            this.inputs.mouse.velocity.x = 0; 
            this.inputs.mouse.velocity.y = 0;
        }.bind(this), 100);
    }

    // Adjusts canvas size to match the window size, improving responsiveness
    resizeCanvas = () => {
        this.canv.width = this.window.innerWidth;
        this.canv.height = this.window.innerHeight;
    }
    
    // Utility function to debounce another function by a given delay
    // This is useful for limiting how often a particularly expensive operation is run
    debounce = (func, delay) => {
        let inDebounce;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce); // Clears the timeout on every call within the delay period
            inDebounce = setTimeout(() => func.apply(context, args), delay); // Sets a new timeout
        }
    }
}
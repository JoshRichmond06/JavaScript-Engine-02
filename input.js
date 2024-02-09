import { Vec } from './vector.js';


export class Input {
    // Constructor to initialize the Input class with a canvas and window reference
    constructor(canv, win) {
        this.canv = canv; // The canvas element where drawing occurs
        this.window = win; // The window object for handling resize events

        this.prevMousePosition = new Vec(0, 0);
        this.lastUpdateTime = Date.now();

        // Initializes input states including mouse position and click states
        this.inputs = { mouse: { position: new Vec(0, 0) }, lclick: false, rclick: false };

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

    // Updates the mouse position state based on the latest mousemove event
    mouseMove = (e) => {
        // Calculates mouse position relative to the canvas
        const currentTime = Date.now();
        const dt = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        const rect = this.canv.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;
        const dx = newX - this.prevMousePosition.x;
        const dy = newY - this.prevMousePosition.y;
    
        // Calculate velocity
        this.inputs.mouse.velocity = new Vec(dx / dt, dy / dt);
    
        // Update positions for the next calculation
        this.inputs.mouse.position.x = newX;
        this.inputs.mouse.position.y = newY;
        this.prevMousePosition = new Vec(newX, newY);
        this.lastUpdateTime = currentTime;
    };

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
import { Circle } from "./circle.js";
import { Rectangle } from "./rectangle.js";

export class Renderer {
    constructor(canv, ctx) {
        this.canvas = canv;
        this.ctx = ctx;
        this.adjustCanvasForDPI();
    }
    // method makes outline and image equal and clear
    adjustCanvasForDPI() {
        const dpr = window.devicePixelRatio || 1; //sees if more than one pixel per pixel, if not default to 1
        const rect = this.canvas.getBoundingClientRect(); //gets size of canvas on page
        this.canvas.width = rect.width * dpr; // make canvas bigger if screen has higher resolution
        this.canvas.height = rect.height * dpr; //make canvas bigger if screen has higher resolution
        this.ctx.scale(dpr, dpr); //makes canvas size the one you set
        this.ctx.imageSmoothingEnabled = false; //turns off image smoothing so image isnt blury
    }

    // Validates and draws a shape
    drawShape(shape) {
        if (typeof shape.draw === 'function') {
            shape.draw(this.ctx);
        } else {
            console.error('Provided object does not have a draw method:', shape);
        }
    }

    // Iterates through and draws each object in the provided array
    drawFrame(objects) {
        objects.forEach(object => this.drawShape(object));
    }

    // Clears the canvas to prepare for the next frame or redraw
    clearFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
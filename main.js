// Import statements for shapes and utility classes
import { Circle } from './circle.js';
import { Rectangle } from './rectangle.js';
import { Triangle } from './triangle.js'; // Assume this exists
import { Vec } from './vector.js';
import { Style } from './style.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';

// Shape factory object
const shapeFactory = {
    circle: (startPos) => new Circle(new Vec(100, 100), 50, new Style('cyan', 'grey', 3)),
    rectangle: (startPos) => new Rectangle(startPos, 100, 50, new Style('cyan', 'grey', 3)),
    triangle: (startPos) => {
        const vertex2 = new Vec(startPos.x + 50, startPos.y);
        const vertex3 = new Vec(startPos.x, startPos.y + 50);
        return new Triangle(startPos, vertex2, vertex3, new Style('cyan', 'grey', 3));
    }
};

class DrawingApp {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.input = new Input(this.canvas, window);
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.currentShapeType = 'circle';
        this.objects = [];
        this.shapeBeingMade = null;

        this.setupEventListeners();
        this.input.addListeners();
        requestAnimationFrame(() => this.updateAndDraw());
    }

    setupEventListeners() {
        document.getElementById('shapeToggle').addEventListener('click', () => this.toggleShape());
        window.addEventListener('resize', () => this.input.resizeCanvas());
    }

    toggleShape() {
        const shapeTypes = Object.keys(shapeFactory);
        let currentShapeIndex = shapeTypes.indexOf(this.currentShapeType);
        currentShapeIndex = (currentShapeIndex + 1) % shapeTypes.length;
        this.currentShapeType = shapeTypes[currentShapeIndex];
    }

    createShape(startPos) {
        return shapeFactory[this.currentShapeType](startPos);
    }

    handleInput() {
        if (this.input.inputs.lclick && !this.shapeBeingMade) {
            const startPos = this.input.inputs.mouse.position.clone();
            this.shapeBeingMade = this.createShape(startPos);
        } else if (this.input.inputs.lclick && this.shapeBeingMade) {
            this.shapeBeingMade.resize(this.input.inputs.mouse.position);
        } else if (!this.input.inputs.lclick && this.shapeBeingMade) {
            this.objects.push(this.shapeBeingMade);
            this.shapeBeingMade = null;
        }
    }

    draw() {
        this.renderer.clearFrame();
        this.objects.forEach(obj => obj.draw(this.ctx));
        if (this.shapeBeingMade) this.shapeBeingMade.draw(this.ctx);
    }

    updateAndDraw() {
        this.handleInput();
        this.draw();
        requestAnimationFrame(() => this.updateAndDraw());
    }
}

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => new DrawingApp());
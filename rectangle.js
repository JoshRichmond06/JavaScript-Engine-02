import { Shape } from './shape.js';
import { Style } from './style.js';
import { RigidBody } from './rigidBody.js';

export class Rectangle extends Shape {
    constructor(position, width = 0, height = 0, style = new Style()) {
        super(position, style);
        this.width = width;
        this.height = height;
        // Initialize RigidBody with position. Ensure RigidBody's constructor supports this.
        this.rigidBody = new RigidBody(this.position);
    }

    draw(ctx) {
        ctx.beginPath(); // Begin a new path for the rectangle
        ctx.rect(this.position.x, this.position.y, this.width, this.height); // Define the rectangle path
        // Set the fill color, defaulting to black if undefined
        ctx.fillStyle = this.style?.fillColor ?? 'black';
        ctx.fill(); // Fill the rectangle with the fill color
        // Set the stroke color, defaulting to black if undefined
        ctx.strokeStyle = this.style?.borderColor ?? 'black';
        // Set the line width, defaulting to 1 if undefined
        ctx.lineWidth = this.style?.lineWidth ?? 1;
        ctx.stroke(); // Stroke the rectangle border
    }

    resize(mousePos) {
        // Calculate new width and height based on the difference between the current position and mouse position
        const tempWidth = mousePos.x - this.position.x;
        const tempHeight = mousePos.y - this.position.y;

        // Update the rectangle's width and height to the absolute values to ensure they're positive
        this.width = Math.abs(tempWidth);
        this.height = Math.abs(tempHeight);

        this.rigidBody.position = this.position.clone();
    }

    update(dt) {
        // Assuming dt is the delta time since the last update
        // Update position based on velocity
        if (this.rigidBody.velocity) {
            this.position.add(this.rigidBody.velocity.multiply(dt));
        }
    }
}
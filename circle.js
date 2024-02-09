import { RigidBody } from './rigidBody.js'; // Ensure this import statement is correct
import { Shape } from './shape.js';
import { Style } from './style.js';

export class Circle extends Shape {
    constructor(position, radius = 0, style = new Style()) {
        super(position, style);
        this.radius = radius;

        // Initialize a RigidBody with the circle's position.
        // The RigidBody class must be defined to include properties like velocity.
        this.rigidBody = new RigidBody(this.position);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.style?.fillColor ?? 'black';
        ctx.fill();
        ctx.strokeStyle = this.style?.borderColor ?? 'black';
        ctx.lineWidth = this.style?.lineWidth ?? 1;
        ctx.stroke();
    }

    resize(mousePos) {
        this.radius = this.position.distance(mousePos);
    }

    // New method to update the circle's position based on its rigid body's velocity
    update(dt) {
        // Assuming 'dt' is the time delta between updates
        // Update the position based on velocity
        if (this.rigidBody.velocity) {
            // Update the position of the rigidBody
            this.rigidBody.position.add(this.rigidBody.velocity.multiply(dt));
            
            // Sync the circle's position with its rigidBody's position
            this.position = this.rigidBody.position.clone();
        }
    }
}
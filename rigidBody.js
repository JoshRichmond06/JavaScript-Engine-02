import { Vec } from './vector.js';
import { Shape } from './Shape.js'; // Assuming Shape is a base class or interface

export class RigidBody {
    constructor(shape) {
        this.shape = shape; // The shape this RigidBody controls
        this.velocity = new Vec(0, 0); // Initial velocity
    }

    update(dt) {
        this.shape.position.add(this.velocity.multiply(dt)); // Update position based on velocity
    }

    draw(ctx) {
        this.shape.draw(ctx); // Delegate drawing to the shape
    }
}
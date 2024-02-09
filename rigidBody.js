import { Vec } from "./vector.js";

export class RigidBody {
    constructor(position = new Vec(0, 0), shape = null) {
        this.position = position; // The current position of the RigidBody
        this.velocity = new Vec(0, 0); // Initialize velocity to ensure it's always defined
        this.shape = shape; // The shape associated with this RigidBody, if any
    }

    // Moves the RigidBody to a new position
    moveTo(newPosition) {
        this.position = newPosition.clone();
        // If this RigidBody is associated with a shape, update the shape's position as well
        if (this.shape) {
            this.shape.position = this.position.clone();
        }
    }

    // Updates the shape's position based on the RigidBody's velocity
    update(time) {
        // Calculate the displacement (ds) as velocity * time
        const ds = this.velocity.clone().multiply(time);
        this.position.add(ds);
        
        // If this RigidBody is associated with a shape, update the shape's position to match
        if (this.shape) {
            this.shape.position.add(ds);
        }
    }
}
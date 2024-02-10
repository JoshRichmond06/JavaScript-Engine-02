// Shape.js
import { Vec } from "./vector.js";
import { RigidBody } from "./rigidBody.js";

export class Shape {
    constructor(position, style) {
        this.position = position;
        this.style = style;
        this.rigidBody = new RigidBody(this);
        this.isMoved = false;
    }

    updatePosition(time) {
        if (this.isMoved) {
            const ds = this.rigidBody.velocity.clone().multiply(time);
            this.position.add(ds);
        }
    }

    draw(ctx) {
        throw new Error('Subclasses must implement their own draw method.');
    }

    moveTo(newPosition) {
        this.position = newPosition;
    }

    update(dt) {
        this.updatePosition(dt);
    }

    collidesWith(otherShape) {
        // To be implemented in subclasses
    }
}

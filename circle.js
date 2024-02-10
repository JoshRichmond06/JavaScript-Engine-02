import { Shape } from './Shape.js';
import { Style } from './Style.js';
import { RigidBody } from './rigidBody.js';
import { Rectangle } from './rectangle.js';
import { Vec } from './vector.js';
import { circleRectCollision, resolveCollision } from './collisionUtils.js';

export class Circle extends Shape {
    constructor(position, radius, style = new Style()) {
        super(position, style);
        this.radius = radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
    }

    resize(mousePos) {
        const distance = this.position.distanceTo(mousePos);
        this.radius = distance;
    }

    collidesWith(otherShape) {
        if (otherShape instanceof Circle) {
            // Circle-Circle collision
            const distance = this.position.distanceTo(otherShape.position);
            return distance < (this.radius + otherShape.radius);
        } else if (otherShape instanceof Rectangle) {
            // Circle-Rectangle collision
            return circleRectCollision(this, otherShape);
        }
        return false;
    }
}

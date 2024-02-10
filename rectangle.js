import { Shape } from './Shape.js';
import { Style } from './Style.js';
import { Vec } from './vector.js'; // Make sure to import the Vec class
import { circleRectCollision } from './collisionUtils.js'; // Import the circleRectCollision function
import { RigidBody } from './rigidBody.js';
import { Circle } from './circle.js';


export class Rectangle extends Shape {
    constructor(position, width, height, style = new Style()) {
        super(position, style);
        this.width = width;
        this.height = height;
        this.rigidBody = new RigidBody(this); // Use RigidBody instance directly
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
    }

    resize(mousePos) {
        const tempWidth = mousePos.x - this.position.x;
        const tempHeight = mousePos.y - this.position.y;
        this.width = Math.abs(tempWidth);
        this.height = Math.abs(tempHeight);
    }

    collidesWith(otherShape) {
        if (otherShape instanceof Circle) {
            // Use the circleRectCollision function for Circle-Rectangle collision
            return circleRectCollision(otherShape, this);
        } else if (otherShape instanceof Rectangle) {
            // Rectangle-Rectangle collision logic
            return !(this.position.x + this.width < otherShape.position.x ||
                     this.position.x > otherShape.position.x + otherShape.width ||
                     this.position.y + this.height < otherShape.position.y ||
                     this.position.y > otherShape.position.y + otherShape.height);
        }
        return false;
    }
}
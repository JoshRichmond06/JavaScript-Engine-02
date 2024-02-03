import { Shape } from './shape.js';
import { Vec } from './vector.js';
import { Style } from './style.js';

export class Circle extends Shape {
    
    constructor(startPos, radius, style) {
        super(startPos);
        this.radius = radius;
        this.style = style;
    }

    draw(ctx) {
        ctx.beginPath();
        // Use this.startPos.x and this.startPos.y for the rectangle's position
        ctx.rect(this.startPos.x, this.startPos.y, this.width, this.height);
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
    }

    resize(mousePos) {
        this.radius = this.startPos.distance(mousePos);
    }
}

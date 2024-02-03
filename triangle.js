import { Shape } from './shape.js';
import { Style } from './style.js';

export class Triangle extends Shape {
    constructor(startPos, vertex2, vertex3, style = new Style()) {
        super(startPos);
        this.vertex2 = vertex2;
        this.vertex3 = vertex3;
        this.style = style;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y);
        ctx.lineTo(this.vertex2.x, this.vertex2.y);
        ctx.lineTo(this.vertex3.x, this.vertex3.y);
        ctx.closePath();
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
    }

    resize(mousePos) {
        // Example resize logic for Triangle
        // This could adjust vertex2 and vertex3 based on mousePos
    }
}

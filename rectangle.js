import { Shape } from './shape.js';


export class Rectangle extends Shape {

    constructor(startPos, width, height, style) {
        super(startPos);
        this.width = width;
        this.height = height;
        this.style = style;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.drawStartX, this.drawStartY, this.width, this.height);
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
    }

    resize(mousePos) {
        // Directly update dimensions based on mouse position
        this.width = Math.abs(mousePos.x - this.startPos.x);
        this.height = Math.abs(mousePos.y - this.startPos.y);

        // Adjust startPos for negative dimensions if necessary
        if (mousePos.x < this.startPos.x) {
            this.startPos.x = mousePos.x;
        }
        if (mousePos.y < this.startPos.y) {
            this.startPos.y = mousePos.y;
        }
    }
}
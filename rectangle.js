import { Shape } from './shape.js';

/**
 * Represents a rectangle shape.
 * @extends Shape
 */
export class Rectangle extends Shape {
    /**
     * Create a Rectangle.
     * @param {Vec} startPos - The starting position of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @param {Style} style - The styling for the rectangle.
     */
    constructor(startPos, width, height, style) {
        super(startPos);
        this.width = width;
        this.height = height;
        this.style = style;
    }

    /**
     * Draw the rectangle on a canvas context.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.drawStartX, this.drawStartY, this.width, this.height);
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
    }

    /**
     * Resize the rectangle based on a new position.
     * @param {Vec} mousePos - The new position to calculate the width and height from.
     */
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
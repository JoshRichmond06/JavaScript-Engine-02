import { Shape } from './shape.js';
import { Vec } from './vector.js';
import { Style } from './style.js';

/**
 * Represents a circle shape.
 * @extends Shape
 */
export class Circle extends Shape {
    /**
     * Create a Circle.
     * @param {Vec} startPos - The starting position of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {Style} style - The styling for the circle.
     */
    constructor(startPos, radius, style) {
        super(startPos);
        this.radius = radius;
        this.style = style;
    }

    /**
     * Draw the circle on a canvas context.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        ctx.beginPath();
<<<<<<< Updated upstream
        ctx.arc(this.drawStartX, this.drawStartY, this.radius, 0, Math.PI * 2);
=======
        ctx.arc(this.startPos.x, this.startPos.y, this.radius, 0, Math.PI * 2);
>>>>>>> Stashed changes
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
    }

    /**
     * Resize the circle based on a new position.
     * @param {Vec} mousePos - The new position to calculate the radius from.
     */
    resize(mousePos) {
        this.radius = this.startPos.distance(mousePos);
    }
}

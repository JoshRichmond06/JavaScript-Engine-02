import { Aabb } from './aabb.js';
import { Shape } from './shape.js';
import { Style } from './style.js';
import { Vec } from './vector.js';

export class Circle extends Shape {
    constructor(position, radius = 0, style = new Style()) {
        super(position, style); // Correctly pass position and style to the Shape constructor
        this.radius = radius; // Initialize radius

        this.aabb = new Aabb(new Vec(0, 0), new Vec(0, 0));
        this.orientation = 0;
    }

    updateAabb() {
        this.aabb.min.setX(this.position.x - this.radius).setY(this.position.y - this.radius);
        this.aabb.max.setX(this.position.x + this.radius).setY(this.position.y + this.radius);
    }

    calculateMass(density) {
        const area = Math.PI * this.radius * this.radius;
        return area * density;
    }

    calculateInertia(mass) {
        const inertia = 0.5 * mass * this.radius * this.radius;      //formula I = (1/2) * mass * r^2
        return inertia;
    }
    draw(ctx) {
        ctx.beginPath(); // Start a new path for the circle
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Draw the circle
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();

        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(
            this.position.x + this.radius * Math.cos(this.orientation),
            this.position.y + this.radius * Math.sin(this.orientation),
        );
        ctx.stroke();
    }
}
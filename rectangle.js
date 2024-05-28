import { Aabb } from './aabb.js';
import { Shape } from './shape.js';
import { Style } from './style.js';
import { Vec } from './vector.js';

export class Rectangle extends Shape {
    constructor(position, width, height, style = new Style()) {
        if (!position) {
            console.error("Invalid or missing position during Rectangle creation");
            throw new Error("Position must be defined");
        }
        super(position, style);

        this.width = width;
        this.height = height;
        this.orientation = 0;

        this.vertices = [
            new Vec(0, 0), 
            new Vec(0, 0), 
            new Vec(0, 0), 
            new Vec(0, 0)
        ];
        this.aabb = new Aabb(new Vec(0, 0), new Vec(0, 0));
        this.updateVertices(); // Initialize vertices based on the provided width and height
        this.updateAabb();     // Initialize AABB based on the vertices
    }

    updateVertices() {
        this.vertices[0].setX(-this.width / 2).setY(-this.height / 2).rotate(this.orientation).add(this.position);
        this.vertices[1].setX(this.width / 2).setY(-this.height / 2).rotate(this.orientation).add(this.position);
        this.vertices[2].setX(this.width / 2).setY(this.height / 2).rotate(this.orientation).add(this.position);
        this.vertices[3].setX(-this.width / 2).setY(this.height / 2).rotate(this.orientation).add(this.position);
    }

    updateAabb() {
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;

        for (let vertex of this.vertices) {
            minX = Math.min(minX, vertex.x);
            maxX = Math.max(maxX, vertex.x);
            minY = Math.min(minY, vertex.y);
            maxY = Math.max(maxY, vertex.y);
        }

        this.aabb.min.x = minX;
        this.aabb.min.y = minY;
        this.aabb.max.x = maxX;
        this.aabb.max.y = maxY;
    }

    calculateMass(density) {
        const area = this.width * this.height;
        return area * density;
    }

    calculateInertia(mass) {
        const inertia = (1/12) * mass * (this.width * this.width + this.height * this.height); // I = 1/12 * m * (w^2 + h^2)
        return inertia;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.orientation);
        ctx.beginPath();
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.fillStyle = this.style.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.stroke();
        ctx.restore();
    }

}
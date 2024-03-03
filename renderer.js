import {Circle} from './circle.js';
import {Rect} from './rect.js';

export class Renderer {
    constructor(canv, ctx) {
        this.canvas = canv;
        this.ctx = ctx;
    }
    
    drawFrame(objects, fillCol, bordCol) {
        for (let i = 0; i<objects.length; i++) {
            const shape = objects[i].shape;
            shape.draw(this.ctx, fillCol, bordCol);
            shape.aabb.draw(this.ctx, "red");
            //draw vertices
            if (shape instanceof Rect) {
                shape.vertices.forEach(vertex => {
                    vertex.drawPoint(this.ctx, "black");
                });
            }
        } 
    }

    clearFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    
}
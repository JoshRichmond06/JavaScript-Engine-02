import { Circle } from './circle.js';
import { Rect } from './rect.js';

export class Renderer {
    constructor(canv, ctx) {
        this.canvas = canv;
        this.ctx = ctx;
        this.renderedAlways = [];   //always rendered
        this.renderedNextFrame = [];    //objects that are rendered for only one frame
    }

    drawFrame(objects, fillCol, strokeColor) {
        for (let i = 0; i < objects.length; i++) {
            const shape = objects[i].shape;
            shape.draw(this.ctx, fillCol, strokeColor);
            shape.aabb.draw(this.ctx, "red");
            //draw vertices
            if (shape instanceof Rect) {
                shape.vertices.forEach(vertex => {
                    vertex.drawPoint(this.ctx, "black");
                });
            }

        }
        for (let i = 0; i < this.renderedNextFrame.length; i++) {
            this.renderedNextFrame[i].draw(this.ctx, strokeColor);  //draw all objects in array
        }
        this.renderedNextFrame = [];    //empty array, means that we only draw them once, then clear

        for (let i = 0; i < this.renderedAlways.length; i++) {
            this.renderedAlways[i].draw();  //draw all objects in array, does not clear array like next frame does
        }
    }
    clearFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


}
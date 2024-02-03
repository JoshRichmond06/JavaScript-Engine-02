export class Shape {

    constructor(startPos) {
        this.startPos = startPos;
    }
    
    draw(ctx) {
        throw new Error("Draw method must be implemented by subclass");
    }

    resize(mousePos) {
        throw new Error("Resize method must be implemented by subclass");
    }
}
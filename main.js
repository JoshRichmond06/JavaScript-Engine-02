import { Input } from './input.js';
import { Circle } from './circle.js';
import { Rectangle } from './rectangle.js';
import { Renderer } from './renderer.js';
import { Style } from './style.js';
import { Vec } from './vector.js';

let currentShapeType = 'circle'; // Dynamically change this to add more shapes
const LOWEST_DISTANCE_MOVING_OBJ = 30;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('shapeToggle').addEventListener('click', toggleShape);
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const renderer = new Renderer(canvas, ctx);
const input = new Input(canvas, window);
input.addListeners();

let objects = [];
let shapeBeingMade = null;
let movingShape = false;

function toggleShape() {
    currentShapeType = currentShapeType === 'circle' ? 'rectangle' : 'circle';
    document.getElementById('shapeToggle').textContent = currentShapeType.charAt(0).toUpperCase() + currentShapeType.slice(1);
}

class ShapeFactory {
    static createShape(type, position, style) {
        switch (type) {
            case 'circle':
                return new Circle(position, 0, style);
            case 'rectangle':
                return new Rectangle(position, 0, 0, style);
            // Add new cases here for additional shapes
            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
    }
}

function createShape(mousePosition) {
    const position = new Vec(mousePosition.x, mousePosition.y);
    const defaultStyle = new Style('cyan', 'grey', 3);
    return ShapeFactory.createShape(currentShapeType, position, defaultStyle);
}

function updateAndDraw() {
    if (input.inputs.lclick && !shapeBeingMade) {
        const startPos = input.inputs.mouse.position.clone();
        shapeBeingMade = createShape(startPos);
    } else if (input.inputs.lclick && shapeBeingMade) {
        if (input.inputs.mouse.position) {
            shapeBeingMade.resize(input.inputs.mouse.position);
        } else {
            console.error('Mouse position is undefined');
        }
    } else if (!input.inputs.lclick && shapeBeingMade) {
        objects.push(shapeBeingMade);
        shapeBeingMade = null;
    }

    if (input.inputs.rclick && !movingShape) {
        let closestObji = null;
        let currentLowestDist = LOWEST_DISTANCE_MOVING_OBJ;
        objects.forEach((obj, i) => {
            let isInsideShape = false;

            if (obj instanceof Circle) {
                const distance = obj.position.distance(input.inputs.mouse.position);
                isInsideShape = distance <= obj.radius;
            } else if (obj instanceof Rectangle) {
                const left = obj.position.x;
                const right = obj.position.x + obj.width;
                const top = obj.position.y;
                const bottom = obj.position.y + obj.height;
                const clickX = input.inputs.mouse.position.x;
                const clickY = input.inputs.mouse.position.y;

                // Correct use of logical AND (&&) for accurate hit detection
                isInsideShape = clickX >= left && clickX <= right && clickY >= top && clickY <= bottom;
            }


            if (isInsideShape && currentLowestDist > 0) { // Ensures we pick the first shape under cursor
                closestObji = i;
                currentLowestDist = 0; // Update based on your needs
            }
        });

        if (currentMovingShape && input.inputs.rclick) {
            currentMovingShape.moveTo(input.inputs.mouse.position);
            currentMovingShape.velocity = input.inputs.mouse.velocity;
        }

        if (closestObji !== null) {
            movingShape = true;
            objects[closestObji].isMoved = true;
        }
    }

    if (!input.inputs.rclick && movingShape) {
        movingShape = false;
        objects.forEach(obj => obj.isMoved = false);
        movingShape = null;
    }

    shapes.forEach(shape => {
        if (shape.velocity) {
            shape.position.add(shape.velocity.clone().multiply(dt)); // dt is the delta time since last frame
        }
    });
    
    if (movingShape) {
        objects.forEach(obj => {
            if (obj.isMoved) {
                obj.position = new Vec(input.inputs.mouse.position.x, input.inputs.mouse.position.y);
            }
            
        });
    }

    renderer.clearFrame();
    objects.forEach(obj => obj.draw(ctx));
    if (shapeBeingMade) shapeBeingMade.draw(ctx);

    requestAnimationFrame(updateAndDraw);
}

input.resizeCanvas();
requestAnimationFrame(updateAndDraw);

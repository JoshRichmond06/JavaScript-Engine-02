import { Input } from './input.js';
import { Circle } from './circle.js';
import { Rectangle } from './rectangle.js';
import { Renderer } from './renderer.js';
import { Style } from './Style.js';
import { Vec } from './vector.js';
import { RigidBody } from './rigidBody.js';
import { resolveCollision, circleRectCollision } from './collisionUtils.js';




document.addEventListener('DOMContentLoaded', () => {

    inp.addListeners(); // Corrected to use 'inp' as defined.
    requestAnimationFrame(updateAndDraw);
});


// Global definitions are correctly placed outside of event listeners
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const renderer = new Renderer(canvas, ctx);
const dt = 1 / 60; // Time per frame, correctly placed here for clarity
const inp = new Input(canvas, window, dt); // Adjusted to use 'inp' consistently
let objects = [];
let currentShapeType = 'circle';
let shapeBeingMade = null;
let movingShape = null;
const LOWEST_DISTANCE_MOVING_OBJ = 30;
const SMALLEST_RADIUS = 10;

document.getElementById('addCircleButton').addEventListener('click', () => {
    const position = new Vec(100, 100); // Example position
    const style = new Style('red', 'black', 2); // Example style
    const newCircle = ShapeFactory.createShape('circle', position, style);
    const circleRigidBody = new RigidBody(newCircle);
    objects.push(circleRigidBody);
    // Redraw scene or update game state as needed
});

document.getElementById('addRectangleButton').addEventListener('click', () => {
    const position = new Vec(150, 150); // Example position
    const style = new Style('blue', 'orange', 3); // Example style
    const newRectangle = ShapeFactory.createShape('rectangle', position, style);
    const rectangleRigidBody = new RigidBody(newRectangle);
    objects.push(rectangleRigidBody);
    // Redraw scene or update game state as needed
});

// ShapeFactory definition appears correct and concise
class ShapeFactory {
    static createShape(type, position, style = new Style('cyan', 'grey', 3)) {
        switch (type) {
            case 'circle':
                return new Circle(position, SMALLEST_RADIUS, style);
            case 'rectangle':
                return new Rectangle(position, SMALLEST_RADIUS * 2, SMALLEST_RADIUS, style);
            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
    }
}


function createShape(mousePosition) {
    const position = new Vec(mousePosition.x, mousePosition.y);
    // Assume defaultStyle is defined or passed as a parameter
    const defaultStyle = new Style('cyan', 'grey', 3);
    // Use ShapeFactory to create the shape based on the currentShapeType
    return ShapeFactory.createShape(currentShapeType, position, defaultStyle);
}


function updateAndDraw() {

    renderer.clearFrame();
    
    if (inp.inputs.lclick && !shapeBeingMade) {
        // Assuming mouse.position is a Vec instance
        const startPos = inp.inputs.mouse.position.clone();
        shapeBeingMade = createShape(startPos);
    } else if (inp.inputs.lclick && shapeBeingMade) {
        // Resizing logic, as already implemented
        shapeBeingMade.resize(inp.inputs.mouse.position);
    } else if (inp.inputs.lclick && shapeBeingMade && shapeBeingMade instanceof Circle) {
        const currentPos = inp.inputs.mouse.position.clone();
        shapeBeingMade.radius = shapeBeingMade.position.distanceTo(currentPos);
    } else if (inp.inputs.lclick && shapeBeingMade && shapeBeingMade instanceof Rectangle) {
        const currentPos = inp.inputs.mouse.position.clone();
        shapeBeingMade.width = Math.abs(currentPos.x - shapeBeingMade.position.x);
        shapeBeingMade.height = Math.abs(currentPos.y - shapeBeingMade.position.y);
    }
    


    // Move finalized shapes into RigidBody instances
    if (!inp.inputs.lclick && shapeBeingMade) {
        objects.push(new RigidBody(shapeBeingMade)); // Corrected to match RigidBody's expected constructor
        shapeBeingMade = null;
    }

    if (!inp.inputs.lclick && shapeBeingMade) {
        const newRigidBody = new RigidBody(shapeBeingMade); // Assuming RigidBody accepts a shape
        objects.push(newRigidBody);
        shapeBeingMade = null;
    }

    // Update object positions and handle collisions
    objects.forEach(obj => {
        obj.update(dt);
    });

    updatePhysicsAndCollisions(dt);

    // Clear the canvas and draw each object
    renderer.clearFrame();
    objects.forEach(obj => {
        obj.draw(ctx); // Assumes RigidBody's draw method delegates to shape's draw
    });

    requestAnimationFrame(updateAndDraw);
}




function updatePhysicsAndCollisions(dt) {
    objects.forEach((obj1, index) => {
        // Assuming 'objects' array contains RigidBody instances or similar
        for (let j = index + 1; j < objects.length; j++) {
            const obj2 = objects[j];
            if (obj1.shape.collidesWith(obj2.shape)) {
                resolveCollision(obj1, obj2);
            }
        }
    });
}


function handleObjectMovement() {
    if (!inp.inputs.lclick && inp.inputs.rclick && !inp.inputs.mouse.movedObject) {
        const closestObject = findClosestObject(objects, inp.inputs.mouse.position);
        inp.inputs.mouse.movedObject = closestObject === null ? null : closestObject;
    }

    if (!inp.inputs.rclick && movingShape) {
        movingShape.rigidBody.velocity = inp.inputs.mouse.velocity; // Apply the mouse's last known velocity
        movingShape = null; // Reset movingShape
    }

    if (!inp.inputs.rclick || inp.inputs.lclick) {
        inp.inputs.mouse.movedObject = null;
    }
    if (inp.inputs.mouse.movedObject) {
        moveObjectWithMouse(inp.inputs.mouse.movedObject);
    }
}



function findClosestObject(objects, vector) {
    let closestObject = null;
    let distance;
    const len = objects.length; // Cache the length of the array
    let lowestDistance = LOWEST_DISTANCE_MOVING_OBJ;
    for (let i = 0; i < len; i++) {
        distance = objects[i].shape.position.distanceTo(vector);
        if (distance < lowestDistance) {
            lowestDistance = distance;
            closestObject = objects[i];
        }
    }
    return closestObject;
}

function moveObjectWithMouse(object) {
    object.shape.position.copy(inp.inputs.mouse.position);
    object.velocity.copy(inp.inputs.mouse.velocity);
}

function addObject(shape) {
    const object = new RigidBody(shape);
    objects.push(object);
}
inp.resizeCanvas();
requestAnimationFrame(updateAndDraw);
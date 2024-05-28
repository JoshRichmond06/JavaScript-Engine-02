import { Renderer } from './renderer.js';
import { Circle } from './circle.js';
import { Rectangle } from './rectangle.js';
import { Input } from './input.js';
import { RigidBody } from './rigidBody.js';
import { Collisions } from './collisions.js';
import { Spring } from './Spring.js';
import { Style } from './style.js';
import { Shape } from './shape.js';
import { Vec } from './vector.js';

// Setup constants and utility functions
const SMALLEST_RADIUS = 10;
const WORLD_SIZE = 5000;
const dt = 1 / 60; // Time per frame, for consistent movement and physics calculations

// Assuming Style class is properly imported or defined
let defaultStyle1 = new Style('black', '#f32177', 4); // default style
let defaultStyle2 = new Style('black', '#2196F3', 4); // default style

const canv = document.getElementById("canvas");
const ctx = canv.getContext("2d");


export const renderer = new Renderer(canv, ctx);    //export renderer, is in collision

const inp = new Input(canv, window, dt);
inp.resizeCanvas();
inp.addListeners();
const col = new Collisions();
const objects = [];
const springs = [];
//ground object
addObject(
    new Rectangle(
        new Vec(canv.width / 2, canv.height),
        canv.width * 3,
        canv.height * 0.3,
        new Style('black', 'transparent', 0),
    ),
    true
);

let shapeBeingMade = null;
//button variables
let shapeSelected = 'r';
let gravitySelected = 2;
let collisionMode = "3";

const circleButton = document.getElementById("c");
const rectButton = document.getElementById("r");

setButtonBold(rectButton, true);    //rect button starts as bold

circleButton.onclick = function () {
    shapeSelected = 'c';
    setButtonBold(circleButton, true);
    setButtonBold(rectButton, false);
};
rectButton.onclick = function () {
    shapeSelected = 'r';
    setButtonBold(circleButton, false);
    setButtonBold(rectButton, true);
};

//select variables
const selectGravity = document.getElementById("gravity");
selectGravity.addEventListener("change", function () {
    gravitySelected = selectGravity.value;
});

const selectCollisions = document.getElementById("collisions");
selectCollisions.addEventListener("change", function () {
    collisionMode = selectCollisions.value;
});

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect();  // Get canvas size and position
        const x = event.clientX - rect.left;  // Adjust for canvas position
        const y = event.clientY - rect.top;
        const position = new Vec(x, y);
        const newRigidBody = new RigidBody(new Shape(position), false);
        console.log("New RigidBody created with position:", newRigidBody.shape.position);
    });
});

let springMode = false;
let defaultRestLength = 100;
let defaultStiffness = 3000;
let currentSpringObject = null;

const springButton = document.getElementById('toggleSpringMode');
springButton.addEventListener('click', () => {
    springMode = !springMode;
    if (!springMode) {
        currentSpringObject = null; // Reset when leaving spring mode
        setButtonBold(springButton, false);
    } else {
        setButtonBold(springButton, true);
    }
});

canv.addEventListener('mousedown', event => {
    if (springMode && event.button === 2) {  // Right-click in spring mode
        const clickedObject = findClosestObject(objects, new Vec(event.clientX, event.clientY));
        if (currentSpringObject && clickedObject && currentSpringObject !== clickedObject) {
            // Directly use default values or ensure they are defined
            const restLength = defaultRestLength || 100;  // Use 100 if defaultRestLength is undefined
            const stiffness = defaultStiffness || 5;      // Use 5 if defaultStiffness is undefined

            const newSpring = new Spring(currentSpringObject, clickedObject, restLength, stiffness);
            springs.push(newSpring);
            console.log('New spring added:', newSpring); // This should now show correctly initialized spring

            currentSpringObject = null; // Reset after attaching spring
        } else {
            currentSpringObject = clickedObject;
            console.log('Current spring object selected:', currentSpringObject); // Debug which object is selected
        }
    }
});





//MAIN LOOP
function updateAndDraw() {

    

    //make objects
    if (inp.inputs.lclick && shapeBeingMade == null) {
        //make rectangles & circles with mouse
        if (shapeSelected == 'c') {
            shapeBeingMade = new Circle(inp.inputs.mouse.position.clone(), SMALLEST_RADIUS, defaultStyle1);
        } else if (shapeSelected == 'r') {
            shapeBeingMade = new Rectangle(inp.inputs.mouse.position.clone(), SMALLEST_RADIUS * 2, SMALLEST_RADIUS * 2, defaultStyle2);
        }

    }
    //adjust radius
    if (inp.inputs.lclick && shapeBeingMade instanceof Circle) {
        const selectedRadius = shapeBeingMade.position.clone().subtract(inp.inputs.mouse.position).magnitude();
        shapeBeingMade.radius = selectedRadius < SMALLEST_RADIUS ? shapeBeingMade.radius : selectedRadius;
    }
    //adjust rectangle
    else if (inp.inputs.lclick && shapeBeingMade instanceof Rectangle) {
        const selectionVector = shapeBeingMade.position.clone().subtract(inp.inputs.mouse.position).absolute();
        shapeBeingMade.width = selectionVector.x > SMALLEST_RADIUS ? selectionVector.x * 2 : SMALLEST_RADIUS * 2;
        shapeBeingMade.height = selectionVector.y > SMALLEST_RADIUS ? selectionVector.y * 2 : SMALLEST_RADIUS * 2;
    }

    //add objects
    if (shapeBeingMade && !inp.inputs.lclick) {
        addObject(shapeBeingMade);
        shapeBeingMade = null;
    }

    //move objects with mouse
    if (!inp.inputs.lclick && inp.inputs.rclick && !inp.inputs.mouse.movedObject) {
        const closestObject = findClosestObject(objects, inp.inputs.mouse.position);
        inp.inputs.mouse.movedObject = closestObject == null ? null : closestObject;
    }
    if (!inp.inputs.rclick || inp.inputs.lclick) {
        inp.inputs.mouse.movedObject = null;
    }
    if (inp.inputs.mouse.movedObject) {
        moveObjectWithMouse(inp.inputs.mouse.movedObject);
    }

    const gravityLevels = [0, 20, 50, 500];  // Corresponding to gravity options 0-3

    // Inside your updateAndDraw:
    let g = gravityLevels[gravitySelected];  // Directly use selected gravity level

    //set object accelerations
    for (let i = 1; i < objects.length; i++) {
        objects[i].acceleration.zero(); //ZERO ACCELERATION
        objects[i].acceleration.y += g;

    }

    springs.forEach(spring => {
        console.log("Applying force", spring);
        spring.applyForce();
    });

    // Apply physics updates
    applyPhysicsUpdates();

    //remove objects that are too far
    const objectsToRemove = [];
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].checkTooFar(WORLD_SIZE)) {
            objectsToRemove.push(objects[i]);
        }
    }
    removeObjects(objectsToRemove);

    // Render objects
    renderer.clearFrame();
    renderer.drawFrame(objects);

    // Draw all springs and objects once after updates
    springs.forEach(spring => {
        spring.applyForce();  // Apply spring forces right before drawing
        spring.draw(ctx);     // Draw each spring
    });

    if (shapeBeingMade) {
        shapeBeingMade.draw(ctx); // Style is already assigned to the shape, no need for extra parameters
    }

    requestAnimationFrame(updateAndDraw);
}
requestAnimationFrame(updateAndDraw);


function applyPhysicsUpdates() {
    objects.forEach(obj => {
        obj.updateShape(dt);
        obj.shape.updateAabb();
    });

    handleCollisions();  // Move collision handling here for better flow and efficiency
}

function handleCollisions() {
    if (collisionMode !== 0) {
        col.clearCollisions();
        col.broadPhaseDetection(objects);
        col.narrowPhaseDetection(objects);
        switch (collisionMode) {
            case "1":
                col.resolveCollisionsWithPushOff();
                break;
            case "2":
                col.resolveCollisionsWithPushAndBounceOff();
                break;
            case "3":
                col.resolveCollisionsWithRotation();
                break;
        }
    }
}


function findClosestObject(objects, vector) {
    let closestObject = null;
    let minDistance = Infinity;
    objects.forEach(obj => {
        let distance = obj.shape.position.distanceTo(vector);
        if (distance < minDistance) {
            minDistance = distance;
            closestObject = obj;
        }
    });
    return closestObject;
}

function moveObjectWithMouse(object) {
    object.shape.position.copy(inp.inputs.mouse.position);
    object.velocity.copy(inp.inputs.mouse.velocity);
}

function addObject(shape, isStatic = false) {
    const object = new RigidBody(shape, isStatic);
    object.setMass();
    objects.push(object);
}

function removeObjects(objectsToRemove) {
    for (let i = 0; i < objects.length; i++) {
        for (let j = 0; j < objectsToRemove.length; j++) {
            if (objects[i] == objectsToRemove[j]) {
                objects.splice(i, 1);
            }
        }
    }
}

function setButtonBold(button, bool) {
    if (bool) {
        button.style.fontWeight = '700';
    } else {
        button.style.fontWeight = '400';
    }
}
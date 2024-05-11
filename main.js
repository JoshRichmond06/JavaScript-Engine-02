import { Renderer } from './renderer.js';
import { Circle } from './circle.js';
import { Rectangle } from './rectangle.js';
import { Input } from './input.js';
import { RigidBody } from './rigidBody.js';
import { Collisions } from './collisions.js';
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
let collisionMode = 2;

const circleButton = document.getElementById("c");
const rectButton = document.getElementById("r");

setButtonBold(rectButton, true);

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

    //set gravity
    let g = 200;
    // update g based on input
    //update g based on input
    switch (true) {
        case gravitySelected == 0: g = 0; break;
        case gravitySelected == 1: g = 20; break;
        case gravitySelected == 2: g = 200; break;
        case gravitySelected == 3: g = 2000; break;
    }

    //set pbject accelerations
    for (let i = 1; i < objects.length; i++) {
        objects[i].acceleration.zero();
        objects[i].acceleration.y += g;

    }

    // console.time('collisions');
    //improve precision
    const iterations = 20;

    for (let i = 0; i < iterations; i++) {

        for (let i = 0; i < objects.length; i++) {
            objects[i].updateShape(dt / iterations);
        }

        //COLLISIONS
        if (collisionMode != 0) {
            col.clearCollisions();
            col.broadPhazeDetection(objects);
            col.narrowPhaseDetection(objects);                  //detect all possible collisions
            if (collisionMode == 1) {
                col.resolveCollisionsWithPushOff();             //push off
            } else if (collisionMode == 2) {
                col.resolveCollisionsWithPushAndBounceOff();    //bounce off
            } else if (collisionMode == 3) {
                col.resolveCollisionsWithRotation();    //Rotate
            }
        }
    }


    //remove objects that are too far
    const objectsToRemove = [];
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].checkTooFar(WORLD_SIZE)) {
            objectsToRemove.push(objects[i]);
        }
    }
    removeObjects(objectsToRemove);

    //draw objects
    renderer.clearFrame();
    renderer.drawFrame(objects);
    //draw shape
    if (shapeBeingMade) {
        shapeBeingMade.draw(ctx); // Style is already assigned to the shape, no need for extra parameters
    }
}
let renderInterval = setInterval(updateAndDraw, 1000 / 60);

function findClosestObject(objects, vector) {
    let closestObject = null;
    let distance;
    let lowestDistance = 30;
    for (let i = 0; i < objects.length; i++) {
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
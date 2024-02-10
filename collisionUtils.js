import { Vec } from "./vector.js";
import { RigidBody } from "./rigidBody.js";
import { Circle } from "./circle.js";
import { Rectangle } from "./rectangle.js";

// Collision detection between a circle and a rectangle
export function circleRectCollision(circle, rectangle) {
    const closestX = Math.max(rectangle.position.x, Math.min(circle.position.x, rectangle.position.x + rectangle.width));
    const closestY = Math.max(rectangle.position.y, Math.min(circle.position.y, rectangle.position.y + rectangle.height));
    const distanceX = circle.position.x - closestX;
    const distanceY = circle.position.y - closestY;
    return (distanceX ** 2 + distanceY ** 2) < (circle.radius ** 2);
}

// Simple collision resolution by swapping velocities
// Assumes obj1 and obj2 are instances of RigidBody or have a `rigidBody` property
export function resolveCollision(obj1, obj2) {
    if (obj1.rigidBody && obj2.rigidBody) {
        // Swap velocities
        const tempVelocity = obj1.rigidBody.velocity.clone();
        obj1.rigidBody.velocity = obj2.rigidBody.velocity.clone();
        obj2.rigidBody.velocity = tempVelocity;
    } else {
        console.error("Attempted to resolve collision on objects without rigidBody or velocity properties.");
    }
}
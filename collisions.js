import { Circle } from "./circle.js";
import {Rect} from './rect.js';

export class Collisions {
    constructor() {
        this.possibleCollisions = [];
        this.collisions = [];
    }

    clearCollisions() {
        this.possibleCollisions = [];
        this.collisions = []; //reset it (assigns it to empty array)
    }

    broadPhazeDetection (objects) {
        for (let i = 0; i < objects.length; i++) {
            for (let j = i +1; j < objects.length; j++) {
                this.detectAabbCollision(objects[i], objects[j]);
            }
        }
    }
    narrowPhazeDetection(objects) {
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {  // try j = i+1
                if (j > i) {
                    if (objects[i].shape instanceof Circle && objects[j].shape instanceof Circle) {
                        this.detectCollisionCircleCircle(objects[i], objects[j]);
                    } else if (objects[i].shape instanceof Rect && objects[j].shape instanceof Rect) {
                        this.detectCollisionRectangleRectangle(objects[i], objects[j]);
                    }
                }
            }
        }
    }

    detectCollisionCircleCircle(obj1, obj2) {   //  obj1 and abj2 are rigid bodies from array objects in main
        const circle1 = obj1.shape;  //  rigid bodies have shape, circle or rectangle
        const circle2 = obj2.shape;  //  shape has position and radius
        const distance = circle1.position.distanceTo(circle2.position);   //  returns magnitude of ditance between these two shapes as a vector (position is from circle class)

        if (distance < circle1.radius + circle2.radius) {   //  finding if the objects touch/overlap, if they do, the collision acts on it
            const overlap = circle1.radius + circle2.radius - distance; //  vector from circle1 to circle2
            const normal = circle2.position.clone().subtract(circle1.position).normalize(); //  dont want to change original vector, so we subtract from a clone() is a unit vector means directon
            this.collisions.push({  //  make a object without a constructor
                collidedPair: [obj1, obj2], //  make array of objects that are colliding
                overlap: overlap,
                normal: normal
            })
        }
    }

    //  detect rectangles collisions

    detectCollisionRectangleRectangle(obj1, obj2) {
        const rect1 = obj1.shape;
        const rect2 = obj2.shape;
    
        // Calculate the left, right, top, and bottom of each rectangle
        const left1 = rect1.position.x - rect1.width / 2;
        const right1 = rect1.position.x + rect1.width / 2;
        const top1 = rect1.position.y - rect1.height / 2;
        const bottom1 = rect1.position.y + rect1.height / 2;
    
        const left2 = rect2.position.x - rect2.width / 2;
        const right2 = rect2.position.x + rect2.width / 2;
        const top2 = rect2.position.y - rect2.height / 2;
        const bottom2 = rect2.position.y + rect2.height / 2;
    
        // Check for overlap
        const isColliding = right1 >= left2 &&
                            left1 <= right2 &&
                            bottom1 >= top2 &&
                            top1 <= bottom2;
    
        if (isColliding) {
            console.log('true');
        } else {
            console.log('false');
        }
    }

    pushOffObjects(obj1, obj2, overlap, normal) {
        obj1.shape.position.subtract(normal.clone().multiply(overlap / 2));
        obj2.shape.position.add(normal.clone().multiply(overlap / 2));

    }

    resolveCollisions() {
        let collidedPair, overlap, normal, obj1, obj2;
        for (let i = 0; i < this.collisions.length; i++) {
            ({ collidedPair, overlap, normal } = this.collisions[i]);
            [obj1, obj2] = collidedPair;
            this.pushOffObjects(obj1, obj2, overlap, normal);
        }
    }
}
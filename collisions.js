import { Circle } from "./circle.js";
import { Rectangle } from "./rectangle.js";
import { renderer } from "./main.js";

export class Collisions {
    constructor() {
        this.possibleCollisions = [];
        this.collisions = [];
    }

    clearCollisions() {
        this.possibleCollisions = [];
        this.collisions = []; //reset it (assigns it to empty array)
    }

    broadPhazeDetection(objects) {
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                this.detectAabbCollision(objects[i], objects[j]);
            }
        }
    }

    narrowPhazeDetection(objects) {
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                if (j > i) {
                    if (objects[i].shape instanceof Circle && objects[j].shape instanceof Circle) {
                        this.detectCollisionCircleCircle(objects[i], objects[j]);
                    } else if (objects[i].shape instanceof Rectangle && objects[j].shape instanceof Rectangle) {
                        this.detectCollisionRectangleRectangle(objects[i], objects[j]);
                    } else if (objects[i].shape instanceof Circle && objects[j].shape instanceof Rectangle) {
                        this.findClosestVertex(objects[j].shape.vertices, objects[i].shape.position);
                    } else if (objects[i].shape instanceof Rectangle && objects[j].shape instanceof Circle) {
                        this.findClosestVertex(objects[i].shape.vertices, objects[j].shape.position);
                    }
                }
            }
        }
    }

    detectAabbCollision(obj1, obj2) {
        let obj1aabb = obj1.shape.aabb;
        let obj2aabb = obj2.shape.aabb;
        if (obj1aabb.max.x > obj2aabb.min.x &&
            obj1aabb.max.y > obj2aabb.min.y &&
            obj2aabb.max.x > obj1aabb.min.x &&
            obj2aabb.max.y > obj1aabb.min.y) {
            this.possibleCollisions.push([obj1, obj2]);
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
    detectCollisionCirclePolygon(circle, polygon) {
        const vertices = polygon.shape.vertices;
        const circleShape = circle.shape;
        let overlap, normal, axis;

        overlap = number.MAX_VALUE;

        for (let i = 0; i < vertices.length; i++) {
            const vertices1 = vertices[i];
            const vertices2 = vertices[(i + 1) % vertices.length];
            axis = vertices2.clone().subtract(vertices1).rotateCCW90().normalize();
            const [min1, max1] = this.projectVertices(vertices, axis);
            const [min2, max2] = this.projectCircle(center, radius, axis);

            if (min2 >= max1 || min1 >= max2) {
                //we dont have collisions
                return;
            }

            const axisOverlap = Math.min(max2 - min1, max1 - min2);
            if (overlap >= axisOverlap) {   //find smallest overlap
                overlap = axisOverlap;
            }
        }
    }

    projectVertices(vertices, axis) {
        let min, max;
        min = vertices[0].dot(axis);    //first vertex projection
        max = min;  //save it as both min and max

        for (let i = 1; i < vertices.length; i++) { //already calculated 0 before so do i = 1
            const proj = vertices[i].dot(axis);
            if (proj < min) {
                min = proj;
            }
            if (proj > max) {
                max = proj;
            }
        }

        return [min, max];  //smallest and largest projection
    }

    projectCircle(center, radius, axis) {
        let min, max;
        //points on circle distance 1 radius from center
        const points = [center.clone().moveDistInDir(radius, axis), center.clone().moveDistInDir(-radius, axis)];

        min = points[0].dot(axis);  //project points
        max = points[1].dot(axis);
        if (min > max) {    //swap min and max if we chose wrong
            const t = min;
            min = max;
            max = t;
        }
        return [min, max];
    }

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

    findClosestVertex(vertices, center) {
        let minDistance = Number.MAX_VALUE;
        let vertexDistance, closestVertex;

        for (let i = 0; i < vertices.length; i++) {
            vertexDistance = vertices[i].distanceTo(center);
            if (vertexDistance < minDistance) {
                minDistance = vertexDistance;
                closestVertex = vertices[i];
            }
        }
        renderer.renderedNextFrame.push(closestVertex); //add closest vertex to renderer array
        return closestVertex;
    }
}
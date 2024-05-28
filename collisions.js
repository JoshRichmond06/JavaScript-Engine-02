import { Calculations } from "./calculations.js";
import { Circle } from "./circle.js";
import { Rectangle } from "./rectangle.js";
import { renderer } from "./main.js";
import { Vec } from "./vector.js";

const calc = new Calculations();
export class Collisions {
    constructor() {
        this.possibleCollisions = [];
        this.collisions = [];
        this.e = 0.5;   //coesfficient of restitution
        this.kf = 0.3;
        this.sf = 0.5;
    }

    clearCollisions() {
        this.possibleCollisions = [];
        this.collisions = []; //reset it (assigns it to empty array)
    }

    broadPhaseDetection(objects) {
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                this.detectAabbCollision(objects[i], objects[j]);
            }
        }
    }

    narrowPhaseDetection(objects) {
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {

                if (objects[i].shape instanceof Circle && objects[j].shape instanceof Circle) {
                    this.detectCollisionCircleCircle(objects[i], objects[j]);
                }
                else if (objects[i].shape instanceof Circle && objects[j].shape instanceof Rectangle) {
                    this.detectCollisionCirclePolygon(objects[i], objects[j]);
                }
                else if (objects[i].shape instanceof Rectangle && objects[j].shape instanceof Circle) {
                    this.detectCollisionCirclePolygon(objects[j], objects[i]);
                }
                else if (objects[i].shape instanceof Rectangle && objects[j].shape instanceof Rectangle) {
                    this.detectCollisionPolygonPolygon(objects[i], objects[j]);
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

            const point = circle1.position.clone().add(normal.clone().multiply(circle1.radius - overlap / 2));
            // renderer.renderedNextFrame.push(point);
            this.collisions.push({  //  make a object without a constructor
                collidedPair: [obj1, obj2], //  make array of objects that are colliding
                overlap: overlap,
                normal: normal,
                point: point
            })
        }
    }

    detectCollisionCirclePolygon(circle, polygon) {
        // Revised logic for clarity and correctness
        const vertices = polygon.shape.vertices;
        const circleShape = circle.shape;
        let overlap = Number.MAX_VALUE;
        let normal, axis;

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];
            this.findClosestPointSegment(circleShape.position, v1, v2);
            axis = v2.clone().subtract(v1).rotateCCW90().normalize();

            const [min1, max1] = this.projectVertices(vertices, axis);
            const [min2, max2] = this.projectCircle(circleShape.position, circleShape.radius, axis);

            if (min2 >= max1 || min1 >= max2) return;

            const axisOverlap = Math.min(max2 - min1, max1 - min2);
            if (axisOverlap <= overlap) {
                overlap = axisOverlap;
                normal = axis;
            }
        }
     
        const closestVertex = this.findClosestVertex(vertices, circleShape.position);
        axis = closestVertex.clone().subtract(circleShape.position).normalize();

        const [min1, max1] = this.projectVertices(vertices, axis);
        const [min2, max2] = this.projectCircle(circleShape.position, circleShape.radius, axis);

        if (!(min1 >= max2 || min2 >= max1)) {
            const axisOverlap = Math.min(max2 - min1, max1 - min2);
            if (axisOverlap < overlap) {
                overlap = axisOverlap;
                normal = axis;
            }

            const vec1to2 = polygon.shape.position.clone().subtract(circle.shape.position);
            if (normal.dot(vec1to2) < 0) {
                normal.invert();
            }
            const point = this.findContactPointCirclePolygon(circleShape.position, vertices);
            renderer.renderedNextFrame.push(point);
            //add collision info
            this.collisions.push({
                collidedPair: [circle, polygon],
                overlap: overlap,
                normal: normal,
                point: point
            });
        }
    }

    projectVertices(vertices, axis) {
        let min = vertices[0].dot(axis), max = min;

        for (let i = 1; i < vertices.length; i++) {
            const proj = vertices[i].dot(axis);
            if (proj < min) {
                min = proj;
            }
            if (proj > max) {
                max = proj;
            }
        }

        return [min, max];
    }

    projectCircle(center, radius, axis) {
        let min, max;
        const points = [center.clone().moveDistanceInDirection(radius, axis), center.clone().moveDistanceInDirection(-radius, axis)];   // points on circle
        min = points[0].dot(axis);
        max = points[1].dot(axis);
        if (min > max) {
            const temp = min;   //swapping min and max values
            min = max;
            max = temp;
        }

        return [min, max];
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
        // renderer.renderedNextFrame.push(closestVertex); //add closest vertex to renderer array
        return closestVertex;
    }


     // Additional changes might be necessary in methods that call this one:
     detectCollisionPolygonPolygon(obj1, obj2) {
        // Ensure all vectors are properly initialized before usage
        // Example safeguard
        if (!obj1.shape || !obj2.shape || !obj1.shape.position || !obj2.shape.position) {
            console.error('Object shapes or positions are undefined');
            return; // Exit the function if critical information is missing
        }
        const vertices1 = obj1.shape.vertices;
        const vertices2 = obj2.shape.vertices;
        let smallestOverlap = Number.MAX_VALUE;
        let collisionNormal, axis;
        const vector1to2 = obj2.shape.position.clone().subtract(obj1.shape.position);

        const edges1 = this.calculateEdges(vertices1);
        const axes1 = [];

        for (let i = 0; i < edges1.length; i++) {
            axes1.push(edges1[i].rotateCCW90().normalize());
        }


        //check if axes are not on the back side of rectangle
        for (let i = 0; i < axes1.length; i++) {
            const axis = axes1[i];
            if (axis.dot(vector1to2) < 0) {
                //axes is in the wrong direction, i.e it is on the backside of rectangle
                continue;
            }

            //calculate overlap on axis
            const { overlap, normal } = this.calculateOverlap(vertices1, vertices2, axis);

            if (overlap <= 0) {
                return; //seperating axis found, no collision
            } else if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                collisionNormal = normal;
            }
        }

        // object 2 edges
        const vector2to1 = vector1to2.clone().invert();
        const edges2 = this.calculateEdges(vertices2);
        const axes2 = [];

        for (let i = 0; i < edges2.length; i++) {
            axes2.push(edges2[i].rotateCCW90().normalize());
        }
        for (let i = 0; i < axes2.length; i++) {
            const axis = axes2[i];
            if (axis.dot(vector2to1) < 0) {
                continue;
            }
            const { overlap, normal } = this.calculateOverlap(vertices1, vertices2, axis);
            if (overlap <= 0) {
                return;
            } else if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                collisionNormal = normal;
            }
        }

        const normal = this.correctNormalDirection(collisionNormal, obj1, obj2);
        const point = this.findContactPointPolygons(vertices1, vertices2);

        this.collisions.push({
            collidedPair: [obj1, obj2],
            overlap: smallestOverlap,
            normal: normal,     //direction from obj1 to obj2, normal points out of obj1
            point: point
        });
        
    }

    calculateEdges(vertices) {
        const edges = [];
        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];
            edges.push(v2.clone().subtract(v1));
        }
        return edges;
    }

    calculateOverlap(vertices1, vertices2, axis) {
        const [min1, max1] = this.projectVertices(vertices1, axis);
        const [min2, max2] = this.projectVertices(vertices2, axis);

        if (min1 >= max2 || min2 >= max1) {
            return {
                overlap: 0,
                normal: null
            }
        }
        return {
            overlap: Math.min(max2 - min1, max1 - min2),
            normal: axis.clone(),
        };
    }

    correctNormalDirection(normal, obj1, obj2) {
        if (!normal || !obj1.shape.position || !obj2.shape.position) {
            console.error('Invalid vector operation due to undefined vectors');
            return normal; // Or handle this case as appropriate
        }

        const vecO1O2 = obj2.shape.position.clone().subtract(obj1.shape.position);
        const dot = normal.dot(vecO1O2);
        if (dot >= 0) {
            return normal;
        } else {
            return normal.invert();
        }
    }

    findClosestPointSegment (p, a, b) { //p-point, a,b - ends of a segment, all 3 are vectors
        const vAB = b.clone().subtract(a);
        const vAP = p.clone().subtract(a);
        const dot = vAB.dot(vAP);
        const d = dot / vAB.magnitudeSq();  //dot divided by squared magnitude of AB
        let closest;
        if (d <= 0) {
            closest = a;
        } else if (d >= 1) {
            closest = b;
        } else {
            closest = a.clone().add(vAB.multiply(d));
        }
        return [closest, p.distanceTo(closest)];
    }

    findContactPointCirclePolygon(circleCenter, polygonVertices) {
        let contact, v1, v2;
        let shortestDistance = Number.MAX_VALUE;
        for (let i = 0; i < polygonVertices.length; i++) {
            v1 = polygonVertices[i];
            v2 = polygonVertices[(i + 1) % polygonVertices.length]
            const info = this.findClosestPointSegment(circleCenter, v1, v2);
            if (info[1] < shortestDistance) {
                contact = info[0];
                shortestDistance = info[1];
            }
        }
        return contact;
    }

    pushOffObjects(obj1, obj2, overlap, normal) {
        if (obj1.isStatic) {
            obj2.shape.position.add(normal.clone().multiply(overlap));
        } else if (obj2.isStatic) {
            obj1.shape.position.subtract(normal.clone().multiply(overlap));
        } else {
            obj1.shape.position.subtract(normal.clone().multiply(overlap / 2));
            obj2.shape.position.add(normal.clone().multiply(overlap / 2));
        }
    }

    findContactPointPolygons(vertices1, vertices2) {
        let contact1, contact2, p, v1, v2, minDist;
        contact2 = null;
        minDist = Number.MAX_VALUE;
        for (let i = 0; i < vertices1.length; i++) {
            p = vertices1[i];
            for (let j = 0; j < vertices2.length; j++) {
                v1 = vertices2[j];
                v2 = vertices2[(j + 1) % vertices2.length];

                const info = this.findClosestPointSegment(p, v1, v2);

                if (calc.checkNearlyEqual(info[1], minDist) && !info[0].checkNearlyEqual(contact1)) {
                    contact2 = info[0];
                } else if (info[1] < minDist) {
                    contact1 = info[0];
                    minDist = info[1];
                }
            }
        }

        for (let i = 0; i < vertices2.length; i++) {
            p = vertices2[i];
            for (let j = 0; j < vertices1.length; j++) {
                v1 = vertices1[j];
                v2 = vertices1[(j + 1) % vertices1.length];

                const info = this.findClosestPointSegment(p, v1, v2);

                if (calc.checkNearlyEqual(info[1], minDist) && !info[0].checkNearlyEqual(contact1)) {
                    contact2 = info[0];
                } else if (info[1] < minDist) {
                    contact1 = info[0];
                    minDist = info[1];
                }
            }
        }

        if (contact2) { //two contacts
            return calc.averageVector([contact1, contact2]);
        } else {  //one contact
            return contact1;
        }

    }

    bounceOffObject(obj1, obj2, normal) {
        const relativeVelocity = obj2.velocity.clone().subtract(obj1.velocity);
        if (relativeVelocity.dot(normal) > 0) return;  //impossible collission

        const j = -relativeVelocity.dot(normal) * (1 + this.e) / (obj1.inverseMass + obj2.inverseMass);
        const dv1 = j * obj1.inverseMass; // change of velocity for obj 1
        const dv2 = j * obj2.inverseMass;
        obj1.velocity.subtract(normal.clone().multiply(dv1));
        obj2.velocity.add(normal.clone().multiply(dv2));
    }

    bounceOffAndRotateObjects(o1, o2, normal, point) {
        renderer.renderedNextFrame.push(point);
        //linear v from rotation at contact = r vectors from objects to contact points, rotated perp, multiplied by angVel 
        const r1 = point.clone().subtract(o1.shape.position);
        const r2 = point.clone().subtract(o2.shape.position);
        const r1Perp = r1.clone().rotateCW90();
        const r2Perp = r2.clone().rotateCW90();
        const v1 = r1Perp.clone().multiply(o1.angularVelocity);
        const v2 = r2Perp.clone().multiply(o2.angularVelocity);

        //relative vel at contact = relative linear vel + relative rotatonal vel
        const relativeVelocity = o2.velocity.clone().add(v2).subtract(o1.velocity).subtract(v1);
        const contactVelocityNormal = relativeVelocity.dot(normal);
        if (contactVelocityNormal > 0) {
            return 0;
        }

        const r1PerpDotN = r1Perp.dot(normal);
        const r2PerpDotN = r2Perp.dot(normal);

        const denom = o1.inverseMass + o2.inverseMass
            + r1PerpDotN * r1PerpDotN * o1.inverseInertia
            + r2PerpDotN * r2PerpDotN * o2.inverseInertia;

        let j = -(1 + this.e) * contactVelocityNormal;
        j /= denom;

        const impulse = normal.clone().multiply(j);

        o1.velocity.subtract(impulse.clone().multiply(o1.inverseMass));
        o1.angularVelocity -= r1.cross(impulse) * o1.inverseInertia;
        o2.velocity.add(impulse.clone().multiply(o2.inverseMass));
        o2.angularVelocity += r2.cross(impulse) * o2.inverseInertia;

        return j;
    }

    addFriction(o1, o2, normal, point, j) {
        //linear v from rotation at contact = r vectors from objects to contact points, rotated perp, multiplied by angVel 
        const r1 = point.clone().subtract(o1.shape.position);
        const r2 = point.clone().subtract(o2.shape.position);
        const r1Perp = r1.clone().rotateCW90();
        const r2Perp = r2.clone().rotateCW90();
        const v1 = r1Perp.clone().multiply(o1.angularVelocity);  
        const v2 = r2Perp.clone().multiply(o2.angularVelocity);

        const relativeVelocity = o2.velocity.clone().add(v2).subtract(o1.velocity).subtract(v1);
        
        const tangentVelocity = relativeVelocity.clone().subtract(normal.clone().multiply(relativeVelocity.dot(normal)));
        if (tangentVelocity.checkNearlyZero()) {
            return;
        }
        const tangent = tangentVelocity.normalize();
        
        const r1PerpDotT = r1Perp.dot(tangent);
        const r2PerpDotT = r2Perp.dot(tangent);

        const denom = o1.inverseMass + o2.inverseMass 
        + r1PerpDotT * r1PerpDotT * o1.inverseInertia 
        + r2PerpDotT * r2PerpDotT * o2.inverseInertia;

        let jt = -relativeVelocity.dot(tangent);
        jt /= denom;

        //Coloumb's law
        let frictionImpulse;
        if (Math.abs(jt) <= j * this.sf) {
            frictionImpulse = tangent.clone().multiply(jt);
        } else {
            frictionImpulse = tangent.clone().multiply(-j * this.kf);
        }
        
        o1.velocity.subtract(frictionImpulse.clone().multiply(o1.inverseMass));
        o1.angularVelocity -= r1.cross(frictionImpulse) * o1.inverseInertia;
        o2.velocity.add(frictionImpulse.clone().multiply(o2.inverseMass));
        o2.angularVelocity += r2.cross(frictionImpulse) * o2.inverseInertia;
    }

    resolveCollisionsWithPushOff() {
        let collidedPair, overlap, normal, obj1, obj2;
        for (let i = 0; i < this.collisions.length; i++) {
            ({ collidedPair, overlap, normal } = this.collisions[i]);
            [obj1, obj2] = collidedPair;
            this.pushOffObjects(obj1, obj2, overlap, normal);
        }
    }

    resolveCollisionsWithPushAndBounceOff() {
        let collidedPair, overlap, normal, obj1, obj2;
        for (let i = 0; i < this.collisions.length; i++) {
            ({ collidedPair, overlap, normal } = this.collisions[i]);
            [obj1, obj2] = collidedPair;
            this.pushOffObjects(obj1, obj2, overlap, normal);
            this.bounceOffObject(obj1, obj2, normal);
        }
    }

    resolveCollisionsWithRotation() {
       
        let collidedPair, overlap, normal, obj1, obj2, point;
        
        for (let i = 0; i < this.collisions.length; i++) {
            ({ collidedPair, overlap, normal, point } = this.collisions[i]);
            [obj1, obj2] = collidedPair;
            this.pushOffObjects(obj1, obj2, overlap, normal);
            const j = this.bounceOffAndRotateObjects(obj1, obj2, normal, point);
            this.addFriction(obj1, obj2, normal, point, j);
        }
    }
}
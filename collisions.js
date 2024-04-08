import {Circle} from './circle.js';
import {Rect} from './rect.js';


export class Collisions {
    constructor() {
        this.possibleCollisions = [];
        this.collisions = [];
    }

    clearCollisions() {
        this.possibleCollisions = [];
        this.collisions = [];
    }

    broadPhazeDetection (objects) {
        for(let i=0; i<objects.length; i++) {
            for(let j=i+1; j<objects.length; j++) {
                this.detectAabbCollision(objects[i], objects[j]);
            }
        }
    }

    narrowPhazeDetection(objects) {
        for (let i=0; i<objects.length; i++) {
            for (let j=0; j<objects.length; j++) {  //try j=i+1
                if(j > i) {
                    //detect collisions
                    if(objects[i].shape instanceof Circle && 
                        objects[j].shape instanceof Circle) {
                        this.detectCollisionCircleCircle(objects[i], objects[j]);
                    }   //later detect rectangle rectangle here
                    else if (objects[i].shape instanceof Circle && 
                        objects[j].shape instanceof Rect) {
                            this.detectCollisionCirclePolygon(objects[i], objects[j]);
                    }
                    else if (objects[i].shape instanceof Rect && 
                        objects[j].shape instanceof Circle) {
                            this.detectCollisionCirclePolygon(objects[j], objects[i]);
                    }
                    else if (objects[i].shape instanceof Rect && 
                        objects[j].shape instanceof Rect) {
                            this.detectCollisionPolygonPolygon(objects[i], objects[j]);
                    }
                }
            }
        }
    }

    detectAabbCollision(o1, o2) {
        let o1aabb = o1.shape.aabb;
        let o2aabb = o2.shape.aabb;
        if (o1aabb.max.x > o2aabb.min.x &&
            o1aabb.max.y > o2aabb.min.y &&
            o2aabb.max.x > o1aabb.min.x &&
            o2aabb.max.y > o1aabb.min.y) {
            this.possibleCollisions.push([o1, o2]);
        }
    }

    detectCollisionCircleCircle(o1, o2) {   //o1 and o2 are rigidBodies from array objects in main
        const s1 = o1.shape;    //rigidBodies have shape circle or rectangle
        const s2 = o2.shape;    //shape has position and radius
        const dist = s1.position.distanceTo(s2.position);
        if (dist < s1.radius + s2.radius) {
            const overlap = s1.radius + s2.radius - dist;
            //unit vector from s1 to s2
            const normal = s2.position.clone().subtract(s1.position).normalize();   //unit vector(direction) normal(perpendicular) to contact surface
            this.collisions.push({  //object
                collidedPair: [o1, o2], //[array]
                overlap: overlap,
                normal: normal
            })
        }
    }

    //detect rectangles collisions
    detectCollisionCirclePolygon (c, p) {
        const vertices = p.shape.vertices;
        const cShape = c.shape;
        let overlap, normal, axis;

        overlap = Number.MAX_VALUE;

        //find overlaps for axes perpendicular to polygon edges
        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i+1)%vertices.length];
            axis = v2.clone().subtract(v1).rotateCCW90().normalize();
            const [min1, max1] = this.projectVertices(vertices, axis);
            const [min2, max2] = this.projectCircle(cShape.position, cShape.radius, axis);
            
            if (min2 >= max1 || min1 >= max2){
                //we dont have collision
                return;
            }

            const axisOverlap = Math.min(max2-min1, max1-min2); //finds smallest overlap
            if (overlap >= axisOverlap) {
                overlap = axisOverlap;
                normal = axis;
            }
        }

        //find overlaps for axis from polygon closest vertex to center of circle
        const closestVertex = this.findClosestVertex(vertices, cShape.position);
        axis = closestVertex.clone().subtract(cShape.position).normalize(); //axis from circle to closest vertex on polygon
        
        const [min1, max1] = this.projectVertices(vertices, axis);
        const [min2, max2] = this.projectCircle(cShape.position, cShape.radius, axis);
        if (min1 >= max2 || min2 >= max1) {
            return;
        }

        const axisOverlap = Math.min(max2-min1, max1-min2); //find on which axis we have the smallest overlap
        if (axisOverlap < overlap) {
            overlap = axisOverlap;
            normal = axis;
        }

        //set correct direction of the collision normal 
        //(direction of collision from 1st to 2nd object)
        const vec1to2 = p.shape.position.clone().subtract(c.shape.position);  //gives correct direction for normal
        if (normal.dot(vec1to2) < 0) { 
            normal.invert();
        }

        //add collision info
        this.collisions.push({
            collidedPair: [c, p],
            overlap: overlap,
            normal: normal,       //direction from c1 to c2
        });

    }

    projectVertices (vertices, axis) {
        let min, max;
        min = vertices[0].dot(axis);    //first vertex projection
        max = min;  //save it as both min and max

        for (let i = 1; i < vertices.length; i++) {
            const proj = vertices[i].dot(axis); //projections for all other vertices
            if (proj < min) {
                min = proj;
            }
            if (proj > max) {
                max = proj;
            }
        }

        return [min, max];  //smallest and largest projection
    }

    projectCircle (center, radius, axis) {
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

    findClosestVertex (vertices, center) {  //returns the i of the closest of vertices to a center point
        let minDist = Number.MAX_VALUE;
        let vertexDist, closestVertex;
        for (let i=0; i<vertices.length; i++) {
            vertexDist = vertices[i].distanceTo(center);
            if (vertexDist < minDist) {
                minDist = vertexDist;
                closestVertex = vertices[i];
            }
        }
        renderer.renderedNextFrame.push(closestVertex);
        return closestVertex;
    }


    detectCollisionPolygonPolygon (o1, o2) {
        const vertices1 = o1.shape.vertices;
        const vertices2 = o2.shape.vertices;
        let smallestOverlap, collisionNormal, axis;
        smallestOverlap = Number.MAX_VALUE;

        const vector1to2 = o2.shape.position.clone().subtract(o1.shape.position);

        const edges1 = this.calculateEdges(vertices1);
        const axes1 = [];
        for (let i = 0; i < edges1.length; i++) {
            axes1.push(edges1[i].rotateCCW90().normalize());
        }
        //check if axes are not on the back side of rectangle
        for (let i = 0; i < axes1.length; i++) {
            const axis = axes1[i];
            if(axis.dot(vector1to2) < 0) {
                //axis is in the wrong direction, i.e it is on the backside of rectangle
                continue;
            }
            //calculate overlap on axis
            const { overlap, normal } = this.calculateOverlap(vertices1, vertices2, axis);
            
            if (overlap <= 0) {
                return; // Separating axis found, no collision
            } else if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                collisionNormal = normal;
            }
        }

        //object2 edges
        const vector2to1 = vector1to2.clone().invert();
        const edges2 = this.calculateEdges(vertices2);
        const axes2 = [];
        for (let i = 0; i < edges2.length; i++) {
            axes2.push(edges2[i].rotateCCW90().normalize());
        }
        for (let i = 0; i < axes2.length; i++) {
            const axis = axes2[i];
            if(axis.dot(vector2to1) < 0) {
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
        
        const normal = this.correctNormalDirection(collisionNormal, o1, o2);

        this.collisions.push({
            collidedPair: [o1, o2],
            overlap: smallestOverlap,
            normal: normal,       //direction from o1 to o2, normal points out of o1
        });
    }

    calculateEdges(vertices) {
        const edges = [];
        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i+1)%vertices.length];
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
            overlap: Math.min(max2-min1, max1-min2),
            normal: axis.clone(),
        };
    }

    correctNormalDirection(normal, o1, o2) {
        const vecO1O2 = o2.shape.position.clone().subtract(o1.shape.position);
        const dot = normal.dot(vecO1O2);
        if (dot >= 0) {
            return normal;
        } else {
            return normal.invert();
        }
    }

    pushOffObjects(o1, o2, overlap, normal) {
        o1.shape.position.subtract(normal.clone().multiply(overlap/2));
        o2.shape.position.add(normal.clone().multiply(overlap/2));
    }

    resolveCollisions() {
        let collidedPair, overlap, normal, o1, o2;
        for(let i=0; i<this.collisions.length; i++) {
            ({collidedPair, overlap, normal} = this.collisions[i]);
            [o1, o2] = collidedPair;
            this.pushOffObjects(o1, o2, overlap, normal);
        }
    }
}
import { Vec } from './vector.js';
import { Rectangle } from './rectangle.js';

export class RigidBody {
    constructor(shape, isStatic = false) {
        if (!shape || !shape.position) {
            console.error("Invalid shape or position during RigidBody creation", shape);
            throw new Error("Shape and position must be defined");
        }
        this.shape = shape;
        this.velocity = new Vec(0, 0);
        this.acceleration = new Vec(0, 0);

        this.angularAcceleration = 0;
        this.angularVelocity = 0;

        this.position = this.shape.position;
        this.mass = 0; // Initialize with a default value
        this.inverseMass;
        this.density = 1;
        this.isStatic = isStatic; // Use consistently

        this.inertia = 0;
        this.inverseInertia = 0;
    }

    updateShape(dt) {

        const dv = this.acceleration.clone().multiply(dt);
        this.velocity.add(dv);
        const ds = this.velocity.clone().multiply(dt);  //multiply v * dt = giving you displacement per frame
        this.shape.position.add(ds);

        this.angularVelocity += this.angularAcceleration * dt;
        this.shape.orientation += this.angularVelocity * dt;


        // Update vertices and aabb of shape if it is a rectangle
        if (this.shape instanceof Rectangle) {
            this.shape.updateVertices();
        }
        //update aabb
        this.shape.updateAabb();
    }

    applyForce(force) {
        if (this.isStatic) return;  // No effect on static bodies

        // F = m * a, so a = F / m (but we use acceleration directly here for simplicity)
        this.acceleration.add(force.clone().divide(this.mass)); //clone force otherwise the second object will have reduced acceleration
    }

    setMass() {
        this.mass = this.shape.calculateMass(this.density);
        this.inertia = this.shape.calculateMass(this.mass);

        if (this.isStatic) { // Correctly using isStatic
            this.inverseMass = 0;   // 0 for collisions means that the mass is infinity
            this.inverseInertia = 0;
        } else {
            this.inverseMass = 1 / this.mass;
            this.inverseInertia = 1 / this.inertia;
        }
    }

    checkTooFar(worldSize) {
        return this.shape.position.magnitude() > worldSize;
    }
}

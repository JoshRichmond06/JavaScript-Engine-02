import { RigidBody } from "./rigidBody.js";

export class Spring {
    constructor(objectA, objectB, restLength, stiffness) {
        console.log("Creating Spring:", { objectA, objectB, restLength, stiffness });

        this.objectA = objectA;
        this.objectB = objectB;
        this.restLength = restLength;
        this.stiffness = stiffness;
    }

    applyForce() {
        console.log('Is objectA a RigidBody?', this.objectA instanceof RigidBody); 
        console.log('Is objectB a RigidBody?', this.objectB instanceof RigidBody); 
        console.log("Object A position:", this.objectA.position); 
        console.log("Object B position:", this.objectB.position); 
        console.log(`Applying force: Positions A: ${this.objectA.position}, B: ${this.objectB.position}`);
        
        if (!this.objectA.position || !this.objectB.position) {
            console.error("Undefined position detected", this.objectA, this.objectB);
            return; // Abort force application if positions are undefined
        }
        let distanceVec = this.objectB.position.clone().subtract(this.objectA.position);
        let distance = distanceVec.magnitude();
        let extension = distance - this.restLength;
        let forceMagnitude = this.stiffness * extension; // Hooke's Law: F = -kx
        let force = distanceVec.normalize().multiply(forceMagnitude);
    
        this.objectA.applyForce(force);
        this.objectB.applyForce(force.clone().multiply(-1)); // Apply equal and opposite force
    }
    
    draw(ctx) {
        if (!this.objectA.position || !this.objectB.position) {
            return; // Do not attempt to draw if positions are undefined
        }
    
        const { x: x1, y: y1 } = this.objectA.position;
        const { x: x2, y: y2 } = this.objectB.position;
    
        const segments = 10; // Number of segments in the zigzag spring
        const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / segments;
        const angle = Math.atan2(y2 - y1, x2 - x1); // Angle of the line between objects
    
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        // Generate points for the zigzag
        for (let i = 1; i <= segments; i++) {
            const x = x1 + i * segmentLength * Math.cos(angle);
            const y = y1 + i * segmentLength * Math.sin(angle);
            // Alternate the displacement along the perpendicular axis
            const displacement = 5 * (i % 2 === 0 ? -1 : 1); // Change 5 to adjust the amplitude of the zigzag
            const dx = displacement * Math.sin(angle);
            const dy = displacement * Math.cos(angle);
            
            ctx.lineTo(x + dx, y - dy);
        }
    
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }
}

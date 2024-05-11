export class Spring {
    constructor(objectA, objectB, restLength, stiffness) {
        this.obj1 = objectA;       //objects it's interacting with
        this.obj2 = objectB;    
        this.restL = restLength;    //equilibrium
        this.k = stiffness; //spring constant
    }

    applyForce() {  //apply force exerted by the spring on the two connected objects
        let distVec = this.obj2.shape.position.clone().subtract(this.obj1.shape.position);  //distance between two obj
        let dist = distVec.magnitude(); //magnitude of dist
        let forceMag = this.k * (dist - this.restL);    //dist is current distance between two obj, d - l determines whether it is tensile or compressive force
        let force = distVec.normalize().multiply(forceMag); //normalize force, force applied to obj1 in direction of obj2, equal & opposite reaction

        this.obj1.applyForce(force);
        this.obj2.applyForce(force.invert());
    }

    draw(ctx) { //draw method
        ctx.beginPath();
        ctx.moveTo(this.obj1.shape.position.x, this.obj1.shape.position.y);
        ctx.lineTo(this.obj2.shape.position.x, this.obj2.shape.position.y);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
    }
}
export class Spring {
    constructor(objectA, objectB, restLength, stiffness) {
        this.obj1 = objectA;
        this.obj2 = objectB;
        this.restL = restLength;
        this.k = stiffness;
    }

    applyForce() {
        let distVec = this.obj2.shape.position.clone().subtract(this.obj1.shape.position);
        let dist = distVec.magnitude();
        let forceMag = this.k * (dist - this.restL);
        let force = distVec.normalize().multiply(forceMag);

        this.obj1.applyForce(force);
        this.obj2.applyForce(force.invert());
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.obj1.shape.position.x, this.obj1.shape.position.y);
        ctx.lineTo(this.obj2.shape.position.x, this.obj2.shape.position.y);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
    }
}
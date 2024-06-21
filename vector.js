export class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.renderOrigin;
		this.minimumAmount = 0.05;
	}
    //chainable methods
	copy (v) {	//copy the xy of another vector into this
		this.x = v.x;
		this.y = v.y;
		return this;
	}

	setX(x) {
		this.x = x;
		return this;
	}

	setY(y) {
		this.y = y;
		return this;
	}

	zero() {
		this.x = 0;
		this.y = 0;
		return this;
	}

	add(v) {		//add a vector to this
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	
	addX(x) {	//scalar addition
		this.x += x;
		return this;
	}

	addY(y) {	//scalar addition
		this.y += y;
		return this;
	}
	subtract (v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}

	subtractX(x) {
		this.x -= x;
		return this;
	}

	subtractY(y) {
		this.y -= y;
		return this;
	}
	
	multiply (s) {
		this.x *= s;
		this.y *= s;
		return this;
	}
	
	divide (s) {
		this.x /= s;
		this.y /= s;
		return this;
	}

	absolute() {
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		return this;
	}

	normalize() {
		const length = this.magnitude();
		if(length > 0) {
			this.x /= length;
			this.y /= length;
		}
		return this;
	}

	rotate(angle) {	//in formula angle is Theta
		const x = this.x;	//Ax
		const y = this.y;
		this.x = x * Math.cos(angle) - y * Math.sin(angle);	//Bx
		this.y = x * Math.sin(angle) + y * Math.cos(angle);
		return this;
	}

	rotateCW90() {	//simple rotate for vector clock-wise 90 degrees
		const x = this.x;
		this.x = -this.y;
		this.y = x;
		return this;
	}

	rotateCCW90() {	//simple rotate for vector counter-clock-wise 90 degrees
		const x = this.x;
		this.x = this.y;
		this.y = -x;
		return this;
	}
	
	//non-chainable
	clone () {	//create a new vector with xy of this
		return new Vec(this.x, this.y);
	}

    magnitude () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	magnitudeSq() {
		return this.x * this.x + this.y * this.y;
	}

	distanceTo(v) {
		return this.clone().subtract(v).magnitude();
	}

	distanceToSq(v) {
		return this.clone().subtract(v).magnitudeSq();
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	invert() {
		this.x *= -1;	//makes vector that is opposite to other vector
		this.y *= -1;
		return this;
	}

	invertX() {
		this.x *= -1;
		return this;
	}

	invertY() {
		this.y *= -1;
		return this;
	}

	moveDistanceInDirection(distance, direction) { // direction is a unit vector
		this.add(direction.clone().multiply(distance));
		return this; // Ensure chainability by returning the instance
	}

	getMovedDistanceInDirection(distance, direction) {
		// Returns a new Vec instance that represents the position after moving
		// Does not mutate the current Vec instance
		return this.clone().add(direction.clone().multiply(distance));
	}

	angle() {
		return Math.atan2(this.y, this.x) * 180 / Math.PI;
	}

	calculateMass(density) {
		const area = Math.PI * this.radius * this.radius;
		return area * density;
	}

	checkNearlyEqual(v) {
		return this.distanceTo(v) < this.minimumAmount;	//return boolean
	}

	cross(v) {    //this - vector 1, v - vector 2, == cross(this, v)
		return (this.x * v.y) - (this.y * v.x);
	}

	checkNearlyZero() {
		return this.magnitude() < this.minimumAmount;
	}

	draw(ctx, strokeColor = 'black') {	// TO DO rename all draws to Vector draw, circle draw, rectangle draw, etc for readability 
		if (this.color) {
			ctx.strokeStyle = this.color;
		} else {
			ctx.strokeStyle = strokeColor;
		}
		if (this.renderOrigin) {
			ctx.lineWidth = 3;
			const renderEnd = this.renderOrigin.clone().add(this);
			//line from vector tail to vector head (head is arrow part)

			ctx.beginPath();	//start draw
			ctx.moveTo(this.renderOrigin.x, this.renderOrigin.y);	//where to start draw (vectors start at origin)
			ctx.lineTo(renderEnd.x, renderEnd.y);	//to create a strait line
			ctx.stroke();

			//circle at vector head
			ctx.beginPath();
			ctx.arc(renderEnd.x, renderEnd.y, 5, 0, Math.PI * 2, true);	//radius 5
			ctx.closePath();

			ctx.stroke();
		} else {
			ctx.beginPath();
			ctx.arc(this.x, this.y, 5, 0, Math.PI * 2, true);	//radius 5
			ctx.closePath();
			ctx.strokeStyle = strokeColor;
			ctx.lineWidth = 3;
			ctx.stroke();
		}
	}
}
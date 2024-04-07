export class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.renderOrigin;
	}
    //chainable methods
	copy (v) {	//copy the xy of another vector into this
		this.x = v.x;
		this.y = v.y;
		return this;
	}
	
	setX (x) {
		this.x = x;
		return this;
	}

	setY (y) {
		this.y = y;
		return this;
	}

	add (v) {		//add a vector to this
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	addX (x) {	//scalar addition
		this.x += x;
		return this;
	}
	
	addY (y) {	//scalar addition
		this.y += y;
		return this;
	}
	
	subtract (v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}

	subtractX (x) {
		this.x -= x;
		return this;
	}

	subtractY (y) {
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

	rotateCW90() {
		const x = this.x;
		this.x = -this.y;
		this.y = x;
		return this;
	}	

	rotateCCW90() {
		const x = this.x;
		this.x = this.y;
		this.y = -x;
		return this;
	}	

	invert() {
		this.x *= -1;
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

	moveDistInDir (dist, dir) {	//dir is a unit vector
		return this.add(dir.clone().multiply(dist));
	}
	
	//non-chainable
	clone () {	//create a new vector with xy of this
		return new Vec(this.x, this.y);
	}

    magnitude () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	distanceTo (v) {
		return this.clone().subtract(v).magnitude();
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	draw(ctx, strokeColor) {
		if (this.color) {
			strokeColor = this.color;
		}
		if(this.renderOrigin) {
			const renderEnd = this.renderOrigin.clone().add(this);
			ctx.beginPath();
			ctx.moveTo(this.renderOrigin.x, this.renderOrigin.y);
			ctx.lineTo(renderEnd.x, renderEnd.y);
			ctx.lineWidth = 3;
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(renderEnd.x, renderEnd.y, 5, 0, Math.PI*2, true);	//radius 5
			ctx.closePath();
			ctx.strokeStyle = strokeColor;
			ctx.lineWidth = 3;
			ctx.stroke();
		} else {
			ctx.beginPath();
			ctx.arc(this.x, this.y, 5, 0, Math.PI*2, true);	//radius 5
			ctx.closePath();
			ctx.strokeStyle = strokeColor;
			ctx.lineWidth = 3;
			ctx.stroke();
		}
	}
}

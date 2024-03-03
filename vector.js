export class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
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

	draw(ctx, strokeColor) {	// TO DO rename all draws to Vector draw, circle draw, rectangle draw, etc for readability 
		ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
		//line from vector tail to vector head (head is arrow part)
		ctx.beginPath();	//start draw
		ctx.moveTo(0, 0);	//where to start draw (vectors start at origin)
		ctx.lineTo(this.x, this.y);	//to create a strait line
		ctx.stroke();
		//circle at vector head
		ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI*2, true);	//radius 5
        ctx.closePath();
    
        ctx.stroke();
	}
}
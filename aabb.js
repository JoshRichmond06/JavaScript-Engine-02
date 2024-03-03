export class Aabb {
	constructor(min, max) {
		this.min = min;
        this.max = max;
	}	

    draw(ctx, strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(
            this.min.x, //x
            this.min.y,//y
            this.max.x - this.min.x,//width
            this.max.y - this.min.y//height
        );
    }
}
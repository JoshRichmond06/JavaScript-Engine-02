export class Style {
    constructor(fillColor = 'black', borderColor = 'red', lineWidth = 3) {
        this.fillColor = fillColor || this.fillColor || 'black';
        this.borderColor = borderColor || this.borderColor || 'red';
        this.lineWidth = lineWidth || this.lineWidth || 3;
    }

    setFillColor(color) {
        this.fillColor = color;
    }

    setBorderColor(color) {
        this.borderColor = color;
    }

    setLineWidth(width) {
        this.lineWidth = width;
    }
}
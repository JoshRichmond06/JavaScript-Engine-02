import { Vec } from "./vector.js";


export class Calculations {
    constructor() {
        this.minimumAmount = 0.05;
    }

    checkNearlyEqual(a, b) {
        return Math.abs(a - b) < this.minimumAmount;    //return boolean
    }

    averageVector(vectors) {
        const n = vectors.length;
        const average = new Vec(0, 0);
        for (let i = 0; i < n; i++) {
            average.add(vectors[i]);

        }
        return average.divide(n);
    }
}
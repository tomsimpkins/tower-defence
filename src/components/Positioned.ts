import { BaseComponent } from "../core";

export class Positioned extends BaseComponent {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		super();
		this.x = x;
		this.y = y;
	}
}

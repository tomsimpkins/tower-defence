import { BaseComponent } from "../core";

export class HitBox extends BaseComponent {
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
	constructor(offsetX: number, offsetY: number, width: number, height: number) {
		super();
		this.width = width;
		this.height = height;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}
}

export class HitCircle extends BaseComponent {
	offsetX: number;
	offsetY: number;
	radius: number;
	constructor(offsetX: number, offsetY: number, radius: number) {
		super();
		this.radius = radius;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}
}

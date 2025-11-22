import { BaseComponent } from "../core";


export class CenterPoint extends BaseComponent {
	offsetX: number;
	offsetY: number;
	constructor(offsetX: number, offsetY: number) {
		super();
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}
}

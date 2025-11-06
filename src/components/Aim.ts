import { BaseComponent } from "../core";

export class Aim extends BaseComponent {
	velocity: { x: number; y: number };
	constructor(vec: { x: number; y: number } = { x: 0, y: 0 }) {
		super();
		this.velocity = vec;
	}
}

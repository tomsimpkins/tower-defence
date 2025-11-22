import { BaseComponent } from "../core";

export class Aim extends BaseComponent {
	velocity: { x: number; y: number; z: number };
	constructor(vec: { x: number; y: number; z?: number } = { x: 0, y: 0 }) {
		super();
		this.velocity = { x: vec.x, y: vec.y, z: vec.z ?? 0 };
	}
}

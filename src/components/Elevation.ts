import { BaseComponent } from "../core";

export class Elevation extends BaseComponent {
	vz: number;
	z: number;
	maxZ: number;
	constructor(h: number, vz: number, maxZ: number) {
		super();

		this.z = h;
		this.vz = vz;
		this.maxZ = maxZ;
	}
}

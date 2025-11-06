import { BaseComponent } from "../core";

export class MaxRange extends BaseComponent {
	range: number;
	constructor(range: number) {
		super();
		this.range = range;
	}
}

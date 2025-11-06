import { BaseComponent } from "../core";

export class MinRange extends BaseComponent {
	range: number;
	constructor(range: number) {
		super();
		this.range = range;
	}
}

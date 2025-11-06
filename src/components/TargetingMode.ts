import { BaseComponent } from "../core";

export class TargetingMode extends BaseComponent {
	mode: "closest" | "furthest" | "highestHealth" | "lowestHealth";
	constructor(mode: "closest" | "furthest" | "highestHealth" | "lowestHealth") {
		super();

		this.mode = mode;
	}
}

import { BaseComponent, type EntityId } from "../core";

export class Targeting extends BaseComponent {
	target: EntityId | null;

	constructor(target: EntityId | null = null) {
		super();
		this.target = target;
	}
}

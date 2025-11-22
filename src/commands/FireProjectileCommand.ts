import { BaseCommand, type EntityId } from "../core";

export class FireProjectileCommand extends BaseCommand {
	tower: EntityId;
	constructor(tower: EntityId) {
		super();
		this.tower = tower;
	}
}

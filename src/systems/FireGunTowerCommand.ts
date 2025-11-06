import { BaseCommand, type EntityId } from "../core";

export class FireGunTowerCommand extends BaseCommand {
	tower: EntityId;
	constructor(tower: EntityId) {
		super();
		this.tower = tower;
	}
}

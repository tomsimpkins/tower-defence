import { BaseCommand, type EntityId } from "../core";

export class DespawnEntityCommand extends BaseCommand {
	entity: EntityId;
	constructor(entity: EntityId) {
		super();
		this.entity = entity;
	}
}

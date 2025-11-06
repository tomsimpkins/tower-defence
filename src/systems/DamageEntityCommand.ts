import { BaseCommand, type EntityId } from "../core";

export class DamageEntityCommand extends BaseCommand {
	amount: number;
	entity: EntityId;
	constructor(entity: EntityId, amount: number) {
		super();

		this.amount = amount;
		this.entity = entity;
	}
}

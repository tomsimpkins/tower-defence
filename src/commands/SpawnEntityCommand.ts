import { Positioned } from "../components/Positioned";
import { BaseCommand, type Ctor, BaseComponent } from "../core";

export interface ISpawnEntityCommandBuilder<TCmd extends BaseCommand> {
	addComponent<C extends BaseComponent>(type: Ctor<C>, data: C): this;
	build(): TCmd;
}

export class SpawnEntityCommand extends BaseCommand {
	components: [Ctor<BaseComponent>, BaseComponent][];
	constructor(components: [Ctor<BaseComponent>, BaseComponent][]) {
		super();
		this.components = components;
	}

	private static Builder = class
		implements ISpawnEntityCommandBuilder<SpawnEntityCommand>
	{
		private components: Map<Ctor<BaseComponent>, BaseComponent> = new Map();
		addComponent<C extends BaseComponent>(type: Ctor<C>, data: C): this {
			this.components.set(type, data);
			return this;
		}

		build() {
			return new SpawnEntityCommand([...this.components.entries()]);
		}
	};

	static builder(): ISpawnEntityCommandBuilder<SpawnEntityCommand> {
		return new this.Builder();
	}
}

export class RequestSpawnEntityCommand extends BaseCommand {
	positioned: Positioned;
	command: SpawnEntityCommand;
	constructor(
		positioned: Positioned,
		builder: ISpawnEntityCommandBuilder<SpawnEntityCommand>,
	) {
		super();
		this.command = builder.addComponent(Positioned, positioned).build();
		this.positioned = positioned;
	}
}

import type { BaseCommand, Ctor } from "./world";

export class CommandBus {
	private commands: BaseCommand[] = [];
	enqueue(cmd: BaseCommand) {
		this.commands.push(cmd);
	}
	handleCommands<Command extends BaseCommand>(type: Ctor<Command>): Command[] {
		const handled = this.commands.filter(
			(cmd): cmd is Command => cmd instanceof type,
		);
		const notHandled = this.commands.filter(
			(cmd): cmd is Command => !(cmd instanceof type),
		);
		this.commands = notHandled;

		return handled;
	}
}

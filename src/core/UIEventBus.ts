import type { UIEvent } from "./world";

export class UIEventBus {
	private events: UIEvent[] = [];
	enqueueUIEvent(event: UIEvent) {
		this.events.push(event);
	}
	handleUIEvents(): UIEvent[] {
		const events = this.events;
		this.events = [];
		return events;
	}
}

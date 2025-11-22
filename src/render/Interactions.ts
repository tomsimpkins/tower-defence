import type { Point } from "../core/point";
import { UIEventBus } from "../core/UIEventBus";
import { type IStore } from "../store";

export type InteractionsState =
	| {
			type: "inactive";
	  }
	| { type: "down"; pointerId: number; startScreen: Point; startWorld: Point }
	| {
			type: "dragging";
			pointerId: number;
			startScreen: Point;
			startWorld: Point;
			currentWorld: Point;
	  };

export class Interactions {
	private canvas: HTMLCanvasElement;
	private uiEventBus: UIEventBus;

	private dragThresholdPx: number = 5;
	private store: IStore<InteractionsState>;

	constructor(
		canvas: HTMLCanvasElement,
		uiEventBus: UIEventBus,
		store: IStore<InteractionsState>,
	) {
		this.canvas = canvas;
		this.uiEventBus = uiEventBus;
		this.store = store;

		canvas.addEventListener("pointerdown", this.onPointerDown);
		canvas.addEventListener("pointermove", this.onPointerMove);
		canvas.addEventListener("pointerup", this.onPointerUp);
	}

	dispose() {
		this.canvas.removeEventListener("pointerdown", this.onPointerDown);
		this.canvas.removeEventListener("pointermove", this.onPointerMove);
		this.canvas.removeEventListener("pointerup", this.onPointerUp);
	}

	private onPointerDown = (e: PointerEvent) => {
		const state = this.store.getState();
		if (state.type !== "inactive") {
			return;
		}

		if (e.button !== 0) {
			return;
		}

		this.store.setState(() => ({
			type: "down",
			pointerId: e.pointerId,
			startScreen: { x: e.clientX, y: e.clientY },
			startWorld: this.getWorldPos(e),
		}));

		this.canvas.setPointerCapture(e.pointerId);
	};

	private onPointerMove = (e: PointerEvent) => {
		const state = this.store.getState();

		if (state.type === "down" && state.pointerId === e.pointerId) {
			const dx = e.clientX - state.startScreen.x;
			const dy = e.clientY - state.startScreen.y;
			if (dx * dx + dy * dy >= this.dragThresholdPx * this.dragThresholdPx) {
				const { x, y } = this.getWorldPos(e);

				this.store.setState(() => ({
					type: "dragging",
					pointerId: state.pointerId,
					startScreen: state.startScreen,
					startWorld: state.startWorld,
					currentWorld: { x, y },
				}));
			}
		}

		if (state.type === "dragging" && state.pointerId === e.pointerId) {
			const { x, y } = this.getWorldPos(e);
			this.store.setState(() => ({
				type: "dragging",
				pointerId: state.pointerId,
				startScreen: state.startScreen,
				startWorld: state.startWorld,
				currentWorld: { x, y },
			}));
		}
	};

	private onPointerUp = (e: PointerEvent) => {
		const state = this.store.getState();
		const { x, y } = this.getWorldPos(e);
		if (state.type === "down" && e.pointerId === state.pointerId) {
			this.store.setState(() => ({ type: "inactive" }));

			try {
				this.canvas.releasePointerCapture(state.pointerId);
			} catch {}

			// Treat as a click (movement stayed under threshold).
			this.uiEventBus.enqueueUIEvent({
				type: "click",
				x,
				y,
				shift: e.shiftKey,
				alt: e.altKey,
			});
			return;
		}

		if (state.type === "dragging" && e.pointerId === state.pointerId) {
			this.store.setState(() => ({ type: "inactive" }));

			try {
				this.canvas.releasePointerCapture(state.pointerId);
			} catch {}

			this.uiEventBus.enqueueUIEvent({
				type: "dragend",
				startX: state.startWorld.x,
				startY: state.startWorld.y,
				x,
				y,
			});
			return;
		}
	};

	private getWorldPos = (evt: PointerEvent) => {
		const rect = this.canvas.getBoundingClientRect();
		// convert client coords → canvas pixel coords
		const cx = (evt.clientX - rect.left) * (this.canvas.width / rect.width);
		const cy = (evt.clientY - rect.top) * (this.canvas.height / rect.height);
		// invert the camera transform (world → screen is: scale then translate)
		const wx = cx;
		const wy = cy;

		return { x: wx, y: wy };
	};
}

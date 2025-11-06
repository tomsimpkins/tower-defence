import type { World } from "../core";
import type { Point } from "../core/point";

type PointerState =
	| {
			type: "inactive";
	  }
	| { type: "down"; pointerId: number; startScreen: Point; startWorld: Point }
	| {
			type: "dragging";
			pointerId: number;
			startScreen: Point;
			startWorld: Point;
	  };

export class Interactions {
	private canvas: HTMLCanvasElement;
	private world: World;

	private dragThresholdPx: number = 5;
	private state: PointerState = { type: "inactive" };

	constructor(canvas: HTMLCanvasElement, world: World) {
		this.canvas = canvas;
		this.world = world;

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
		if (this.state.type !== "inactive") {
			return;
		}

		if (e.button !== 0) {
			return;
		}

		this.state = {
			type: "down",
			pointerId: e.pointerId,
			startScreen: { x: e.clientX, y: e.clientY },
			startWorld: this.getWorldPos(e),
		};

		this.canvas.setPointerCapture(e.pointerId);
	};

	private onPointerMove = (e: PointerEvent) => {
		const state = this.state;

		if (state.type === "down" && state.pointerId === e.pointerId) {
			const dx = e.clientX - state.startScreen.x;
			const dy = e.clientY - state.startScreen.y;
			if (dx * dx + dy * dy >= this.dragThresholdPx * this.dragThresholdPx) {
				this.state = {
					type: "dragging",
					pointerId: state.pointerId,
					startScreen: state.startScreen,
					startWorld: state.startWorld,
				};

				const { x, y } = this.getWorldPos(e);
				this.world.enqueueUIEvent({
					type: "dragstart",
					startX: state.startWorld.x,
					startY: state.startWorld.y,
					x,
					y,
				});
			}
		}

		if (state.type === "dragging" && state.pointerId === e.pointerId) {
			const { x, y } = this.getWorldPos(e);
			this.world.enqueueUIEvent({
				type: "dragmove",
				startX: state.startWorld.x,
				startY: state.startWorld.y,
				x,
				y,
			});
		}
	};

	private onPointerUp = (e: PointerEvent) => {
		const state = this.state;
		const { x, y } = this.getWorldPos(e);
		if (state.type === "down" && e.pointerId === state.pointerId) {
			this.state = { type: "inactive" };

			try {
				this.canvas.releasePointerCapture(state.pointerId);
			} catch {}

			// Treat as a click (movement stayed under threshold).
			this.world.enqueueUIEvent({
				type: "click",
				x,
				y,
				shift: e.shiftKey,
				alt: e.altKey,
			});
			return;
		}

		if (state.type === "dragging" && e.pointerId === state.pointerId) {
			this.state = { type: "inactive" };

			try {
				this.canvas.releasePointerCapture(state.pointerId);
			} catch {}

			this.world.enqueueUIEvent({
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

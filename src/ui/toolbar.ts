import type { TowerId } from "../domain/towers";
import { makeDispatcher, type IStore, type TowerState } from "../store";

import { towerUiSpecs } from "./towers";

// draw a tower into a small canvas, scaling your draw function
function renderTowerThumb(
	draw: (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		opts?: any,
	) => void,
	size = 28,
	opts?: any,
): HTMLCanvasElement {
	const c = document.createElement("canvas");
	c.width = c.height = size * devicePixelRatio;
	c.style.width = c.style.height = size + "px";
	const ctx = c.getContext("2d")!;
	ctx.scale(devicePixelRatio, devicePixelRatio);
	// center the drawing in the square
	ctx.save();
	ctx.translate(size / 2, size / 2);
	// your tower draw uses a known local size (e.g. 20). Scale accordingly:
	const target = 20; // whatever your function expects
	const s = (size * 0.75) / target; // 75% of the square
	ctx.scale(s, s);
	ctx.translate(-target / 2, -target / 2);
	draw(ctx as any, 0, 0, opts); // call your tower draw
	ctx.restore();
	return c;
}

type TowerAction = { type: "setActiveTower"; active: TowerId };
const towerReducer = (state: TowerState, action: TowerAction): TowerState => {
	switch (action.type) {
		case "setActiveTower": {
			return { ...state, active: action.active };
		}
	}
};

export const mountButton = (towerStore: IStore<TowerState>) => {
	const toolbar = document.getElementById("toolbar")!;
	const actionHandler = makeDispatcher(towerStore, towerReducer);

	const btnById = new Map<TowerId, HTMLButtonElement>();
	const rerender = () => {
		const { active } = towerStore.getState();

		for (const [id, btn] of btnById) {
			const on = id === active;
			btn.classList.toggle("is-active", on);
			btn.setAttribute("aria-checked", String(on));
		}
	};
	towerStore.subscribe(rerender);

	const { active: activeTower } = towerStore.getState();
	for (const t of towerUiSpecs) {
		const btn = document.createElement("button");
		btnById.set(t.id, btn);

		btn.className = "toolbar-btn" + (t.id === activeTower ? " is-active" : "");
		btn.setAttribute("aria-pressed", String(t.id === activeTower));
		btn.title = t.name;

		const thumb = renderTowerThumb(
			(ctx: CanvasRenderingContext2D) =>
				t.draw(ctx, 0, 0, { teamColor: t.teamColor, size: 20 }),
			28,
		);
		thumb.className = "toolbar-thumb";

		const label = document.createElement("span");
		label.textContent = t.name;

		btn.appendChild(thumb);
		btn.appendChild(label);
		btn.addEventListener("click", () => {
			actionHandler({ type: "setActiveTower", active: t.id });
		});

		toolbar.appendChild(btn);
	}
};

import type { World } from "../core";
import { CELL_SIZE, TOWER_SIZE } from "../globals";
import { drawGunTower } from "./renderGunTowers";

// TODO: consolidate with map
const EDGE = "#424856"; // panel edges/highlights
const LIGHT = "#8fa3b8"; // small lit details
const HEALTH_CRIT = "#FF3D57";

// ===== Drag overlay colors (harmonized to your panel + health palettes) =====
const SELECT_FILL = "rgba(143,163,184,0.10)"; // LIGHT @ ~10% alpha
const SELECT_STROKE = LIGHT; // outline matches lit details
const SELECT_EDGE = EDGE; // subtle inner edge

// Optional health-based overrides (hook these up if you compute validity)
// const SELECT_OK = HEALTH_GOOD;                // valid placement
// const SELECT_WARN = HEALTH_WARN;              // borderline
// const SELECT_CRIT = HEALTH_CRIT;              // invalid

// Render a grid-snapped drag rectangle preview
export function renderDragOverlay(world: World, ctx: CanvasRenderingContext2D) {
	const drag = world.resource.drag;
	if (!drag) {
		return;
	}

	const sx = drag.start.x;
	const sy = drag.start.y;
	const cx = drag.current.x;
	const cy = drag.current.y;

	// Normalize start/end
	const x0 = Math.min(sx, cx);
	const y0 = Math.min(sy, cy);
	const x1 = Math.max(sx, cx);
	const y1 = Math.max(sy, cy);

	// Snap to CELL_SIZE boundaries for a true placement preview
	const gx0 = Math.floor(x0 / CELL_SIZE) * CELL_SIZE;
	const gy0 = Math.floor(y0 / CELL_SIZE) * CELL_SIZE;
	const gx1 = Math.ceil(x1 / CELL_SIZE) * CELL_SIZE;
	const gy1 = Math.ceil(y1 / CELL_SIZE) * CELL_SIZE;

	const w = Math.max(0, gx1 - gx0);
	const h = Math.max(0, gy1 - gy0);
	if (w === 0 || h === 0) return;

	// Choose stroke color: default LIGHT, but you can switch based on validation later
	// Example: const validity = world.resource.drag.valid as "ok"|"warn"|"crit" | undefined;
	// let stroke = SELECT_STROKE;
	// if (validity === "ok") stroke = SELECT_OK;
	// else if (validity === "warn") stroke = SELECT_WARN;
	// else if (validity === "crit") stroke = SELECT_CRIT;
	const stroke = SELECT_STROKE;
	const padding = (CELL_SIZE - TOWER_SIZE) / 2;

	ctx.save();

	// A little additive glow helps the outline sit on dark plates/trenches
	ctx.globalCompositeOperation = "lighter";

	// Fill
	ctx.fillStyle = SELECT_FILL;
	ctx.beginPath();
	ctx.rect(gx0, gy0, w, h);
	ctx.fill();

	// Outer dashed outline
	ctx.strokeStyle = stroke;
	ctx.lineWidth = 1;
	ctx.setLineDash([6, 4]);
	ctx.lineJoin = "bevel";
	ctx.lineCap = "butt";
	ctx.stroke();

	// Inner subtle edge to echo your panel bevels
	ctx.setLineDash([2, 2]);
	ctx.strokeStyle = SELECT_EDGE;
	// Inset by 1px to avoid blending with the outer dash
	ctx.strokeRect(gx0 + 1, gy0 + 1, Math.max(0, w - 2), Math.max(0, h - 2));

	// Cell guides for placement (lightweight grid inside the rect)
	ctx.setLineDash([]);
	ctx.globalAlpha = 0.35;
	ctx.strokeStyle = EDGE;
	// Vertical cell lines
	for (let x = gx0 + CELL_SIZE; x < gx1; x += CELL_SIZE) {
		ctx.beginPath();
		ctx.moveTo(x + 0.5, gy0);
		ctx.lineTo(x + 0.5, gy1);
		ctx.stroke();
	}
	// Horizontal cell lines
	for (let y = gy0 + CELL_SIZE; y < gy1; y += CELL_SIZE) {
		ctx.beginPath();
		ctx.moveTo(gx0, y + 0.5);
		ctx.lineTo(gx1, y + 0.5);
		ctx.stroke();
	}

	ctx.globalAlpha = 0.6;
	for (let x = gx0; x < gx1; x += CELL_SIZE) {
		for (let y = gy0; y < gy1; y += CELL_SIZE) {
			const occupied = world.resource.grid.isOccupied(
				(x / CELL_SIZE) | 0,
				(y / CELL_SIZE) | 0,
			);

			// Draw tower faintly
			ctx.save();
			ctx.globalAlpha = occupied ? 0.4 : 0.6;
			drawGunTower(ctx, x + padding, y + padding);
			ctx.restore();

			// Add red fade for occupied cells
			if (occupied) {
				ctx.save();
				ctx.globalCompositeOperation = "source-atop";
				const g = ctx.createLinearGradient(x, y, x, y + CELL_SIZE);
				g.addColorStop(0, "rgba(255,61,87,0.85)");
				g.addColorStop(1, "rgba(255,61,87,0.35)");
				ctx.fillStyle = g;
				ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
				ctx.restore();

				// Optional: faint outline to reinforce blocked cells
				ctx.save();
				ctx.globalAlpha = 0.4;
				ctx.strokeStyle = HEALTH_CRIT;
				ctx.lineWidth = 1;
				ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
				ctx.restore();
			}
		}
	}

	ctx.restore();
}

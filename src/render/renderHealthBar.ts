import { Health } from "../components/Health";
import { HitCircle } from "../components/Hitbox";
import { Positioned } from "../components/Positioned";
import type { RendererFn } from "./canvasRenderer";

const HEALTH_GOOD = "#37FF8B"; // bright green-cyan
const HEALTH_WARN = "#FFCF3D"; // golden yellow (warm pop)
const HEALTH_CRIT = "#FF3D57"; // vivid magenta-red
const HEALTH_BG = "rgba(0,0,0,0.6)"; // subtle black backing
const HEALTH_BORDER = "rgba(255,255,255,0.25)"; // soft edge for legibility

export const renderHealthBar: RendererFn = (world, ctx) => {
	const entities = world.query(Positioned, Health, HitCircle);
	for (const entityId of entities) {
		const { offsetX, offsetY, radius } = world.mustGetComponent(
			HitCircle,
			entityId,
		);
		const { x, y } = world.mustGetComponent(Positioned, entityId);
		const { health, maxHealth } = world.mustGetComponent(Health, entityId);

		if (health === maxHealth) {
			continue;
		}

		const barH = 3;
		const padding = 4;
		const hx = x + offsetX - radius;
		const hy = y + offsetY - radius - barH - padding;

		const pct = Math.max(0, Math.min(1, health / maxHealth));
		let color = pct > 0.6 ? HEALTH_GOOD : pct > 0.3 ? HEALTH_WARN : HEALTH_CRIT;

		ctx.fillStyle = HEALTH_BG;
		ctx.fillRect(hx - 1, hy - 1, 2 * radius + 2, barH + 2);

		ctx.fillStyle = color;
		ctx.fillRect(hx, hy, Math.floor(2 * radius * pct), barH);
	}
};

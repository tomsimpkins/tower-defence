import type { TowerId } from "../domain/towers";
import { drawBeamTower } from "../render/drawBeamTower";
import { drawGunTower } from "../render/drawGunTower";
import { drawMortarTower } from "../render/drawMortarTower";

type TowerUiSpec = {
	id: TowerId;
	name: string;
	teamColor: string;
	draw: (ctx: any, x: number, y: number, opts?: any) => void; // e.g. drawGunTower
};

const towerUiSpecsById: Record<TowerId, TowerUiSpec> = {
	gun: {
		id: "gun",
		name: "Gun",
		teamColor: "#cfe8ff",
		draw: (ctx, x, y, opts) => drawGunTower(ctx, x, y, opts),
	},
	beam: {
		id: "beam",
		name: "Beam",
		teamColor: "#87e6ff",
		draw: (ctx, x, y, opts) => drawBeamTower(ctx, x, y, opts),
	},
	mortar: {
		id: "mortar",
		name: "Mortar",
		teamColor: "#87e6ff",
		draw: (ctx, x, y, opts) => drawMortarTower(ctx, x, y, opts),
	},
};

export const towerUiSpecs = Object.values(towerUiSpecsById);
export const getTowerUiSpec = (id: TowerId): TowerUiSpec =>
	towerUiSpecsById[id];

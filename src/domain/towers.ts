import { makeSpawnBeamTowerCommand } from "../commands/SpawnBeamTowerCommand";
import { makeSpawnGunTowerCommand } from "../commands/SpawnGunTowerCommand";
import { makeSpawnMortarTowerCommand } from "../commands/SpawnMortarTowerCommand";
import type { BaseCommand } from "../core";

export type TowerId = "gun" | "beam" | "mortar";

export type TowerDomainSpec = {
	id: TowerId;
	spawnCommand: (x: number, y: number) => BaseCommand;
};
const towerDomainSpecsById: Record<TowerId, TowerDomainSpec> = {
	gun: {
		id: "gun",
		spawnCommand: (x: number, y: number) => makeSpawnGunTowerCommand(x, y),
	},
	beam: {
		id: "beam",
		spawnCommand: (x: number, y: number) => makeSpawnBeamTowerCommand(x, y),
	},
	mortar: {
		id: "mortar",
		spawnCommand: (x: number, y: number) => makeSpawnMortarTowerCommand(x, y),
	},
};
export const towerDomainSpecs = Object.values(towerDomainSpecsById);
export const getTowerDomainSpec = (id: TowerId): TowerDomainSpec =>
	towerDomainSpecsById[id];

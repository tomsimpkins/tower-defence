import { scale } from "./../core/point";
import { BaseSystem, type World } from "../core";

import { makeSpawnBeamTowerCommand } from "../commands/SpawnBeamTowerCommand";
import { makeSpawnEnemyCommand } from "../commands/SpawnEnemyCommand";
import { makeSpawnGunTowerCommand } from "../commands/SpawnGunTowerCommand";
import { CELL_SIZE } from "../globals";
import { normal } from "../core/point";
import type { UIEventBus } from "../core/UIEventBus";
import type { Store } from "../store";
import { getTowerDomainSpec } from "../domain/towers";

export class ProcessUiEventsSystem extends BaseSystem {
	private store: Store;
	private uiEventBus: UIEventBus;
	constructor(store: Store, uiEventBus: UIEventBus) {
		super();
		this.store = store;
		this.uiEventBus = uiEventBus;
	}

	execute(world: World): void {
		for (const event of this.uiEventBus.handleUIEvents()) {
			switch (event.type) {
				case "click": {
					if (event.shift) {
						world.enqueueCommand(makeSpawnBeamTowerCommand(event.x, event.y));
					} else if (event.alt) {
						world.enqueueCommand(makeSpawnGunTowerCommand(event.x, event.y));
					} 
					break;
				}

				case "dragend": {
					const { x: endX, y: endY, startX, startY } = event;
					const [sx, ex] = startX <= endX ? [startX, endX] : [endX, startX];
					const [sy, ey] = startY <= endY ? [startY, endY] : [endY, startY];
					const gx0 = Math.floor(sx / CELL_SIZE) * CELL_SIZE;
					const gy0 = Math.floor(sy / CELL_SIZE) * CELL_SIZE;

					const towerType = this.store.getState().tower.active;
					const towerDef = getTowerDomainSpec(towerType);
					for (let x = gx0; x < ex; x += CELL_SIZE) {
						for (let y = gy0; y < ey; y += CELL_SIZE) {
							world.enqueueCommand(towerDef.spawnCommand(x, y));
						}
					}
					break;
				}
			}
		}
	}
}

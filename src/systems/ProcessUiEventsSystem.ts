import { scale } from "./../core/point";
import { BaseSystem, type World } from "../core";

import { makeSpawnBeamTowerCommand } from "../commands/SpawnBeamTowerCommand";
import { makeSpawnEnemyCommand } from "../commands/SpawnEnemyCommand";
import { makeSpawnGunTowerCommand } from "../commands/SpawnGunTowerCommand";
import { CELL_SIZE } from "../globals";
import { normal } from "../core/point";

export class ProcessUiEventsSystem extends BaseSystem {
	execute(world: World): void {
		for (const event of world.handleUIEvents()) {
			switch (event.type) {
				case "click": {
					if (event.shift) {
						world.enqueueCommand(makeSpawnBeamTowerCommand(event.x, event.y));
					} else if (event.alt) {
						world.enqueueCommand(makeSpawnGunTowerCommand(event.x, event.y));
					} else {
						for (let i = 0; i < 100; i++) {
							const vel = scale(
								50,
								normal({ x: Math.random() - 0.5, y: Math.random() - 0.5 }),
							);
							world.enqueueCommand(makeSpawnEnemyCommand(event, vel).build());
						}
					}
					break;
				}
				case "dragstart": {
					const { x, y, startX, startY } = event;

					world.resource.drag = {
						start: { x: startX, y: startY },
						current: { x, y },
						tower: "gun",
						type: "placement",
					};
					break;
				}
				case "dragmove": {
					const { x, y, startX, startY } = event;

					world.resource.drag = {
						start: { x: startX, y: startY },
						current: { x, y },
						tower: "gun",
						type: "placement",
					};
					break;
				}
				case "dragend": {
					world.resource.drag = undefined;

					const { x: endX, y: endY, startX, startY } = event;
					const [sx, ex] = startX <= endX ? [startX, endX] : [endX, startX];
					const [sy, ey] = startY <= endY ? [startY, endY] : [endY, startY];
					const gx0 = Math.floor(sx / CELL_SIZE) * CELL_SIZE;
					const gy0 = Math.floor(sy / CELL_SIZE) * CELL_SIZE;

					for (let x = gx0; x < ex; x += CELL_SIZE) {
						for (let y = gy0; y < ey; y += CELL_SIZE) {
							world.enqueueCommand(makeSpawnGunTowerCommand(x, y));
						}
					}
					break;
				}
			}
		}
	}
}

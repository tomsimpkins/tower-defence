import { BaseSystem, type EntityId, type World } from "../core";
import { EnemyTag } from "../components/EnemyTag";
import { Positioned } from "../components/Positioned";
import { Targeting } from "../components/Targeting";
import { TargetingMode } from "../components/TargetingMode";
import { MaxRange } from "../components/MaxRange";
import { MinRange } from "../components/MinRange";
import { Health } from "../components/Health";

export class TowerTargetingSystem extends BaseSystem {
	execute(world: World): void {
		const towerEntities = world.query(
			Positioned,
			Targeting,
			TargetingMode,
			MaxRange,
		);

		const towerComponents = towerEntities.map<
			[EntityId, Positioned, Targeting, TargetingMode, MaxRange, MinRange]
		>((entityId) => [
			entityId,
			world.mustGetComponent<Positioned>(Positioned, entityId),
			world.mustGetComponent<Targeting>(Targeting, entityId),
			world.mustGetComponent<TargetingMode>(TargetingMode, entityId),
			world.mustGetComponent<MaxRange>(MaxRange, entityId),
			world.mustGetComponent<MinRange>(MinRange, entityId),
		]);

		const enemyEntities = world.query(EnemyTag, Positioned, Health);
		const enemyPositions = enemyEntities.map<[EntityId, Positioned, Health]>(
			(entityId) => [
				entityId,
				world.mustGetComponent<Positioned>(Positioned, entityId),
				world.mustGetComponent<Health>(Health, entityId),
			],
		);

		const distance = (
			v1: { x: number; y: number },
			v2: { x: number; y: number },
		) => Math.hypot(v1.x - v2.x, v1.y - v2.y);

		for (const [
			,
			towerPosition,
			towerTargeting,
			targetingMode,
			maxRange,
			minRange,
		] of towerComponents) {
			towerTargeting.target = null;

			switch (targetingMode.mode) {
				case "closest": {
					let bestLink: EntityId | null = null;
					let bestDistance = Infinity;

					for (const [enemy, enemyPosition] of enemyPositions) {
						const d = distance(towerPosition, enemyPosition);
						if (d > maxRange.range || d < minRange.range) {
							continue;
						}

						if (d < bestDistance) {
							bestDistance = d;
							bestLink = enemy;
						}

						towerTargeting.target = bestLink;
					}
					break;
				}
				case "furthest": {
					let bestLink: EntityId | null = null;
					let bestDistance = -Infinity;

					for (const [enemy, enemyPosition] of enemyPositions) {
						const d = distance(towerPosition, enemyPosition);
						if (d > maxRange.range || d < minRange.range) {
							continue;
						}

						if (d > bestDistance) {
							bestDistance = d;
							bestLink = enemy;
						}

						towerTargeting.target = bestLink;
					}
					break;
				}
				case "highestHealth": {
					let bestLink: EntityId | null = null;
					let bestHealth = -Infinity;

					for (const [enemy, enemyPosition, enemyHealth] of enemyPositions) {
						const d = distance(towerPosition, enemyPosition);
						if (d > maxRange.range) {
							continue;
						}

						if (enemyHealth.health > bestHealth) {
							bestHealth = d;
							bestLink = enemy;
						}

						towerTargeting.target = bestLink;
					}
					break;
				}
				case "lowestHealth": {
					let bestLink: EntityId | null = null;
					let bestHealth = -Infinity;

					for (const [enemy, enemyPosition, enemyHealth] of enemyPositions) {
						const d = distance(towerPosition, enemyPosition);
						if (d > maxRange.range) {
							continue;
						}

						if (enemyHealth.health < bestHealth) {
							bestHealth = d;
							bestLink = enemy;
						}

						towerTargeting.target = bestLink;
					}
					break;
				}
			}
		}
	}
}

import { addPoints } from "./../core/point";
import { Aim } from "../components/Aim";
import { GunWeapon } from "../components/GunWeapon";
import { Health } from "../components/Health";
import { MaxRange } from "../components/MaxRange";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import { Targeting } from "../components/Targeting";
import { TargetingMode } from "../components/TargetingMode";
import { TowerTag } from "../components/TowerTag";
import { BaseSystem, World, type EntityId } from "../core";

import { TOWER_SIZE } from "../globals";
import { CenterPoint } from "../commands/SpawnEnemyCommand";
import { FireGunTowerCommand } from "./FireGunTowerCommand";

type Vec = { x: number; y: number };

function dot(a: Vec, b: Vec) {
	return a.x * b.x + a.y * b.y;
}

function predictBulletVelocity(
	towerPosition: Vec,
	enemyPosition: Vec,
	enemyVelocity: Vec,
	bulletSpeed: number,
): [Vec, number] | null {
	const s = bulletSpeed;
	const r = {
		x: enemyPosition.x - towerPosition.x,
		y: enemyPosition.y - towerPosition.y,
	};
	const v = enemyVelocity;

	const a = dot(v, v) - s * s;
	const b = 2 * dot(r, v);
	const c = dot(r, r);

	let t: number | null = null;

	// Handle near-linear case (a ≈ 0): s ≈ |v|
	if (Math.abs(a) < 1e-8) {
		if (Math.abs(b) < 1e-8) return null; // no relative motion or impossible
		t = -c / b; // single root
		if (t <= 0) return null;
	} else {
		const disc = b * b - 4 * a * c;
		if (disc < 0) return null; // no real intercept
		const sqrt = Math.sqrt(disc);
		const t1 = (-b - sqrt) / (2 * a);
		const t2 = (-b + sqrt) / (2 * a);
		// choose the earliest positive time
		t = t1 > 0 && t2 > 0 ? Math.min(t1, t2) : t1 > 0 ? t1 : t2 > 0 ? t2 : null;
		if (t == null) return null;
	}

	// Intercept point
	const px = enemyPosition.x + enemyVelocity.x * t;
	const py = enemyPosition.y + enemyVelocity.y * t;

	// Bullet velocity: (P - T) / t
	return [{ x: (px - towerPosition.x) / t, y: (py - towerPosition.y) / t }, t];
}

export class GunAimingSystem extends BaseSystem {
	execute(world: World): void {
		const towerEntities = world.query(
			Positioned,
			TowerTag,
			GunWeapon,
			Targeting,
			Aim,
			CenterPoint,
		);
		const towerComponents = towerEntities.map<
			[
				EntityId,
				Positioned,
				Targeting,
				TargetingMode,
				MaxRange,
				GunWeapon,
				Aim,
				CenterPoint,
			]
		>((entityId) => [
			entityId,
			world.mustGetComponent<Positioned>(Positioned, entityId),
			world.mustGetComponent<Targeting>(Targeting, entityId),
			world.mustGetComponent<TargetingMode>(TargetingMode, entityId),
			world.mustGetComponent<MaxRange>(MaxRange, entityId),
			world.mustGetComponent<GunWeapon>(GunWeapon, entityId),
			world.mustGetComponent<Aim>(Aim, entityId),
			world.mustGetComponent<CenterPoint>(CenterPoint, entityId),
		]);

		for (const [
			towerId,
			towerPosition,
			towerTargeting,
			,
			maxRange,
			gunWeapon,
			aim,
			center,
		] of towerComponents) {
			if (towerTargeting.target === null) {
				continue;
			}

			const [, enemyPosition, , enemyMoving, enemyAimPoint] = [
				towerTargeting.target,
				world.mustGetComponent<Positioned>(Positioned, towerTargeting.target),
				world.mustGetComponent<Health>(Health, towerTargeting.target),
				world.mustGetComponent<Moving>(Moving, towerTargeting.target),
				world.mustGetComponent<CenterPoint>(CenterPoint, towerTargeting.target),
			];

			const { offsetX, offsetY } = center;
			const towerCentre = {
				x: towerPosition.x + offsetX + TOWER_SIZE / 2,
				y: towerPosition.y + offsetY + TOWER_SIZE / 2,
			};

			const enemyCentre = addPoints(
				{ x: enemyPosition.x, y: enemyPosition.y },
				{ x: enemyAimPoint.offsetX, y: enemyAimPoint.offsetY },
			);

			const bulletVelocityPrediction = predictBulletVelocity(
				towerCentre,
				enemyCentre,
				{ x: enemyMoving.vx, y: enemyMoving.vy },
				gunWeapon.projectileSpeed,
			);
			if (bulletVelocityPrediction === null) {
				continue;
			}

			const [bulletVelocity, intersectionTime] = bulletVelocityPrediction;
			if (intersectionTime * gunWeapon.projectileSpeed > maxRange.range) {
				continue;
			}

			aim.velocity = bulletVelocity;

			world.enqueueCommand(new FireGunTowerCommand(towerId));
		}
	}
}

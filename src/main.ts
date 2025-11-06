import { startLoop } from "./core/loop.ts";
import { BaseSystem, Grid, World } from "./core/world.ts";
import { Road } from "./core/Road.ts";
import { HitTestMap } from "./core/HitTestMap.ts";
import { Renderer } from "./render/canvasRenderer.ts";
import { renderBullets } from "./render/renderBullets.ts";
import { renderGunTowers } from "./render/renderGunTowers.ts";
import { renderBeamTowers } from "./render/renderBeamTowers.ts";
import { renderBeams } from "./render/renderBeams.ts";
import { renderEnemies } from "./render/renderEnemies.ts";
import { EnemyCleanupSystem } from "./commands/EnemyCleanupSystem.ts";

import { MoveSystem } from "./systems/MoveSystem.ts";
import { TowerTargetingSystem } from "./systems/TowerTargetingSystem.ts";
import { BeamWeaponDamageSystem } from "./systems/BeamWeaponDamageSystem.ts";
import { CleanupTargetsSystem } from "./systems/CleanupTargetsSystem.ts";
import { DamageResolutionSystem } from "./systems/DamageResolutionSystem.ts";
import { GunAimingSystem } from "./systems/GunAimingSystem.ts";
import { CooldownSystem } from "./systems/CooldownSystem.ts";
import { GunWeaponFiringSystem } from "./systems/GunWeaponFiringSystem.ts";
import { BulletCleanupSystem } from "./systems/BulletCleanupSystem.ts";

import { SpawnEntitySystem } from "./systems/SpawnEntitySystem.ts";
import { DespawnEntitySystem } from "./systems/DespawnEntitySystem.ts";
import { BuildHitTestMapSystem } from "./systems/BuildHitTestMapSystem.ts";
import { MaxDistanceTravelableSystem } from "./systems/MaxDistanceTravelableSystem.ts";

import { renderMap } from "./core/renderMap.ts";

import {
	CANVAS_SIZE,
	CELL_SIZE,
	ENEMY_SIZE,
	GRID_HEIGHT,
	GRID_WIDTH,
} from "./globals.ts";
import { renderRoad } from "./render/renderRoad.ts";
import { renderHealthBar } from "./render/renderHealthBar.ts";
import { EnemyTag } from "./components/EnemyTag.ts";
import { makeSpawnEnemyCommand } from "./commands/SpawnEnemyCommand.ts";
import { randomWalk } from "./core/randomWalk.ts";
import { rand } from "./core/mulberry32.ts";
import { SpawnEntityInGridSystem } from "./systems/SpawnEntityInGridSystem.ts";
import { ProcessUiEventsSystem } from "./systems/ProcessUiEventsSystem.ts";
import { renderDragOverlay } from "./render/renderDragRect.ts";
import { addPoints, scale } from "./core/point.ts";
import { FollowWaypoints } from "./components/FollowRoad.ts";
import { FollowWaypointsSystem } from "./systems/FollowWaypointsSystem.ts";

const grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
const roadPoints = randomWalk(
	{ w: grid.w, h: grid.h },
	{ x: Math.floor(grid.w / 2), y: 0 },
	{ x: grid.w - 1, y: grid.h - 1 },
	rand,
);
roadPoints.forEach(({ x, y }) => grid.setRoad(x, y));
const road = new Road(roadPoints);

const world = new World({
	map: { width: CANVAS_SIZE, height: CANVAS_SIZE },
	hitTestMap: new HitTestMap(),
	diagnotics: {},
	wallTime: 0,
	grid,
	road,
	drag: undefined,
});

// handle ui events
world.addSystem(new ProcessUiEventsSystem());

// execute commands (origjnally from the UI which spawn entities)
world.addSystem(new SpawnEntityInGridSystem());
world.addSystem(new SpawnEntitySystem());

// physics: moving system
world.addSystem(new MoveSystem());
world.addSystem(new FollowWaypointsSystem());

world.addSystem(new BuildHitTestMapSystem());

// work out which enemy is closest/furthest/lowest/highest health and set it as the target
world.addSystem(new TowerTargetingSystem());

// enqueue damage to enemies from beam towers
world.addSystem(new BeamWeaponDamageSystem());

// aim the gun towers at enemies: work out the path of the enemy and the required velocity of the bullet
world.addSystem(new GunAimingSystem());
// decrement the cooldown by dt
world.addSystem(new CooldownSystem());
// if the cooldown is zero, fire the bullet at the aimed velocity (enqueue bullet spawn)
world.addSystem(new GunWeaponFiringSystem());

// spawn any created bullets straight away
world.addSystem(new SpawnEntitySystem());

// apply damage from damage events, enqueue despawn if health depleted
world.addSystem(new DamageResolutionSystem());

// enqueue despawn for enemy and bullets
world.addSystem(new EnemyCleanupSystem());
world.addSystem(new BulletCleanupSystem());
world.addSystem(new MaxDistanceTravelableSystem());

// handle despawn commands
world.addSystem(new DespawnEntitySystem());

class EnemyWaveSystem extends BaseSystem {
	execute(world: World): void {
		const enemyEntities = world.query(EnemyTag);
		const targetEnemyCount = 200;

		const enemiesToCreate = Math.max(
			0,
			targetEnemyCount - enemyEntities.length,
		);
		const road = world.resource.road;
		const roadStart = road.points[0];

		const roadNext = road.points[1];

		const margin = (CELL_SIZE - ENEMY_SIZE) / 2;
		const pos = addPoints(world.gridToWorld(roadStart), {
			x: margin,
			y: margin,
		});

		const dirX = Math.sign(roadNext.x - roadStart.x);
		const dirY = Math.sign(roadNext.y - roadStart.y);
		const vel = scale(50, { x: dirX, y: dirY });
		const corners = road.waypoints.map((corner) =>
			addPoints(world.gridToWorld(corner), {
				x: CELL_SIZE / 2,
				y: CELL_SIZE / 2,
			}),
		);

		for (let i = 0; i < enemiesToCreate; i++) {
			world.enqueueCommand(
				makeSpawnEnemyCommand(pos, vel)
					.addComponent(FollowWaypoints, new FollowWaypoints(corners))
					.build(),
			);
		}
	}
}
world.addSystem(new EnemyWaveSystem());
world.addSystem(new SpawnEntitySystem());

// fix dangling references
world.addSystem(new CleanupTargetsSystem());

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const renderer = new Renderer(canvas, world);

renderer.addRenderer(renderMap);
renderer.addRenderer(renderRoad);

renderer.addRenderer(renderBeamTowers);

renderer.addRenderer(renderGunTowers);
renderer.addRenderer(renderEnemies);
renderer.addRenderer(renderBullets);
renderer.addRenderer(renderBeams);
renderer.addRenderer(renderHealthBar);
renderer.addRenderer(renderDragOverlay);
// renderer.addRenderer(renderDiagnostics);

startLoop(world, (world) => renderer.render(world));

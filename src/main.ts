import { startLoop } from "./core/loop.ts";
import { Grid, World } from "./core/world.ts";
import { Road } from "./core/Road.ts";
import { HitTestMap } from "./core/HitTestMap.ts";
import { Renderer } from "./render/canvasRenderer.ts";
import { renderBullets } from "./render/renderBullets.ts";
import { renderGunTowers } from "./render/renderGunTowers.ts";
import { renderBeamTowers } from "./render/renderBeamTowers.ts";
import { renderBeams } from "./render/renderBeams.ts";
import { renderEnemies } from "./render/renderEnemies.ts";
import { EnemyCleanupSystem } from "./systems/EnemyCleanupSystem.ts";

import { MoveSystem } from "./systems/MoveSystem.ts";
import { TowerTargetingSystem } from "./systems/TowerTargetingSystem.ts";
import { BeamWeaponDamageSystem } from "./systems/BeamWeaponDamageSystem.ts";
import { CleanupTargetsSystem } from "./systems/CleanupTargetsSystem.ts";
import { DamageResolutionSystem } from "./systems/DamageResolutionSystem.ts";
import { GunAimingSystem } from "./systems/GunAimingSystem.ts";
import { CooldownSystem } from "./systems/CooldownSystem.ts";
import { ProjectileWeaponFiringSystem } from "./systems/GunWeaponFiringSystem.ts";
import { BulletCleanupSystem } from "./systems/BulletCleanupSystem.ts";

import { SpawnEntitySystem } from "./systems/SpawnEntitySystem.ts";
import { DespawnEntitySystem } from "./systems/DespawnEntitySystem.ts";
import { BuildHitTestMapSystem } from "./systems/BuildHitTestMapSystem.ts";
import {
	BulletEnemyIntersectionSystem,
	DamageEntityInCircleSystem,
} from "./systems/BulletEnemyIntersectionSystem.ts";
import { MaxDistanceTravelableSystem } from "./systems/MaxDistanceTravelableSystem.ts";

import { renderMap } from "./core/renderMap.ts";

import {
	CANVAS_SIZE,
	GRID_HEIGHT,
	GRID_WIDTH,
} from "./globals.ts";
import { renderRoad } from "./render/renderRoad.ts";
import { renderHealthBar } from "./render/renderHealthBar.ts";

import { randomWalk } from "./core/randomWalk.ts";
import { rand } from "./core/mulberry32.ts";
import { SpawnEntityInGridSystem } from "./systems/SpawnEntityInGridSystem.ts";
import { ProcessUiEventsSystem } from "./systems/ProcessUiEventsSystem.ts";

import { renderDragOverlay } from "./render/renderDragRect.ts";
import { FollowWaypointsSystem } from "./systems/FollowWaypointsSystem.ts";
import { storeFactory, subStore, type State } from "./store.ts";
import { CommandBus } from "./core/CommandBus.ts";
import { UIEventBus } from "./core/UIEventBus.ts";
import { mountButton } from "./ui/toolbar.ts";
import { renderMortarTowers } from "./render/renderMortarTowers.ts";
import { renderMortarShells } from "./render/renderMortarShells.ts";
import { ElevationSystem } from "./systems/ElevationSystem.ts";
import {

	MortarShellExplosionSystem,
} from "./systems/MortarShellExplosionSystem.ts";

import { TimedLifetimeSystem } from "./systems/TimedLifetimeSystem.ts";
import { renderPlasmaExplosions } from "./render/drawPlasmaExplosion.ts";
import { EnemyWaveSystem } from "./systems/EnemyWaveSystem.ts"
import { renderDiagnostics } from "./render/renderDiagnostics.ts";

export const store = storeFactory<State>({
	tower: { active: "gun" },
	interactions: { type: "inactive" },
});

const commandBus = new CommandBus();
const uiEventBus = new UIEventBus();

const grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
const roadPoints = randomWalk(
	{ w: grid.w, h: grid.h },
	{ x: Math.floor(grid.w / 2), y: 0 },
	{ x: grid.w - 1, y: grid.h - 1 },
	rand,
);
roadPoints.forEach(({ x, y }) => grid.setRoad(x, y));
const road = new Road(roadPoints);

const world = new World(
	{
		map: { width: CANVAS_SIZE, height: CANVAS_SIZE },
		hitTestMap: new HitTestMap(),
		grid,
		road,
		ui: { wallTime: 0 },
	},
	commandBus,
);

// handle ui events
world.addSystem(new ProcessUiEventsSystem(store, uiEventBus));

// execute commands (origjnally from the UI which spawn entities)
world.addSystem(new SpawnEntityInGridSystem());
world.addSystem(new SpawnEntitySystem());

// physics: moving system
world.addSystem(new MoveSystem());
world.addSystem(new FollowWaypointsSystem());
world.addSystem(new ElevationSystem());

world.addSystem(new BuildHitTestMapSystem());
world.addSystem(new BulletEnemyIntersectionSystem());
world.addSystem(new DamageEntityInCircleSystem());

// work out which enemy is closest/furthest/lowest/highest health and set it as the target
world.addSystem(new TowerTargetingSystem());

// enqueue damage to enemies from beam towers
world.addSystem(new BeamWeaponDamageSystem());

// aim the gun towers at enemies: work out the path of the enemy and the required velocity of the bullet
world.addSystem(new GunAimingSystem());
// decrement the cooldown by dt
world.addSystem(new CooldownSystem());
// if the cooldown is zero, fire the bullet at the aimed velocity (enqueue bullet spawn)
world.addSystem(new ProjectileWeaponFiringSystem());

world.addSystem(new MortarShellExplosionSystem());

// spawn any created bullets straight away
world.addSystem(new SpawnEntitySystem());

// apply damage from damage events, enqueue despawn if health depleted
world.addSystem(new DamageResolutionSystem());

// enqueue despawn for enemy and bullets
world.addSystem(new TimedLifetimeSystem());
world.addSystem(new EnemyCleanupSystem());
world.addSystem(new BulletCleanupSystem());
world.addSystem(new MaxDistanceTravelableSystem());

// handle despawn commands
world.addSystem(new DespawnEntitySystem());

world.addSystem(new EnemyWaveSystem());
world.addSystem(new SpawnEntitySystem());

// fix dangling references
world.addSystem(new CleanupTargetsSystem());

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const renderer = new Renderer(
	canvas,
	uiEventBus,
	subStore(store, "interactions"),
);

renderer.addRenderer(renderMap);
renderer.addRenderer(renderRoad);

renderer.addRenderer(renderBeamTowers);

renderer.addRenderer(renderMortarTowers);

renderer.addRenderer(renderGunTowers);
renderer.addRenderer(renderEnemies);
renderer.addRenderer(renderPlasmaExplosions);
renderer.addRenderer(renderBullets);
renderer.addRenderer(renderMortarShells);
renderer.addRenderer(renderBeams);
renderer.addRenderer(renderHealthBar);
renderer.addRenderer(renderDragOverlay(store));
renderer.addRenderer(renderDiagnostics);

mountButton(subStore(store, "tower"));

startLoop(world, (world) => renderer.render(world));

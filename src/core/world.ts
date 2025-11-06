import { CELL_SIZE } from "../globals";
import type { HitTestMap } from "./HitTestMap";
import { scale, type Point } from "./point";
import type { Road } from "./Road";

export type EntityId = number;

export abstract class BaseCommand {
	protected constructor() {}
}

export type UIEvent =
	| {
			type: "click";
			x: number;
			y: number;
			shift: boolean;
			alt: boolean;
	  }
	| { type: "dragend"; x: number; y: number; startX: number; startY: number }
	| { type: "dragstart"; x: number; y: number; startX: number; startY: number }
	| { type: "dragmove"; x: number; y: number; startX: number; startY: number };

export type Ctor<C extends BaseComponent> = new (...args: any[]) => C;

export type Diagnostics = {};

export const gridDatas = {
	empty: -1,
	road: 0,
	tower: 1,
} as const;
type GridDatas = typeof gridDatas;
type GridDatasValue = GridDatas[keyof GridDatas];

export class Grid {
	w: number;
	h: number;
	private data: (typeof gridDatas)[keyof typeof gridDatas][];
	constructor(w: number, h: number) {
		this.w = w;
		this.h = h;
		this.data = Array.from({ length: w * h }, () => -1);
	}

	private toIndex(gx: number, gy: number) {
		return (gy * this.w + gx) | 0;
	}

	private toPoint(gi: number): Point {
		return { x: (gi / this.w) | 0, y: gi % this.w };
	}

	setRoad(gx: number, gy: number) {
		const gi = this.toIndex(gx | 0, gy | 0);
		this.data[gi] = gridDatas.road;
	}

	setTower(gx: number, gy: number) {
		const gi = this.toIndex(gx | 0, gy | 0);
		this.data[gi] = gridDatas.tower;
	}

	isOccupied(gx: number, gy: number): boolean {
		return this.inBounds(gx, gy) && this.data[this.toIndex(gx, gy)] !== -1;
	}

	inBounds(gx: number, gy: number): boolean {
		return gx >= 0 && gx < this.w && gy >= 0 && gy < this.h;
	}

	getByType(type: GridDatasValue): Point[] {
		return this.data
			.map((v, i) => [v, i])
			.filter(([v]) => v === type)
			.map(([, gi]) => this.toPoint(gi));
	}
}

export interface DragPlacement {
	type: "placement";
	tower: "gun";
	start: Point;
	current: Point;
}
export type WorldResource = {
	map: { width: number; height: number };
	hitTestMap: HitTestMap;
	diagnotics: Diagnostics;
	wallTime: number;
	grid: Grid;
	road: Road;
	drag: DragPlacement | undefined;
};

export class World {
	private entities: Set<EntityId>;
	private components: Map<Ctor<BaseComponent>, Map<EntityId, BaseComponent>>;
	private systems: BaseSystem[];
	private commands: BaseCommand[];
	private events: UIEvent[];

	readonly resource: WorldResource;

	constructor(resource: WorldResource) {
		this.entities = new Set();
		this.components = new Map();
		this.systems = [];
		this.commands = [];
		this.events = [];

		this.resource = resource;
	}

	gridToWorld = (point: Point): Point => scale(CELL_SIZE, point);
	worldToGrid = (point: Point): Point => ({
		x: (point.x / CELL_SIZE) | 0,
		y: (point.y / CELL_SIZE) | 0,
	});

	private lastEntityId = 1;
	private makeEntityId(): EntityId {
		return this.lastEntityId++;
	}

	addSystem(system: BaseSystem) {
		this.systems.push(system);
	}

	createEntity(): EntityId {
		const id = this.makeEntityId();
		this.entities.add(id);
		return id;
	}

	destroyEntity(entityId: EntityId) {
		if (!this.entities.has(entityId)) {
			return;
		}

		this.entities.delete(entityId);
		this.components.forEach((map) => map.delete(entityId));
	}

	entityIsAlive(entityId: EntityId) {
		return this.entities.has(entityId);
	}

	addComponent<Component extends BaseComponent>(
		entity: EntityId,
		type: Ctor<Component>,
		data: Component,
	) {
		if (!this.components.has(type)) {
			this.components.set(type, new Map());
		}

		this.components.get(type)!.set(entity, data);
	}

	query(...types: Ctor<BaseComponent>[]): EntityId[] {
		const sets = types.map(
			(type) => new Set(this.components.get(type)?.keys() ?? []),
		);
		if (sets.length === 0) {
			return [];
		}
		return [...sets.reduce((a, b) => a.intersection(b))];
	}

	mustGetComponent<Component extends BaseComponent>(
		type: Ctor<Component>,
		entityId: EntityId,
	): Component {
		const component = this.components.get(type)?.get(entityId);
		if (!component) {
			throw new Error("could not get component");
		}

		return component as Component;
	}

	update(dt: number) {
		for (const system of this.systems) {
			system.execute(this, dt);
		}
	}

	enqueueCommand(command: BaseCommand) {
		this.commands.push(command);
	}

	enqueueUIEvent(event: UIEvent) {
		this.events.push(event);
	}

	handleCommands<Command extends BaseCommand>(type: Ctor<Command>): Command[] {
		const handled = this.commands.filter(
			(cmd): cmd is Command => cmd instanceof type,
		);
		const notHandled = this.commands.filter(
			(cmd): cmd is Command => !(cmd instanceof type),
		);
		this.commands = notHandled;

		return handled;
	}

	handleUIEvents(): UIEvent[] {
		const events = this.events;
		this.events = [];
		return events;
	}
}

export class BaseComponent {}

export abstract class BaseSystem {
	abstract execute(world: World, dt: number): void;
}

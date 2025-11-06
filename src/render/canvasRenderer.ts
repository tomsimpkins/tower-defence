import { type World } from "../core";
import { Interactions } from "./Interactions";

export type RendererFn = (world: World, ctx: CanvasRenderingContext2D) => void;
export class Renderer {
	private ctx: CanvasRenderingContext2D;
	private interactions: Interactions;
	constructor(canvas: HTMLCanvasElement, world: World) {
		this.interactions = new Interactions(canvas, world);
		this.ctx = canvas.getContext("2d")!;
	}

	dispose() {
		this.interactions.dispose();
	}

	render(world: World) {
		this.ctx.clearRect(
			0,
			0,
			world.resource.map.width,
			world.resource.map.height,
		);

		for (const renderer of this.renderers) {
			renderer(world, this.ctx);
		}
	}

	private renderers: RendererFn[] = [];
	addRenderer(renderer: RendererFn) {
		this.renderers.push(renderer);
	}
}

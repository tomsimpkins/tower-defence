import type { RendererFn } from "./canvasRenderer";

export const renderDiagnostics: RendererFn = (world, ctx) => {
	ctx.fillText(`Entity count: ${world.entityCount}`, 100, 100)
};

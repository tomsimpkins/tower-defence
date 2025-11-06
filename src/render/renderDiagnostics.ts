import type { RendererFn } from "./canvasRenderer";

export const renderDiagnostics: RendererFn = (world, ctx) => {
	ctx.fillText("FPS: todo", 100, 100);
};

import type { RendererFn } from "./canvasRenderer";

export const renderDiagnostics: RendererFn = (_, ctx) => {
	ctx.fillText("FPS: todo", 100, 100);
};

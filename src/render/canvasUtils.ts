// Keep 1px strokes crisp by aligning to pixel grid.
export function withCrisp(ctx: Any2DCanvasContext, draw: () => void) {
	ctx.save();
	ctx.translate(0.5, 0.5);
	draw();
	ctx.restore();
} /**
 * Draws a minimalist bullet in a strict 4×4 box at (x, y).
 * The bullet is a tiny rotated capsule with an optional tracer.
 */
// --- Generic scaling helper for any normalized box size (e.g., 4×4 for bullets)

export function inBoxN(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	size: number, // target edge length in pixels
	norm: number, // normalization edge (4 for bullets, 20 for towers)
	draw: () => void,
) {
	const s = Math.max(1, size) / Math.max(1, norm);
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s, s);

	// Keep 1px lines visually crisp at any scale
	const prevLineWidth = ctx.lineWidth;
	ctx.lineWidth = prevLineWidth / s;
	ctx.translate(0.5 / s, 0.5 / s);

	draw();

	ctx.lineWidth = prevLineWidth;
	ctx.restore();
}

// Panel with fill, stroke, and a faint top-left highlight rim.
export function inset(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	radius: number,
	fill: string,
	stroke: string,
	highlight: string,
) {
	// Body
	roundedRect(ctx, x, y, w, h, radius);
	ctx.fillStyle = fill;
	ctx.fill();

	// Stroke (slightly lighter than fill)
	ctx.strokeStyle = stroke;
	ctx.lineWidth = 1;
	ctx.stroke();

	// Highlight rim (top + left only) to pop layers apart
	if (highlight) {
		ctx.save();
		ctx.clip();
		ctx.beginPath();
		// top edge
		ctx.moveTo(x + 2, y + 1);
		ctx.lineTo(x + w - 2, y + 1);
		// left edge
		ctx.moveTo(x + 1, y + 2);
		ctx.lineTo(x + 1, y + h - 2);
		ctx.strokeStyle = highlight;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.restore();
	}
}

export type Any2DCanvasContext =
	| CanvasRenderingContext2D
	| OffscreenCanvasRenderingContext2D;

export function roundedRect(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.lineTo(x + w - rr, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
	ctx.lineTo(x + w, y + h - rr);
	ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
	ctx.lineTo(x + rr, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
	ctx.lineTo(x, y + rr);
	ctx.quadraticCurveTo(x, y, x + rr, y);
	ctx.closePath();
}

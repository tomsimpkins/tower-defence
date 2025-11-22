// ===== Palette (lighter, higher contrast) =====
export function makeTowerPalette(overrides = {}) {
	const p = {
		baseFill: "#171d29", // lighter than before
		baseStroke: "#3c4b66",
		innerFill: "#1d2636",
		innerStroke: "#526688",
		ringStroke: "#63779b",
		outline: "#586e90",
		foot: "#141d2b",
		slitBg: "#111826",
		highlight: "rgba(255,255,255,0.12)", // subtle rim light
		shadow: "rgba(0,0,0,0.14)",
		gunAccent: "#87e6ff", // default team/accent for gun
		beamAccent: "#87e6ff", // default team/accent for beam
	};
	return Object.assign(p, overrides);
}

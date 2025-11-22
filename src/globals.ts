export const WORLD_SCALE = 1.8;

export const GRID_SQUARE_SIZE = 30 * WORLD_SCALE;
export const BULLET_SIZE = 6 * WORLD_SCALE;
export const CELL_SIZE = 30 * WORLD_SCALE;
export const CANVAS_SIZE = 1000;
export const GRID_WIDTH = (CANVAS_SIZE / CELL_SIZE) | 0;
export const GRID_HEIGHT = (CANVAS_SIZE / CELL_SIZE) | 0;
export const SEED = 16;

export const TOWER_SIZE = CELL_SIZE * 0.8;
export const ENEMY_SIZE = CELL_SIZE * 0.5;
export const ENEMY_RADIUS = ENEMY_SIZE / 2;

export const GRAVITY = -10; // -10 px per second

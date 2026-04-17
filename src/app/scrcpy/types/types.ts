// Game state types for Vision Layer output

export type Vector2 = {
  x: number;
  y: number;
};

export type Enemy = {
  id: number;
  position: Vector2;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
};

export type Bullet = {
  id: number;
  position: Vector2;
  velocity?: Vector2;
  color?: string;
  confidence: number;
};

export type Player = {
  position: Vector2;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
};

export type GameState = {
  player: Player | null;
  enemies: Enemy[];
  bullets: Bullet[];
  timestamp: number;
  frameWidth: number;
  frameHeight: number;
};

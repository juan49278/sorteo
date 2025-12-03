
export interface DrawConfig {
  min: number;
  max: number;
}

export type DrawMode = 'NUMBERS' | 'NAMES';

export interface DrawResult {
  id: number;
  value: string | number; // Can be a number or a name
  timestamp: number;
  funFact?: string;
  mode: DrawMode;
}

export enum DrawState {
  IDLE = 'IDLE',
  DRAWING = 'DRAWING',
  COMPLETED = 'COMPLETED'
}

export interface FunFactResponse {
  fact: string;
}

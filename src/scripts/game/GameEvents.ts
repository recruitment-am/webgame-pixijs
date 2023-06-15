import EventEmitter from 'eventemitter3';
import type { GameActions } from './GameContext';

export const gameEvents = new EventEmitter<GameActions>();

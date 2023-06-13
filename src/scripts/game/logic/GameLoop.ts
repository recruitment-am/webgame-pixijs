import EventEmitter from 'eventemitter3';
import { GameDispatch, GameState } from '../GameContext';
import { logAs } from '../systems/Logger';
import CollisionDetector from './CollisionDetector';
import LivesCounter from './LivesCounter';
import PointsCounter from './PointsCounter';
import { Level1Config } from './config/Level1Config';
import Level from './elements/Level';

const TICK_DURATION = 16;
const MAX_TICKS_PER_UPDATE = 50;
const MAX_PROCESS_TIME = 500;

export const GameLoopEvents = {
  Tick: 'Tick',
  GameOver: 'GameOver',
  Started: 'Started',
};

export default class GameLoop {
  readonly events = new EventEmitter();

  readonly level: Level;
  readonly collisions: CollisionDetector;
  readonly points: PointsCounter;
  readonly lives: LivesCounter;

  state: 'initialized' | 'playing' | 'ended' = 'initialized';

  private _tickNo = 0;
  private _timePassed = 0;
  private _timeRest = 0;
  private _lastTickAt: number = 0;

  private _timeScale = 1;

  // params are set/stored on React-end
  constructor(initialState: GameState, readonly dispatch: GameDispatch) {
    this.level = new Level(Level1Config);

    this.collisions = new CollisionDetector(this.level.activeFruits, this.level.knight);

    this.points = new PointsCounter(this, initialState.score);
    this.lives = new LivesCounter(this, initialState.lives);
  }

  start() {
    this._lastTickAt = Date.now();
    this.events.emit(GameLoopEvents.Started);

    this.state = 'playing';
  }

  updateTick(now: number = Date.now()) {
    if (this.state !== 'playing') return;

    let dt: number = now - this._lastTickAt;

    this._lastTickAt = now;

    const tickDurationScaled = TICK_DURATION / this._timeScale;

    let ticks = Math.floor((dt + this._timeRest) / tickDurationScaled);
    if (ticks < 0) return 0;

    let ticksProcessed = 0;
    const processStartAt = now;

    while (
      ticks &&
      (ticksProcessed < MAX_TICKS_PER_UPDATE ||
        Date.now() - processStartAt < MAX_PROCESS_TIME ||
        ticks - ticksProcessed > 50)
    ) {
      this.tick(TICK_DURATION);

      --ticks;
      ++ticksProcessed;
    }

    dt -= ticksProcessed * tickDurationScaled;
    this._timeRest += dt;

    const processedDelta = ticksProcessed * TICK_DURATION;
    this._timePassed += processedDelta;

    return processedDelta;
  }

  private tick(dt: number) {
    this._tickNo++;

    this.level.update(dt);
    this.points.update();
    this.lives.update();

    this.events.emit(GameLoopEvents.Tick, this._tickNo, dt);
  }

  gameOver() {
    this.state = 'ended';
    logAs('GameLoop', 'game over');

    this.events.emit(GameLoopEvents.GameOver);
  }

  get timePassed() {
    return this._timePassed;
  }
}

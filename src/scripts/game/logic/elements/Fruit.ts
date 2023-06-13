import EventEmitter from 'eventemitter3';
import { FruitEnumType } from './FruitTypes';
import Level, { LevelEvents } from './Level';

export default class Fruit {
  readonly events = new EventEmitter();

  private _state: 'falling' | 'collected' | 'dropped' = 'falling';
  private _fruitType: FruitEnumType = 'Apple';
  private _x = 0;
  private _y = 0;
  private _z = 0;

  // pixels per second
  private _fallingSpeed = 7.5;

  constructor(private level: Level) {}

  startFalling(fruitType: FruitEnumType) {
    this._fruitType = fruitType;

    const m = 0.05;

    const { sizeX, sizeY } = this.level.config;
    this._x = -sizeX / 2 + m + Math.random() * (1 - m * 2) * sizeX;
    this._y = -sizeY / 2 + m + Math.random() * (1 - m * 2) * sizeY;

    this._z = Math.random() * 5 + 20;
    this._y -= this._z;

    this.level.events.emit(LevelEvents.FruitSpawned, this);
  }

  collect() {
    if (this._state !== 'falling') throw Error('Cannot collect not falling Fruit');
    this._state = 'collected';
    this.level.events.emit(LevelEvents.FruitCollected, this);
    this.events.emit(LevelEvents.FruitCollected, this);
  }

  drop() {
    if (this._state !== 'falling') throw Error('Cannot drop not falling Fruit');
    this._state = 'dropped';
    this.level.events.emit(LevelEvents.FruitDropped, this);
    this.events.emit(LevelEvents.FruitDropped, this);
  }

  update(delta: number = 0) {
    this._y += (delta / 1000) * this._fallingSpeed;
    this._z -= (delta / 1000) * this._fallingSpeed;
  }

  get state() {
    return this._state;
  }

  get fruitType() {
    return this._fruitType;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get z() {
    return this._z;
  }
}

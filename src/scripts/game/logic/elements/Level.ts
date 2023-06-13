import EventEmitter from 'eventemitter3';
import FruitsGenerator from '../FruitsGenerator';
import { LevelConfig } from '../config/LevelConfigBase';
import Fruit from './Fruit';
import Knight from './Knight';

export const LevelEvents = {
  FruitDropped: 'FruitDropped',
  FruitSpawned: 'FruitSpawned',
  FruitCollected: 'FruitCollected',
};

export default class Level {
  events = new EventEmitter();

  readonly knight;
  readonly activeFruits;
  readonly fruitsGenerator;

  constructor(public readonly config: LevelConfig) {
    this.activeFruits = new Array<Fruit>();
    this.knight = new Knight();
    this.fruitsGenerator = new FruitsGenerator(this);
  }

  update(delta: number) {
    this.knight.update(delta);
    this.activeFruits.forEach((fruit) => fruit.update(delta));
    this.fruitsGenerator.update(delta);

    // clean old fruits
    this.activeFruits
      .map((fruit, idx) => ({ fruit, idx }))
      .filter((vo) => vo.fruit.state !== 'falling')
      .reverse()
      .forEach(({ idx }) => {
        this.activeFruits.splice(idx, 1);
      });
  }
}

import EventEmitter from 'eventemitter3';
import { Container } from 'pixi.js';
import GameLoop from '../logic/GameLoop';
import Fruit from '../logic/elements/Fruit';
import { LevelEvents } from '../logic/elements/Level';
import { logAs } from '../systems/Logger';
import VFruit from './VFruit';

export const FruitsGeneratorEvents = {
  NewFruit: 'NewFruit',
};

export default class VFruitsFactory {
  readonly events = new EventEmitter();

  private pool?: VFruit[];

  constructor(model: GameLoop, layers: { shadowsLayer: Container; fruitLayer: Container }) {
    const { shadowsLayer, fruitLayer } = layers;

    const putBackToPool = (fruit: VFruit) => {
      this.pool?.unshift(fruit);
    };

    const pool = new Array(20).fill(null).map(() => {
      const fruit = new VFruit(putBackToPool);
      fruitLayer.addChild(fruit);

      // put shadows in the dedicated layer
      (shadowsLayer ?? fruitLayer).addChildAt(fruit.shadow, 0);

      return fruit;
    });

    this.pool = pool;

    model.level.events.on(LevelEvents.FruitSpawned, this.handleFruitSpawned, this);
  }

  private handleFruitSpawned(fruit: Fruit) {
    const vFruit = this.pool?.pop();
    if (!vFruit) {
      logAs('VFruitsFactory', 'No more VFruits in pool');
      return;
    }

    vFruit.showFor(fruit);
  }
}

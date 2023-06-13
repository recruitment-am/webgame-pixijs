import EventEmitter from 'eventemitter3';
import GameScene from '../GameScene';
import Fruit from '../logic/elements/Fruit';
import { LevelEvents } from '../logic/elements/Level';
import { logAs } from '../systems/Logger';
import VFruit from './VFruit';
import VLevel from './VLevel';

export const FruitsGeneratorEvents = {
  NewFruit: 'NewFruit',
};

export default class VFruitsFactory {
  readonly events = new EventEmitter();
  readonly scene: GameScene;

  private pool?: VFruit[];

  constructor(scene: GameScene, vLevel: VLevel) {
    this.scene = scene;
    const putBackToPool = (fruit: VFruit) => {
      this.pool?.unshift(fruit);
    };

    const { fruitLayer, shadowsLayer } = vLevel;

    const pool = new Array(20).fill(null).map(() => {
      const fruit = new VFruit(scene, putBackToPool);
      fruitLayer.add(fruit);

      // put shadows in the dedicated layer
      (shadowsLayer ?? fruitLayer).addAt(fruit.shadow, 0);

      return fruit;
    });

    this.pool = pool;

    scene.gameLoop.level.events.on(LevelEvents.FruitSpawned, this.handleFruitSpawned, this);
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

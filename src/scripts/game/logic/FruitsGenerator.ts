import { logAs } from '../systems/Logger';
import { round } from '../systems/utils';

import Fruit from './elements/Fruit';
import { FruitEnumEntries } from './elements/FruitTypes';
import Level from './elements/Level';

export const FruitsGeneratorEvents = {
  NewFruit: 'NewFruit',
};

const RAND_TIME = 1800;
const BASE_TIME = 3700;

export default class FruitsGenerator {
  private nextFruitAt: number = 0;

  private randTime = RAND_TIME;
  private baseTime = BASE_TIME;
  private nextDifficultyIn = BASE_TIME * 5;
  private difficulty = 0;

  constructor(private level: Level) {}

  spawnFruit() {
    const fruit = new Fruit(this.level);
    const randomFruitType = Phaser.Utils.Array.GetRandom(FruitEnumEntries);
    fruit.startFalling(randomFruitType);
    this.level.activeFruits.push(fruit);

    logAs('FruitsGenerator', 'New fruit spawned');
  }

  update(delta: number) {
    this.nextFruitAt -= delta;
    if (this.nextFruitAt < 0) {
      this.nextFruitAt += Math.random() * this.randTime + this.baseTime;
      this.spawnFruit();
    }

    this.nextDifficultyIn -= delta;
    if (this.nextDifficultyIn < 0) {
      this.difficulty++;
      this.nextDifficultyIn = BASE_TIME * (5 + this.difficulty);

      this.baseTime = (BASE_TIME * 10) / (10 + this.difficulty);

      logAs(
        'FruitsGenerator',
        'Next difficulty level. ' + (this.difficulty + 1) + ' Time: ' + round(this.baseTime)
      );
    }
  }
}

import { Container, Sprite } from 'pixi.js';
import Fruit from '../../logic/elements/Fruit';
import { LevelEvents } from '../../logic/elements/Level';

import GameLoop from '../../logic/GameLoop';
import VFruit from '../VFruit';
import { modelToViewScale } from '../VGlobals';

export default class VFruitsOnFloorDecalsFx {
  private readonly pool: Sprite[];

  constructor(model: GameLoop, shadowsLayer: Container) {
    model.level.events.on(LevelEvents.FruitDropped, this.handleFruitDropped, this);

    this.pool = new Array(50).fill('').map(() => {
      const image = new Sprite();
      shadowsLayer.addChild(image);
      image.visible = false;
      image.alpha = 0.3;
      image.anchor.set(0.5);
      return image;
    });
  }

  private handleFruitDropped(fruit: Fruit) {
    const decal = this.pool.pop();
    if (!decal) return;

    decal.texture = VFruit.getTextureFor(fruit);

    decal.scale.set(Math.random() * 0.5 + 3.7);
    decal.scale.y *= 0.7;

    let c = Math.round(Math.random() * 50 + 70).toString(16);
    if (c.length < 2) c = '0' + c;
    decal.tint = Number.parseInt(`0x${c}${c}${c}`, 16);

    decal.x = fruit.x * modelToViewScale;
    decal.y = fruit.y * modelToViewScale;
    decal.angle = Math.random() * 10 - 5;

    decal.visible = true;
  }
}

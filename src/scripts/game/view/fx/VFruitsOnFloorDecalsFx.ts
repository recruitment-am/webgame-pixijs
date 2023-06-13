import GameScene from '../../GameScene';
import Fruit from '../../logic/elements/Fruit';
import { LevelEvents } from '../../logic/elements/Level';
import { AtlasKeys } from '../AtlasKeys';
import VFruit from '../VFruit';
import { modelToViewScale } from '../VGlobal';

export default class VFruitsOnFloorDecalsFx {
  private readonly pool: Phaser.GameObjects.Image[];

  constructor(sc: GameScene) {
    sc.gameLoop.level.events.on(LevelEvents.FruitDropped, this.handleFruitDropped, this);

    this.pool = new Array(50).fill('').map(() => {
      const image = sc.add.image(0, 0, AtlasKeys.Game);
      sc.vLevel.shadowsLayer.add(image);
      image.visible = false;
      image.alpha = 0.3;
      return image;
    });
  }

  private handleFruitDropped(fruit: Fruit) {
    const decal = this.pool.pop();
    if (!decal) return;

    decal.setFrame(VFruit.getFrameFor(fruit));

    decal.scale = Math.random() * 0.5 + 3.7;
    decal.scaleY *= 0.7;

    const c = Math.round(Math.random() * 50 + 70).toString(16);
    decal.setTint(Phaser.Display.Color.HexStringToColor(`#${c}${c}${c}`).color);

    decal.x = fruit.x * modelToViewScale;
    decal.y = fruit.y * modelToViewScale;
    decal.angle = Math.random() * 10 - 5;

    decal.visible = true;
  }
}

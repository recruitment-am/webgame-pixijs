import GameScene from '../GameScene';
import { modelToViewScale } from './VGlobal';

export default class VLevel extends Phaser.GameObjects.Container {
  readonly shadowsLayer: Phaser.GameObjects.Container;
  readonly floorLayer: Phaser.GameObjects.Container;
  readonly fruitLayer: Phaser.GameObjects.Container;

  constructor(readonly sc: GameScene, readonly level = sc.gameLoop.level) {
    super(sc);
    sc.add.existing(this);

    const shadowsLayer = sc.add.container();
    this.add(shadowsLayer);
    this.shadowsLayer = shadowsLayer;

    const floorLayer = sc.add.container();
    this.add(floorLayer);
    this.floorLayer = floorLayer;

    const fruitLayer = sc.add.container();
    this.add(fruitLayer);
    this.fruitLayer = fruitLayer;

    const rect = sc.add.rectangle(
      0,
      0,
      level.config.sizeX * modelToViewScale,
      level.config.sizeY * modelToViewScale,
      0,
      0.08
    );
    shadowsLayer.add(rect);

    this.setSize(rect.width, rect.height);
  }
}

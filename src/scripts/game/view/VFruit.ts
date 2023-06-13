import GameScene from '../GameScene';
import Fruit from '../logic/elements/Fruit';
import { LevelEvents } from '../logic/elements/Level';
import { AtlasKeys } from './AtlasKeys';
import { modelToViewScale } from './VGlobal';

export default class VFruit extends Phaser.GameObjects.Image {
  static getFrameFor(fruit: Fruit) {
    return `fruits/${fruit.fruitType}.png`;
  }

  readonly sc: GameScene;

  private putBackToPool: (fruit: VFruit) => void;

  private _shadow: Phaser.GameObjects.Image;
  private fruit?: Fruit;

  constructor(sc: GameScene, putBackToPool: (fruit: VFruit) => void) {
    super(sc, 0, 0, AtlasKeys.Game);
    this.sc = sc;
    this.putBackToPool = putBackToPool;
    sc.add.existing(this);
    this.setOrigin(0.5, 0.5);

    this.visible = false;
    this.scale = 3;

    // fruit's shadow
    const shadow = sc.add.image(0, 0, AtlasKeys.Game);
    shadow.visible = false;
    shadow.setTintFill(0);
    this._shadow = shadow;
  }

  showFor(fruit: Fruit) {
    this.fruit = fruit;

    fruit.events.on(LevelEvents.FruitCollected, this.handleFruitRemoved, this);
    fruit.events.on(LevelEvents.FruitDropped, this.handleFruitRemoved, this);

    this.setFrame(`fruits/${fruit.fruitType}.png`);

    this.setUpShadow(fruit);

    // fade in
    this.visible = true;
    this.alpha = 0;
    this.sc.tweens.add({
      targets: [this],
      props: {
        alpha: 1,
      },
      duration: 300,
    });

    this.sc.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

    this.update();
  }

  private setUpShadow(fruit: Fruit) {
    const { _shadow } = this;
    _shadow.setFrame(VFruit.getFrameFor(fruit));
    _shadow.scale = this.scale;
    _shadow.visible = true;
    _shadow.x = fruit.x * modelToViewScale;
    _shadow.y = fruit.y * modelToViewScale + fruit.z * modelToViewScale;
  }

  private handleFruitRemoved() {
    if (this.fruit?.state === 'collected') this.collect();
    else this.drop();
  }

  collect() {
    this.sc.sounds.play('collect');
    this.remove();
  }

  drop() {
    this.sc.sounds.play('fail');
    this.remove();
  }

  remove() {
    this.sc.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.fruit?.events.off(LevelEvents.FruitCollected, this.handleFruitRemoved, this);
    this.fruit?.events.off(LevelEvents.FruitDropped, this.handleFruitRemoved, this);
    this.visible = false;
    this.putBackToPool(this);

    this._shadow.visible = false;
    this.fruit = undefined;
  }

  update() {
    const { fruit } = this;
    if (!fruit) return;

    this.x = fruit.x * modelToViewScale;
    this.y = fruit.y * modelToViewScale - fruit.z * modelToViewScale;
    this._shadow.alpha = 0.4 - Phaser.Math.Clamp(fruit.z / 40, 0, 0.32);
  }

  get shadow() {
    return this._shadow;
  }
}

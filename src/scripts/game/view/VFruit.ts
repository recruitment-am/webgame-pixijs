import { Sprite, Texture, Ticker } from 'pixi.js';
import Fruit from '../logic/elements/Fruit';
import { LevelEvents } from '../logic/elements/Level';
import { modelToViewScale } from './VGlobals';

export default class VFruit extends Sprite {
  static getTextureFor(fruit: Fruit) {
    return Texture.from(`fruits/${fruit.fruitType}.png`);
  }

  private _shadow: Sprite;

  private fruit?: Fruit;

  constructor(private putBackToPool: (fruit: VFruit) => void) {
    super(Texture.from(`fruits/Cookie.png`));
    this.scale.set(3);
    this.visible = false;

    // create shadow
    this._shadow = Sprite.from(`fruits/Cookie.png`);
    this._shadow.tint = 0x222222;
    this._shadow.visible = false;
  }

  showFor(fruit: Fruit) {
    this.fruit = fruit;

    fruit.events.on(LevelEvents.FruitCollected, this.handleFruitRemoved, this);
    fruit.events.on(LevelEvents.FruitDropped, this.handleFruitRemoved, this);
    Ticker.shared.add(this.update, this);

    this.texture = Texture.from(`fruits/${fruit.fruitType}.png`);

    this.setUpShadow(fruit);

    // fade in
    this.visible = true;

    this.update();
  }

  private setUpShadow(fruit: Fruit) {
    const { _shadow } = this;
    _shadow.texture = VFruit.getTextureFor(fruit);
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
    // this.sc.sounds.play('collect');
    this.remove();
  }

  drop() {
    // this.sc.sounds.play('fail');
    this.remove();
  }

  remove() {
    Ticker.shared.remove(this.update, this);
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
    this._shadow.alpha = 0.4 - Math.max(0, Math.min(fruit.z / 40, 0.32));
  }

  get shadow() {
    return this._shadow;
  }
}

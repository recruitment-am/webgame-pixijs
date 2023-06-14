import { AnimatedSprite, Sprite, Texture } from 'pixi.js';
import Knight from '../logic/elements/Knight';

const AnimKeys = {
  idle: 'idle',
  runDown: 'run down',
  runLeft: 'run left',
  runRight: 'run right',
  runUp: 'run up',
  sliceDown: 'slice down',
  sliceLeft: 'slice left',
  sliceRight: 'slice right',
  sliceUp: 'slice up',
} as const;
type AnimNames = keyof typeof AnimKeys;

const AnimFramesIndex = {
  idle: 3,
  'run left': 5,
  'run right': 5,
  run: 4,
  slice: 2,
} as Record<string, number | undefined>;

export default class VKnight extends AnimatedSprite {
  private _animationFrames: Record<AnimNames, Texture[]>;
  private _shadowAsset: Sprite;
  public get shadowAsset(): Sprite {
    return this._shadowAsset;
  }

  currentAnimKey: AnimNames;

  constructor(private readonly knight: Knight) {
    const animationTextures = Object.fromEntries(
      (Object.keys(AnimKeys) as (keyof typeof AnimKeys)[]).map((key) => {
        // num of frames per animation
        const animName = AnimKeys[key];
        const end = AnimFramesIndex[animName] ?? AnimFramesIndex[animName.split(' ')?.[0] ?? 'idle'] ?? 3;

        const textureNames = new Array(end + 1)
          .fill(null)
          .map((_, idx) => `knight/knight iso char_${animName}_${idx}.png`);

        return [key, textureNames.map((texture) => Texture.from(texture))];
      })
    ) as Record<AnimNames, Texture[]>;

    const initialAnimationName: AnimNames = 'idle';
    super(animationTextures[initialAnimationName]);
    this.currentAnimKey = initialAnimationName;

    this.anchor.set(0.5, 0.7);
    this.scale.set(3);
    this.animationSpeed = 0.1;
    this.play();

    this._animationFrames = animationTextures;

    {
      const shadowAsset = Sprite.from(`fruits/Cookie.png`);
      this._shadowAsset = shadowAsset;
      shadowAsset.tint = 0;
      shadowAsset.alpha = 0.33;
      shadowAsset.anchor.set(0.5, 0.7);
      shadowAsset.scale.set(6, 3);
      this.updateShadowPosition();
    }
  }

  private updateShadowPosition() {
    const { _shadowAsset } = this;
    _shadowAsset.x = this.x;
    _shadowAsset.y = this.y + this.height * (1 - this.anchor.y);
  }

  private switchAnim(anim: AnimNames, opts: { frameRate?: number } = {}) {
    if (this.currentAnimKey === anim) return;
    this.currentAnimKey = anim;

    this.textures = this._animationFrames[anim];
    this.animationSpeed = 0.1 * (opts.frameRate ?? 1);
    this.play();
  }
}

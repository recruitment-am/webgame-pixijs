import GameScene from '../GameScene';
import { GameLoopEvents } from '../logic/GameLoop';
import Knight from '../logic/elements/Knight';
import Align from '../systems/Align';
import { AtlasKeys } from './AtlasKeys';
import { modelToViewScale } from './VGlobal';

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
type AnimKeysEntry = (typeof AnimKeys)[keyof typeof AnimKeys];

const AnimFramesIndex = {
  idle: 3,
  'run left': 5,
  'run right': 5,
  run: 4,
  slice: 2,
} as Record<string, number | undefined>;

export default class VKnight extends Phaser.GameObjects.Container {
  readonly knightAsset: Phaser.GameObjects.Sprite;
  readonly shadowAsset: Phaser.GameObjects.Image;
  currentAnimKey: AnimKeysEntry = AnimKeys.idle;

  constructor(private readonly sc: GameScene, private readonly knight: Knight) {
    super(sc);
    sc.add.existing(this);

    const shadowAsset = sc.add.image(0, 0, AtlasKeys.Game, `fruits/Cookie.png`);
    this.shadowAsset = shadowAsset;
    sc.vLevel.shadowsLayer.add(shadowAsset);
    shadowAsset.setTintFill(0);
    shadowAsset.alpha = 0.4;
    shadowAsset.setScale(6, 3);

    const knightAsset = sc.add.sprite(0, 0, AtlasKeys.Game);
    this.knightAsset = knightAsset;
    knightAsset.setOrigin(0.5, 0.7);

    Object.values(AnimKeys).forEach((key) => {
      // num of frames per animation
      const end = AnimFramesIndex[key] ?? AnimFramesIndex[key.split(' ')?.[0] ?? 'idle'] ?? 3;

      const animConfig = {
        key,
        frames: sc.anims.generateFrameNames(AtlasKeys.Game, {
          end,
          suffix: '.png',
          prefix: `knight/knight iso char_${key}_`,
        }),
        repeat: -1,
        frameRate: 10,
      };
      knightAsset.anims.create(animConfig);
    });

    knightAsset.scale = 3;
    this.add(knightAsset);

    this.knightAsset.play(AnimKeys.idle);

    sc.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.updateShadowPosition();

    sc.gameLoop.events.once(GameLoopEvents.GameOver, () => {
      this.switchAnim('idle', { frameRate: 5 });

      // death animation
      sc.tweens.add({
        targets: this,
        props: {
          y: `-=${Align.height}`,
        },
        duration: 5000,
        ease: Phaser.Math.Easing.Cubic.In,
      });

      sc.tweens.add({
        targets: shadowAsset,
        props: {
          alpha: 0,
        },
        duration: 2000,
        delay: 1000,
      });
    });
  }

  update() {
    const { knight } = this;
    if (this.sc.gameLoop.state !== 'playing') return;

    this.x = knight.x * modelToViewScale;
    this.y = knight.y * modelToViewScale;

    this.updateShadowPosition();

    // animation/view
    if (Math.abs(knight.speedX) + Math.abs(knight.speedY) < 7.5) {
      this.switchAnim(AnimKeys.idle);
    } else {
      if (Math.abs(knight.speedX) > 5) {
        this.switchAnim(knight.speedX > 0 ? AnimKeys.runRight : AnimKeys.runLeft);
      } else if (Math.abs(knight.speedY) > 5) {
        this.switchAnim(knight.speedY > 0 ? AnimKeys.runDown : AnimKeys.runUp);
      }
    }
  }

  private updateShadowPosition() {
    const { shadowAsset } = this;
    shadowAsset.x = this.x;
    shadowAsset.y = this.y + this.knightAsset.displayHeight * (1 - this.knightAsset.originY);
  }

  private switchAnim(anim: AnimKeysEntry, opts: { frameRate?: number } = {}) {
    if (this.currentAnimKey === anim) return;
    this.currentAnimKey = anim;

    this.knightAsset.play({ key: anim, ...opts });
  }
}

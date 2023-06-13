import GameScene from '../../GameScene';
import Align from '../../systems/Align';

export default class FadeInFx {
  constructor(sc: GameScene) {
    const rect = sc.add.rectangle(0, 0, 1, 1, 0xf7767a, 1.0);
    rect.setOrigin(0, 0);
    rect.x = Align.left;
    rect.y = Align.top;
    rect.width = Align.width;
    rect.height = Align.height;

    sc.tweens.add({
      targets: [rect],
      props: {
        alpha: 0,
      },
      duration: 900,
      ease: Phaser.Math.Easing.Cubic.InOut,
    });
  }
}

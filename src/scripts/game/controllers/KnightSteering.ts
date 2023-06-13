import GameScene from '../GameScene';
import Knight from '../logic/elements/Knight';

export default class KnightSteering {
  private keyboard;
  private knight;
  private upKey;
  private downKey;
  private rightKey;
  private leftKey;

  constructor(scene: GameScene, knight: Knight) {
    this.knight = knight;

    if (!scene.input.keyboard) {
      throw Error('Keyboard not available');
    }

    this.upKey = scene.input.keyboard.addKey('up');
    this.downKey = scene.input.keyboard.addKey('down');
    this.leftKey = scene.input.keyboard.addKey('left');
    this.rightKey = scene.input.keyboard.addKey('right');

    this.keyboard = scene.input.keyboard;

    scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    const { keyboard, knight } = this;

    {
      // vertical
      const { upKey, downKey } = this;
      if (keyboard.checkDown(upKey)) {
        knight.moveY = -1;
      } else if (keyboard.checkDown(downKey)) {
        knight.moveY = 1;
      } else {
        knight.moveY = 0;
      }
    }

    {
      // horizontal
      const { leftKey, rightKey } = this;
      if (keyboard.checkDown(leftKey)) {
        knight.moveX = -1;
      } else if (keyboard.checkDown(rightKey)) {
        knight.moveX = 1;
      } else {
        knight.moveX = 0;
      }
    }
  }
}

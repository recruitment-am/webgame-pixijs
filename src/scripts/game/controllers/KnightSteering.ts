import { GameInputs } from 'game-inputs';
import { Ticker } from 'pixi.js';
import Knight from '../logic/elements/Knight';
import { logAs } from '../systems/Logger';

export default class KnightSteering {
  private inputs;
  private knight;

  constructor(knight: Knight) {
    this.knight = knight;

    const element = document.getElementById('game-canvas');
    if (!element) {
      throw Error('Keyboard not available');
    }

    const inputs = new GameInputs(element, {
      allowContextMenu: false,
      preventDefaults: true,
      stopPropagation: false,
      disabled: false,
    });
    this.inputs = inputs;
    inputs.bind('move-up', 'KeyW', 'ArrowUp');
    inputs.bind('move-down', 'KeyS', 'ArrowDown');
    inputs.bind('move-left', 'KeyA', 'ArrowLeft');
    inputs.bind('move-right', 'KeyD', 'ArrowRight');

    Ticker.shared.add(this.update, this);

    logAs('KnightSteering', 'Initialized');
  }

  update() {
    const { inputs, knight } = this;

    {
      // vertical
      const upKey = inputs.state['move-up'];
      const downKey = inputs.state['move-down'];
      if (upKey) {
        knight.moveY = -1;
      } else if (downKey) {
        knight.moveY = 1;
      } else {
        knight.moveY = 0;
      }
    }

    {
      // horizontal
      const leftKey = inputs.state['move-left'];
      const rightKey = inputs.state['move-right'];
      if (leftKey) {
        knight.moveX = -1;
      } else if (rightKey) {
        knight.moveX = 1;
      } else {
        knight.moveX = 0;
      }
    }

    inputs.tick();
  }
}

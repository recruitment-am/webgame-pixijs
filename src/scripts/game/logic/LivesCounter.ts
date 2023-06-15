import { logAs } from '../systems/Logger';
import GameLoop from './GameLoop';

import type { GameState } from '../GameContext';
import { gameEvents } from '../GameEvents';

export default class LivesCounter {
  constructor(private loop: GameLoop) {
    // listen to global game events, stored on the UI (react) side
    gameEvents.on('takeLife', ({ state }: { state: GameState }) => {
      if (state.lives <= 0) {
        logAs('LivesCounter', 'Lives count dropped to 0');
        this.loop.gameOver();
      }
    });
  }

  update() {
    const fruitsFallen = this.loop.collisions.checkForFalls();
    fruitsFallen.forEach((fruit) => {
      fruit.drop();
      logAs('LivesCounter', `Lost a life.`);

      this.loop.dispatch({
        type: 'takeLife',
      });
    });
  }
}

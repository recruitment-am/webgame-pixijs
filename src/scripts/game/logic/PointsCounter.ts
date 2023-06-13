import { GameState, gameEvents } from '../GameContext';
import { logAs } from '../systems/Logger';
import GameLoop from './GameLoop';

export default class PointsCounter {
  constructor(private loop: GameLoop) {
    // you may listen to global game events, stored on the UI (react) side
    gameEvents.on('addScore', ({ state }: { state: GameState }) => {
      if (state.score === 250) {
        console.log(`The level won!`);
        this.loop.gameOver();
      }
    });
  }

  update() {
    // collects
    const fruitsToCollect = this.loop.collisions.checkForCollisions();
    fruitsToCollect.forEach((fruit) => {
      fruit.collect();

      const points = 50;
      logAs('PointsCounter', `Scored: ${points}`);

      this.loop.dispatch({
        type: 'addScore',
        points,
      });
    });
  }
}

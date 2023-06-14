import { Application } from 'pixi.js';
import { useEffect } from 'react';
import Lives from '../hud/Lives';
import Score from '../hud/Score';
import './Game.css';
import { GameDispatch, GameState, useGame } from './GameContext';
import GameLoop from './logic/GameLoop';
import { Align } from './systems/Align';
import { prepareStage } from './view/prepareStage';

let gameInstance: Application;
let gameWrapper: HTMLDivElement;

let timeoutId: ReturnType<typeof setTimeout> | undefined;
function createPixiInstance(dispatch: GameDispatch, initialState: GameState) {
  if (gameInstance) return;

  // React "Strict.Mode" double-instance mitigation
  clearTimeout(timeoutId);
  timeoutId = setTimeout(doCreate, 100);

  async function doCreate() {
    gameWrapper = document.getElementById('game-wrapper') as HTMLDivElement;
    if (!gameWrapper) throw Error('No wrapper found for game in DOM');

    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw Error('No canvas found for game in DOM');
    if (!(canvas instanceof HTMLCanvasElement))
      throw Error('Found canvas in DOM but it is not HTMLCanvasElement');

    // create Pixi application (game)
    const game = new Application({
      view: canvas,
      backgroundColor: 0xf7767a,
    });
    gameInstance = game;

    Align.init(game);

    // create model
    const model = new GameLoop(dispatch);

    // create the stage (view)
    await prepareStage(game, model);
  }
}

export const Game = (): JSX.Element => {
  // we need to pass the game state's dispatch function down to Phaser
  const { dispatch, state } = useGame();
  // create phaser instance
  useEffect(() => {
    createPixiInstance(dispatch, state);

    return () => {
      if (!gameInstance) return;
      gameInstance.destroy(true);
    };

    // Do not recreate canvas if state changes (pass only initial state here)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <>
      <div className="relativeWrapper">
        <div className="hud">
          <Score />
          <Lives />
        </div>
        <div id="game-wrapper">
          <canvas id="game-canvas" />
        </div>
      </div>
    </>
  );
};

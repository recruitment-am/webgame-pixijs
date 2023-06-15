import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';
import Lives from '../hud/Lives';
import Score from '../hud/Score';
import './Game.css';
import KnightSteering from './controllers/KnightSteering';
import GameLoop from './logic/GameLoop';
import { Align } from './systems/Align';
import { logAs } from './systems/Logger';
import { useGame } from './useGame';
import { prepareStage } from './view/prepareStage';

import type { GameDispatch, GameState } from './GameContext';

let gameInstance: Application;
let gameWrapper: HTMLDivElement;

let timeoutId: ReturnType<typeof setTimeout> | undefined;
function createPixiInstance(canvas: HTMLCanvasElement, dispatch: GameDispatch, initialState: GameState) {
  if (gameInstance) return;

  // React "Strict.Mode" double-instance mitigation
  clearTimeout(timeoutId);
  timeoutId = setTimeout(doCreate, 100);

  async function doCreate() {
    gameWrapper = document.getElementById('game-wrapper') as HTMLDivElement;
    if (!gameWrapper) throw Error('No wrapper found for game in DOM');

    // create Pixi application (game)
    const game = new Application({
      view: canvas,
      backgroundColor: 0xf7767a,
    });
    gameInstance = game;

    // init "Align" utility (window responsiveness)
    Align.init(game);

    // create model
    const model = new GameLoop(dispatch);

    // create the stage (view)
    await prepareStage(game, model);

    // initialize steering
    new KnightSteering(model.level.knight);

    // start
    setTimeout(() => {
      model.start();
      logAs('Game', 'Started!');
    }, 500);
  }
}

export const Game = (): JSX.Element => {
  // we need to pass the game state's dispatch function down to Phaser
  const { dispatch, state } = useGame();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // create phaser instance
  useEffect(() => {
    if (canvasRef.current) {
      createPixiInstance(canvasRef.current, dispatch, state);
    }

    return () => {
      if (!gameInstance) return;
      gameInstance.destroy(true);
    };

    // Do not recreate canvas if state changes (pass only initial state here)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, dispatch]);

  return (
    <>
      <div className="relativeWrapper">
        <div className="hud">
          <Score />
          <Lives />
        </div>
        <div id="game-wrapper">
          <canvas id="game-canvas" ref={canvasRef} />
        </div>
      </div>
    </>
  );
};

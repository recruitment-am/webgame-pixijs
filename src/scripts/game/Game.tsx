import 'phaser';

import { useEffect } from 'react';
import Lives from '../hud/Lives';
import Score from '../hud/Score';
import './Game.css';
import { GameDispatch, GameState, useGame } from './GameContext';
import Align from './systems/Align';
import { logger } from './systems/Logger';

export let gameInstance: any;
let timeoutId: ReturnType<typeof setTimeout> | undefined;
function createPixiInstance(dispatch: GameDispatch, initialState: GameState) {
  // React "Strict.Mode" double-instance mitigation
  clearTimeout(timeoutId);
  timeoutId = setTimeout(doCreate, 100);

  function doCreate() {
    const wrapper = document.getElementById('game-wrapper');
    if (!wrapper) throw Error('No wrapper found for game in DOM');

    // create Pixi renderer instance
    // TODO

    updateDevicePixelRatio();

    // create "scene"
    // TODO

    // fix for background blinking on canvas init
    wrapper.style.display = 'none';
  }
}

// call resize - cache prev values to limit re-triggering
let storedCanvasWidth = 0;
let storedCanvasHeight = 0;
let storedNativeDPR = 0;

function updateDevicePixelRatio() {
  // Get the device pixel ratio, falling back to 1.
  const nativeDPR = window.devicePixelRatio || 1;
  if (nativeDPR !== storedNativeDPR) {
    storedNativeDPR = nativeDPR;

    // do not use full resolution to achieve better performance

    // propagate the ratio to the system
    Align.setDevicePixelRatio(nativeDPR);

    logger.info(
      `%c[updateDevicePixelRatio] %cGot native dpr ${nativeDPR.toFixed(2)}`,
      'background: #222; color: #bc06f0',
      'background: #222; color: #ddd'
    );
  }
  return nativeDPR;
}

// the browser responsiveness handler
export function handleResize() {
  updateDevicePixelRatio();

  if (storedCanvasWidth) logger.info(`Stored canvas size: ${storedCanvasWidth} x ${storedCanvasHeight}`);

  // Get the size of the canvas in CSS pixels.
  const viewportWidth = Math.round(
    Math.max(document.documentElement.clientWidth, window.innerWidth || 0) * Align.devicePixelRatio
  );
  const viewportHeight = Math.round(
    Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * Align.devicePixelRatio
  );

  const canvasWidth = viewportWidth;
  let canvasHeight = viewportHeight;

  storedCanvasWidth = canvasWidth;
  storedCanvasHeight = canvasHeight;

  const game = gameInstance;
  if (!game) {
    throw Error('handleResizeForPhaser() No game instance');
  }

  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  game.canvas.width = canvasWidth;
  game.canvas.height = canvasHeight;
  game.canvas.style.width = canvasWidth + 'px';
  game.canvas.style.height = canvasHeight + 'px';

  // resize the game
  // To fix offset issue - do it after
  // new margin and dimensions of canvas are set up
  Align.canvasWidth = canvasWidth;
  Align.canvasHeight = canvasHeight;
  Align.viewportWidth = viewportWidth;
  Align.viewportHeight = viewportHeight;

  // scale the whole game by the inverse of dpr
  game.scale.setZoom(1 / Align.devicePixelRatio);
  game.scale.resize(canvasWidth, canvasHeight);

  logger.info(
    `%c[handleResize] %c{ res: ${Align.canvasWidth}x${Align.canvasHeight} }`,
    'background: #222; color: #bcf006',
    'background: #222; color: #ddd'
  );
}

export const Game = (): JSX.Element => {
  // we need to pass the game state's dispatch function down to Phaser
  const { dispatch, state: initialState } = useGame();

  // create phaser instance
  useEffect(() => {
    createPixiInstance(dispatch, initialState);

    return () => {
      if (!gameInstance) return;
      gameInstance.destroy(true);
    };
  }, [dispatch]);

  return (
    <>
      <div className="relativeWrapper">
        <div className="hud">
          <Score />
          <Lives />
        </div>
        <div id="game-wrapper"></div>
      </div>
    </>
  );
};

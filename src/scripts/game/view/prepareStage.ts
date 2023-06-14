import { Application, Assets, Container, SCALE_MODES, Spritesheet, Ticker } from 'pixi.js';
import GameLoop from '../logic/GameLoop';
import { Align } from '../systems/Align';
import VKnight from './VKnight';
import VLevel from './VLevel';

export async function prepareStage(game: Application, model: GameLoop) {
  const ATLAS_JSON = 'atlas/game.json';
  const result = (await Assets.load(ATLAS_JSON)) as Spritesheet;

  if (!(result instanceof Spritesheet)) throw Error('Cannot load assets');

  // pixel art style
  result.baseTexture.scaleMode = SCALE_MODES.NEAREST;

  const globalWrapper = new Container();
  game.stage.addChild(globalWrapper);

  const vLevel = new VLevel(model);
  globalWrapper.addChild(vLevel);

  const vKnight = new VKnight(model.level.knight);
  globalWrapper.addChild(vKnight);

  globalWrapper.addChildAt(vKnight.shadowAsset, 1);

  // update model using Pixi's Ticker
  Ticker.shared.add(() => {
    model.updateTick();
  });

  // on resize - fit wrapper to the screen/canvas size with Align helper tool
  // respect VLevel width/height
  Align.onResize(() => {
    globalWrapper.scale.set(
      Math.min((Align.width * 0.9) / vLevel.width, (Align.height * 0.8) / vLevel.height)
    );

    globalWrapper.x = Align.centerX;
    globalWrapper.y = Align.centerY;
  });
}

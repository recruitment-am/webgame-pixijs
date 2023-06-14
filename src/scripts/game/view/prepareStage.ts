import { Application, Assets, Container, SCALE_MODES, Spritesheet, Ticker } from 'pixi.js';
import GameLoop from '../logic/GameLoop';
import { Align } from '../systems/Align';
import VFruitsFactory from './VFruitsFactory';
import VKnight from './VKnight';
import VLevel from './VLevel';
import VFruitsOnFloorDecalsFx from './fx/VFruitsOnFloorDecalsFx';

export async function prepareStage(game: Application, model: GameLoop) {
  const ATLAS_JSON = 'atlas/game.json';
  const result = (await Assets.load(ATLAS_JSON)) as Spritesheet;

  if (!(result instanceof Spritesheet)) throw Error('Cannot load assets');

  // pixel art style
  result.baseTexture.scaleMode = SCALE_MODES.NEAREST;

  // global wrapper is resized to canvas-size
  const globalWrapper = new Container();
  game.stage.addChild(globalWrapper);

  const vLevel = new VLevel(model);
  globalWrapper.addChild(vLevel);

  // layers to keep order of rendering proper
  const shadowsLayer = new Container();
  const fruitLayer = new Container();

  // view elements
  const vKnight = new VKnight(model);

  new VFruitsFactory(model, { shadowsLayer, fruitLayer });

  // fruits should be displayed in the front
  globalWrapper.addChild(shadowsLayer);
  globalWrapper.addChild(vKnight);
  globalWrapper.addChild(fruitLayer);
  shadowsLayer.addChild(vKnight.shadowAsset);

  new VFruitsOnFloorDecalsFx(model, shadowsLayer);

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

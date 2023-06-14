import { Graphics } from 'pixi.js';
import GameLoop from '../logic/GameLoop';
import { modelToViewScale } from './VGlobals';

export default class VLevel extends Graphics {
  constructor(model: GameLoop) {
    super();
    this.beginFill(0, 0.08);
    const w = model.level.config.sizeX * modelToViewScale;
    const h = model.level.config.sizeX * modelToViewScale;
    this.drawRect(-w / 2, -h / 2, w, h);
    this.endFill();
  }
}

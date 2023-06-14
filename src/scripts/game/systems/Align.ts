import EventEmitter from 'eventemitter3';
import { Application } from 'pixi.js';
import { logger } from './Logger';

const AlignEvents = {
  Resize: 'Resize',
};

export class Align {
  private static game: Application;
  private static _events = new EventEmitter();
  private static _devicePixelRatio = 1;
  static canvasWidth = 0;
  static canvasHeight = 0;
  static viewportWidth = 0;
  static viewportHeight = 0;

  static init(game: Application) {
    Align.game = game;

    Align.updateDevicePixelRatio();
    window.removeEventListener('resize', Align.handleResize);
    window.addEventListener('resize', Align.handleResize);
    Align.handleResize();
  }

  static onResize(
    handler: (width: number, height: number) => void,
    opts: { context?: unknown; callImmediately?: boolean } = {}
  ) {
    Align._events.on(AlignEvents.Resize, handler, opts.context);

    if (opts.callImmediately !== false) handler.call(opts.context, Align.width, Align.height);
  }

  static offResize(handler: (width: number, height: number) => void, context?: unknown) {
    Align._events.off(AlignEvents.Resize, handler, context);
  }

  // call resize - cache prev values to limit re-triggering
  private static storedCanvasWidth = 0;
  private static storedCanvasHeight = 0;
  private static storedNativeDPR = 0;

  private static updateDevicePixelRatio() {
    // Get the device pixel ratio, falling back to 1.
    const nativeDPR = window.devicePixelRatio || 1;
    if (nativeDPR !== this.storedNativeDPR) {
      this.storedNativeDPR = nativeDPR;

      // do not use full resolution to achieve better performance

      // propagate the ratio to the system
      Align.setDevicePixelRatio(nativeDPR);

      logger.info(
        `%c[Align.updateDevicePixelRatio] %cGot native dpr ${nativeDPR.toFixed(2)}`,
        'background: #222; color: #bc06f0',
        'background: #222; color: #ddd'
      );
    }
    return nativeDPR;
  }

  private static handleResize() {
    Align.updateDevicePixelRatio();

    if (Align.storedCanvasWidth)
      logger.info(`Stored canvas size: ${Align.storedCanvasWidth} x ${Align.storedCanvasHeight}`);

    // Get the size of the canvas in CSS pixels.
    const viewportWidth = Math.round(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
    const viewportHeight = Math.round(
      Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    );

    const canvasWidth = viewportWidth;
    const canvasHeight = viewportHeight;

    Align.storedCanvasWidth = canvasWidth;
    Align.storedCanvasHeight = canvasHeight;

    const { game } = Align;
    if (!game) {
      throw Error('handleResizeForPhaser() No game instance');
    }

    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    game.view.width = canvasWidth;
    game.view.height = canvasHeight;
    game.renderer.resolution = Align.devicePixelRatio;

    // resize the game
    // To fix offset issue - do it after
    // new margin and dimensions of canvas are set up
    Align.canvasWidth = canvasWidth;
    Align.canvasHeight = canvasHeight;
    Align.viewportWidth = viewportWidth;
    Align.viewportHeight = viewportHeight;

    logger.info(
      `%c[handleResize] %c{ size: ${Align.canvasWidth}x${Align.canvasHeight}, resolution: ${Align.devicePixelRatio} }`,
      'background: #222; color: #bcf006',
      'background: #222; color: #ddd'
    );

    Align._events.emit(AlignEvents.Resize, Align.width, Align.height);
  }

  static setDevicePixelRatio(dpr: number) {
    this._devicePixelRatio = dpr;
  }

  static get devicePixelRatio() {
    return Align._devicePixelRatio;
  }

  static get width() {
    return this.canvasWidth / this._devicePixelRatio;
  }

  static get height() {
    return this.canvasHeight / this._devicePixelRatio;
  }

  static get centerX() {
    return this.width / 2;
  }

  static get centerY() {
    return this.height / 2;
  }
}

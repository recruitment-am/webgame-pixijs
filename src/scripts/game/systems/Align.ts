export class Align {
  private static _devicePixelRatio = 1;
  static canvasWidth = 0;
  static canvasHeight = 0;
  static viewportWidth = 0;
  static viewportHeight = 0;

  static setDevicePixelRatio(dpr: number) {
    this._devicePixelRatio = dpr;
  }

  static get devicePixelRatio() {
    return Align._devicePixelRatio;
  }
}

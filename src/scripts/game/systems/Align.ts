import { logger } from './Logger';

export type Alignable =
  | (
      | Phaser.GameObjects.Components.ComputedSize
      | Phaser.GameObjects.Components.Size
      | Phaser.GameObjects.Text
      | Phaser.GameObjects.BitmapText
      | Phaser.GameObjects.Shape
      | Phaser.GameObjects.Container
    ) &
      Phaser.GameObjects.Components.Transform;
export type PointLike = { x: number; y: number };

export type AlignableX = {
  width: number;
  displayWidth?: number;
  x?: number;
};
export type AlignableImgX = {
  width: number;
  displayWidth: number;
  x: number;
};

export type AlignableY = {
  height: number;
  displayHeight?: number;
  y?: number;
};
export type AlignableImgY = {
  height: number;
  displayHeight: number;
  y: number;
};

export type BitmapText = Phaser.GameObjects.BitmapText;

export class AlignUtils {
  static EVENT_DPR_CHANGED = 'dpr changed';
  static FINGER_SIZE = 65;

  canvasWidth: number = 0;
  canvasHeight: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;
  devicePixelRatio: number = 0;
  camera!: Phaser.Cameras.Scene2D.Camera;

  private _topSafeAreaRaw = 0;
  private _bottomSafeAreaRaw = 0;
  private _lastSafeAreaChangeTm = 0;

  get topSafeAreaPx() {
    return this._topSafeAreaRaw * this.devicePixelRatio;
  }
  get bottomSafeAreaPx() {
    return this._bottomSafeAreaRaw * this.devicePixelRatio;
  }
  set topSafeAreaRaw(value: number) {
    if (value === this._topSafeAreaRaw) return;
    this._topSafeAreaRaw = value;

    this._lastSafeAreaChangeTm = Date.now();
  }
  set bottomSafeAreaRaw(value: number) {
    if (value === this._bottomSafeAreaRaw) return;
    this._bottomSafeAreaRaw = value;

    this._lastSafeAreaChangeTm = Date.now();
  }

  private listeners: Map<string, { func: Function; context: any }[]> = new Map();

  // call it from the very first scene
  init(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
  }

  setDevicePixelRatio(dpr: number) {
    this.devicePixelRatio = dpr;
    this.emit(AlignUtils.EVENT_DPR_CHANGED);
  }

  on(event: string, func: Function, context?: any) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push({ func, context });
  }
  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((handle) => {
      handle.func.call(handle.context, ...args);
    });
  }

  /**
   * Checks if the group has been resized already for actual screen dimensions
   *
   * Call this in the beginning of the handleResize functions
   * to prevent from multiple triggers of the same function after single screen size change.
   **/
  isResized(group: any, offset = 0.01) {
    // notch has changed - screen size and alignment are invalidated
    if (Date.now() - this._lastSafeAreaChangeTm < 2000) return false;

    const currentScreenSize = {
      w: this.width,
      h: this.height,
    };

    const previousSize = (group as any).__previousScreenSize;
    if (
      previousSize &&
      Math.abs(previousSize.w - currentScreenSize.w) < offset &&
      Math.abs(previousSize.h - currentScreenSize.h) < offset
    ) {
      // got previous value and it is exactly the same
      // the group is properly resized for current screen size
      return true;
    }

    (group as any).__previousScreenSize = currentScreenSize;
    return false;
  }

  get isPortrait() {
    return this.width > this.height ? false : true;
  }

  get isLandscape() {
    return this.width > this.height ? true : false;
  }

  // iPad resolutions
  get isLandscapeNarrow() {
    return this.isLandscape && this.width / this.height < 1.75;
  }

  /** Returns height of the game area minus CI header */
  get height() {
    return this.canvasHeight;
  }

  get width() {
    return this.canvasWidth;
  }

  get top() {
    return this.camera.y;
  }

  get bottom() {
    return this.top + this.height;
  }

  get left() {
    return this.camera.x;
  }

  get right() {
    return this.left + this.width;
  }

  get centerX() {
    return this.left + this.width / 2;
  }

  get centerY() {
    return this.top + this.height / 2;
  }

  /**
   * Fills the game screen with the given image ("bleeding" allowed)
   *
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} offsetX (optional)
   * @param {Number} offsetY (optional)
   */
  fillScreen(img: Alignable, offsetX = 0, offsetY = 0) {
    img.setScale(
      Math.max(
        (this.width + offsetX) / ((img as any)._width || img.width),
        (this.height + offsetY) / ((img as any)._height || img.height)
      )
    );

    img.x = this.centerX;
    img.y = this.centerY;
  }

  /**
   * Fills the rect (width, height) with the given image ("bleeding" allowed)
   *
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} width
   * @param {Number} height (optional)
   */
  fillSize(img: Alignable, width: number, height = 0) {
    // make a 0.5-anchored img fully fill the screen
    img.setScale(Math.max(width / img.width, height / img.height));
  }

  /**
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} width
   * @param {Number} height
   * @param {Number} maxScale (optional)
   * @param {Number} minScale (optional)
   */
  fitIntoSize(img: Alignable, width: number, height: number, maxScale = Number.MAX_VALUE, minScale = 0.0) {
    if (!img.width || !img.height) {
      logger.error('Width/height == 0');
      return;
    }

    const calcScale = Math.min(width / Math.abs(img.width), height / Math.abs(img.height));
    img.setScale(Math.min(maxScale, Math.max(minScale, calcScale)));
  }

  matchFingerByHeight(img: Alignable, size = 1.5, maxWidth = Number.MAX_VALUE, maxHeight = Number.MAX_VALUE) {
    if (!img.width || !img.height) {
      logger.error('Width/height == 0');
      return;
    }

    const matchScale = (AlignUtils.FINGER_SIZE * size) / img.height;
    const maxWidthScale = maxWidth / img.width;
    const maxHeightScale = maxHeight / img.height;
    img.setScale(Math.min(matchScale, maxWidthScale, maxHeightScale));
  }

  matchFingerByWidth(go: Alignable, size = 1.5, maxWidth = Number.MAX_VALUE, maxHeight = Number.MAX_VALUE) {
    const matchScale = (AlignUtils.FINGER_SIZE * size) / go.width;
    const maxHeightScale = maxHeight / go.height;
    const maxWidthScale = maxWidth / go.width;
    go.setScale(Math.min(matchScale, maxHeightScale, maxWidthScale));
  }

  /**
   * Center + Resize to screen width/height
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} screenWidthP Portion of screen width (i.e. 0.5 = 50% of width)
   * @param {Number} screenHeightP Portion of screen height (i.e. 1.1 = 110% of screen height)
   **/
  toCenter(img: Alignable) {
    img.x = this.centerX;
    img.y = this.top + this.height / 2;
  }
  /**
   * Center + Resize to screen width/height
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} screenWidthP Portion of screen width (i.e. 0.5 = 50% of width)
   * @param {Number} screenHeightP Portion of screen height (i.e. 1.1 = 110% of screen height)
   **/
  fitScreenAndCenter(img: Alignable, screenWidthP: number = 1.0, screenHeightP = 1.0) {
    if (screenWidthP && screenHeightP) {
      this.fitScreen(img, screenWidthP, screenHeightP);
    }

    this.toCenter(img);
  }

  /**
   * Scales the given img to fit into a specified part of the game screen
   *
   * @param {Alignable} img
   * @param {Number} screenWidthP 1.0 - whole screen width | 0.5 - half of the screen width and so on
   * @param {Number} screenHeightP 1.0 - whole screen width | 0.5 - half of the screen width and so on
   */
  fitScreen(img: Alignable, screenWidthP: number, screenHeightP = 1.0) {
    if (!screenWidthP || !screenHeightP) return;

    // assert(img.width && img.height, 'Width/height == 0')
    if (!img.width || !img.height) {
      logger.error('Width/height == 0');
      return;
    }

    const fitWidth = (this.width / img.width) * screenWidthP;
    const fitHeight = (this.height / img.height) * screenHeightP;
    img.setScale(Math.min(fitWidth, fitHeight));
  }

  /**
   * Aligns a image __extactly__ to the bottom edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} margin (optional) Amount of aligned img width to move of
   */
  toBottomOf(
    img: Alignable | BitmapText,
    ofImg: AlignableY,
    margin: number = 0,
    absOffset: number = 0,
    ofImgMargin: number = 0
  ) {
    let origin = 0.5;
    let ofOrigin = 0.5;
    if ('originY' in ofImg) {
      ofOrigin = ofImg.originY as number;
    }
    if ('originY' in img) {
      origin = img.originY as number;
    }

    const imgHeight = Math.abs(img.displayHeight ?? img.height);
    const ofImgHeight = Math.abs(ofImg.displayHeight ?? ofImg.height);

    img.y =
      (ofImg.y ?? 0) + ofImgHeight * (1 - ofOrigin + ofImgMargin) + imgHeight * (origin + margin) + absOffset;
  }

  /**
   * Aligns a image __extactly__ to the top edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} margin (optional) Amount of aligned img width to move of
   */
  toTopOf(
    img: Alignable | BitmapText,
    ofImg: AlignableY,
    margin: number = 0,
    absOffset: number = 0,
    ofImgMargin: number = 0
  ) {
    let origin = 0.5;
    let ofOrigin = 0.5;
    if ('originY' in ofImg) {
      ofOrigin = ofImg.originY as number;
    }
    if ('originY' in img) {
      origin = img.originY as number;
    }

    const imgHeight = Math.abs(img.displayHeight ?? img.height);
    const ofImgHeight = Math.abs(ofImg.displayHeight ?? ofImg.height);

    img.y =
      (ofImg.y ?? 0) - ofImgHeight * (1 - ofOrigin + ofImgMargin) - imgHeight * (origin + margin) - absOffset;
  }

  /**
   * Aligns a image __extactly__ to the left edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} margin (optional) Amount of aligned img width to move of
   */
  toLeftOf(
    img: Alignable | BitmapText,
    ofImg: AlignableX,
    margin: number = 0,
    absOffset: number = 0,
    ofImgMargin: number = 0
  ) {
    let origin = 0.5;
    let ofOrigin = 0.5;
    if ('originX' in ofImg) {
      ofOrigin = ofImg.originX as number;
    }
    if ('originX' in img) {
      origin = img.originX as number;
    }

    const imgWidth = Math.abs(img.displayWidth ?? img.width);
    const ofImgWidth = Math.abs(ofImg.displayWidth ?? ofImg.width);

    img.x =
      (ofImg.x ?? 0) - ofImgWidth * (1 - ofOrigin + ofImgMargin) - imgWidth * (origin + margin) - absOffset;
  }

  /**
   * Aligns a image __extactly__ to the right edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} margin (optional) Amount of aligned img width to move of
   */
  toRightOf(
    img: Alignable | BitmapText,
    ofImg: AlignableX,
    margin: number = 0,
    absOffset: number = 0,
    ofImgMargin: number = 0
  ) {
    let origin = 0.5;
    let ofOrigin = 0.5;
    if ('originX' in ofImg) {
      ofOrigin = ofImg.originX as number;
    }
    if ('originX' in img) {
      origin = img.originX as number;
    }

    const imgWidth = Math.abs(img.displayWidth ?? img.width);
    const ofImgWidth = Math.abs(ofImg.displayWidth ?? ofImg.width);

    img.x =
      (ofImg.x ?? 0) + ofImgWidth * (1 - ofOrigin + ofImgMargin) + imgWidth * (origin + margin) + absOffset;
  }

  /**
   * Aligns a image __extactly__ to the bottom edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} p (optional) Amount of aligned img width to move of
   */
  toBottomOn(img: Alignable | BitmapText, ofImg: AlignableY, p: number = 0, imgP: number = 0) {
    let ofImgOrigin = 0.5;
    if ('originY' in ofImg) {
      ofImgOrigin = ofImg.originY as number;
    }

    const ofImgHeight = Math.abs(ofImg.displayHeight ?? ofImg.height);
    const imgHeight = Math.abs(img.displayHeight ?? img.height);

    img.y = (ofImg.y ?? 0) + ofImgHeight * (1 - ofImgOrigin + p) + imgHeight * imgP;
  }

  /**
   * Aligns a image __extactly__ to the top edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} p (optional) Amount of aligned img width to move of
   */
  toTopOn(img: Alignable | BitmapText, ofImg: AlignableY, p: number = 0, imgP: number = 0) {
    let ofImgOrigin = 0.5;
    if ('originY' in ofImg) {
      ofImgOrigin = ofImg.originY as number;
    }

    const ofImgHeight = Math.abs(ofImg.displayHeight ?? ofImg.height);
    const imgHeight = Math.abs(img.displayHeight ?? img.height);

    img.y = (ofImg.y ?? 0) - ofImgHeight * (ofImgOrigin + p) - imgHeight * imgP;
  }

  /**
   * Aligns a image __extactly__ to the left edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} p (optional) Amount of aligned img width to move of
   */
  toLeftOn(img: Alignable | BitmapText, ofImg: AlignableX, p: number = 0, imgP: number = 0) {
    let ofImgOrigin = 0.5;
    if ('originX' in ofImg) {
      ofImgOrigin = ofImg.originX as number;
    }

    const ofImgWidth = Math.abs(ofImg.displayWidth ?? ofImg.width);
    const imgWidth = Math.abs(img.displayWidth ?? img.width);

    img.x = (ofImg.x ?? 0) - ofImgWidth * (ofImgOrigin + p) - imgP * imgWidth;
  }

  /**
   * Aligns a image __extactly__ to the right edge of another image.
   *
   * @param {Alignable} img image/group that will be aligned
   * @param {Alignable} ofImg image/group that will be used to align to
   * @param {number} p (optional) Amount of aligned img width to move of
   */
  toRightOn(img: Alignable | BitmapText, ofImg: AlignableX, p: number = 0, imgP: number = 0) {
    let ofImgOrigin = 0.5;
    if ('originX' in ofImg) {
      ofImgOrigin = ofImg.originX as number;
    }

    const ofImgWidth = Math.abs(ofImg.displayWidth ?? ofImg.width);
    const imgWidth = Math.abs(img.displayWidth ?? img.width);

    img.x = (ofImg.x ?? 0) + ofImgWidth * (1 - ofImgOrigin + p) + imgP * imgWidth;
  }

  toCenterYOn(img: Alignable | BitmapText, ofImg: Alignable | BitmapText, imgP = 0, p = 0) {
    this.toBottomOn(img, ofImg, -0.5 + p, imgP);
  }

  toCenterXOn(img: Alignable | BitmapText, ofImg: Alignable | BitmapText, imgP = 0, p = 0) {
    this.toRightOn(img, ofImg, -0.5 + p, imgP);
  }

  toCenterOn(
    img: Alignable | BitmapText,
    ofImg: Alignable | BitmapText,
    opts: { imgPX?: number; px?: number; imgPY?: number; py?: number } = {}
  ) {
    this.toCenterXOn(img, ofImg, opts.imgPX ?? 0, opts.px ?? 0);
    this.toCenterYOn(img, ofImg, opts.imgPY ?? 0, opts.py ?? 0);
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (bottom)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{y: number}} l 0.5 - amount of height to consider in aligining to the edge
   * @param {(Number|{y: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toBottom(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteY = LP((l as any).y, (p as any).y);
    if (absoluteY !== undefined) {
      img.y = absoluteY;
    } else {
      const imgHeight = Math.abs(img.displayHeight ?? img.height);
      img.y = this.bottom - imgHeight * LP(l, p);
    }

    return img.y;
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (top)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{y: number}} l 0.5 - amount of height to consider in aligining to the edge
   * @param {(Number|{y: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toTop(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteY = LP((l as any).y, (p as any).y);
    if (absoluteY !== undefined) {
      img.y = absoluteY;
    } else {
      const imgHeight = Math.abs(img.displayHeight ?? img.height);
      img.y = this.top + imgHeight * LP(l, p);
    }

    return img.y;
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (left)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{x: number}} l 0.5 - amount of width to consider in aligining to the edge
   * @param {(Number|{x: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toLeft(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteX = LP((l as any).x, (p as any).x);
    if (absoluteX !== undefined) {
      img.x = absoluteX;
    } else {
      const imgWidth = Math.abs(img.displayWidth ?? img.width);
      img.x = this.left + imgWidth * LP(l, p);
    }

    return img.x;
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (right)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{x: number}} l 0.5 - amount of width to consider in aligining to the edge
   * @param {(Number|{x: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toRight(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteX = LP((l as any).x, (p as any).x);
    if (absoluteX !== undefined) {
      img.x = absoluteX;
    } else {
      const imgWidth = Math.abs(img.displayWidth ?? img.width);
      img.x = this.right - imgWidth * LP(l, p);
    }

    return img.x;
  }

  /**
   * Aligns the object within the game screen from its left by specified fragment of its total width
   *
   * @param {Alignable} img
   * @param {(Number|{x: number}} xf 0.0 - to _lower_ edge (left), 0.5 - to center, 0.5 - to _higher_ edge (right)
   * @param {(Number|{x: number}} xfPortrait (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  horizontally(
    img: PointLike,
    xf: number | PointLike = 0.5,
    xfPortrait: number | PointLike | null | undefined = undefined
  ) {
    if (xfPortrait === undefined) xfPortrait = xf;

    const absoluteX = LP((xf as any).x, (xfPortrait as any).x);
    if (absoluteX !== undefined) {
      img.x = absoluteX;
    } else {
      img.x = this.left + this.width * LP(xf, xfPortrait);
    }

    return img.x;
  }

  /**
   * Aligns the object within the game screen from its top by specified fragment of its total height
   *
   * @param {Alignable} img
   * @param {(Number|{y: number}} yf 0.0 - to _lower_ edge (top), 0.5 - to center, 0.5 - to _higher_ edge (bottom)
   * @param {(Number|{y: number}} yfPortrait (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  vertically(
    img: PointLike,
    yf: number | PointLike = 0.5,
    yfPortrait: number | PointLike | undefined = undefined
  ) {
    if (yfPortrait === undefined) yfPortrait = yf;

    const absoluteY = LP((yf as any).y, (yfPortrait as any).y);
    if (absoluteY !== undefined) {
      img.y = absoluteY;
    } else {
      img.y = this.top + this.height * LP(yf, yfPortrait);
    }

    return img.y;
  }

  /**
   * Aligns the object using both Align.horizontally and Align.vertically in one call
   */
  horvert(
    img: PointLike,
    xf = 0.5,
    yf = 0.5,
    xfPortrait: number | undefined = undefined,
    yfPortrait: number | undefined = undefined
  ) {
    this.horizontally(img, xf, xfPortrait);
    this.vertically(img, yf, yfPortrait);
  }

  /**
   * Copy position, scale and origin (from » to)
   **/
  cp(from: Alignable | any, to?: Alignable | any) {
    if (!to) to = { x: 0, y: 0, scaleX: 0, scaleY: 0 };

    to.x = from.x;
    to.y = from.y;
    if ((from.originY !== undefined || from.originX !== undefined) && typeof to.setOrigin === 'function') {
      to.setOrigin(from.originX, from.originY);
    }
    if (to.scaleX !== undefined && from.scaleX !== undefined) to.scaleX = from.scaleX;
    if (to.scaleY !== undefined && from.scaleY !== undefined) to.scaleY = from.scaleY;
    if (to.angle !== undefined && from.angle !== undefined) to.angle = from.angle;

    return to;
  }

  cpPos(from: Alignable | any, to?: Alignable | any) {
    if (!to) to = { x: 0, y: 0 };

    to.x = from.x;
    to.y = from.y;

    return to;
  }

  avg(vobj: Alignable, func: (...args: any) => any, midPt: number = 0.5) {
    const bufX = vobj.x;
    const bufY = vobj.y;
    func();
    vobj.x = vobj.x * midPt + bufX * (1 - midPt);
    vobj.y = vobj.y * midPt + bufY * (1 - midPt);
  }
}

const Align = new AlignUtils();
export default Align;

export function LP(landscape: any, portrait: any) {
  return Align.isPortrait ? portrait : landscape;
}

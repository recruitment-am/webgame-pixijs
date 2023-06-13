import { GameDispatch, GameState } from './GameContext';
import KnightSteering from './controllers/KnightSteering';
import GameLoop from './logic/GameLoop';
import Align from './systems/Align';
import SoundSystem from './systems/SoundSystem';
import { AtlasKeys } from './view/AtlasKeys';
import VFruitsFactory from './view/VFruitsFactory';
import VKnight from './view/VKnight';
import VLevel from './view/VLevel';
import FadeInFx from './view/fx/VFadeInFx';
import VFruitsOnFloorDecalsFx from './view/fx/VFruitsOnFloorDecalsFx';

export default class GameScene extends Phaser.Scene {
  private _sounds!: SoundSystem;

  private _gameLoop!: GameLoop;
  private _vLevel!: VLevel;

  get gameLoop() {
    return this._gameLoop;
  }
  get vLevel() {
    return this._vLevel;
  }

  preload() {
    Align.init(this);

    // load atlasses
    this.load.atlas(AtlasKeys.Game, 'atlas/game.webp', 'atlas/game.json');

    // load bitmap fonts
    this.load.bitmapFont('arial', 'fonts/arial.png', 'fonts/arial.fnt');
    this.load.bitmapFont('arial-stroke', 'fonts/arial-stroke.png', 'fonts/arial-stroke.fnt');

    // load settings
    this.load.json('default-settings', 'settings.json');

    // load sounds
    this.load.audioSprite('sounds', 'audio/sounds.json', 'audio/sounds.mp3');
  }

  create(data: { dispatch: GameDispatch; initialState: GameState }) {
    // model
    // create game loop with all logic systems
    const gameLoop = new GameLoop(data.initialState, data.dispatch);
    this._gameLoop = gameLoop;

    // view
    const vLevel = new VLevel(this);
    this._vLevel = vLevel;

    // knight's view
    const vKnight = new VKnight(this, gameLoop.level.knight);
    vLevel.floorLayer.add(vKnight);

    new VFruitsFactory(this, vLevel);
    new VFruitsOnFloorDecalsFx(this);

    // other systems
    // initialize sounds
    this._sounds = new SoundSystem(this.game, 'sounds');

    this.start();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    this.resize();
  }

  resize() {
    const { vLevel } = this;
    Align.fitScreenAndCenter(vLevel, 0.9, 0.9);
  }

  start() {
    // fade in
    new FadeInFx(this);

    setTimeout(() => {
      this._gameLoop.start();
    }, 1000);

    // controls
    new KnightSteering(this, this._gameLoop.level.knight);
  }

  update() {
    this._gameLoop.updateTick();
  }

  get sounds() {
    return this._sounds;
  }
}

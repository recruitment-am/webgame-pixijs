import { logger } from './Logger';

export type PlayConfig = {
  loop?: boolean;
  // 0 - 100
  detuneRange?: number;
  // -100 - 100
  pitch?: number;
  // 0 - 1
  volume?: number;
  // 0 - 1
  volumeRange?: number;
  // 0 - 1 - for what part of duration should system lock the sound from replaying
  replayLock?: number;
};
type Audio = Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound;

export default class SoundSystem {
  // cache to store last time of playing certain sound
  // to prevent from playback too often
  private soundLockTm: any = {};
  private sounds: { [key: string]: Audio } = {};
  private game: Phaser.Game;
  private key: string;
  private music?: Phaser.Sound.BaseSound;

  sfxVolume = 1;
  musicVolume = 0.15;
  enabled = true;

  constructor(game: Phaser.Game, key = 'sounds') {
    this.game = game;
    this.key = key;

    Object.keys(this.sounds).forEach((key) => {
      delete this.sounds[key];
    });

    this.soundLockTm = {};
  }

  /**
   * Play Sound FX
   * (non-music)
   */
  play(name: SfxKey | SfxKey[], config: PlayConfig = {}) {
    if (!this.sfxVolume) return;
    if (Array.isArray(name)) name = Phaser.Utils.Array.GetRandom(name) as SfxKey;
    this.playRaw(name, config);
  }

  private playRaw(name: string, config: PlayConfig = {}) {
    const { game, soundLockTm, sounds, enabled } = this;

    if (!enabled) return;

    if (config.volume === undefined) config.volume = 1;

    config.volume = this.volumeFunc(config.volume);

    // limit too often same sound playback
    const now = game.getTime();
    if (soundLockTm[name] && now < soundLockTm[name]) return;

    let sound;
    try {
      let audioInstance = sounds[name];
      if (!audioInstance) {
        audioInstance = this.game.sound.addAudioSprite(this.key);
        sounds[name] = audioInstance;
      }

      const pitch = config.pitch || 0;
      sound = audioInstance.play(name, {
        volume: config.volume,
        detune: pitch + (config.detuneRange ? (Math.random() - 0.5) * config.detuneRange : 0),
        loop: config.loop ?? false,
      });

      soundLockTm[name] =
        now + (audioInstance.currentMarker.duration || 0.1) * 1000 * (config.replayLock ?? 0.5);
    } catch (error: any) {
      logger.warn(error);
      logger.error('No such sound:', name);
      return null;
    }

    return sound;
  }

  playMusic(key?: string, volume: number = 1) {
    //TODO
  }

  stopSounds() {
    Object.keys(this.sounds).forEach((key) => {
      const sound = this.sounds[key];
      if (!sound) return;
      sound.stop();
    });
  }

  // human ear hears in logarithmic scale - that function transforms
  // linear value to logarithmic-like to make it easier to balance sound volume
  volumeFunc(linearValue: number) {
    return (Math.exp(linearValue) - 1) / (Math.E - 1);
  }
}

export type SfxKey = 'btn' | 'collect' | 'fail';

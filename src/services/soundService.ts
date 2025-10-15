import { Audio } from 'expo-av';

class SoundService {
  private doorClickSound: Audio.Sound | null = null;
  private doorCreakSound: Audio.Sound | null = null;
  private doorOpenSound: Audio.Sound | null = null;
  private winningChimeSound: Audio.Sound | null = null;
  private celebrationSound: Audio.Sound | null = null;
  private losingDoorSound: Audio.Sound | null = null;
  private lossSound: Audio.Sound | null = null;

  constructor() {
    this.loadSounds();
  }

  private async loadSounds() {
    try {
      // Load actual sound files - you can replace these with your own sound files
      // For now, we'll create placeholder sounds using Expo's built-in sounds
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // In a real app, you would load actual sound files here:
      // this.doorClickSound = new Audio.Sound();
      // await this.doorClickSound.loadAsync(require('../assets/sounds/door-click.mp3'));
      
      // For now, we'll just create placeholder functions
      this.doorClickSound = new Audio.Sound();
      this.doorCreakSound = new Audio.Sound();
      this.doorOpenSound = new Audio.Sound();
      this.winningChimeSound = new Audio.Sound();
      this.celebrationSound = new Audio.Sound();
      this.losingDoorSound = new Audio.Sound();
      this.lossSound = new Audio.Sound();
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  }

  playDoorClick() {
    console.log('🔊 Playing door click sound');
    // this.doorClickSound?.replayAsync();
  }

  playDoorCreak() {
    console.log('🔊 Playing door creak sound');
    // this.doorCreakSound?.replayAsync();
  }

  playDoorOpen() {
    console.log('🔊 Playing door opening sound');
    // this.doorOpenSound?.replayAsync();
  }

  playWinningChime() {
    console.log('🔊 Playing winning chime sound');
    // this.winningChimeSound?.replayAsync();
  }

  playCelebration() {
    console.log('🎉 Playing celebration sound');
    // this.celebrationSound?.replayAsync();
  }

  playLosingDoor() {
    console.log('🔊 Playing losing door sound');
    // this.losingDoorSound?.replayAsync();
  }

  playLoss() {
    console.log('😔 Playing loss sound');
    // this.lossSound?.replayAsync();
  }
}

export const soundService = new SoundService();
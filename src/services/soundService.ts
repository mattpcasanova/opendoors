import { Audio } from 'expo-av';

class SoundService {
  private doorClickSound: Audio.Sound | null = null;
  private doorCreakSound: Audio.Sound | null = null;
  private winningChimeSound: Audio.Sound | null = null;
  private losingDoorSound: Audio.Sound | null = null;

  constructor() {
    this.loadSounds();
  }

  private async loadSounds() {
    // In a real app, you would load actual sound files here.
    // For now, we'll just create placeholder functions.
    this.doorClickSound = new Audio.Sound();
    this.doorCreakSound = new Audio.Sound();
    this.winningChimeSound = new Audio.Sound();
    this.losingDoorSound = new Audio.Sound();
  }

  playDoorClick() {
    console.log('Playing door click sound');
    // this.doorClickSound?.replayAsync();
  }

  playDoorCreak() {
    console.log('Playing door creak sound');
    // this.doorCreakSound?.replayAsync();
  }

  playWinningChime() {
    console.log('Playing winning chime sound');
    // this.winningChimeSound?.replayAsync();
  }

  playLosingDoor() {
    console.log('Playing losing door sound');
    // this.losingDoorSound?.replayAsync();
  }
}

export const soundService = new SoundService();
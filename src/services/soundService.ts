import { Audio } from 'expo-av';

class SoundService {
  private soundsLoaded = false;
  private doorClickSound: Audio.Sound | null = null;
  private doorOpenSound: Audio.Sound | null = null;
  private celebrationSound: Audio.Sound | null = null;
  private lossSound: Audio.Sound | null = null;

  constructor() {
    this.loadSounds();
  }

  private async loadSounds() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Try to load sound files if they exist, otherwise use system sounds
      try {
        // Load the 4 sound files
        const { sound: doorClick } = await Audio.Sound.createAsync(
          require('../../assets/sounds/door-click.mp3'),
          { shouldPlay: false }
        );
        this.doorClickSound = doorClick;

        const { sound: doorOpen } = await Audio.Sound.createAsync(
          require('../../assets/sounds/door-open.mp3'),
          { shouldPlay: false }
        );
        this.doorOpenSound = doorOpen;

        const { sound: celebration } = await Audio.Sound.createAsync(
          require('../../assets/sounds/celebration.mp3'),
          { shouldPlay: false }
        );
        this.celebrationSound = celebration;

        const { sound: loss } = await Audio.Sound.createAsync(
          require('../../assets/sounds/loss.mp3'),
          { shouldPlay: false }
        );
        this.lossSound = loss;

        console.log('✅ Custom sound files loaded successfully');
      } catch (fileError) {
        console.log('ℹ️ Custom sound files not found, using system feedback');
        // Sound files not found - will use haptic/system feedback instead
      }

      this.soundsLoaded = true;
      console.log('✅ Sound service initialized');
    } catch (error) {
      console.error('Error initializing sound service:', error);
    }
  }

  private async playSound(sound: Audio.Sound | null, fallbackLog: string) {
    if (!this.soundsLoaded) {
      console.warn('Sound service not ready');
      return;
    }

    if (sound) {
      try {
        // Get the status first to check if sound is loaded
        const status = await sound.getStatusAsync();

        if (status.isLoaded) {
          // If currently playing, stop it first
          if (status.isPlaying) {
            await sound.stopAsync();
          }
          // Rewind to the beginning
          await sound.setPositionAsync(0);
          // Play the sound
          await sound.playAsync();
        } else {
          console.warn('Sound not loaded properly');
        }
      } catch (error) {
        // Silently handle errors - sound is not critical
        console.log(`Could not play sound (non-critical): ${error}`);
      }
    } else {
      console.log(fallbackLog);
      // Could add haptic feedback here as an alternative
      // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  async playDoorClick() {
    await this.playSound(this.doorClickSound, '🔊 Door click (no sound file)');
  }

  async playDoorCreak() {
    // No separate creak sound - just use door open
    await this.playSound(this.doorOpenSound, '🔊 Door opening (no sound file)');
  }

  async playDoorOpen() {
    await this.playSound(this.doorOpenSound, '🔊 Door opening (no sound file)');
  }

  async playWinningChime() {
    // No separate winning chime - use celebration
    await this.playSound(this.celebrationSound, '🎉 Celebration (no sound file)');
  }

  async playCelebration() {
    await this.playSound(this.celebrationSound, '🎉 Celebration (no sound file)');
  }

  async playLosingDoor() {
    // No separate losing door sound - use door open
    await this.playSound(this.doorOpenSound, '🔊 Door opening (no sound file)');
  }

  async playLoss() {
    await this.playSound(this.lossSound, '😔 Loss sound (no sound file)');
  }

  // Cleanup method to unload sounds when no longer needed
  async cleanup() {
    const sounds = [
      this.doorClickSound,
      this.doorOpenSound,
      this.celebrationSound,
      this.lossSound,
    ];

    for (const sound of sounds) {
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  }
}

export const soundService = new SoundService();
# Sound Files for Monty Hall Game

This directory should contain the following 4 MP3 sound files:

1. **door-click.mp3** - Short click sound when clicking a door
2. **door-open.mp3** - Sound of door opening
3. **celebration.mp3** - Celebration/cheery sound for winning
4. **loss.mp3** - Sad "womp womp" sound for losing

## Sound Mapping

The app reuses these sounds for multiple actions:
- `door-click.mp3` - Played when clicking a door
- `door-open.mp3` - Played when doors open (both winning and losing)
- `celebration.mp3` - Played for winning doors
- `loss.mp3` - Played when you lose

## Where to Get Free Sounds

### Recommended Free Sources:

**Door Sounds:**
- [Pixabay - Door Sounds](https://pixabay.com/sound-effects/search/door/)
- [ZapSplat - Door Sounds](https://www.zapsplat.com/music/door-creak-squeak-1/)

**Winning Sounds:**
- [Orange Free Sounds - Winning Chime](https://orangefreesounds.com/winning-sound-effect-chimes/)
- [Orange Free Sounds - Success Chime](https://orangefreesounds.com/success-chime-sound-effect/)

**Losing Sounds:**
- [Orange Free Sounds - Womp Womp](https://orangefreesounds.com/womp-womp/)
- [Orange Free Sounds - Sad Trombone](https://orangefreesounds.com/sad-trombone/)

## How to Add Sounds

1. Download the MP3 files from the sources above (or use your own)
2. Rename them to match the exact filenames listed above
3. Place them in this directory (`assets/sounds/`)
4. Rebuild your app

The app will automatically detect and load these files. If the files are not present, the app will still work but will only show console logs instead of playing sounds.

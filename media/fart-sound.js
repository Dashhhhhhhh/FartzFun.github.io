// Simple fart sound preloader and manager

class SoundManager {
    constructor() {
        // Define sound paths - you'll need to add actual sound files to your media folder
        this.soundPaths = [
            './media/fart1.mp3',
            './media/fart2.mp3',
            './media/fart3.mp3',
            './media/fart4.mp3',
            './media/fart5.mp3'
        ];
        
        // Preload sounds
        this.sounds = [];
        this.preloadSounds();
        
        // Track if browser supports audio
        this.audioSupported = typeof Audio !== 'undefined';
    }
    
    preloadSounds() {
        if (!this.audioSupported) return;
        
        this.sounds = this.soundPaths.map(path => {
            try {
                const audio = new Audio();
                audio.src = path;
                audio.preload = 'auto';
                return audio;
            } catch (e) {
                console.error('Could not load sound:', path);
                return null;
            }
        }).filter(sound => sound !== null);
    }
    
    getRandomSound() {
        if (!this.audioSupported || this.sounds.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * this.sounds.length);
        return this.sounds[randomIndex];
    }
    
    playRandomSound(volume = 1.0, pitchVariation = true) {
        if (!this.audioSupported) return;
        
        const sound = this.getRandomSound();
        if (!sound) return;
        
        // Clone the sound for simultaneous playback
        const soundClone = sound.cloneNode();
        
        // Apply volume
        soundClone.volume = Math.min(1.0, Math.max(0, volume));
        
        // Apply random pitch if enabled
        if (pitchVariation) {
            soundClone.playbackRate = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        }
        
        // Handle errors gracefully
        soundClone.onerror = (e) => {
            console.error('Error playing sound:', e);
        };
        
        // Play the sound
        soundClone.play().catch(e => {
            console.log('Browser blocked autoplay:', e);
        });
    }
}

// Export the sound manager
window.fartSoundManager = new SoundManager();
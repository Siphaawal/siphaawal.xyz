// Audio Manager - Handle sound effects and background music for GaliaViewer
export class AudioManager {
    constructor() {
        this.masterVolume = 0.5; // 50% volume by default
        this.backgroundMusic = null;
        this.clickSound = null;
        this.musicStarted = false;
        this.baseBackgroundVolume = 0.3; // Base volume for background music
        this.baseClickVolume = 0.5; // Base volume for click sounds

        this.initializeAudio();
    }

    initializeAudio() {
        // Get audio elements
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.clickSound = document.getElementById('clickSound');

        // Set initial volumes based on master volume
        this.updateAudioVolumes();

        // Add event listeners for user interaction to start background music
        this.addInteractionListeners();
    }

    addInteractionListeners() {
        // Due to browser autoplay policies, we need user interaction to start audio
        const startMusicOnInteraction = () => {
            if (!this.musicStarted && this.masterVolume > 0 && this.backgroundMusic) {
                this.playBackgroundMusic();
                this.musicStarted = true;
                // Remove listeners after first interaction
                document.removeEventListener('click', startMusicOnInteraction);
                document.removeEventListener('keydown', startMusicOnInteraction);
                document.removeEventListener('touchstart', startMusicOnInteraction);
            }
        };

        document.addEventListener('click', startMusicOnInteraction);
        document.addEventListener('keydown', startMusicOnInteraction);
        document.addEventListener('touchstart', startMusicOnInteraction);
    }

    updateAudioVolumes() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.baseBackgroundVolume * this.masterVolume;
        }
        if (this.clickSound) {
            this.clickSound.volume = this.baseClickVolume * this.masterVolume;
        }
    }

    playBackgroundMusic() {
        if (this.backgroundMusic && this.masterVolume > 0) {
            this.backgroundMusic.play().catch(error => {
                console.log('Background music play failed:', error);
            });
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    playClickSound() {
        if (this.clickSound && this.masterVolume > 0) {
            // Reset the sound to beginning and play
            this.clickSound.currentTime = 0;
            this.clickSound.play().catch(error => {
                console.log('Click sound play failed:', error);
            });
        }
    }

    setVolume(value) {
        this.masterVolume = value / 100; // Convert percentage to decimal

        // Update audio volumes
        this.updateAudioVolumes();

        // Update UI elements
        const volumeIcon = document.getElementById('volumeIcon');
        const volumePercent = document.getElementById('volumePercent');

        if (volumePercent) {
            volumePercent.textContent = `${value}%`;
        }

        if (volumeIcon) {
            if (value == 0) {
                volumeIcon.textContent = '🔇';
            } else if (value < 30) {
                volumeIcon.textContent = '🔈';
            } else if (value < 70) {
                volumeIcon.textContent = '🔉';
            } else {
                volumeIcon.textContent = '🔊';
            }
        }

        // Handle background music based on volume
        if (this.masterVolume === 0) {
            this.stopBackgroundMusic();
        } else if (this.musicStarted && this.backgroundMusic && this.backgroundMusic.paused) {
            this.playBackgroundMusic();
        }

        console.log('Volume set to:', value + '%');
    }

    // Method to be called on any click event
    handleClick() {
        this.playClickSound();
    }
}
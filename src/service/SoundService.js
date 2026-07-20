// src/services/SoundService.js
import Sound from 'react-native-sound';
import { Platform, Vibration } from 'react-native';

// Enable playback in silence mode (iOS)
if (Platform.OS === 'ios') {
    Sound.setCategory('Playback', true);
}

class SoundService {
    constructor() {
        this.sounds = {};
        this.isInitialized = false;
    }

    // Initialize all sounds
    initSounds = () => {
        try {
            // Create sound objects
            this.sounds = {
                success: new Sound(require('../assets/sounds/notification.mp3'), (error) => {
                    if (error) {
                    }
                }),
                error: new Sound(require('../assets/sounds/notification.mp3'), (error) => {
                    if (error) {
                    }
                }),
                notification: new Sound(require('../assets/sounds/notification.mp3'), (error) => {
                    if (error) {
                    }
                }),
                click: new Sound(require('../assets/sounds/notification.mp3'), (error) => {
                    if (error) {
                    }
                })
            };
            
            this.isInitialized = true;
        } catch (error) {
        }
    };

    // Play a specific sound
    playSound = (soundName, shouldVibrate = false, callback = null) => {
        if (!this.isInitialized) {
            if (callback) callback(false);
            return;
        }

        const sound = this.sounds[soundName];
        if (!sound) {
            if (callback) callback(false);
            return;
        }

        // Stop if already playing
        sound.stop(() => {
            // Then play
            sound.play((success) => {
                if (success) {
                    
                    // Vibrate if requested (Android only)
                    if (shouldVibrate && Platform.OS === 'android') {
                        Vibration.vibrate(200);
                    }
                } else {
                }
                if (callback) callback(success);
            });
        });
    };

    // Play test notification sound
    playTestSound = () => {
        this.playSound('notification', true);
    };

    // Release sounds (call on app close)
    release = () => {
        Object.keys(this.sounds).forEach(key => {
            if (this.sounds[key]) {
                this.sounds[key].release();
            }
        });
    };
}

export default new SoundService();

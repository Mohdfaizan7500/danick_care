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
                        console.log('Failed to load success sound:', error);
                    }
                }),
                error: new Sound(require('../assets/sounds/notification.mp3'), (error) => {
                    if (error) {
                        console.log('Failed to load error sound:', error);
                    }
                }),
                notification: new Sound(require('../assets/sounds/notification.mp3'), (error) => {
                    if (error) {
                        console.log('Failed to load notification sound:', error);
                    }
                }),
                click: new Sound(require('../assets/sounds/notification.mp3'), (error) => {
                    if (error) {
                        console.log('Failed to load click sound:', error);
                    }
                })
            };
            
            this.isInitialized = true;
            console.log('✅ Sound service initialized');
        } catch (error) {
            console.error('Failed to initialize sound service:', error);
        }
    };

    // Play a specific sound
    playSound = (soundName, shouldVibrate = false, callback = null) => {
        if (!this.isInitialized) {
            console.warn('Sound service not initialized');
            if (callback) callback(false);
            return;
        }

        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound ${soundName} not found`);
            if (callback) callback(false);
            return;
        }

        // Stop if already playing
        sound.stop(() => {
            // Then play
            sound.play((success) => {
                if (success) {
                    console.log(`✅ Sound ${soundName} played successfully`);
                    
                    // Vibrate if requested (Android only)
                    if (shouldVibrate && Platform.OS === 'android') {
                        Vibration.vibrate(200);
                    }
                } else {
                    console.log(`❌ Failed to play sound ${soundName}`);
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
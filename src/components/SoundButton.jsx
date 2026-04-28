// src/components/SoundButton.js
import React, { useState } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import SoundService from '../service/SoundService';

const SoundButton = ({ onPress, title, soundName = 'click', variant = 'primary' }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePress = () => {
        setIsPlaying(true);
        
        // Play sound
        SoundService.playSound(soundName, true, (success) => {
            setIsPlaying(false);
        });
        
        // Call the provided onPress handler
        if (onPress) {
            onPress();
        }
    };

    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'danger':
                return styles.dangerButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryText;
            case 'secondary':
                return styles.secondaryText;
            case 'danger':
                return styles.dangerText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, getButtonStyle()]}
            onPress={handlePress}
            disabled={isPlaying}
        >
            {isPlaying ? (
                <ActivityIndicator size="small" color="#ffffff" />
            ) : (
                <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#0D9488',
    },
    secondaryButton: {
        backgroundColor: '#6B7280',
    },
    dangerButton: {
        backgroundColor: '#EF4444',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#FFFFFF',
    },
    dangerText: {
        color: '#FFFFFF',
    },
});

export default SoundButton;
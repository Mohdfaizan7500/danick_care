import { Linking, StyleSheet, Text, TouchableOpacity, View, Alert, Modal, TextInput, Share } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import {requestUserPermissions} from '../../src/permissions/ReqNotification';
const Home = () => {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [productId, setProductId] = useState('');
    const [showProductInput, setShowProductInput] = useState(false);


     useEffect(() => {
        requestUserPermissions();
    }, [])

    // For testing without deep link configuration
    const handleDirectNavigation = (title) => {
        if (title === 'Profile') {
            navigation.navigate('Profile');
        } else if (title === 'Product') {
            if (productId) {
                navigation.navigate('Product', { productId });
                setProductId('');
            } else {
                Alert.alert('Product ID Required', 'Please enter a product ID');
            }
        }
    };

    const handleClick = (title) => {
        if (title === 'Profile') {
            Linking.openURL('partner://profile').catch(err => {
                console.error('Failed to open deep link:', err);
                // Fallback to direct navigation
                Alert.alert(
                    'Deep Link Failed',
                    'Would you like to open Profile directly?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Yes', onPress: () => navigation.navigate('Profile') }
                    ]
                );
            });
        }
        else if (title === 'Product') {
            if (productId) {
                Linking.openURL(`partner://product/${productId}`).catch(err => {
                    console.error('Failed to open deep link:', err);
                    Alert.alert(
                        'Deep Link Failed',
                        'Would you like to open Product directly?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Yes', onPress: () => navigation.navigate('Product', { productId }) }
                        ]
                    );
                });
                setProductId('');
                setShowProductInput(false);
            } else {
                Alert.alert('Product ID Required', 'Please enter a product ID');
            }
        }
    };

    const generateDeepLink = (type) => {
        let link = '';
        if (type === 'profile') {
            link = 'partner://profile';
        } else if (type === 'product') {
            if (productId) {
                link = `partner://product/${productId}`;
            } else {
                Alert.alert('Product ID Required', 'Please enter a product ID first');
                return null;
            }
        }
        setGeneratedLink(link);
        return link;
    };

    const handleGenerateDeepLink = () => {
        Alert.alert(
            'Generate Deep Link',
            'Select screen to generate deep link',
            [
                {
                    text: 'Profile',
                    onPress: () => {
                        const link = generateDeepLink('profile');
                        if (link) {
                            setGeneratedLink(link);
                            setModalVisible(true);
                        }
                    }
                },
                {
                    text: 'Product',
                    onPress: () => {
                        if (!productId) {
                            Alert.alert('Product ID Required', 'Please enter a product ID first');
                            return;
                        }
                        const link = generateDeepLink('product');
                        if (link) {
                            setGeneratedLink(link);
                            setModalVisible(true);
                        }
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleCopyDeepLink = () => {
        if (generatedLink) {
            Clipboard.setString(generatedLink);
            Toast.show({
                type: 'success',
                text1: 'Copied!',
                text2: 'Deep link copied to clipboard',
                position: 'bottom',
                visibilityTime: 2000,
            });
            setModalVisible(false);
        } else {
            Alert.alert('No Link', 'Please generate a deep link first');
        }
    };

    const testDeepLink = () => {
        if (generatedLink) {
            Linking.openURL(generatedLink).catch(err => {
                console.error('Failed to test deep link:', err);
                Alert.alert('Error', 'Deep link not configured. Make sure you updated AndroidManifest.xml');
            });
            setModalVisible(false);
        } else {
            Alert.alert('No Link', 'Please generate a deep link first');
        }
    };

    const shareDeepLink = async () => {
        if (generatedLink) {
            try {
                await Share.share({
                    message: `Check out this link: ${generatedLink}`,
                    title: 'Share Deep Link',
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
            setModalVisible(false);
        } else {
            Alert.alert('No Link', 'Please generate a deep link first');
        }
    };

    return (
        <View className='bg-white flex-1 justify-center gap-3 items-center'>
            <View className={'gap-3 w-full px-5'}>
                {/* Info Box */}
                <View className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <Text className="text-yellow-800 text-sm text-center">
                        ⚠️ Make sure you've updated AndroidManifest.xml with intent-filter for partner:// scheme
                    </Text>
                </View>

                {/* Product ID Input */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Product ID (for testing):</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
                        placeholder="Enter Product ID (e.g., 123)"
                        value={productId}
                        onChangeText={setProductId}
                        keyboardType="numeric"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleGenerateDeepLink}
                    className="bg-blue-500 px-5 py-4 rounded-xl items-center justify-center"
                >
                    <Text className="text-white font-semibold">Generate Deep Link</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={handleCopyDeepLink}
                    className="bg-green-500 px-5 py-4 rounded-xl items-center justify-center"
                >
                    <Text className="text-white font-semibold">Copy Deep Link</Text>
                </TouchableOpacity>
            </View>

            <View className={'flex-row gap-3 mt-5'}>
                <TouchableOpacity
                    onPress={() => handleClick('Profile')}
                    className="bg-purple-500 px-5 py-4 rounded-xl items-center justify-center"
                >
                    <Text className="text-white font-semibold">Test Profile Deep Link</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={() => handleClick('Product')}
                    className="bg-orange-500 px-5 py-4 rounded-xl items-center justify-center"
                >
                    <Text className="text-white font-semibold">Test Product Deep Link</Text>
                </TouchableOpacity>
            </View>

            {/* Direct Navigation Buttons (Fallback) */}
            <View className="mt-5 pt-5 border-t border-gray-200 w-full px-5">
                <Text className="text-center text-gray-500 mb-3">Or navigate directly:</Text>
                <View className={'flex-row gap-3'}>
                    <TouchableOpacity
                        onPress={() => handleDirectNavigation('Profile')}
                        className="bg-gray-500 px-5 py-3 rounded-xl items-center justify-center flex-1"
                    >
                        <Text className="text-white font-semibold">Profile (Direct)</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => {
                            if (productId) {
                                handleDirectNavigation('Product');
                            } else {
                                Alert.alert('Product ID Required', 'Please enter a product ID');
                            }
                        }}
                        className="bg-gray-500 px-5 py-3 rounded-xl items-center justify-center flex-1"
                    >
                        <Text className="text-white font-semibold">Product (Direct)</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Generated Link Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Generated Deep Link</Text>
                        <View style={styles.linkContainer}>
                            <Text style={styles.linkText} selectable>{generatedLink}</Text>
                        </View>
                        <Text style={styles.linkHint}>
                            Share this link. When clicked, it will open the app to the specific screen.
                        </Text>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.copyButton]}
                                onPress={handleCopyDeepLink}
                            >
                                <Text style={styles.buttonText}>Copy</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.testButton]}
                                onPress={testDeepLink}
                            >
                                <Text style={styles.buttonText}>Test</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.shareButton]}
                                onPress={shareDeepLink}
                            >
                                <Text style={styles.buttonText}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Toast />
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '85%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    linkContainer: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        width: '100%',
    },
    linkText: {
        fontSize: 14,
        color: '#007AFF',
        textAlign: 'center',
    },
    linkHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    copyButton: {
        backgroundColor: '#28A745',
    },
    testButton: {
        backgroundColor: '#007AFF',
    },
    shareButton: {
        backgroundColor: '#FF9800',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
});
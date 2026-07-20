import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Pressable, Linking, ToastAndroid, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import { ImageIcon } from '../assets/svgIcons/SVGIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast } from 'sonner-native';
import StatusMessage from './StatusMessage';

// Helper for cross-platform toast
const showToast = (message) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        Alert.alert('Info', message);
    }
};

const Complaintscard = ({ item, onPress }) => {
    const [modalVisible, setModalVisible] = useState(false);

    if (!item) return null;

    const safeToString = (value, fallback = '') => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === 'object') return fallback;
        return String(value);
    };

    const safeParseFloat = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? fallback : parsed;
    };

    const mapStatusToDisplay = (status) => {
        const statusMap = {
            'Assigned': 'Assigned',
            'On Progress': 'On Progress',
            'Complete': 'Complete',
            'success': 'Complete',
            'Cancel': 'Cancel',
            'assigned': 'Assigned',
            'on_progress': 'On Progress',
            'onworking': 'On Progress',
            'in_progress': 'On Progress',
            'completed': 'Complete',
            'cancelled': 'Cancel',
            'pending': 'Pending',
        };
        const safeStatus = safeToString(status, 'Pending');
        return statusMap[safeStatus] || safeStatus;
    };

    const isRecomplaint = (item) => {
        return item.isRecomplaint === true || item.recomplaint === 'Yes';
    };

    const rawStatus = item?.status;
    const displayStatus = mapStatusToDisplay(rawStatus);
    const serviceType = safeToString(item?.service || item?.service_name, 'Service');
    const complaintType = safeToString(item?.complaint_type, 'service').toUpperCase();
    const recomplaint = isRecomplaint(item);

    const csnValue = safeToString(item?.csn, 'N/A');
    const serviceNameValue = safeToString(item?.service_name, 'Service');
    const customerNameValue = safeToString(item?.customer_name, 'Customer');
    const area = safeToString(item?.area, '');
    const city = safeToString(item?.city, '');
    const mobileValue = safeToString(item?.customer_mobile, 'Mobile not available');
    const amountValue = safeParseFloat(item?.tot_amt, 0);
    const slotDateValue = safeToString(item?.slot_date, '');
    const slotTimeValue = safeToString(item?.slot_time, '');
    const daysValue = safeToString(item?.days, '');

    // Check if latitude and longitude are available
    const hasLocation =
        item?.latitude &&
        item?.longitude &&
        item.latitude !== '' &&
        item.longitude !== '' &&
        item.latitude !== null &&
        item.longitude !== null;

    const handleLocationPress = () => {
        if (hasLocation) {
            const lat = parseFloat(item.latitude);
            const lng = parseFloat(item.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                const url = `https://www.google.com/maps?q=${lat},${lng}`;
                Linking.openURL(url).catch(() => {
                    showToast('Unable to open maps');
                });
            } else {
                showToast('Invalid coordinates');
            }
        } else {
            // Toast('⚠️ Location not available');
            toast.custom(<StatusMessage type="error" title={"⚠️ Location not available"} className="mx-4 mb-6" />, { duration: 300 });
        }
    };

    const handleCallPress = () => {
        const phoneNumber = item?.customer_mobile;
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => { });
        }
    };

    const handleComplaintPress = (complaint) => {
        if (onPress) {
            onPress(complaint);
        } else {
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '') return 'N/A';
        return dateString;
    };

    const isCancel = displayStatus === 'Cancel';
    const isSuccessOrCancel = rawStatus === 'success' || rawStatus === 'cancel' || rawStatus === 'Cancel' || rawStatus === 'cancelled';
    const hideActionButtons = displayStatus === 'Complete' || displayStatus === 'Cancel';

    const getComplaintTypeStyle = () => {
        switch (complaintType) {
            case 'AMC':
                return { backgroundColor: '#E3F2FD', textColor: '#1565C0' };
            case 'SERVICE':
                return { backgroundColor: '#E8F5E9', textColor: '#2E7D32' };
            default:
                return { backgroundColor: '#F5F5F5', textColor: '#757575' };
        }
    };

    const typeStyle = getComplaintTypeStyle();

    return (
        <>
            <TouchableOpacity
                disabled={isCancel}
                onPress={() => handleComplaintPress(item)}
                activeOpacity={0.7}
                style={{
                    backgroundColor: isCancel ? '#FEF2F2' : '#FFFFFF',
                    borderColor: isCancel ? '#FCA5A5' : '#E5E7EB',
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                }}
            >
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View>
                        <Text style={{ color: '#666', fontSize: 12, fontWeight: '500' }}>
                            CSN: {csnValue}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: typeStyle.backgroundColor }}>
                            <Text style={{ fontSize: 12, fontWeight: '500', color: typeStyle.textColor }}>
                                {complaintType}
                            </Text>
                        </View>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: '#E8F5E9' }}>
                            <Text style={{ fontSize: 12, fontWeight: '500', color: '#2E7D32' }}>
                                {serviceType}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Title & Status */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: '#000', fontWeight: '600', fontSize: 16, flex: 1, marginRight: 8 }}>
                        {serviceNameValue}
                    </Text>
                    <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 20,
                        backgroundColor:
                            displayStatus === 'Assigned' ? '#E8F5E9' :
                                displayStatus === 'On Progress' ? '#FFF3E0' :
                                    displayStatus === 'Complete' ? '#E8F5E9' :
                                        displayStatus === 'Cancel' ? '#FFEBEE' : '#F5F5F5'
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '500',
                            color:
                                displayStatus === 'Assigned' ? '#2E7D32' :
                                    displayStatus === 'On Progress' ? '#E65100' :
                                        displayStatus === 'Complete' ? '#2E7D32' :
                                            displayStatus === 'Cancel' ? '#C62828' : '#757575'
                        }}>
                            {displayStatus}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <View style={{ marginTop: 8 }}>
                            {
                                !isSuccessOrCancel &&
                                <Text style={{ color: '#000', fontSize: 14, fontWeight: '500' }}>
                                    {customerNameValue}
                                </Text>
                            }
                            <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                                {!isSuccessOrCancel && area ? area + ' ' : ''}{city || 'hhh'}
                            </Text>
                            {
                                !isSuccessOrCancel &&
                                <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                                    {mobileValue}
                                </Text>
                            }
                        </View>

                        <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }} numberOfLines={2}>
                            Amount: ₹{amountValue.toFixed(2) || 'N/A'}
                        </Text>

                        <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                            Slot Date: {formatDate(slotDateValue) || 'N/A'}
                        </Text>

                        <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                            Slot Time: {formatDate(slotTimeValue) || 'N/A'}
                        </Text>

                        <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                            Description/Remark : {item?.remark || 'N/A'}
                        </Text>
                        <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                            Review : {item?.review || 'N/A'}
                        </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 5 }}>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => item?.image && setModalVisible(true)}
                        >
                            {item?.image ? (
                                <View style={{ width: 96, height: 96, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#E8F5E9', overflow: 'hidden' }}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode='cover'
                                    />
                                </View>
                            ) : (
                                <View style={{ width: 96, height: 96, borderRadius: 16, borderWidth: 1, borderColor: '#2E7D32', backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                                    <ImageIcon width={36} height={36} fill={'#2E7D32'} />
                                    <Text style={{ fontSize: 9, color: '#2E7D32', marginTop: 4 }}>No Image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <View style={{}}>
                            <View style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 20,
                                backgroundColor: recomplaint ? '#FF9800' : '#2196F3'
                            }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                                    {recomplaint ? 'Recomplaint' : 'New'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {daysValue !== '' && daysValue !== '0' && (
                    <Text style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                        {daysValue} days ago
                    </Text>
                )}

                {!hideActionButtons && (
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                    <TouchableOpacity
                        onPress={handleCallPress}
                        style={{
                            flex: 1,
                            backgroundColor: '#2563EB',
                            paddingVertical: 10,
                            borderRadius: 8,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Icon name="call-outline" size={18} color="white" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLocationPress}
                        style={{
                            flex: 1,
                            backgroundColor: hasLocation ? '#10B981' : '#9CA3AF',
                            paddingVertical: 10,
                            borderRadius: 8,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Icon name="map-outline" size={18} color="white" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>
                            {hasLocation ? 'Location' : 'No Location'}
                        </Text>
                    </TouchableOpacity>

                    {/* Job Start Button - Updated with orange color and same onPress as card */}
                    <TouchableOpacity
                        onPress={() => handleComplaintPress(item)}
                        style={{
                            flex: 1,
                            backgroundColor: '#F59E0B', // Orange/amber color
                            paddingVertical: 10,
                            borderRadius: 8,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Icon name="play-outline" size={18} color="white" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Job Start</Text>
                    </TouchableOpacity>
                </View>
                )}
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Image
                            source={{ uri: item?.image }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

export default Complaintscard;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 32,
    },
});

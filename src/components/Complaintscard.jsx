import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Pressable } from 'react-native'
import React, { useState } from 'react'
import { ImageIcon } from '../assets/svgIcons/SVGIcons';

const Complaintscard = ({ item, onPress }) => {
    const [modalVisible, setModalVisible] = useState(false);

    if (!item) return null;

    // Safely convert any value to string
    const safeToString = (value, fallback = '') => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === 'object') return fallback;
        return String(value);
    };

    // Safely parse number
    const safeParseFloat = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? fallback : parsed;
    };

    // Map status to display format
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

    // Check if it's a recomplaint
    const isRecomplaint = (item) => {
        return item.isRecomplaint === true || item.recomplaint === 'Yes';
    };

    // Get safe values
    const rawStatus = item?.status;
    const displayStatus = mapStatusToDisplay(rawStatus);
    const serviceType = safeToString(item?.service || item?.service_name, 'Service');
    const complaintType = safeToString(item?.complaint_type, 'service').toUpperCase();
    const recomplaint = isRecomplaint(item);

    const csnValue = safeToString(item?.csn, 'N/A');
    const idValue = safeToString(item?.id, 'N/A');
    const serviceNameValue = safeToString(item?.service_name, 'Service');
    const customerNameValue = safeToString(item?.customer_name, 'Customer');
    const addressValue = safeToString(item?.service_address, 'Address not available');
    const mobileValue = safeToString(item?.customer_mobile, 'Mobile not available');
    const amountValue = safeParseFloat(item?.tot_amt, 0);
    const slotDateValue = safeToString(item?.slot_date, '');
    const slotTimeValue = safeToString(item?.slot_time, '');
    const daysValue = safeToString(item?.days, '');

    const handleComplaintPress = (complaint) => {
        if (onPress) {
            onPress(complaint);
        } else {
            console.log('Complaint pressed:', complaint);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '') return 'N/A';
        return dateString;
    };

    const formatTime = (timeString) => {
        if (!timeString || timeString === '') return 'N/A';
        return timeString;
    };

    const isCancel = displayStatus === 'Cancel';

    // Color for complaint type badge
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
                {/* Header: Complaint number and service type */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View>
                        <Text style={{ color: '#666', fontSize: 12, fontWeight: '500' }}>
                            CSN: {csnValue}
                        </Text>

                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        {/* Complaint Type Badge */}
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: typeStyle.backgroundColor }}>
                            <Text style={{ fontSize: 12, fontWeight: '500', color: typeStyle.textColor }}>
                                {complaintType}
                            </Text>
                        </View>
                        {/* Service Type Badge */}
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: '#E8F5E9' }}>
                            <Text style={{ fontSize: 12, fontWeight: '500', color: '#2E7D32' }}>
                                {serviceType}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Title and status */}
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
                        {/* Customer details */}
                        <View style={{ marginTop: 8 }}>
                            {
                                (item.status !== "success" && item.status !== "Cancel") &&
                                <Text style={{ color: '#000', fontSize: 14, fontWeight: '500' }}>
                                    {customerNameValue}
                                </Text>
                            }

                            <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                                {addressValue}
                            </Text>
                            {
                                 (item.status !== "success" && item.status !== "Cancel") &&
                                <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                                    {mobileValue}
                                </Text>
                            }

                        </View>

                        {/* Amount */}
                        <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }} numberOfLines={2}>
                            Amount: ₹{amountValue.toFixed(2)}
                        </Text>

                        {/* Slot Date */}
                        {slotDateValue !== '' && (
                            <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                Slot Date: {formatDate(slotDateValue)}
                            </Text>
                        )}

                        {/* Slot Time */}
                        {slotTimeValue !== '' && (
                            <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                Slot Time: {formatTime(slotTimeValue)}
                            </Text>
                        )}
                    </View>

                    {/* Image with tap to open modal */}
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
                                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                />
                            </View>
                        ) : (
                            <View style={{ width: 96, height: 96, borderRadius: 16, borderWidth: 1, borderColor: '#2E7D32', backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                                <ImageIcon width={36} height={36} fill={'#2E7D32'} />
                                <Text style={{ fontSize: 9, color: '#2E7D32', marginTop: 4 }}>No Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Days since complaint */}
                {daysValue !== '' && daysValue !== '0' && (
                    <Text style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                        {daysValue} days ago
                    </Text>
                )}

                {/* Recomplaint/New Badge - positioned at bottom right */}
                <View style={{ position: 'absolute', bottom: 8, right: 8 }}>
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
            </TouchableOpacity>

            {/* Modal for fullscreen image */}
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
    )
}

export default Complaintscard

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
})
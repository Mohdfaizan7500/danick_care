import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const Complaintscard = ({ item, onPress }) => {
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

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString || dateString === '') return 'N/A';
        return dateString;
    };

    // Format time function
    const formatTime = (timeString) => {
        if (!timeString || timeString === '') return 'N/A';
        return timeString;
    };

    // Determine if cancel status
    const isCancel = displayStatus === 'Cancel';

    return (
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
                    <Text style={{ color: '#666', fontSize: 12, fontWeight: '500', marginTop: 2 }}>
                        Complaint ID: {idValue}
                    </Text>
                </View>
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: '#E8F5E9' }}>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#2E7D32' }}>
                        {serviceType}
                    </Text>
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

            {/* Customer details */}
            <View style={{ marginTop: 8 }}>
                <Text style={{ color: '#000', fontSize: 14, fontWeight: '500' }}>
                    {customerNameValue}
                </Text>
                <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                    {addressValue}
                </Text>
                <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                    {mobileValue}
                </Text>
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

            {/* Days since complaint (from API) */}
            {daysValue !== '' && daysValue !== '0' && (
                <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
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
    )
}

export default Complaintscard

const styles = StyleSheet.create({})
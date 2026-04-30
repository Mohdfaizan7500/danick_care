// components/QRCodeCard.js
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import Clipboard from '@react-native-clipboard/clipboard'
import { toast } from 'sonner-native'
import StatusMessage from './StatusMessage'

const QRCodeCard = ({ item, index, onPress, onImagePress, onCopy, getImageUrl, getStatusBadge }) => {
    
    const handleCopyQRCode = (qrCodeNumber) => {
        Clipboard.setString(qrCodeNumber);
        toast.custom(
            <StatusMessage
                type='info'
                title='QR Code Copied!'
                message={`QR Code: ${qrCodeNumber}`}
            />,
            { duration: 1000 }
        );
        if (onCopy) onCopy(qrCodeNumber);
    };

    const statusBadge = getStatusBadge(item.isUsed);
    
    return (
        <View className="bg-white border border-gray-300 rounded-2xl p-4 mb-3">
            <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
                <View className="flex-row">
                    {/* QR Code Image */}
                    <TouchableOpacity onPress={() => onImagePress(getImageUrl(item))}>
                        <View className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 items-center justify-center">
                            {getImageUrl(item) ? (
                                <Image
                                    source={{ uri: getImageUrl(item) }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Icon name="qr-code-outline" size={50} color="#000" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* QR Code Details */}
                    <View className="ml-4 flex-1">
                        <Text className="text-xs text-gray-500 mb-1">Sr: {index + 1}</Text>
                        
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Text className="text-lg font-bold text-text-primary">{item.qrCodeNumber}</Text>
                                {/* Copy Icon */}
                                <TouchableOpacity 
                                    onPress={() => handleCopyQRCode(item.qrCodeNumber)}
                                    className="ml-2 p-1"
                                >
                                    <Icon name="copy-outline" size={18} color="#58A890" />
                                </TouchableOpacity>
                            </View>
                            <View className={`px-2 py-1 rounded-full ${statusBadge.color.split(' ')[0]}`}>
                                <Text className={`text-xs font-semibold ${statusBadge.color.split(' ')[1]}`}>
                                    {statusBadge.text}
                                </Text>
                            </View>
                        </View>

                        {/* Part Name */}
                        {item.partName && item.partName !== 'Spare Part' && (
                            <Text className="text-sm text-gray-700 mt-1">{item.partName}</Text>
                        )}

                        {/* Complaint ID - only show if exists */}
                        {item.complaintId && item.complaintId !== 'N/A' && item.complaintId !== null && (
                            <View className="flex-row items-center mt-1">
                                <Icon name="document-text-outline" size={14} color="#666" />
                                <Text className="text-xs text-gray-600 ml-1">
                                    Complaint ID: {item.complaintId}
                                </Text>
                            </View>
                        )}

                        {(!item.complaintId || item.complaintId === 'N/A') && (
                            <View className="flex-row items-center mt-1">
                                <Icon name="checkmark-circle-outline" size={14} color="#10B981" />
                                <Text className="text-xs text-green-600 ml-1">
                                    Available for use
                                </Text>
                            </View>
                        )}

                       
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default QRCodeCard;

const styles = StyleSheet.create({});
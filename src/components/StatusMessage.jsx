// components/common/StatusMessage.js
import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Color';

// Map type to colors and icons
const typeConfig = {
    success: {
        bg: 'bg-green-50',
        border: 'border-ui-success',
        icon: 'checkmark-circle',
        iconColor: '#58A890', // ui-success
        titleColor: 'text-ui-success',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-ui-error',
        icon: 'alert-circle',
        iconColor: '#E86F6F', // ui-error
        titleColor: 'text-ui-error',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-ui-warning',
        icon: 'warning',
        iconColor: '#F0B27A', // ui-warning
        titleColor: 'text-ui-warning',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-primary-sage400',
        icon: 'information-circle',
        iconColor: '#88D8C0', // primary-sage400
        titleColor: 'text-primary-sage700',
    },
    fail: {
        bg: 'bg-red-50',
        border: 'border-ui-error',
        icon: 'close-circle',
        iconColor: '#E86F6F',
        titleColor: 'text-ui-error',
    },
    alert: {
        bg: 'bg-perpule-50',
        border: 'border-ui-warning',
        icon: 'alert',
        iconColor: '#F0B27A',
        titleColor: 'text-ui-warning',
    },
};

const StatusMessage = ({
    type = 'info',
    title,
    message,
    icon,
    className = '',
    iconSize = 24,
}) => {
    const config = typeConfig[type] || typeConfig.info;

    return (
        <View
          className={`flex-row items-start gap-2 p-4 rounded-xl border  ${config.bg} ${config.border} ${className}`}
        >
          <Icon name={icon || config.icon} size={iconSize} color={config.iconColor} />
          <View className="flex-1">
            <Text className={`font-semibold text-base ${config.titleColor}`}>{title}</Text>
            {message && <Text className="text-text-secondary text-sm mt-1">{message}</Text>}
          </View>
        </View>
        // <View className={`flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4 ${config.bg} ${config.border} ${className}`} >
        //     <Icon name={icon || config.icon} size={iconSize} color={config.iconColor} />
        //     <View className="flex-1">
        //         <Text className={`font-semibold text-base ${config.titleColor}`}>{title}</Text>
        //         {message && <Text className="text-text-secondary text-sm mt-1">{message}</Text>}
        //     </View>
        // </View>
    );
};

export default StatusMessage;
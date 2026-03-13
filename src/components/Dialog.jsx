import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const Dialog = ({
  visible,
  onClose,
  type = 'confirmation',
  title,
  description,
  iconName,
  iconColor,
  iconSize = 40,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancelButton = true,
  showConfirmButton = true,
  confirmButtonStyle = '',
  cancelButtonStyle = '',
  confirmTextStyle = '',
  cancelTextStyle = '',
  titleStyle = '',
  descriptionStyle = '',
  contentStyle = '',
  modalStyle = '',
  closeOnBackdropPress = true,
  animationType = 'fade',
  buttonsDirection = 'row',
  customHeader,
  customFooter,
  children,
}) => {
  
  const getIconByType = () => {
    if (iconName) return iconName;
    
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'help';
    }
  };

  const getColorByType = () => {
    if (iconColor) return iconColor;
    
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const renderHeader = () => {
    if (customHeader) {
      return customHeader;
    }

    return (
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center flex-1">
          <Icon
            name={getIconByType()}
            size={iconSize}
            color={getColorByType()}
          />
          {title && (
            <Text className={`text-lg font-semibold ml-2.5 text-gray-800 flex-1 ${titleStyle}`}>
              {title}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onClose} className="p-1.5">
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (children) {
      return children;
    }

    return (
      <View className={`mb-5 ${contentStyle}`}>
        {description && (
          <Text className={`text-sm text-gray-600 leading-5 ${descriptionStyle}`}>
            {description}
          </Text>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (customFooter) {
      return customFooter;
    }

    return (
      <View className={`mt-2.5 gap-2.5 ${buttonsDirection === 'row' ? 'flex-row' : 'flex-col'}`}>
        {showCancelButton && type === 'confirmation' && (
          <TouchableOpacity
            className={`
              flex-1 py-3 px-5 rounded-lg items-center justify-center
              bg-gray-100 border border-gray-300
              ${buttonsDirection === 'column' ? 'w-full' : ''}
              ${cancelButtonStyle}
            `}
            onPress={handleCancel}
          >
            <Text className={`text-sm font-medium text-gray-600 ${cancelTextStyle}`}>
              {cancelText}
            </Text>
          </TouchableOpacity>
        )}
        
        {showConfirmButton && (
          <TouchableOpacity
            className={`
              flex-1 py-3 px-5 rounded-lg items-center justify-center
              ${buttonsDirection === 'column' ? 'w-full' : ''}
              ${!showCancelButton ? 'w-full' : ''}
              ${confirmButtonStyle}
            `}
            style={{ backgroundColor: getColorByType() }}
            onPress={handleConfirm}
          >
            <Text className={`text-sm font-semibold text-white ${confirmTextStyle}`}>
              {type === 'confirmation' ? confirmText : 'OK'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <View className={`w-[85%] max-w-[400px] ${modalStyle}`}>
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-xl p-5 shadow-lg elevation-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {renderHeader()}
            {renderContent()}
            {renderFooter()}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default Dialog;
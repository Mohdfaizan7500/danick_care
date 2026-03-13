import { Text, View, Modal, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const DialogBox = ({
  visible,
  onClose,
  title,
  titleStyle = '',
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  showCloseButton = true,
  closeIconName = 'close',
  closeIconSize = 24,
  closeIconColor = '#666',
  customHeader,
  footer,
  footerStyle = '',
  children,
  modalAnimationType = 'fade',
  onRequestClose,
  closeOnBackdropPress = true,
  dialogContainerStyle = '',
  contentContainerStyle = '',
  headerStyle = '',
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      width: width * 0.7,
      maxWidth: 320,
      padding: 16,
    },
    md: {
      width: width * 0.85,
      maxWidth: 400,
      padding: 20,
    },
    lg: {
      width: width * 0.9,
      maxWidth: 500,
      padding: 24,
    },
    xl: {
      width: width * 0.95,
      maxWidth: 600,
      padding: 28,
    },
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress && onClose) {
      onClose();
    }
  };

  const renderHeader = () => {
    if (customHeader) {
      return customHeader;
    }

    if (!title && !showCloseButton) return null;

    return (
      <View className={`flex-row justify-between items-center px-5 pt-4 pb-2 border-b overflow-hidden border-gray-100 ${headerStyle}`}>
        {title && (
          <Text 
            className={`text-lg font-semibold text-gray-800 flex-1 mr-2 ${titleStyle}`}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {showCloseButton && (
          <TouchableOpacity 
            onPress={onClose} 
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={closeIconName} size={closeIconSize} color={closeIconColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;

    return (
      <View className={`border-t border-gray-100 p-4 ${footerStyle}`}>
        {footer}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={modalAnimationType}
      onRequestClose={onRequestClose || onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <View 
          className="bg-white rounded-xl shadow-lg elevation-5"
          style={[
            {
              width: sizeConfig[size].width,
              maxWidth: sizeConfig[size].maxWidth,
            },
            dialogContainerStyle && typeof dialogContainerStyle === 'string' 
              ? {} 
              : dialogContainerStyle
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="w-full"
          >
            {renderHeader()}
            
            <View className={`p-${sizeConfig[size].padding/4} ${contentContainerStyle}`}>
              {children}
            </View>
            
            {renderFooter()}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default DialogBox;
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import BackIcon from 'react-native-vector-icons/Ionicons';
const Header = ({ 
  // Title props
  title,
  titleStyle = 'text-base font-semibold text-gray-800',
  titlePosition = 'center', // 'left', 'center', 'right'
  
  // Back button props
  showBackButton = true,
  onBackPress,
  backButtonColor = '#333',
  backButtonStyle = 'p-1',
  
  // Left Icon props (original header icon)
  showLeftIcon = false,
  leftIcon = '🔧',
  customLeftIconComponent,
  leftIconContainerStyle = 'w-10 h-10 rounded-full bg-gray-100 justify-center items-center mb-1',
  leftIconTextStyle = 'text-xl',
  leftIconBackgroundColor,
  onLeftIconPress,
  
  // Right Icon props
  showRightIcon = false,
  rightIcon = '🔧',
  customRightIconComponent,
  rightIconContainerStyle = 'w-10 h-10 rounded-full bg-gray-100 justify-center items-center',
  rightIconTextStyle = 'text-xl',
  rightIconBackgroundColor,
  onRightIconPress,
  
  // Container props
  containerStyle = 'bg-white flex-row items-center justify-between px-4 py-4 border-gray-100 shadow-sm',
  leftContainerStyle = 'w-10 items-start',
  centerContainerStyle = 'flex-1 items-center justify-center',
  rightContainerStyle = 'w-10 items-end',
  
  // Additional props
  showIcon = false, // Kept for backward compatibility
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  // Merge left icon background color with container style
  const getLeftIconContainerStyle = () => {
    if (leftIconBackgroundColor) {
      return [leftIconContainerStyle, { backgroundColor: leftIconBackgroundColor }];
    }
    return leftIconContainerStyle;
  };

  // Merge right icon background color with container style
  const getRightIconContainerStyle = () => {
    if (rightIconBackgroundColor) {
      return [rightIconContainerStyle, { backgroundColor: rightIconBackgroundColor }];
    }
    return rightIconContainerStyle;
  };

  // Determine title container style based on position
  const getTitleContainerStyle = () => {
    switch (titlePosition) {
      case 'left':
        return 'flex-1 items-start justify-center ml-0';
      case 'right':
        return 'flex-1 items-end justify-center mr-2';
      case 'center':
      default:
        return centerContainerStyle;
    }
  };

  // Determine if we need to adjust the layout for title position
  const getLeftContainerWidth = () => {
    if (titlePosition === 'center') return 'w-10';
    return 'w-auto'; // Auto width for left/right positions
  };

  const getRightContainerWidth = () => {
    if (titlePosition === 'center') return 'w-10';
    return 'w-auto'; // Auto width for left/right positions
  };

  return (
    <View className={containerStyle}>
      {/* Left Container with Back Button */}
      <View className={`${getLeftContainerWidth()} ${leftContainerStyle}`}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={handleBackPress}
            className={backButtonStyle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {/* <ArrowBigLeft size={24} color={backButtonColor} /> */}
            <BackIcon name="chevron-back-outline" size={24} color={backButtonColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Container with Left Icon (optional) and Title */}
      <View className={getTitleContainerStyle()}>
        {(showLeftIcon || showIcon) && (
          <TouchableOpacity 
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            activeOpacity={onLeftIconPress ? 0.7 : 1}
            style={titlePosition === 'left' ? { marginRight: 8 } : {}}
          >
            <View className={getLeftIconContainerStyle()}>
              {customLeftIconComponent ? (
                customLeftIconComponent
              ) : (
                <Text className={leftIconTextStyle}>{leftIcon}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        {title && (
          <Text className={titleStyle}>
            {title}
          </Text>
        )}
      </View>

      {/* Right Container for Right Icon */}
      <View className={`${getRightContainerWidth()} ${rightContainerStyle}`}>
        {showRightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={onRightIconPress ? 0.7 : 1}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View className={getRightIconContainerStyle()}>
              {customRightIconComponent ? (
                customRightIconComponent
              ) : (
                <Text className={rightIconTextStyle}>{rightIcon}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({})
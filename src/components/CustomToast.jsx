// components/CustomToast.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";
import { toastColors } from '../constants/Color';
import { CheckCircleIcon, ErrorIcon, InfoIcon, WarningIcon } from '../assets/svgIcons/SVGIcons';

// Custom component to render icons properly
const ToastIcon = ({ type }) => {
  const getIcon = () => {
    switch(type) {
      case 'success':
        return <CheckCircleIcon width={30} height={30} fill={toastColors.success.text1Color} />;
      case 'error':
        return <ErrorIcon width={30} height={30} fill={toastColors.error.text1Color} />;
      case 'info':
        return <InfoIcon width={30} height={30} fill={toastColors.info.text1Color} />;
      case 'warning':
        return <WarningIcon width={30} height={30} fill={toastColors.warning.text1Color} />;
      default:
        return <ErrorIcon width={30} height={30} fill="#000" />;
    }
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{getIcon()}</Text>
    </View>
  );
};

// Custom Success Toast
const CustomSuccessToast = (props) => {
  const colors = toastColors.success;
  return (
    <BaseToast
      {...props}
      style={{ 
        borderLeftWidth: 1, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        borderLeftColor: colors.borderColor, 
        backgroundColor: colors.backgroundColor 
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text1Color,
      }}
      text2Style={{
        fontSize: 12,
        color: colors.text2Color,
      }}
      renderLeadingIcon={() => <ToastIcon type="success" />}
    />
  );
};

// Custom Error Toast
const CustomErrorToast = (props) => {
  const colors = toastColors.error;
  return (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftWidth: 1, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        borderLeftColor: colors.borderColor, 
        backgroundColor: colors.backgroundColor 
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text1Color,
      }}
      text2Style={{
        fontSize: 12,
        color: colors.text2Color,
      }}
      renderLeadingIcon={() => <ToastIcon type="error" />}
    />
  );
};

// Custom Info Toast
const CustomInfoToast = (props) => {
  const colors = toastColors.info;
  return (
    <InfoToast
      {...props}
      style={{ 
        borderLeftWidth: 1, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        borderLeftColor: colors.borderColor, 
        backgroundColor: colors.backgroundColor 
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text1Color,
      }}
      text2Style={{
        fontSize: 12,
        color: colors.text2Color,
      }}
      renderLeadingIcon={() => <ToastIcon type="info" />}
    />
  );
};

// Custom Warning Toast
const CustomWarningToast = (props) => {
  const colors = toastColors.warning;
  return (
    <BaseToast
      {...props}
      style={{ 
        borderLeftWidth: 1, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        borderLeftColor: colors.borderColor, 
        backgroundColor: colors.backgroundColor 
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text1Color,
      }}
      text2Style={{
        fontSize: 12,
        color: colors.text2Color,
      }}
      renderLeadingIcon={() => <ToastIcon type="warning" />}
    />
  );
};

export const toastConfig = {
  success: (props) => <CustomSuccessToast {...props} />,
  error: (props) => <CustomErrorToast {...props} />,
  info: (props) => <CustomInfoToast {...props} />,
  warning: (props) => <CustomWarningToast {...props} />,
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
    width: 60,
    height: '100%',
  },
  icon: {
    fontSize: 22,
  },
});

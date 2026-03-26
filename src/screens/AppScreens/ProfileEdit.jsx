import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import DialogBox from '../../components/DilaogBox';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';
import { useAuth } from '../../context/AuthContext';
import { getProfile, apiClient, changePassword } from '../../lib/api';

const ProfileEdit = () => {
  const navigation = useNavigation();
  const { user, imagUrl } = useAuth();
  const tech_id = user?.id;
  console.log('id:', tech_id);

  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    size: 'sm',
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const scrollViewRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile(tech_id);
      const data = response?.data?.data[0];
      console.log('response:', data);
      console.log("image url :", imagUrl + data?.profile_photo);
      setUserData({
        name: data?.technician_name,
        phone: data?.technician_mobile,
        email: data?.email,
        profileImage: imagUrl + data?.profile_photo,
      });
    } catch (error) {
      console.log('fetch profile error:', error);
      console.error('fetch profile error:', error);
      showDialog('error', 'Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ------------------- Internet Monitoring -------------------
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const retryConnection = async () => {
    setIsCheckingConnection(true);
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected ?? true);
    setIsCheckingConnection(false);
  };

  // ------------------- Keyboard Visibility -------------------
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  // ------------------- Detect changes -------------------
  useEffect(() => {
    const passwordChanged =
      currentPassword !== '' || newPassword !== '' || confirmPassword !== '';
    setHasChanges(passwordChanged);
  }, [currentPassword, newPassword, confirmPassword]);

  // ------------------- Helper Functions -------------------
  const showDialog = (type, title, message, size = 'sm') => {
    setDialogConfig({ type, title, message, size });
    setDialogVisible(true);
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    if (dialogConfig.type === 'success') {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigation.goBack();
    }
  };

  // ------------------- Save Changes -------------------
// ------------------- Save Changes -------------------
const handleSave = async () => {
  // Validate password fields
  if (!currentPassword) {
    showDialog('warning', 'Validation Error', 'Please enter current password');
    return;
  }
  if (!newPassword) {
    showDialog('warning', 'Validation Error', 'Please enter new password');
    return;
  }
  if (!confirmPassword) {
    showDialog('warning', 'Validation Error', 'Please confirm new password');
    return;
  }
  if (newPassword !== confirmPassword) {
    showDialog('error', 'Password Mismatch', 'New password and confirm password do not match');
    return;
  }
  

  try {
    setSaving(true);

    const payload = {
      technician_id: tech_id.toString(),
      old_password: currentPassword,
      new_password: newPassword,
    };

    console.log('Changing password with payload:', payload);

    const response = await changePassword(payload);
    console.log('Password change response:', response);

    // Check the success flag from the response data
    if (response.data && response.data.success === true) {
      showDialog('success', 'Success', 'Password updated successfully', 'sm');
    } else {
      // Show the error message from the API response
      const errorMessage = response.data?.msg || 
                          response.data?.message || 
                          'Failed to update password. Please check your current password and try again.';
      showDialog('error', 'Error', errorMessage);
    }
  } catch (error) {
    console.log('Password change error:', error);
    const errorMessage = error.response?.data?.msg ||
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to update password. Please check your current password and try again.';
    showDialog('error', 'Error', errorMessage);
  } finally {
    setSaving(false);
  }
};
  // ------------------- Dialog Rendering -------------------
  const getDialogIcon = type => {
    switch (type) {
      case 'success':
        return <Icon name="check-circle" size={40} color="#58A890" />;
      case 'error':
        return <Icon name="error" size={40} color="#E86F6F" />;
      case 'warning':
        return <Icon name="warning" size={40} color="#F0B27A" />;
      default:
        return <Icon name="info" size={40} color="#88D8C0" />;
    }
  };

  const renderDialogContent = () => (
    <View className="items-center py-4">
      <View className="mb-4">{getDialogIcon(dialogConfig.type)}</View>
      <Text className="text-gray-800 text-center mb-2">{dialogConfig.message}</Text>
    </View>
  );

  const renderDialogFooter = () => (
    <TouchableOpacity
      onPress={handleDialogClose}
      className={`py-3 px-6 rounded-xl ${dialogConfig.type === 'success'
          ? 'bg-primary-sage500'
          : dialogConfig.type === 'error'
            ? 'bg-red-500'
            : dialogConfig.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-primary-sage500'
        }`}
    >
      <Text className="text-white font-semibold text-center">OK</Text>
    </TouchableOpacity>
  );

  // ------------------- Skeleton Loader -------------------
  const SkeletonLoader = () => (
    <View className="flex-1 px-4">
      {/* Profile Image Skeleton */}
      <View className="items-center mt-6 mb-6">
        <View className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center border-4 border-white">
          <Icon name="person" size={50} color="#CCCCCC" />
        </View>
        <View className="items-center mt-3">
          <View className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <View className="h-3 w-24 bg-gray-200 rounded" />
        </View>
      </View>

      {/* Password Section Skeleton */}
      <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-gray-200 rounded-full mr-2" />
          <View className="h-6 w-32 bg-gray-200 rounded" />
        </View>

        {[1, 2, 3].map((item) => (
          <View key={item} className="mb-4">
            <View className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <View className="h-12 bg-gray-200 rounded-xl" />
          </View>
        ))}

        <View className="mt-2 bg-gray-50 p-3 rounded-xl">
          <View className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <View className="h-3 w-full bg-gray-200 rounded mb-1" />
          <View className="h-3 w-full bg-gray-200 rounded mb-1" />
          <View className="h-3 w-full bg-gray-200 rounded" />
        </View>
      </View>

      {/* Save Button Skeleton */}
      <View className="h-14 bg-gray-200 rounded-xl mb-6" />
    </View>
  );

  // ------------------- Render -------------------
  if (!isConnected) {
    return (
      <NoInternet
        onRetry={retryConnection}
        isChecking={isCheckingConnection}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        showBackButton={true}
        title="Edit Profile"
        titlePosition="center"
        containerStyle="bg-transparent px-4 py-4 flex-row items-center justify-between"
        titleStyle="font-bold text-xl text-black"
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: keyboardVisible ? 10 : 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Profile Image Section */}
              <View className="items-center mt-6 mb-6">
                <View className="relative">
                  <Pressable
                    className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center border-4 border-white shadow-sm"
                    style={{
                      shadowColor: '#88D8C0',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    {userData?.profileImage ? (
                      <Image
                        source={{ uri: userData?.profileImage }}
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Icon name="person" size={50} color="#999999" />
                    )}
                  </Pressable>
                </View>

                <View className="items-center mt-3">
                  <Text className="text-gray-800 text-sm font-medium">{userData.name || 'User Name'}</Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    {userData.phone ? `+91 ${userData.phone}` : '+91 9876543210'}
                  </Text>
                </View>
              </View>

              {/* Password Change Section */}
              <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-primary-sage50 rounded-full items-center justify-center mr-2">
                    <Icon name="lock" size={16} color="#88D8C0" />
                  </View>
                  <Text className="text-gray-800 text-lg font-semibold">Change Password</Text>
                </View>

                {/* Current Password */}
                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">Current Password</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50">
                    <Icon name="lock-outline" size={20} color="#BBBBBB" />
                    <TextInput
                      className="flex-1 py-3 px-2 text-gray-800"
                      placeholder="Enter current password"
                      placeholderTextColor="#BBBBBB"
                      secureTextEntry={!showCurrentPassword}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      editable={!saving}
                    />
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                      <Icon
                        name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#BBBBBB"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">New Password</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50">
                    <Icon name="lock-outline" size={20} color="#BBBBBB" />
                    <TextInput
                      className="flex-1 py-3 px-2 text-gray-800"
                      placeholder="Enter new password"
                      placeholderTextColor="#BBBBBB"
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      editable={!saving}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Icon
                        name={showNewPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#BBBBBB"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">Confirm New Password</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50">
                    <Icon name="lock-outline" size={20} color="#BBBBBB" />
                    <TextInput
                      className="flex-1 py-3 px-2 text-gray-800"
                      placeholder="Confirm new password"
                      placeholderTextColor="#BBBBBB"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSave}
                      editable={!saving}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Icon
                        name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#BBBBBB"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Requirements */}
                <View className="mt-2 bg-gray-50 p-3 rounded-xl">
                  <Text className="text-gray-500 text-xs">Password must:</Text>
                  <Text className="text-gray-500 text-xs mt-1">• Be at least 6 characters long</Text>
                  <Text className="text-gray-500 text-xs">• Include at least one number</Text>
                  <Text className="text-gray-500 text-xs">• Include at least one uppercase letter</Text>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                className={`py-4 rounded-xl items-center shadow-sm mb-6 ${hasChanges && !saving ? 'bg-primary-sage500' : 'bg-gray-300'
                  }`}
                onPress={handleSave}
                disabled={!hasChanges || saving}
                style={
                  hasChanges && !saving
                    ? {
                      shadowColor: '#88D8C0',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                    : {}
                }
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    {hasChanges ? 'Save Changes' : 'No Changes to Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dialog Box */}
      <DialogBox
        visible={dialogVisible}
        onClose={handleDialogClose}
        title={dialogConfig.title}
        size={dialogConfig.size}
        showCloseButton={false}
        closeOnBackdropPress={false}
        contentContainerStyle="px-4"
        footer={renderDialogFooter()}
        headerStyle={
          dialogConfig.type === 'success'
            ? 'bg-green-50 rounded-t-xl'
            : dialogConfig.type === 'error'
              ? 'bg-red-50 rounded-t-xl'
              : dialogConfig.type === 'warning'
                ? 'bg-yellow-50 rounded-t-xl'
                : 'bg-primary-sage50 rounded-t-xl'
        }
        titleStyle={
          dialogConfig.type === 'success'
            ? 'text-green-700'
            : dialogConfig.type === 'error'
              ? 'text-red-700'
              : dialogConfig.type === 'warning'
                ? 'text-yellow-700'
                : 'text-primary-sage700'
        }
      >
        {renderDialogContent()}
      </DialogBox>
    </SafeAreaView>
  );
};

export default ProfileEdit;
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
  Pressable
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Header from '../../components/Header'
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions'
import DialogBox from '../../components/DilaogBox'
import { useNavigation } from '@react-navigation/native'

const ProfileEdit = () => {
  const navigation = useNavigation()
  
  // Mock user data - replace with actual user data from your context/redux
  const userData = {
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@example.com",
    profileImage: null // Initial profile image
  }

  const [image, setImage] = useState(userData.profileImage)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  
  // Track if any changes were made
  const [hasChanges, setHasChanges] = useState(false)
  
  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogConfig, setDialogConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    size: 'sm'
  })

  const scrollViewRef = useRef(null)

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false)
      }
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  // Check for changes
  useEffect(() => {
    const imageChanged = image !== userData.profileImage
    const passwordChanged = currentPassword !== '' || newPassword !== '' || confirmPassword !== ''
    
    setHasChanges(imageChanged || passwordChanged)
  }, [image, currentPassword, newPassword, confirmPassword])

  // Show dialog helper function
  const showDialog = (type, title, message, size = 'sm') => {
    setDialogConfig({ type, title, message, size })
    setDialogVisible(true)
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogVisible(false)
    
    if (dialogConfig.type === 'success') {
      // Clear all input fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      // Navigate back
      navigation.goBack()
    }
  }

  // Check and request camera permission
  const checkCameraPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await check(PERMISSIONS.IOS.CAMERA)
      return status
    } else {
      const status = await check(PERMISSIONS.ANDROID.CAMERA)
      return status
    }
  }

  const requestCameraPermission = async () => {
    if (Platform.OS === 'ios') {
      return await request(PERMISSIONS.IOS.CAMERA)
    } else {
      return await request(PERMISSIONS.ANDROID.CAMERA)
    }
  }

  // Handle image picker
  const handleChooseImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
      selectionLimit: 1,
    }

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
        showDialog('error', 'Error', 'Error selecting image: ' + response.error)
      } else if (response.assets && response.assets[0]) {
        const source = { uri: response.assets[0].uri }
        setImage(source)
        setShowImageOptions(false)
      }
    })
  }

  // Handle take photo with permission check
  const handleTakePhoto = async () => {
    try {
      const permissionStatus = await checkCameraPermission()

      if (permissionStatus === RESULTS.GRANTED) {
        openCamera()
      } else if (permissionStatus === RESULTS.DENIED) {
        const requestStatus = await requestCameraPermission()
        if (requestStatus === RESULTS.GRANTED) {
          openCamera()
        } else {
          showDialog('error', 'Permission Denied', 'Camera permission is required to take photos')
        }
      } else if (permissionStatus === RESULTS.BLOCKED) {
        showDialog('error', 'Permission Blocked', 'Camera permission is blocked. Please enable it in settings')
      }
    } catch (error) {
      console.log('Permission error:', error)
      showDialog('error', 'Error', 'Error accessing camera')
    }
  }

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
      saveToPhotos: true,
    }

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera')
      } else if (response.error) {
        console.log('Camera Error: ', response.error)
        showDialog('error', 'Error', 'Error taking photo: ' + response.error)
      } else if (response.assets && response.assets[0]) {
        const source = { uri: response.assets[0].uri }
        setImage(source)
        setShowImageOptions(false)
      }
    })
  }

  // Handle save changes
  const handleSave = () => {
    // Validate password
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        showDialog('warning', 'Validation Error', 'Please enter current password')
        return
      }
      if (!newPassword) {
        showDialog('warning', 'Validation Error', 'Please enter new password')
        return
      }
      if (!confirmPassword) {
        showDialog('warning', 'Validation Error', 'Please confirm new password')
        return
      }
      if (newPassword !== confirmPassword) {
        showDialog('error', 'Password Mismatch', 'New password and confirm password do not match')
        return
      }
      if (newPassword.length < 6) {
        showDialog('error', 'Invalid Password', 'Password must be at least 6 characters long')
        return
      }
    }

    // Here you would implement the actual save logic
    console.log('Saving changes...')
    console.log('Image:', image)
    console.log('Password changed:', !!newPassword)

    showDialog('success', 'Success', 'Profile updated successfully', 'sm')
  }

  // Get icon based on dialog type
  const getDialogIcon = (type) => {
    switch(type) {
      case 'success':
        return <Icon name="check-circle" size={40} color="#58A890" />
      case 'error':
        return <Icon name="error" size={40} color="#E86F6F" />
      case 'warning':
        return <Icon name="warning" size={40} color="#F0B27A" />
      case 'info':
        return <Icon name="info" size={40} color="#88D8C0" />
      default:
        return <Icon name="info" size={40} color="#88D8C0" />
    }
  }

  // Custom dialog content
  const renderDialogContent = () => (
    <View className="items-center py-4">
      <View className="mb-4">
        {getDialogIcon(dialogConfig.type)}
      </View>
      <Text className="text-gray-800 text-center mb-2">
        {dialogConfig.message}
      </Text>
    </View>
  )

  // Custom dialog footer with OK button
  const renderDialogFooter = () => (
    <TouchableOpacity
      onPress={handleDialogClose}
      className={`py-3 px-6 rounded-xl ${
        dialogConfig.type === 'success' ? 'bg-primary-sage500' :
        dialogConfig.type === 'error' ? 'bg-red-500' :
        dialogConfig.type === 'warning' ? 'bg-yellow-500' :
        'bg-primary-sage500'
      }`}
    >
      <Text className="text-white font-semibold text-center">OK</Text>
    </TouchableOpacity>
  )

  // Image picker options modal
  const ImagePickerModal = () => (
    <TouchableOpacity
      className="absolute inset-0 bg-black/50"
      activeOpacity={1}
      onPress={() => setShowImageOptions(false)}
    >
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 10
        }}
      >
        <View className="items-center mb-4">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        <Text className="text-gray-800 text-lg font-semibold mb-4">Change Profile Photo</Text>

        <TouchableOpacity
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={handleTakePhoto}
        >
          <View className="w-10 h-10 bg-primary-sage50 rounded-full items-center justify-center mr-3">
            <Icon name="camera-alt" size={20} color="#88D8C0" />
          </View>
          <Text className="text-gray-700 text-base flex-1">Take Photo</Text>
          <Icon name="chevron-right" size={20} color="#BBBBBB" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={handleChooseImage}
        >
          <View className="w-10 h-10 bg-primary-sage50 rounded-full items-center justify-center mr-3">
            <Icon name="photo-library" size={20} color="#88D8C0" />
          </View>
          <Text className="text-gray-700 text-base flex-1">Choose from Gallery</Text>
          <Icon name="chevron-right" size={20} color="#BBBBBB" />
        </TouchableOpacity>

        {image && image !== userData.profileImage && (
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => {
              setImage(userData.profileImage)
              setShowImageOptions(false)
            }}
          >
            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
              <Icon name="restore" size={20} color="#E86F6F" />
            </View>
            <Text className="text-red-500 text-base flex-1">Reset to Original</Text>
            <Icon name="chevron-right" size={20} color="#BBBBBB" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="mt-4 py-3 items-center border border-gray-200 rounded-xl"
          onPress={() => setShowImageOptions(false)}
        >
          <Text className="text-gray-600 font-medium">Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      

       <Header 
        showBackButton={true}
        title={'Edit Profile'}
        titlePosition='center'
        containerStyle='bg-transaprent text-red-100 px-4 py-4 flex-row items-center justify-between'
        titleStyle='font-bold text-xl text-black'
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
          {/* Profile Image Section */}
          <View className="items-center mt-6 mb-6">
            <View className="relative">
              {/* Profile Image */}
              <Pressable
                onPress={() => setShowImageOptions(true)}
                className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center border-4 border-white shadow-sm"
                style={{
                  shadowColor: '#88D8C0',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                {image ? (
                  <Image
                    source={image}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Icon name="person" size={50} color="#999999" />
                )}
              </Pressable>

              {/* Edit Button */}
              <TouchableOpacity
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-sage500 rounded-full items-center justify-center border-2 border-white"
                onPress={() => setShowImageOptions(true)}
              >
                <Icon name="edit" size={16} color="white" />
              </TouchableOpacity>
            </View>

            {/* User Name and Phone - Same font size as "Tap edit icon" text */}
            <View className="items-center mt-3">
              <Text className="text-gray-800 text-sm font-medium">{userData.name}</Text>
              <Text className="text-gray-500 text-sm mt-1">{userData.phone}</Text>
            </View>

            <Text className="text-gray-500 text-sm mt-3">Tap edit icon to change photo</Text>
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
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Icon name={showCurrentPassword ? "visibility" : "visibility-off"} size={20} color="#BBBBBB" />
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
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Icon name={showNewPassword ? "visibility" : "visibility-off"} size={20} color="#BBBBBB" />
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
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#BBBBBB" />
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

          {/* Save Button - Enabled only when changes are made */}
          <TouchableOpacity
            className={`py-4 rounded-xl items-center shadow-sm mb-6 ${
              hasChanges ? 'bg-primary-sage500' : 'bg-gray-300'
            }`}
            onPress={handleSave}
            disabled={!hasChanges}
            style={hasChanges ? {
              shadowColor: '#88D8C0',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3
            } : {}}
          >
            <Text className="text-white font-semibold text-base">
              {hasChanges ? 'Save Changes' : 'No Changes to Save'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      {showImageOptions && <ImagePickerModal />}

      {/* Dialog Box for messages */}
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
          dialogConfig.type === 'success' ? 'bg-green-50 rounded-t-xl' :
          dialogConfig.type === 'error' ? 'bg-red-50 rounded-t-xl' :
          dialogConfig.type === 'warning' ? 'bg-yellow-50 rounded-t-xl' :
          'bg-primary-sage50 rounded-t-xl'
        }
        titleStyle={
          dialogConfig.type === 'success' ? 'text-green-700' :
          dialogConfig.type === 'error' ? 'text-red-700' :
          dialogConfig.type === 'warning' ? 'text-yellow-700' :
          'text-primary-sage700'
        }
      >
        {renderDialogContent()}
      </DialogBox>
    </SafeAreaView>
  )
}

export default ProfileEdit
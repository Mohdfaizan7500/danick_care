import React, { useState, useRef, useEffect } from 'react';
import {
  StatusBar,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS, request, check, RESULTS, openSettings } from 'react-native-permissions';
import { requestContactsPermissionAndFetch } from '../../../hooks/contectPermission';
import { ContactImport } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DialogBox from '../../../components/Dialog'; // adjust path if needed

const { width: screenWidth } = Dimensions.get('window');

const getAndroidPermission = (permForApi33, permForOld) => {
  if (Platform.OS !== 'android') return null;
  const apiLevel = Platform.Version;
  return apiLevel >= 33 ? permForApi33 : permForOld;
};

// Permission list with icons and friendly metadata
const PERMISSION_LIST = [
  {
    id: 'location',
    title: 'Location Access',
    description: 'We need your location to show nearby services.',
    icon: 'my-location',
    permission: Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    }),
  },
  {
    id: 'camera',
    title: 'Camera Access',
    description: 'Allow us to capture photos for your profile.',
    icon: 'camera-alt',
    permission: Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    }),
  },
  {
    id: 'notification',
    title: 'Notification Access',
    description: 'Get important updates and alerts.',
    icon: 'notifications',
    permission: Platform.select({
      android: getAndroidPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS, null),
      ios: PERMISSIONS.IOS.NOTIFICATIONS,
    }),
  },
  {
    id: 'contacts',
    title: 'Contacts Access',
    description: 'We need access to your contacts to find friends.',
    icon: 'contacts',
    permission: Platform.select({
      android: PERMISSIONS.ANDROID.READ_CONTACTS,
      ios: PERMISSIONS.IOS.CONTACTS,
    }),
  },
  {
    id: 'gallery',
    title: 'Gallery Access',
    description: 'Access your photos to upload content.',
    icon: 'photo-library',
    permission: Platform.select({
      android: getAndroidPermission(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE),
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    }),
  },
];

const PERMISSION_STORAGE_KEY = '@granted_permissions';
const SETUP_DONE_KEY = '@app_setup_done';

const PermissionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [granted, setGranted] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const contactsImportedRef = useRef(false);

  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    buttons: [],
  });

  const grantedCount = granted.length;
  const remainingSteps = PERMISSION_LIST.length - grantedCount;
  const allGranted = grantedCount === PERMISSION_LIST.length;

  // Load saved granted permissions on mount
  useEffect(() => {
    const loadGrantedPermissions = async () => {
      try {
        const saved = await AsyncStorage.getItem(PERMISSION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setGranted(parsed);
        }
      } catch (error) {
        console.error('Failed to load permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGrantedPermissions();
  }, []);

  // Save granted permissions whenever they change
  useEffect(() => {
    const saveGrantedPermissions = async () => {
      try {
        await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(granted));
      } catch (error) {
        console.error('Failed to save permissions:', error);
      }
    };
    if (!isLoading) {
      saveGrantedPermissions();
    }
  }, [granted, isLoading]);

  // After loading, scroll to first ungranted permission
  useEffect(() => {
    if (!isLoading && scrollViewRef.current) {
      const firstUngrantedIndex = PERMISSION_LIST.findIndex(
        item => !granted.includes(item.id)
      );
      if (firstUngrantedIndex !== -1 && firstUngrantedIndex !== currentIndex) {
        scrollToIndex(firstUngrantedIndex);
      }
    }
  }, [isLoading, granted]);

  // When all permissions are granted, save setup flag and navigate
  useEffect(() => {
    const markSetupDoneAndNavigate = async () => {
      if (allGranted && !isNavigating && !isLoading) {
        setIsNavigating(true);
        try {
          await AsyncStorage.setItem(SETUP_DONE_KEY, 'true');
        } catch (error) {
          console.error('Failed to save setup done flag:', error);
        }
        setTimeout(() => {
          navigation.replace('BottomTabs');
        }, 300);
      }
    };
    markSetupDoneAndNavigate();
  }, [allGranted, navigation, isNavigating, isLoading]);

  // Helper: navigate to the next ungranted permission (scroll only)
  const goToNextUngranted = () => {
    const nextIndex = PERMISSION_LIST.findIndex(item => !granted.includes(item.id));
    if (nextIndex !== -1 && nextIndex !== currentIndex) {
      scrollToIndex(nextIndex);
    }
  };

  // Fetch and import contacts once contacts permission is granted
  useEffect(() => {
    const fetchAndImportContacts = async () => {
      if (
        granted.includes('contacts') &&
        !isLoading &&
        !contactsImportedRef.current &&
        user?.id
      ) {
        contactsImportedRef.current = true;
        try {
          const rawContacts = await requestContactsPermissionAndFetch();
          if (!rawContacts || rawContacts.length === 0) {
            ToastAndroid.show('No contacts found to import', ToastAndroid.SHORT);
            // Do NOT proceed to next permission
            return;
          }

          const formatContactForApi = (contact) => {
            let name = '';
            if (contact.givenName || contact.familyName) {
              name = `${contact.givenName || ''} ${contact.familyName || ''}`.trim();
            }
            if (!name && contact.displayName) {
              name = contact.displayName;
            }
            if (!name) name = 'Unknown';

            const phoneNumbers = contact.phoneNumbers
              .map(pn => pn.number)
              .filter(num => num && num.trim().length > 0);

            return { name, phoneNumbers };
          };

          const formattedContacts = rawContacts.map(formatContactForApi).filter(
            contact => contact.phoneNumbers.length > 0
          );

          if (formattedContacts.length === 0) {
            ToastAndroid.show('No contacts with phone numbers found', ToastAndroid.SHORT);
            // Do NOT proceed to next permission
            return;
          }

          const payload = {
            technician_id: user.id,
            contacts: formattedContacts,
          };
          console.log('payload:',payload)

          const response = await ContactImport(payload);
          const msg = response?.data?.msg;

          if (response?.data?.success) {
            ToastAndroid.show('Success' || 'Contacts imported successfully', ToastAndroid.SHORT);
            // Only proceed if msg matches exactly one of the two allowed strings
            if (msg === 'All contacts already exist' || msg === 'Contacts imported successfully') {
              goToNextUngranted();
            }
          } else {
            if (msg === 'All contacts already exist' ) {
              ToastAndroid.show('Already fatced' || 'Failed to import contacts', ToastAndroid.SHORT);

            }
            // Do NOT proceed to next permission
          }
        } catch (error) {
          console.error('Error importing contacts:', error);
          ToastAndroid.show('Error importing contacts', ToastAndroid.SHORT);
          // Do NOT proceed to next permission
        }
      }
    };
    fetchAndImportContacts();
  }, [granted, isLoading, user]);

  const scrollToIndex = (index) => {
    if (index >= 0 && index < PERMISSION_LIST.length) {
      scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
      setCurrentIndex(index);
    }
  };

  const showDialog = (title, message, buttons = [{ text: 'OK', onPress: () => setDialogVisible(false) }]) => {
    setDialogConfig({ title, message, buttons });
    setDialogVisible(true);
  };

  const requestPermission = async (permItem) => {
    try {
      if (!permItem.permission) {
        if (!granted.includes(permItem.id)) {
          setGranted(prev => [...prev, permItem.id]);
        }
        if (currentIndex < PERMISSION_LIST.length - 1) {
          scrollToIndex(currentIndex + 1);
        }
        return;
      }

      const checkResult = await check(permItem.permission);
      if (checkResult === RESULTS.GRANTED) {
        if (!granted.includes(permItem.id)) {
          setGranted(prev => [...prev, permItem.id]);
        }
        if (currentIndex < PERMISSION_LIST.length - 1) {
          scrollToIndex(currentIndex + 1);
        }
        return;
      }

      if (Platform.OS === 'android' && checkResult === RESULTS.BLOCKED) {
        showDialog(
          'Permission Required',
          `${permItem.title} permission has been permanently denied. Please enable it in app settings.`,
          [
            { text: 'Cancel', onPress: () => setDialogVisible(false) },
            { text: 'Open Settings', onPress: () => { openSettings().catch(console.warn); setDialogVisible(false); } }
          ]
        );
        return;
      }

      const requestResult = await request(permItem.permission);
      if (requestResult === RESULTS.GRANTED) {
        setGranted(prev => [...prev, permItem.id]);
        if (currentIndex < PERMISSION_LIST.length - 1) {
          scrollToIndex(currentIndex + 1);
        }
      } else if (requestResult === RESULTS.BLOCKED) {
        showDialog(
          'Permission Required',
          `${permItem.title} permission is blocked. Please enable it in app settings.`,
          [
            { text: 'Cancel', onPress: () => setDialogVisible(false) },
            { text: 'Open Settings', onPress: () => { openSettings().catch(console.warn); setDialogVisible(false); } }
          ]
        );
      } else {
        showDialog(
          'Permission Denied',
          `${permItem.title} is required for this feature. Please grant permission to continue.`
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      showDialog('Error', 'Something went wrong while requesting permission.');
    }
  };

  const isGranted = (id) => granted.includes(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Loading permissions...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#f9fafb" barStyle="dark-content" />

      {/* Header with progress */}
      <View className="px-6 pt-12 pb-4 bg-white shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-500 text-sm font-medium">Setup Progress</Text>
          <Text className="text-gray-700 text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full">
            {remainingSteps} step{remainingSteps !== 1 ? 's' : ''} left
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(grantedCount / PERMISSION_LIST.length) * 100}%` }}
          />
        </View>
      </View>

      {/* Permission cards horizontal scroll */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {PERMISSION_LIST.map((item, index) => {
          const grantedAlready = isGranted(item.id);
          return (
            <View key={item.id} style={{ width: screenWidth }} className="flex-1 justify-center items-center px-5">
              <View className="bg-white rounded-2xl shadow-lg p-6 w-full border border-gray-100">
                {/* Icon */}
                <View className="items-center mb-4">
                  <View className={`p-4 rounded-full ${grantedAlready ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <Icon name={item.icon} size={48} color={grantedAlready ? '#10b981' : '#3b82f6'} />
                  </View>
                </View>

                <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-center mb-8 px-4">
                  {item.description}
                </Text>

                {grantedAlready ? (
                  <View className="bg-green-50 py-3 rounded-xl flex-row justify-center items-center space-x-2">
                    <Icon name="check-circle" size={20} color="#10b981" />
                    <Text className="text-green-700 text-center font-medium ml-2">
                      Already Allowed
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="bg-blue-600 py-3 px-6 rounded-xl min-w-[150px] self-center flex-row justify-center items-center"
                    onPress={() => requestPermission(item)}
                    onLongPress={item.id === 'contacts' ? () => {
                      if (!granted.includes('contacts')) {
                        setGranted(prev => [...prev, 'contacts']);
                        if (currentIndex < PERMISSION_LIST.length - 1) {
                          scrollToIndex(currentIndex + 1);
                        }
                      }
                    } : undefined}
                    delayLongPress={500}
                  >
                    <Icon name="done" size={20} color="white" />
                    <Text className="text-white text-center font-semibold text-base ml-2">Allow</Text>
                  </TouchableOpacity>
                )}

                {index < PERMISSION_LIST.length - 1 && !grantedAlready && (
                  <Text className="text-gray-400 text-xs text-center mt-6">
                    After allowing, you'll proceed to the next step
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Custom DialogBox */}
      <DialogBox
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title={dialogConfig.title}
        size="sm"
        footer={
          <View className="flex-row justify-end space-x-3">
            {dialogConfig.buttons.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={btn.onPress}
                className={`px-4 py-2 rounded-lg ${btn.text === 'Open Settings' ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <Text className={btn.text === 'Open Settings' ? 'text-white font-medium' : 'text-gray-800'}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      >
        <Text className="text-gray-600 text-base leading-6">{dialogConfig.message}</Text>
      </DialogBox>
    </View>
  );
};

export default PermissionScreen;
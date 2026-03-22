import { Text, View, TouchableOpacity, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Mail, Phone } from 'lucide-react-native';
import { ComplaintsIcon, FileIcon, ReplaceIcon, TermsIcon, UserIcon } from '../../../assets/svgIcons/SVGIcons';
import { useNavigation } from '@react-navigation/native';
import DialogBox from '../../../components/DilaogBox';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

const Profile = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDialogLoggingOut, setIsDialogLoggingOut] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Internet connectivity state

  // Monitor internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const menuItems = [
    {
      id: 'profile',
      icon: <UserIcon width={22} height={22} stroke={'black'} />,
      title: 'My Profile',
      subtitle: 'View and edit your profile',
      route: 'ProfileEdit'
    },
    {
      id: 'complaints',
      icon: <ComplaintsIcon width={22} height={22} fill={'black'} />,
      title: 'My Complaints',
      subtitle: 'View your complaint history',
      route: 'MyComplaints'
    },
    {
      id: 'amc',
      icon: <FileIcon width={22} height={22} stroke={'black'} />,
      title: 'My AMC',
      subtitle: 'View your Annual Maintenance Contracts',
      route: 'AMC'
    },
    {
      id: 'replace',
      icon: <ReplaceIcon width={22} height={22} fill={'black'} />,
      title: 'Replace Parts',
      subtitle: 'Order replacement parts',
      route: 'ReplaceParts'
    },
    {
      id: 'terms',
      icon: <TermsIcon width={22} height={22} fill={'black'} />,
      title: 'Terms & Conditions',
      subtitle: 'Read our terms and conditions',
      route: 'TermsConditions'
    },
    {
      id: 'support',
      icon: <Icon name="support-agent" size={22} color="black" />,
      title: 'Support',
      subtitle: 'Get help from our support team',
      route: 'Support'
    }
  ];

  // Check internet before showing logout dialog
  const handleLogoutPress = () => {
    if (!isConnected) {
      // toast.error('You are offline. Please check your internet connection.');
      toast.custom(<StatusMessage type='error' title={'You are offline. Please check your internet connection.'}/>,{duration:300})
      return;
    }
    setLogoutDialogVisible(true);
  };

  const handleLogout = async () => {
    // Extra safety: if offline, don't proceed
    if (!isConnected) {
      // toast.error('Cannot logout while offline.');
      toast.custom(<StatusMessage type='error' title={'Cannot logout while offline.'}/>,{duration:300})


      setLogoutDialogVisible(false);
      return;
    }

    setIsDialogLoggingOut(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await logout();
      setLogoutDialogVisible(false);
    } catch (error) {
      toast.custom(<StatusMessage type='error' title={'CFailed to logout. Please try again.'}/>,{duration:300})

      // Alert.alert('Error', 'Failed to logout. Please try again.');
      setLogoutDialogVisible(false);
    } finally {
      setIsDialogLoggingOut(false);
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (route) => {
    if (!isConnected) {
      // toast.error('You are offline. Please check your internet connection.');
      toast.custom(<StatusMessage type='error' title={'You are offline. Please check your internet connection.'}/>,{duration:300})
      return;
    }
    else {
      navigation.navigate(route);

    }
  };

  const MenuItem = ({ item, isLast }) => (
    <TouchableOpacity
      className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
      onPress={() => handleNavigation(item.route)}
    >
      <View className="w-11 h-11 rounded-xl bg-[#f0f2f5] justify-center items-center mr-3">
        {item.icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-800">{item.title}</Text>
        <Text className="text-xs text-gray-500 mt-0.5">{item.subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  const logoutFooter = (
    <View className="flex-row gap-3">
      <TouchableOpacity
        className={`flex-1 py-3 rounded-lg ${isDialogLoggingOut ? 'bg-gray-200' : 'bg-gray-100'}`}
        onPress={() => setLogoutDialogVisible(false)}
        disabled={isDialogLoggingOut}
      >
        <Text className={`text-center font-medium ${isDialogLoggingOut ? 'text-gray-400' : 'text-gray-700'}`}>
          Cancel
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${isDialogLoggingOut ? 'bg-red-400' : 'bg-red-500'}`}
        onPress={handleLogout}
        disabled={isDialogLoggingOut}
      >
        {isDialogLoggingOut ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="text-white text-center font-medium">Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="absolute inset-0 z-50 w-90% pointer-events-none">
          <Toaster />
        </View>

        <View className="bg-white p-5 items-center border-b border-gray-200">
          <Image
            source={user?.image ? { uri: user.image } : require('../../../assets/images/profileImage.jpg')}
            className="w-24 h-24 rounded-full mb-4 border-3 border-white shadow-md"
          />

          <Text className="text-2xl font-bold text-gray-800">
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.username || 'User Name'}
          </Text>

          <View className="flex-row items-center mt-1 gap-2">
            <Phone size={14} color="gray" />
            <Text className="text-xs text-gray-500 font-medium">{user?.phone || '+91 98765 43210'}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Mail size={14} color="gray" />
            <Text className="text-xs text-gray-500 font-medium">{user?.email || 'No email provided'}</Text>
          </View>

          {user?.username && (user?.firstName || user?.lastName) && (
            <Text className="text-sm text-gray-500 mt-1">@{user.username}</Text>
          )}
        </View>

        <View className="mt-6">
          <View className="bg-white mx-5 rounded-xl px-4 shadow-md">
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.id}
                item={item}
                isLast={index === menuItems.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Logout Button - Now checks connectivity before showing dialog */}
        <View className="mt-8 mx-5 mb-5">
          <TouchableOpacity
            className="bg-red-500 p-4 rounded-xl flex-row items-center justify-center shadow-md"
            onPress={handleLogoutPress}
            disabled={isDialogLoggingOut}
          >
            <Icon name="logout" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text className="text-base font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center mt-2.5 mb-5 text-gray-400 text-xs">Version 1.0.0</Text>
      </ScrollView>

      <DialogBox
        visible={logoutDialogVisible}
        onClose={() => {
          if (!isDialogLoggingOut) {
            setLogoutDialogVisible(false);
          }
        }}
        title={isDialogLoggingOut ? "Logging out..." : "Confirm Logout"}
        size="sm"
        titleStyle="text-black text-lg font-bold"
        showCloseButton={!isDialogLoggingOut}
        closeIconColor="#000"
        closeOnBackdropPress={!isDialogLoggingOut}
        footer={logoutFooter}
        footerStyle="border-t border-red-100"
        headerStyle="border-0"
      >
        <View className="py-6 items-center">
          {isDialogLoggingOut ? (
            <>
              <Icon name="logout" size={60} color="#EF4444" />
              <Text className="text-gray-600 text-center mt-4 text-base">
                Please wait while we log you out...
              </Text>
            </>
          ) : (
            <>
              <Icon name="logout" size={60} color="#EF4444" />
              <Text className="text-gray-600 text-center mt-4 text-base">
                Are you sure you want to logout?
              </Text>
              <Text className="text-gray-500 text-center mt-1 text-sm">
                You'll need to login again to access your account.
              </Text>
            </>
          )}
        </View>
      </DialogBox>
    </SafeAreaView>
  );
};

export default Profile;
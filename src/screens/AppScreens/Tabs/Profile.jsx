import { Text, View, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Mail, Phone } from 'lucide-react-native';
import { ComplaintsIcon, FileIcon, ReplaceIcon, TermsIcon, UserIcon } from '../../../assets/svgIcons/SVGIcons';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { 
      id: 'profile',
      icon: <UserIcon width={22} height={22} stroke={'gray'} />,
      title: 'My Profile',
      subtitle: 'View and edit your profile',
      route: 'ProfileEdit'
    },
    { 
      id: 'complaints',
      icon: <ComplaintsIcon width={22} height={22} fill={'gray'} />,
      title: 'My Complaints',
      subtitle: 'View your complaint history',
      route: 'Complaints'
    },
    { 
      id: 'amc',
      icon: <FileIcon width={22} height={22} stroke={'gray'} />,
      title: 'My AMC',
      subtitle: 'View your Annual Maintenance Contracts',
      route: 'AMC'
    },
    { 
      id: 'replace',
      icon: <ReplaceIcon width={22} height={22} fill={'gray'} />,
      title: 'Replace Parts',
      subtitle: 'Order replacement parts',
      route: 'ReplaceParts'
    },
    { 
      id: 'terms',
      icon: <TermsIcon width={22} height={22} fill={'gray'} />,
      title: 'Terms & Conditions',
      subtitle: 'Read our terms and conditions',
      route: 'TermsConditions'
    },
    { 
      id: 'support',
      icon: <Icon name="support-agent" size={22} color="gray" />,
      title: 'Support',
      subtitle: 'Get help from our support team',
      route: 'Support'
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleNavigation = (route) => {
    navigation.navigate(route);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* User Info Section */}
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

        {/* Menu Items Section */}
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

        {/* Logout Button */}
        <View className="mt-8 mx-5 mb-5">
          <TouchableOpacity
            className={`bg-red-500 p-4 rounded-xl flex-row items-center justify-center shadow-md ${isLoggingOut ? 'opacity-70' : ''}`}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="logout" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text className="text-base font-semibold text-white">Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text className="text-center mt-2.5 mb-5 text-gray-400 text-xs">Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
import { Text, View, ActivityIndicator, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { getProfile } from '../../lib/api';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Wallet,
  Wrench,
  FileText,
  CreditCard,
  Stamp,
  Truck,
  BadgeCheck,
  CircleDot,
  Star,
  ServerIcon,
  FileQuestion,
  Eye,
  EyeOff,
  FileIcon,
  EyeIcon,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { NodocumentIcon, UserIcon } from '../../assets/svgIcons/SVGIcons';
import dummyData from '../../lib/dummyData';

const ProfileDetails = () => {
  const { user, imagUrl } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAadhar, setShowAadhar] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalDocTitle, setModalDocTitle] = useState('');

  // State for expanding/collapsing documents section
  const [documentsExpanded, setDocumentsExpanded] = useState(false);

  const id = user?.id || 'N/A';
  console.log("user :", user, id);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // const response = await getProfile(id);
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = dummyData.profileData;
      console.log('Profile data fetched:', response);

      if (response?.data?.success && response?.data?.data?.[0]) {
        setProfileData(response.data.data[0]);
      } else {
        setError('No profile data found');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, valueColor = 'text-gray-800', multiline = false, isLast = false }) => (
    <View className={`py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <View className="flex-row items-start">
        <View className="w-6 mt-1">
          <Icon size={16} color="#6b7280" />
        </View>
        <Text className="flex-1 text-gray-600 font-medium ml-2">{label}</Text>
        {!multiline && (
          <Text className={`${valueColor} font-semibold flex-shrink ml-2 text-right`}>{value}</Text>
        )}
      </View>
      {multiline && (
        <View className="ml-8 mt-1">
          <Text className={`${valueColor} font-normal text-black`}>{value}</Text>
        </View>
      )}
    </View>
  );

  const SectionHeader = ({ icon: Icon, title }) => (
    <View className="flex-row items-center mb-3 pb-2">
      <Icon size={22} color="#000" />
      <Text className="text-lg font-bold text-gray-800 ml-2">{title}</Text>
    </View>
  );

  // Enhanced Document2 component with availability text, modal handling and alert
  const Document2 = ({ title, isAvailable, fileUrl, onPressIcon }) => {
    const handlePress = () => {
      if (isAvailable && fileUrl) {
        onPressIcon(fileUrl, title);
      } else {
        Alert.alert('Document Not Available', `${title} has not been uploaded yet.`);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        className={`p-4 border ${isAvailable ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-gray-50'} mb-4 rounded-xl flex-row items-center justify-between`}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View className={`${isAvailable ? 'bg-green-200' : 'bg-gray-200'} w-10 h-10 rounded-xl items-center justify-center`}>
            <FileText size={20} color={isAvailable ? 'green' : 'gray'} />
          </View>
          <View className="flex-1">
            <Text className={`text-gray-600 font-semibold text-base ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
              {title || 'N/A'}
            </Text>
            <Text className={`text-xs mt-0.5 ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
              {isAvailable ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>
        {isAvailable ? (
          <EyeIcon stroke={'green'} width={24} height={24} />
        ) : (
          <NodocumentIcon fill={'red'} width={24} height={24} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title={'Profile'} />
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600 text-sm font-medium">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title={'Profile'} />
        <View className="flex-1 justify-center items-center bg-gray-50">
          <View className="bg-red-50 p-6 rounded-2xl mx-4 items-center border border-red-200">
            <CircleDot size={48} color="#ef4444" />
            <Text className="text-red-600 text-base text-center mt-3 font-medium">Error: {error}</Text>
            <TouchableOpacity
              onPress={fetchProfile}
              className="mt-4 bg-red-600 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title={'Profile'} />
        <View className="flex-1 justify-center items-center bg-gray-50">
          <User size={64} color="#9ca3af" />
          <Text className="text-gray-500 text-base mt-4">No profile data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header title={'Profile'} />
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Image and Info */}
        <View className="items-center pt-8 pb-4 px-4 bg-white">
          <View className="w-28 h-28 rounded-full items-center justify-center border-2 border-gray overflow-hidden bg-gray-100">
            {profileData.profile_photo && !imageError ? (
              <Image
                source={{ uri: `${imagUrl}${profileData.profile_photo}` }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <UserIcon width={60} height={60} stroke={'gray'} />
              </View>
            )}
          </View>

          <Text className="text-2xl font-bold text-gray-800 mt-4">{profileData.technician_name || 'N/A'}</Text>

          <View className="flex-row items-center mt-1">
            <BadgeCheck size={16} color="#3b82f6" />
            <Text className="text-gray-500 text-sm ml-1">ID: {profileData.technician_id || 'N/A'}</Text>
          </View>

          <View className={`mt-3 px-4 py-1.5 rounded-full flex-row items-center ${profileData.login_status === 'Online' ? 'bg-green-50' : 'bg-gray-100'}`}>
            <CircleDot size={14} color={profileData.login_status === 'Online' ? '#22c55e' : '#9ca3af'} />
            <Text className={`ml-1.5 font-semibold ${profileData.login_status === 'Online' ? 'text-green-600' : 'text-gray-600'}`}>
              {profileData.login_status || 'Offline'}
            </Text>
          </View>

          <View className="flex-row items-center mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} color="#fbbf24" fill="#fbbf24" />
            ))}
            <Text className="text-gray-500 text-sm ml-2">(4.8 rating)</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View className="bg-white rounded-2xl mx-4 mt-4 p-5 shadow-sm">
          <SectionHeader icon={User} title="Personal Information" />
          <InfoRow
            icon={Phone}
            label="Mobile Number"
            value={profileData.technician_mobile || 'N/A'}
          />
          <InfoRow
            icon={MapPin}
            label="Address"
            value={profileData.technician_address || 'N/A'}
            valueColor="text-gray-600"
            multiline={true}
          />
          <InfoRow
            icon={Calendar}
            label="Registered On"
            value={profileData.date || 'N/A'}
            isLast={true}
          />
        </View>

        {/* Professional Information */}
        <View className="bg-white rounded-2xl mx-4 mt-4 p-5 shadow-sm">
          <SectionHeader icon={Briefcase} title="Professional Information" />
          <InfoRow
            icon={Truck}
            label="Technician Type"
            value={profileData.technician_type || 'N/A'}
          />
          <InfoRow
            icon={Wallet}
            label="Flat Value"
            value={`₹${profileData.technician_flat_value || '0'}`}
            valueColor="text-green-600"
          />
          <InfoRow
            icon={Wrench}
            label="Product"
            value={`${profileData.per_product || '0'}%`}
          />
          <InfoRow
            icon={CreditCard}
            label="Service"
            value={`${profileData.per_service || '0'}%`}
          />
          <InfoRow
            icon={ServerIcon}
            label="AMC"
            value={`${profileData.per_amc || '0'}%`}
          />
          <InfoRow
            icon={FileText}
            label="Part Policy"
            value={profileData.part_per || 'N/A'}
            isLast={true}
          />
        </View>

        {/* Documents Section - Collapsible */}
        <View className="bg-white rounded-2xl mx-4 mt-4 p-5 shadow-sm mb-6">
          {/* Header with title and chevron icon */}
          <TouchableOpacity 
            onPress={() => setDocumentsExpanded(!documentsExpanded)}
            className="flex-row items-center justify-between mb-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <FileText size={22} color="#000" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Documents</Text>
            </View>
            {documentsExpanded ? (
              <ChevronUp size={24} color="#000" />
            ) : (
              <ChevronDown size={24} color="#000" />
            )}
          </TouchableOpacity>

          {/* When collapsed: show only Aadhar Card */}
          {!documentsExpanded && (
            <Document2
              title="Aadhar Card"
              isAvailable={!!profileData.aadhar}
              fileUrl={profileData.aadhar ? `${imagUrl}${profileData.aadhar}` : null}
              onPressIcon={(url, docTitle) => {
                setModalImageUrl(url);
                setModalDocTitle(docTitle);
                setModalVisible(true);
              }}
            />
          )}

          {/* When expanded: show all documents */}
          {documentsExpanded && (
            <>
              <Document2
                title="Aadhar Card"
                isAvailable={!!profileData.aadhar}
                fileUrl={profileData.aadhar ? `${imagUrl}${profileData.aadhar}` : null}
                onPressIcon={(url, docTitle) => {
                  setModalImageUrl(url);
                  setModalDocTitle(docTitle);
                  setModalVisible(true);
                }}
              />
              <Document2
                title="Driving License"
                isAvailable={!!profileData.dl}
                fileUrl={profileData.dl ? `${imagUrl}${profileData.dl}` : null}
                onPressIcon={(url, docTitle) => {
                  setModalImageUrl(url);
                  setModalDocTitle(docTitle);
                  setModalVisible(true);
                }}
              />
              <Document2
                title="Cheque Copy"
                isAvailable={!!profileData.cheque}
                fileUrl={profileData.cheque ? `${imagUrl}${profileData.cheque}` : null}
                onPressIcon={(url, docTitle) => {
                  setModalImageUrl(url);
                  setModalDocTitle(docTitle);
                  setModalVisible(true);
                }}
              />
              <Document2
                title="Stamp Copy"
                isAvailable={!!profileData.stamp}
                fileUrl={profileData.stamp ? `${imagUrl}${profileData.stamp}` : null}
                onPressIcon={(url, docTitle) => {
                  setModalImageUrl(url);
                  setModalDocTitle(docTitle);
                  setModalVisible(true);
                }}
              />
              <Document2
                title="Resume"
                isAvailable={!!profileData.resume}
                fileUrl={profileData.resume ? `${imagUrl}${profileData.resume}` : null}
                onPressIcon={(url, docTitle) => {
                  setModalImageUrl(url);
                  setModalDocTitle(docTitle);
                  setModalVisible(true);
                }}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal for Document Preview */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center">
          <View className="bg-white rounded-2xl w-11/12 max-h-[80%] p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">{modalDocTitle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
              {modalImageUrl ? (
                <Image
                  source={{ uri: modalImageUrl }}
                  className="w-full h-80 rounded-lg"
                  resizeMode="contain"
                  onError={() => Alert.alert('Error', 'Failed to load document image')}
                />
              ) : (
                <Text className="text-gray-500">No image available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileDetails;
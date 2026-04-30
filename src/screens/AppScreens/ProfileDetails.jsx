import { Text, View, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProfile } from '../../lib/api'
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
  LogOut,
  Settings,
  Share2,
  Star,
  ServerIcon,
  IdCard,
  FileQuestion,
  Eye,
  EyeOff,
  Download,
  UserCircle,
  FileIcon
} from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'

const ProfileDetails = () => {
  const { user, imagUrl } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAadhar, setShowAadhar] = useState(false);
  const [imageError, setImageError] = useState(false);

  const id = user?.id || 'N/A';
  console.log("user :", user, id)

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile(id);
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

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <View className="bg-white rounded-xl p-4 shadow-sm mx-1" style={{ flex: 1 }}>
      <View className={`w-10 h-10 rounded-full ${color} items-center justify-center mb-2`}>
        <Icon size={20} color="white" />
      </View>
      <Text className="text-gray-500 text-xs">{label}</Text>
      <Text className="text-gray-800 font-bold text-lg">{value}</Text>
    </View>
  );

  const DocumentItem = ({ title, fileName, icon: Icon, bgColor, iconColor, isImage = true, isLast = false, onToggleVisibility, showValue, isAadhar = false, docImageError, setDocImageError }) => (
    <TouchableOpacity
      className={`flex-row items-start py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
      onPress={onToggleVisibility}
    >
      <View className={`w-10 h-10 ${bgColor} rounded-lg items-center justify-center mr-3`}>
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-600 font-medium">{title}</Text>
        {fileName ? (
          <>
            {isAadhar ? (
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-gray-800 font-semibold">
                  {showValue ? fileName : 'XXXX XXXX XXXX'}
                </Text>
                <TouchableOpacity onPress={onToggleVisibility} className="ml-2">
                  {showValue ? <EyeOff size={16} color="#6b7280" /> : <Eye size={16} color="#6b7280" />}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                  {fileName}
                </Text>
                {isImage && (
                  <>
                    {docImageError ? (
                      <View className="w-full h-32 rounded-lg mt-2 bg-gray-100 items-center justify-center">
                        <FileQuestion size={48} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs mt-2">Image not available</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: `${imagUrl}${fileName}` }}
                        className="w-full h-32 rounded-lg mt-2"
                        resizeMode="cover"
                        onError={() => setDocImageError && setDocImageError(true)}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <View className="flex-col items-center justify-center  wifull h-32 mt-2">
            <FileIcon size={56} color="#9ca3af" />
            <Text className="text-gray-400 text-xs mt-3">Not uploaded yet</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title={'Profile'} />
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600 text-sm  font-medium">Loading profile...</Text>
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

  // Format Aadhar number for display
  const formatAadharForDisplay = (aadhar) => {
    if (!aadhar) return null;
    const str = aadhar.toString();
    if (str.length === 12) {
      return `${str.slice(0, 4)} ${str.slice(4, 8)} ${str.slice(8, 12)}`;
    }
    return aadhar;
  };

  // Get initials for profile icon
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

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
          {/* Profile Image - Show big icon if no image or image error */}
          <View className="w-28 h-28 rounded-full items-center justify-center shadow-lg border-4 border-white overflow-hidden bg-white">
            {profileData.profile_photo && !imageError ? (
              <Image
                source={{ uri: `${imagUrl}${profileData.profile_photo}` }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 items-center justify-center">
                <Text className="text-white text-4xl font-bold">
                  {getInitials(profileData.technician_name)}
                </Text>
              </View>
            )}
          </View>

          <Text className="text-2xl font-bold text-gray-800 mt-4">{profileData.technician_name || 'N/A'}</Text>

          <View className="flex-row items-center mt-1">
            <BadgeCheck size={16} color="#3b82f6" />
            <Text className="text-gray-500 text-sm ml-1">ID: {profileData.technician_id || 'N/A'}</Text>
          </View>

          <View className={`mt-3 px-4 py-1.5 rounded-full flex-row items-center ${profileData.login_status === 'Online' ? 'bg-green-50' : 'bg-gray-100'
            }`}>
            <CircleDot size={14} color={profileData.login_status === 'Online' ? '#22c55e' : '#9ca3af'} />
            <Text className={`ml-1.5 font-semibold ${profileData.login_status === 'Online' ? 'text-green-600' : 'text-gray-600'
              }`}>
              {profileData.login_status || 'Offline'}
            </Text>
          </View>

          {/* Rating Placeholder */}
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

        {/* Documents Section */}
        <View className="bg-white rounded-2xl mx-4 mt-4 p-5 shadow-sm mb-6">
          <SectionHeader icon={FileText} title="Documents" />

          {/* Aadhar Card Document */}
          <DocumentItem
            title="Aadhar Card"
            fileName={profileData.aadhar ? formatAadharForDisplay(profileData.aadhar) : null}
            icon={IdCard}
            bgColor="bg-orange-50"
            iconColor="#f97316"
            isImage={false}
            isAadhar={true}
            showValue={showAadhar}
            onToggleVisibility={() => setShowAadhar(!showAadhar)}
          />

          {/* Driving License */}
          <DocumentItem
            title="Driving License"
            fileName={profileData.dl || null}
            icon={profileData.dl ? Truck : FileQuestion}
            bgColor={profileData.dl ? "bg-blue-50" : "bg-gray-50"}
            iconColor={profileData.dl ? "#3b82f6" : "#9ca3af"}
            isImage={!!profileData.dl}
            docImageError={false}
            setDocImageError={() => { }}
          />

          {/* Cheque Copy */}
          <DocumentItem
            title="Cheque Copy"
            fileName={profileData.cheque || null}
            icon={profileData.cheque ? CreditCard : FileQuestion}
            bgColor={profileData.cheque ? "bg-green-50" : "bg-gray-50"}
            iconColor={profileData.cheque ? "#22c55e" : "#9ca3af"}
            isImage={!!profileData.cheque}
            docImageError={false}
            setDocImageError={() => { }}
          />

          {/* Stamp Copy - Last item, no border */}
          <DocumentItem
            title="Stamp Copy"
            fileName={profileData.stamp || null}
            icon={profileData.stamp ? Stamp : FileQuestion}
            bgColor={profileData.stamp ? "bg-purple-50" : "bg-gray-50"}
            iconColor={profileData.stamp ? "#a855f7" : "#9ca3af"}
            isImage={!!profileData.stamp}
            isLast={true}
            docImageError={false}
            setDocImageError={() => { }}
          />

          {!profileData.dl && !profileData.cheque && !profileData.stamp && !profileData.aadhar && (
            <View className="items-center py-6">
              <FileText size={48} color="#d1d5db" />
              <Text className="text-gray-400 text-center mt-2">No documents uploaded yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileDetails
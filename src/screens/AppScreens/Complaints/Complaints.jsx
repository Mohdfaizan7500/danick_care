import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext';
import { getComplaints, getDeshBoardCount } from '../../../lib/api';

// Tabs: All, Assigned, On Progress, Complete, Cancel
const TABS = ['All', 'Assigned', 'On Progress', 'Complete', 'Cancel'];

// Skeleton component for loading state
const SkeletonCard = () => (
  <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-3 animate-pulse">
    <View className="flex-row justify-between items-center mb-2">
      <View className="h-3 w-16 bg-gray-200 rounded" />
      <View className="h-5 w-16 bg-gray-200 rounded-full" />
    </View>
    <View className="flex-row justify-between items-center mb-1">
      <View className="h-5 w-40 bg-gray-200 rounded flex-1 mr-2" />
      <View className="h-6 w-20 bg-gray-200 rounded-full" />
    </View>
    <View className="mt-2">
      <View className="h-4 w-32 bg-gray-200 rounded mb-1" />
      <View className="h-3 w-48 bg-gray-200 rounded mb-1" />
      <View className="h-3 w-24 bg-gray-200 rounded" />
    </View>
    <View className="h-4 w-full bg-gray-200 rounded mt-2" />
    <View className="h-3 w-20 bg-gray-200 rounded mt-1" />
  </View>
);

const Complaints = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [tabPositions, setTabPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [complaintsData, setComplaintsData] = useState([]);
  const [dashboardCounts, setDashboardCounts] = useState({
    all: 0,
    assign: 0,
    onworking: 0,
    completed: 0,
    cancel: 0,
    amc: 0,
    bucket: 0,
    prebooking: 0,
    payout: 0,
  });
  const scrollViewRef = useRef(null);
  const timeoutRef = useRef(null);
  const { user } = useAuth();
  const technicianId = user?.id || '1';

  const route = useRoute();
  const status = route?.params?.status;

  // Map tab names to API status strings
  const getApiStatus = (tab) => {
    switch (tab) {
      case 'All': return '';
      case 'Assigned': return 'assign';
      case 'On Progress': return 'onworking';
      case 'Complete': return 'success';
      case 'Cancel': return 'cancel';
      default: return '';
    }
  };

  // Map API status to display status
  const mapStatusToDisplay = (apiStatus) => {
    switch (apiStatus) {
      case 'assign': return 'Assigned';
      case 'onworking': return 'On Progress';
      case 'success': return 'Complete';
      case 'cancel': return 'Cancel';
      default: return apiStatus;
    }
  };

  // Fetch complaints from API
  const fetchComplaints = async (tab) => {
    const apiStatus = getApiStatus(tab);
    setLoading(true);
    try {
      const response = await getComplaints(technicianId, apiStatus);
      console.log('API Response for', tab, ':', response);
      // Handle different response structures
      let result = [];
      if (response?.data?.result) {
        result = response.data.result;
      } else if (response?.data?.data) {
        result = response.data.data;
      } else if (Array.isArray(response?.data)) {
        result = response.data;
      } else if (response?.data) {
        result = [response.data];
      }
      setComplaintsData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaintsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard counts from API
  const fetchTabCount = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      const payload = {
        technician_id: user?.id.toString(),
      };
      const response = await getDeshBoardCount(payload);
      
      if (response?.data?.success) {
        const data = response.data;
        
        setDashboardCounts({
          all: data.all || 0,
          assign: data.assign || 0,
          onworking: data.onworking || 0,
          completed: data.completed || 0,
          cancel: data.cancel || 0,
          amc: data.amc || 0,
          bucket: data.bucket || 0,
          prebooking: data.prebooking || 0,
          payout: data.payout || 0,
        });
      }
    } catch (error) {
      console.log('Fetch dashboard error:', error);
    }
  };

  // Format payout amount to k format
  const formatPayout = (amount) => {
    if (!amount) return '0';
    const number = parseFloat(amount);
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}k`;
    }
    return number.toString();
  };

  // Initial fetch based on route param (if any)
  useEffect(() => {
    fetchTabCount();
    
    if (status === 'Complete' || status === 'Cancel') {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: 200,
          animated: true,
        });
      }
    }
    
    if (status) {
      if (status === 'All') {
        setSelectedTab('All');
        fetchComplaints('All');
      } else if (status === 'Assign') {
        setSelectedTab('Assigned');
        fetchComplaints('Assigned');
      } else if (status === 'Onworking') {
        setSelectedTab('On Progress');
        fetchComplaints('On Progress');
      } else if (status === 'Complete') {
        setSelectedTab('Complete');
        fetchComplaints('Complete');
      } else if (status === 'Cancel') {
        setSelectedTab('Cancel');
        fetchComplaints('Cancel');
      }
    } else {
      // Default: fetch for 'All' tab when no route param
      fetchComplaints('All');
    }
  }, []);

  // Get count for each tab from dashboard data
  const getTabCount = (tab) => {
    switch (tab) {
      case 'All':
        return dashboardCounts.all;
      case 'Assigned':
        return dashboardCounts.assign;
      case 'On Progress':
        return dashboardCounts.onworking;
      case 'Complete':
        return dashboardCounts.completed;
      case 'Cancel':
        return dashboardCounts.cancel;
      default:
        return 0;
    }
  };

  // Filter complaints based on selected tab and search query - FIXED with null checks
  const filteredComplaints = complaintsData.filter((complaint) => {
    // First check if complaint exists
    if (!complaint) return false;
    
    const apiStatus = getApiStatus(selectedTab);
    const matchesTab = selectedTab === 'All' || complaint.status === apiStatus;
    
    // Safe string conversion with null checks
    const complaintId = complaint?.id?.toString() || '';
    const complaintCsn = complaint?.csn?.toString() || '';
    const customerName = complaint?.customer_name || '';
    const serviceName = complaint?.service_name || '';
    
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      complaintId.toLowerCase().includes(searchLower) ||
      complaintCsn.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      serviceName.toLowerCase().includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  const handleTabPress = (tab, index) => {
    if (tab === selectedTab) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setSelectedTab(tab);
    setLoading(true);
    fetchComplaints(tab);

    timeoutRef.current = setTimeout(() => { }, 500);

    if (scrollViewRef.current && tabPositions[index] !== undefined) {
      scrollViewRef.current.scrollTo({
        x: tabPositions[index] - 20,
        animated: true,
      });
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleComplaintPress = (complaint) => {
    navigation.navigate('ComplaintDetail', { complaint });
  };

const renderComplaintCard = ({ item }) => {
  // Add null checks for item properties
  if (!item) return null;
  
  const displayStatus = mapStatusToDisplay(item.status);
  const serviceType = item.service || item.service_name || 'Service';
  
  return (
    <TouchableOpacity
      disabled={displayStatus === 'Cancel'}
      onPress={() => handleComplaintPress(item)}
      className={`border border-ui-border rounded-xl p-4 mb-3 ${displayStatus === 'Cancel' ? 'bg-red-50 border-red-300' : 'bg-ui-card'}`}
    >
      {/* Header: Complaint number and service type */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-text-secondary text-xs font-medium">
          #{item?.id || item?.csn || 'N/A'}
        </Text>
        <View className="px-2 py-0.5 rounded-full bg-primary-sage100">
          <Text className="text-xs font-medium text-primary-sage700">
            {serviceType}
          </Text>
        </View>
      </View>

      {/* Title and status */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-text-primary font-semibold text-base flex-1 mr-2">
          {item.service_name || 'Service'}
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${
            displayStatus === 'Assigned'
              ? 'bg-primary-sage100'
              : displayStatus === 'On Progress'
                ? 'bg-ui-warning/20'
                : displayStatus === 'Complete'
                  ? 'bg-ui-success/20'
                  : displayStatus === 'Cancel'
                    ? 'bg-ui-error/20'
                    : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              displayStatus === 'Assigned'
                ? 'text-primary-sage700'
                : displayStatus === 'On Progress'
                  ? 'text-ui-warning'
                  : displayStatus === 'Complete'
                    ? 'text-ui-success'
                    : displayStatus === 'Cancel'
                      ? 'text-ui-error'
                      : 'text-text-tertiary'
            }`}
          >
            {displayStatus}
          </Text>
        </View>
      </View>

      {/* Customer details */}
      <View className="mt-2">
        <Text className="text-text-primary text-sm font-medium">
          {item.customer_name || 'Customer'}
        </Text>
        <Text className="text-text-tertiary text-xs">{item.service_address || 'Address not available'}</Text>
        <Text className="text-text-tertiary text-xs">{item.customer_mobile || 'Mobile not available'}</Text>
      </View>

      {/* Amount and date */}
      <Text className="text-text-secondary text-sm mt-2" numberOfLines={2}>
        Amount: ₹{parseFloat(item.tot_amt || 0).toFixed(2)}
      </Text>
      <Text className="text-text-tertiary text-xs mt-1">{item.slot_date || 'Date not available'}</Text>
    </TouchableOpacity>
  );
};

  const renderSkeleton = () => (
    <View style={{ padding: 16 }}>
      {[1, 2, 3, 4].map((key) => (
        <SkeletonCard key={key} />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <Header
        title="Complaints"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5 text-text-primary"
        showBackButton={true}
        backButtonColor="#333333"
        containerStyle="bg-background-primary flex-row items-center justify-between px-4 py-4 border-gray-200"
      />

      {/* Compact Search Bar */}
      <View className="px-4 mt-2 mb-4">
        <View className="flex-row items-center bg-background-secondary rounded-xl px-4 py-1.5 border border-ui-border">
          <Icon name="search-outline" size={18} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-text-primary text-sm py-1"
            placeholder="Search complaints..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs with counts from dashboard */}
      <View className="border-b border-ui-border">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 w-[100%] py-1"
        >
          {TABS.map((tab, index) => {
            const count = getTabCount(tab);
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabPress(tab, index)}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  setTabPositions((prev) => {
                    const newPositions = [...prev];
                    newPositions[index] = layout.x;
                    return newPositions;
                  });
                }}
                className="mr-3"
              >
                <View
                  className={`px-4 py-1.5 rounded-full flex-row items-center ${selectedTab === tab
                    ? 'bg-primary-sage600'
                    : 'bg-background-tertiary'
                    }`}
                >
                  <Text
                    className={`text-sm font-medium ${selectedTab === tab
                      ? 'text-text-inverse'
                      : 'text-text-secondary'
                      }`}
                  >
                    {tab}
                  </Text>
                  <View
                    className={`ml-2 px-2 py-0.5 rounded-full ${selectedTab === tab ? 'bg-white/30' : 'bg-ui-border'
                      }`}
                  >
                    <Text
                      className={`text-xs ${selectedTab === tab
                        ? 'text-text-inverse'
                        : 'text-text-tertiary'
                        }`}
                    >
                      {count}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Conditional rendering: skeleton or list */}
      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredComplaints}
          renderItem={renderComplaintCard}
          keyExtractor={(item, index) => item?.id?.toString() || item?.csn?.toString() || index.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Icon name="document-text-outline" size={48} color="#DDDDDD" />
              <Text className="text-text-tertiary text-center mt-4">
                No complaints found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Complaints;
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
import { getComplaints } from '../../../lib/api';

// Tabs: All, Assigned, On Progress, Complete
const TABS = ['All', 'Assigned', 'On Progress', 'Complete'];

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
  const [complaintsData, setComplaintsData] = useState([]); // stores real data from API
  const scrollViewRef = useRef(null);
  const timeoutRef = useRef(null);
  const { user } = useAuth();
  const technicianId = user?.id || '1';

  const route = useRoute();
  const status = route?.params?.status;

  // Map tab names to API status strings
  const getApiStatus = (tab) => {
    switch (tab) {
      case 'All': return 'all';
      case 'Assigned': return 'assign';
      case 'On Progress': return 'onworking';
      case 'Complete': return 'success';
      default: return 'all';
    }
  };

  // Map API status to display status
  const mapStatusToDisplay = (apiStatus) => {
    switch (apiStatus) {
      case 'assign': return 'Assigned';
      case 'onworking': return 'On Progress';
      case 'success': return 'Complete';
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
      // The API returns data in response.data.result
      const result = response?.data?.result || [];
      setComplaintsData(result);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaintsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch based on route param (if any)
  useEffect(() => {
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
      }
    } else {
      // Default: fetch for 'All' tab when no route param
      fetchComplaints('All');
    }
  }, []); // Only runs once on mount

  // Compute counts for each tab based on actual data
  const counts = TABS.reduce((acc, tab) => {
    if (tab === 'All') {
      acc[tab] = complaintsData.length;
    } else {
      const apiStatus = getApiStatus(tab);
      acc[tab] = complaintsData.filter((c) => c.status === apiStatus).length;
    }
    return acc;
  }, {});

  // Filter complaints based on selected tab and search query
  const filteredComplaints = complaintsData.filter((complaint) => {
    const apiStatus = getApiStatus(selectedTab);
    const matchesTab = selectedTab === 'All' || complaint.status === apiStatus;
    const matchesSearch =
      (complaint.csn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (complaint.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (complaint.service_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleTabPress = (tab, index) => {
    if (tab === selectedTab) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setSelectedTab(tab);
    setLoading(true);
    fetchComplaints(tab);

    timeoutRef.current = setTimeout(() => {}, 500);

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
    // Determine priority based on total amount? Or default. We'll use a placeholder for priority.
    // Since API doesn't provide priority, we can derive from amount or keep as "Medium"
    const priority = item.tot_amt > 500 ? 'High' : item.tot_amt > 200 ? 'Medium' : 'Low';
    const displayStatus = mapStatusToDisplay(item.status);
    return (
      <TouchableOpacity
        onPress={() => handleComplaintPress(item)}
        className="bg-ui-card border border-ui-border rounded-xl p-4 mb-3"
      >
        {/* Header: Complaint number and priority */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-text-secondary text-xs font-medium">
            #{item.csn}
          </Text>
          <View
            className={`px-2 py-0.5 rounded-full ${
              priority === 'High'
                ? 'bg-ui-error/20'
                : priority === 'Medium'
                ? 'bg-ui-warning/20'
                : 'bg-ui-success/20'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                priority === 'High'
                  ? 'text-ui-error'
                  : priority === 'Medium'
                  ? 'text-ui-warning'
                  : 'text-ui-success'
              }`}
            >
              {priority}
            </Text>
          </View>
        </View>

        {/* Title and status */}
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-text-primary font-semibold text-base flex-1 mr-2">
            {item.service_name}
          </Text>
          <View
            className={`px-3 py-1 rounded-full ${
              displayStatus === 'Assigned'
                ? 'bg-primary-sage100'
                : displayStatus === 'On Progress'
                ? 'bg-ui-warning/20'
                : displayStatus === 'Complete'
                ? 'bg-ui-success/20'
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
            {item.customer_name}
          </Text>
          <Text className="text-text-tertiary text-xs">{item.service_address}</Text>
          <Text className="text-text-tertiary text-xs">{item.customer_mobile}</Text>
        </View>

        {/* Description and date */}
        <Text className="text-text-secondary text-sm mt-2" numberOfLines={2}>
          Amount: ₹{item.tot_amt}
        </Text>
        <Text className="text-text-tertiary text-xs mt-1">{item.slot_date}</Text>
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

      {/* Tabs with counts and scroll-on-click */}
      <View className="border-b border-ui-border">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 w-[100%] py-1"
        >
          {TABS.map((tab, index) => (
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
                className={`px-4 py-1.5 rounded-full flex-row items-center ${
                  selectedTab === tab
                    ? 'bg-primary-sage600'
                    : 'bg-background-tertiary'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedTab === tab
                      ? 'text-text-inverse'
                      : 'text-text-secondary'
                  }`}
                >
                  {tab}
                </Text>
                <View
                  className={`ml-2 px-2 py-0.5 rounded-full ${
                    selectedTab === tab ? 'bg-white/30' : 'bg-ui-border'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      selectedTab === tab
                        ? 'text-text-inverse'
                        : 'text-text-tertiary'
                    }`}
                  >
                    {counts[tab]}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conditional rendering: skeleton or list */}
      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredComplaints}
          renderItem={renderComplaintCard}
          keyExtractor={(item) => item.id?.toString() || item.csn}
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
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  LayoutAnimation,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext';
import { getComplaints, getDeshBoardCount } from '../../../lib/api';

// Tabs: All, Assigned, On Progress, Complete, Cancel
const TABS = ['All', 'Assigned', 'On Progress', 'Complete', 'Cancel'];

// Skeleton component for loading state
const SkeletonCard = () => (
  <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-3">
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

// Loading footer component
const LoadingFooter = () => (
  <View className="py-4 items-center justify-center">
    <ActivityIndicator size="small" color="#666666" />
    <Text className="text-text-tertiary text-xs mt-2">Loading more...</Text>
  </View>
);

const Complaints = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [tabPositions, setTabPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [complaintsData, setComplaintsData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
  const flatListRef = useRef(null);
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

  // Fetch complaints from API with pagination
  const fetchComplaints = async (tab, page = 1, isLoadMore = false, isRefresh = false) => {
    const apiStatus = getApiStatus(tab);

    if (!isLoadMore && !isRefresh) {
      setLoading(true);
      setComplaintsData([]);
      setCurrentPage(1);
      setHasMore(true);
      setTotalPages(1);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await getComplaints(technicianId, apiStatus, page);
      console.log('API Response for', tab, 'page', page, ':', response);

      // Handle response structure based on your API
      let result = [];
      let currentPageNum = 1;
      let itemsPerPage = 10;
      let totalItems = 0;

      if (response?.data?.success) {
        // Your API response structure: { success: true, result: [], page: "1", limit: 10 }
        result = response.data.result || [];
        currentPageNum = parseInt(response.data.page) || 1;
        itemsPerPage = parseInt(response.data.limit) || 10;

        // Calculate total pages based on dashboard counts
        const totalCount = getTabCount(tab);
        if (totalCount > 0) {
          totalItems = totalCount;
          const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
          setTotalPages(calculatedTotalPages);

          // Check if there are more pages
          const hasMorePages = currentPageNum < calculatedTotalPages;
          setHasMore(hasMorePages);

          console.log(`Page ${currentPageNum} of ${calculatedTotalPages}, Has more: ${hasMorePages}, Items loaded: ${result.length}`);
        } else {
          // If no total count from dashboard, determine based on result length
          if (result.length === itemsPerPage) {
            setHasMore(true);
            setTotalPages(currentPageNum + 1);
          } else {
            setHasMore(false);
            setTotalPages(currentPageNum);
          }
        }
      } else if (Array.isArray(response?.data)) {
        result = response.data;
        setHasMore(false);
        setTotalPages(1);
      } else if (response?.data) {
        result = [response.data];
        setHasMore(false);
        setTotalPages(1);
      }

      const newData = Array.isArray(result) ? result : [];

      if (isLoadMore) {
        // Append new data to existing list
        setComplaintsData(prev => {
          // Avoid duplicates by filtering out items that already exist
          const existingIds = new Set(prev.map(item => item?.id));
          const uniqueNewData = newData.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNewData];
        });
        setCurrentPage(currentPageNum);
      } else if (isRefresh) {
        // Refresh - replace data
        setComplaintsData(newData);
        setCurrentPage(currentPageNum);
      } else {
        setComplaintsData(newData);
        setCurrentPage(currentPageNum);
      }

    } catch (error) {
      console.error('Error fetching complaints:', error);
      if (!isLoadMore && !isRefresh) {
        setComplaintsData([]);
      }
      setHasMore(false);
    } finally {
      if (!isLoadMore && !isRefresh) {
        setLoading(false);
      } else if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Refresh all data (dashboard counts and complaints)
  const refreshAllData = async () => {
    console.log('Refreshing all data...');
    setRefreshing(true);
    
    try {
      // First refresh dashboard counts
      await fetchTabCount();
      
      // Small delay to ensure counts are updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then refresh complaints for current tab
      await fetchComplaints(selectedTab, 1, false, true);
      
      console.log('All data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load more data when reaching the end
  const loadMoreComplaints = () => {
    // Prevent multiple calls while loading
    if (loadingMore || loading || refreshing) {
      console.log('Skipping load more - already loading');
      return;
    }

    // Check if there are more pages to load
    if (!hasMore) {
      console.log('No more pages to load');
      return;
    }

    // Calculate next page number
    const nextPage = currentPage + 1;

    // Check if next page exceeds total pages
    if (nextPage > totalPages) {
      console.log(`Next page ${nextPage} exceeds total pages ${totalPages}`);
      setHasMore(false);
      return;
    }

    console.log(`Loading more complaints: Page ${nextPage} of ${totalPages}`);
    fetchComplaints(selectedTab, nextPage, true, false);
  };

  // Refresh data (pull to refresh)
  const onRefresh = () => {
    console.log('Pull to refresh triggered');
    refreshAllData();
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

  // Initialize data on mount
  const initializeData = async () => {
    await fetchTabCount();

    // Small delay to ensure dashboard counts are loaded
    setTimeout(() => {
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
          fetchComplaints('All', 1, false, false);
        } else if (status === 'Assign') {
          setSelectedTab('Assigned');
          fetchComplaints('Assigned', 1, false, false);
        } else if (status === 'Onworking') {
          setSelectedTab('On Progress');
          fetchComplaints('On Progress', 1, false, false);
        } else if (status === 'Complete') {
          setSelectedTab('Complete');
          fetchComplaints('Complete', 1, false, false);
        } else if (status === 'Cancel') {
          setSelectedTab('Cancel');
          fetchComplaints('Cancel', 1, false, false);
        }
      } else {
        // Default: fetch for 'All' tab when no route param
        fetchComplaints('All', 1, false, false);
      }
    }, 100);
  };

  // Initial fetch based on route param (if any)
  useEffect(() => {
    initializeData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - refreshing data');
      refreshAllData();
      
      return () => {
        // Cleanup if needed
        console.log('Screen unfocused');
      };
    }, [selectedTab]) // Re-run when selectedTab changes
  );

  // Filter complaints based on selected tab and search query
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
    fetchComplaints(tab, 1, false, false);

    timeoutRef.current = setTimeout(() => { }, 500);

    if (scrollViewRef.current && tabPositions[index] !== undefined) {
      scrollViewRef.current.scrollTo({
        x: tabPositions[index] - 20,
        animated: true,
      });
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Scroll to top when changing tabs
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const handleComplaintPress = (complaint) => {
    console.log('Selected complaint:', complaint);
    if (complaint?.status === 'success') {
      navigation.navigate('QRCodeDetails', { complaint, status: "complaint" });
    }
    else {
      navigation.navigate('ComplaintDetail', { complaint, status: "complaint" });
    }
  };

  // Function to determine if it's a recomplaint
  const isRecomplaint = (complaint) => {
    return complaint?.recomplaint === 'Yes' || complaint?.recomplaint === true;
  };

  const renderComplaintCard = ({ item }) => {
    // Add null checks for item properties
    if (!item) return null;

    const displayStatus = mapStatusToDisplay(item.status);
    const serviceType = item.service || item.service_name || 'Service';
    const recomplaint = isRecomplaint(item);

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
            className={`px-3 py-1 rounded-full ${displayStatus === 'Assigned'
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
              className={`text-xs font-medium ${displayStatus === 'Assigned'
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
          <Text className="text-text-tertiary text-xs">
            {item.service_address || 'Address not available'}
          </Text>
          <Text className="text-text-tertiary text-xs">
            {item.customer_mobile || 'Mobile not available'}
          </Text>
        </View>

        {/* Amount and date */}
        <Text className="text-text-secondary text-sm mt-2" numberOfLines={2}>
          Amount: ₹{parseFloat(item.tot_amt || 0).toFixed(2)}
        </Text>
        <Text className="text-text-tertiary text-xs mt-1">
          {item.slot_date || 'Date not available'}
        </Text>

        {/* Recomplaint/New Badge - positioned at bottom right */}
        <View className="absolute bottom-2 right-2">
          <View
            className={`px-2 py-1 rounded-full ${recomplaint ? 'bg-orange-500' : 'bg-blue-500'
              }`}
          >
            <Text className="text-white text-xs font-bold">
              {recomplaint ? 'Recomplaint' : 'New'}
            </Text>
          </View>
        </View>
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

  // Render footer for FlatList
  const renderFooter = () => {
    if (!hasMore && complaintsData.length > 0) {
      return (
        <View className="py-4 items-center justify-center">
          <Text className="text-text-tertiary text-xs">No more complaints to load</Text>
        </View>
      );
    }
    if (loadingMore) {
      return <LoadingFooter />;
    }
    return null;
  };

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
          ref={flatListRef}
          data={filteredComplaints}
          renderItem={renderComplaintCard}
          keyExtractor={(item, index) =>
            item?.id?.toString() || item?.csn?.toString() || index.toString()
          }
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreComplaints}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A6FA5']}
              tintColor="#4A6FA5"
            />
          }
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
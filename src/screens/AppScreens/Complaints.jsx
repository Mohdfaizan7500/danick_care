import React, { useState, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';

// Mock data for complaints – extended with customer info and priority
const MOCK_COMPLAINTS = [
  {
    id: '1',
    complaintNumber: 'CMP001',
    title: 'Broken AC in office',
    status: 'Assigned',
    priority: 'High',
    date: '2025-03-15',
    description: 'The AC is not cooling properly.',
    customerName: 'John Doe',
    address: '123 Main St, Office 4',
    phone: '+1 555-1234',
  },
  {
    id: '2',
    complaintNumber: 'CMP002',
    title: 'Leaking tap',
    status: 'In Progress',
    priority: 'Medium',
    date: '2025-03-14',
    description: 'Water leaking from kitchen sink.',
    customerName: 'Jane Smith',
    address: '456 Oak Ave, Apt 2B',
    phone: '+1 555-5678',
  },
  {
    id: '3',
    complaintNumber: 'CMP003',
    title: 'WiFi not working',
    status: 'Pending',
    priority: 'Low',
    date: '2025-03-13',
    description: 'No internet connection in conference room.',
    customerName: 'Bob Johnson',
    address: '789 Pine Rd',
    phone: '+1 555-9012',
  },
  {
    id: '4',
    complaintNumber: 'CMP004',
    title: 'Printer jam',
    status: 'Complete',
    priority: 'Medium',
    date: '2025-03-12',
    description: 'Printer on first floor is jammed.',
    customerName: 'Alice Brown',
    address: '321 Elm St',
    phone: '+1 555-3456',
  },
  {
    id: '5',
    complaintNumber: 'CMP005',
    title: 'Light bulb replacement',
    status: 'Cancel',
    priority: 'Low',
    date: '2025-03-11',
    description: 'Tube light in lobby is flickering.',
    customerName: 'Charlie Davis',
    address: '654 Maple Dr',
    phone: '+1 555-7890',
  },
  {
    id: '6',
    complaintNumber: 'CMP006',
    title: 'Projector bulb issue',
    status: 'Assigned',
    priority: 'High',
    date: '2025-03-10',
    description: 'Projector displays dim image.',
    customerName: 'Diana Evans',
    address: '987 Cedar Ln',
    phone: '+1 555-2345',
  },
];

const TABS = ['Bucket', 'Assigned', 'In Progress', 'Pending', 'Complete', 'Cancel'];

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
  const [selectedTab, setSelectedTab] = useState('Bucket');
  const [tabPositions, setTabPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const timeoutRef = useRef(null);

  // Compute counts for each tab
  const counts = TABS.reduce((acc, tab) => {
    if (tab === 'Bucket') {
      acc[tab] = MOCK_COMPLAINTS.length;
    } else {
      acc[tab] = MOCK_COMPLAINTS.filter((c) => c.status === tab).length;
    }
    return acc;
  }, {});

  // Filter complaints based on selected tab and search query
  const filteredComplaints = MOCK_COMPLAINTS.filter((complaint) => {
    const matchesTab = selectedTab === 'Bucket' || complaint.status === selectedTab;
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleTabPress = (tab, index) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSelectedTab(tab);
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Animate tab scroll
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

  const renderComplaintCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleComplaintPress(item)}
      className="bg-ui-card border border-ui-border rounded-xl p-4 mb-3"
    >
      {/* Header: Complaint number and priority */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-text-secondary text-xs font-medium">
          #{item.complaintNumber}
        </Text>
        <View
          className={`px-2 py-0.5 rounded-full ${
            item.priority === 'High'
              ? 'bg-ui-error/20'
              : item.priority === 'Medium'
              ? 'bg-ui-warning/20'
              : 'bg-ui-success/20'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              item.priority === 'High'
                ? 'text-ui-error'
                : item.priority === 'Medium'
                ? 'text-ui-warning'
                : 'text-ui-success'
            }`}
          >
            {item.priority}
          </Text>
        </View>
      </View>

      {/* Title and status */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-text-primary font-semibold text-base flex-1 mr-2">
          {item.title}
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${
            item.status === 'Assigned'
              ? 'bg-primary-sage100'
              : item.status === 'In Progress'
              ? 'bg-ui-warning/20'
              : item.status === 'Pending'
              ? 'bg-ui-secondary/20'
              : item.status === 'Complete'
              ? 'bg-ui-success/20'
              : item.status === 'Cancel'
              ? 'bg-ui-error/20'
              : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              item.status === 'Assigned'
                ? 'text-primary-sage700'
                : item.status === 'In Progress'
                ? 'text-ui-warning'
                : item.status === 'Pending'
                ? 'text-text-secondary'
                : item.status === 'Complete'
                ? 'text-ui-success'
                : item.status === 'Cancel'
                ? 'text-ui-error'
                : 'text-text-tertiary'
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {/* Customer details */}
      <View className="mt-2">
        <Text className="text-text-primary text-sm font-medium">
          {item.customerName}
        </Text>
        <Text className="text-text-tertiary text-xs">{item.address}</Text>
        <Text className="text-text-tertiary text-xs">{item.phone}</Text>
      </View>

      {/* Description and date */}
      <Text className="text-text-secondary text-sm mt-2" numberOfLines={2}>
        {item.description}
      </Text>
      <Text className="text-text-tertiary text-xs mt-1">{item.date}</Text>
    </TouchableOpacity>
  );

  // Render skeleton list
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
          className="px-4 py-1"
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
                  selectedTab === tab ? 'bg-primary-sage600' : 'bg-background-tertiary'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedTab === tab ? 'text-text-inverse' : 'text-text-secondary'
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
                      selectedTab === tab ? 'text-text-inverse' : 'text-text-tertiary'
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
          keyExtractor={(item) => item.id}
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
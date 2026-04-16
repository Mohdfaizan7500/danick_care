import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { TechnicianServices } from '../../lib/api';
import { CheckCircleIcon, CrossCircleIcon } from '../../assets/svgIcons/SVGIcons';
// Fix the import - make sure the path is correct

const Services = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            setError(null);

            // Add null check for TechnicianServices
            if (!TechnicianServices || typeof TechnicianServices !== 'function') {
                console.error('TechnicianServices is not a function. Available:', TechnicianServices);
                throw new Error('API function not available');
            }

            const payload = {
                technician_id: user?.id?.toString() || "1",
                city_id: user?.city_id?.toString() || "1"
            };

            console.log('Fetching services with payload:', payload);

            const response = await TechnicianServices(payload);
            console.log('Full API response:', response);

            // Handle different response structures
            let servicesData = [];

            // Try different response structures
            if (response?.data?.data && Array.isArray(response.data.data)) {
                servicesData = response.data.data;
            } else if (response?.data && Array.isArray(response.data)) {
                servicesData = response.data;
            } else if (response?.data?.result && Array.isArray(response.data.result)) {
                servicesData = response.data.result;
            } else if (response?.result && Array.isArray(response.result)) {
                servicesData = response.result;
            } else if (Array.isArray(response)) {
                servicesData = response;
            } else if (response?.data && response.data.success && Array.isArray(response.data.data)) {
                servicesData = response.data.data;
            } else {
                console.log('Unexpected response structure:', response);
                servicesData = [];
            }

            console.log('Extracted services data:', servicesData);

            // Transform API data to component format
            const transformedServices = servicesData.map(service => ({
                id: service.id,
                name: service.service_name,
                active: service.assigned === 1,
                description: getServiceDescription(service.service_name),
                assigned: service.assigned
            }));

            setServices(transformedServices);
            console.log(`Loaded ${transformedServices.length} services`);

        } catch (error) {
            console.error('Error fetching services:', error);
            setError(error?.message || 'Failed to load services');
            Alert.alert('Error', error?.message || 'Failed to load services');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getServiceDescription = (serviceName) => {
        const descriptions = {
            'RO': 'Water purifier service and repair',
            'AC': 'Air conditioner service and repair',
            'Fridge': 'Refrigerator service and repair',
            'Microwave': 'Microwave oven service and repair',
            'Washing Machine': 'Washing machine service and repair',
            'Geyser': 'Water heater service and repair',
            'Chimney': 'Chimney service and repair',
            'TV': 'Television service and repair',
            'Computer': 'Computer and laptop service'
        };
        return descriptions[serviceName] || `${serviceName} service and support`;
    };



    const handleRefresh = () => {
        setRefreshing(true);
        fetchServices();
    };

    const renderServiceCard = (service) => (
        <View
            key={service.id}

            activeOpacity={0.7}
            className="mb-3"
        >
            <View
                className={`flex-row items-center gap-4 justify-between p-4 rounded-xl border ${service.active
                    ? 'bg-[#F0FDF4] border-[#B9F8CF]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB]'
                    }`}

            >
               {
                service.active ? (<CheckCircleIcon width={24} height={24}/>):(<CrossCircleIcon width={24} height={24}/>)
               }
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <Text
                            className={`text-base font-semibold ${service.active ? 'text-green-800' : 'text-gray-600'
                                }`}
                        >
                            {service.name}
                        </Text>
                        <View
                            className={`ml-3 px-2 py-0.5 rounded-full ${service.active ? 'bg-green-100' : 'bg-gray-100'
                                }`}
                        >
                            <Text
                                className={`text-xs font-medium ${service.active ? 'text-green-700' : 'text-gray-600'
                                    }`}
                            >
                                {service.active ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                    </View>
                    <Text
                        className={`text-sm ${service.active ? 'text-green-600' : 'text-gray-400'
                            }`}
                        numberOfLines={2}
                    >
                        {service.description}
                    </Text>
                </View>

            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View className="flex-1 justify-center items-center py-16">
            <Icon name="build-circle" size={64} color="#ccc" />
            <Text className="text-base text-gray-400 text-center mt-4">
                No services available
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-2">
                No services have been assigned to you yet
            </Text>
        </View>
    );

    const renderError = () => (
        <View className="flex-1 justify-center items-center py-16">
            <Icon name="error-outline" size={64} color="#F44336" />
            <Text className="text-base text-red-500 text-center mt-4">
                Failed to load services
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
                {error}
            </Text>
            <TouchableOpacity
                onPress={fetchServices}
                className="mt-6 bg-orange-500 px-6 py-3 rounded-lg"
            >
                <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Header
                    title={'Services'}
                    containerStyle="flex-row px-4 py-4 border-b border-gray-200"
                    titlePosition="left"
                    titleStyle="font-bold text-xl ml-5"
                />
                <View className="flex-1 justify-center items-center bg-gray-50">
                    <ActivityIndicator size="large" color="#FF5722" />
                    <Text className="mt-2.5 text-base text-gray-500">Loading services...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Header
                    title={'Services'}
                    containerStyle="flex-row px-4 py-4 border-b border-gray-200"
                    titlePosition="left"
                    titleStyle="font-bold text-xl ml-5"
                />
                {renderError()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Header
                title={'Services'}
                containerStyle="flex-row px-4 py-4 border-b border-gray-200"
                titlePosition="left"
                titleStyle="font-bold text-xl ml-5"
            />
            <ScrollView
                className="flex-1 bg-gray-50"
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            >
                <View className="p-4 px-6">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-gray-500 text-sm">
                            {services.length} service{services.length !== 1 ? 's' : ''} available
                        </Text>

                    </View>

                    {services.length > 0 ? (
                        services.map(service => renderServiceCard(service))
                    ) : (
                        renderEmptyState()
                    )}
                </View>
                <View className="h-4" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default Services;


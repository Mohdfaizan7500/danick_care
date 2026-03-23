import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native';
import React, { useState } from 'react';
import Header from '../../components/Header';
import { useRoute } from '@react-navigation/native';
import {
  Package, Hash, Layers, CheckCircle, XCircle,
  FileText, ShoppingCart, Heart, X, Star
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PartDetails = () => {
  const route = useRoute();
  const part = route.params.part;
  const [modalVisible, setModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Stock status logic
  const getStockStatus = () => {
    const inStock = part.inStock !== undefined ? part.inStock : true;
    return {
      color: inStock ? 'text-status-online' : 'text-status-busy',
      bgColor: inStock ? 'bg-primary-sage50' : 'bg-status-busy/10',
      icon: inStock ? CheckCircle : XCircle,
      text: inStock ? 'In Stock' : 'Out of Stock',
      iconColor: inStock ? '#58A890' : '#E86F6F',
    };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      {/* Header – absolutely positioned over image */}
      <View className="absolute top-0 z-10 w-full" style={{ top: insets.top }}>
        <Header
          showBackButton
          titlePosition="left"
          containerStyle="bg-transparent px-5 py-4"
          rightComponent={
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <Heart
                size={24}
                color={isFavorite ? '#E86F6F' : '#FFFFFF'}
                fill={isFavorite ? '#E86F6F' : 'transparent'}
              />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Section with subtle gradient overlay */}
        <View className="w-full h-96 bg-background-secondary relative">
          <Image
            source={{
              uri:
                part.image ||
                part.imageUrl ||
                'https://via.placeholder.com/400x400?text=No+Image',
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
          <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        </View>

        {/* Details Card */}
        <View className="bg-white rounded-t-3xl -mt-6 px-6 pt-6 pb-8 shadow-lg">
          {/* Product Name & Price */}
          <View className="flex-row justify-between items-start mb-4">
            <Text className="flex-1 mr-4 text-3xl font-bold text-text-primary">
              {part.name}
            </Text>
            <Text className="text-2xl font-bold text-primary-sage600">
              {part.price}
            </Text>
          </View>

          {/* Stock Status & Rating (if available) */}
          <View className="flex-row items-center justify-between mb-4">
            <View className={`flex-row items-center ${stockStatus.bgColor} px-3 py-1.5 rounded-full`}>
              <StockIcon size={18} color={stockStatus.iconColor} />
              <Text className={`ml-1.5 text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </Text>
            </View>
            {part.rating && (
              <View className="flex-row items-center">
                <Star size={18} color="#F0B27A" fill="#F0B27A" />
                <Text className="ml-1 text-text-secondary font-medium">{part.rating}</Text>
              </View>
            )}
          </View>

          {/* Quick Highlights */}
          <View className="flex-row mb-6">
            <View className="flex-1 items-center p-2 bg-background-secondary rounded-lg mr-2">
              <Package size={20} color="#777777" />
              <Text className="text-xs text-text-secondary mt-1">Type</Text>
              <Text className="text-sm font-semibold text-text-primary">{part.type || 'Part'}</Text>
            </View>
            <View className="flex-1 items-center p-2 bg-background-secondary rounded-lg mx-2">
              <Layers size={20} color="#777777" />
              <Text className="text-xs text-text-secondary mt-1">Category</Text>
              <Text className="text-sm font-semibold text-text-primary">{part.category || 'General'}</Text>
            </View>
            <View className="flex-1 items-center p-2 bg-background-secondary rounded-lg ml-2">
              <Hash size={20} color="#777777" />
              <Text className="text-xs text-text-secondary mt-1">Part #</Text>
              <Text className="text-sm font-semibold text-text-primary">{part.partNumber?.slice(-4) || 'N/A'}</Text>
            </View>
          </View>

          {/* Details Grid */}
          <View className="bg-background-secondary rounded-xl p-4 mb-6">
            {/* Manufacturer */}
            <View className="flex-row items-center py-3 border-b border-ui-border">
              <Package size={20} color="#777777" />
              <Text className="flex-1 ml-3 text-text-secondary">Manufacturer</Text>
              <Text className="font-semibold text-text-primary">
                {part.manufacturer || 'Original'}
              </Text>
            </View>

            {/* Warranty */}
            <View className="flex-row items-center py-3 border-b border-ui-border">
              <FileText size={20} color="#777777" />
              <Text className="flex-1 ml-3 text-text-secondary">Warranty</Text>
              <Text className="font-semibold text-text-primary">
                {part.warranty || '1 Year'}
              </Text>
            </View>

            {/* Model/Compatibility */}
            <View className="flex-row items-center py-3">
              <FileText size={20} color="#777777" />
              <Text className="flex-1 ml-3 text-text-secondary">Compatibility</Text>
              <Text className="font-semibold text-text-primary">
                {part.compatibility || 'Universal'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-2">Description</Text>
            <Text className="text-text-secondary leading-6">
              {part.description || part.desc || 'No description available.'}
            </Text>
          </View>

          {/* Add to Bucket Button (no quantity) */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-primary-sage500 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
          >
            <ShoppingCart size={22} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Add to Bucket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal – Additional Details (Bottom Sheet style) */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Grabber */}
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-ui-border rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-text-primary">Product Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#777777" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <InfoItem label="Product Name" value={part.name} />
                <InfoItem label="Part Number" value={part.partNumber || 'N/A'} />
                <InfoItem label="Category" value={part.category || part.categoryName || 'General'} />
                <InfoItem label="Price" value={part.price} highlight />
                <InfoItem label="Availability" custom>
                  <View className={`flex-row items-center ${stockStatus.bgColor} px-3 py-2 rounded-lg self-start`}>
                    <StockIcon size={16} color={stockStatus.iconColor} />
                    <Text className={`ml-1 font-medium ${stockStatus.color}`}>{stockStatus.text}</Text>
                  </View>
                </InfoItem>
                <InfoItem label="Description" value={part.description || part.desc || 'No description available.'} />
                <InfoItem label="Specifications" value={part.specifications || 'Standard specifications apply'} />
                <InfoItem label="Shipping" value="Free shipping on orders above ₹500" />
                <InfoItem label="Returns" value="7-day easy returns" />
              </View>
            </ScrollView>

            {/* Modal Footer Button */}
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                // Add to cart logic (quantity = 1)
                console.log(`Added ${part.name} to cart`);
              }}
              className="mt-6 bg-primary-sage500 py-3 rounded-xl"
            >
              <Text className="text-white font-bold text-center text-lg">Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper component for modal info rows
const InfoItem = ({ label, value, highlight, custom }) => (
  <View>
    <Text className="text-sm text-text-tertiary mb-1">{label}</Text>
    {custom ? (
      custom
    ) : (
      <Text className={`text-base ${highlight ? 'text-primary-sage600 font-bold' : 'text-text-primary'}`}>
        {value}
      </Text>
    )}
  </View>
);

export default PartDetails;

const styles = StyleSheet.create({});
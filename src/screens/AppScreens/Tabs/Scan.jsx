import { Text, View, Button, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';

const Scan = () => {
  const [scannedData, setScannedData] = useState(null);        // removed TypeScript generic
  const [isScanning, setIsScanning] = useState(true);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  // Request camera permission on mount if not already granted
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Configure the barcode scanner
  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'ean-8',
      'code-128',
      'code-39',
      'pdf-417',
      'aztec',
      'data-matrix',
    ], // add any other barcode formats you need
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning) {
        const code = codes[0].value;
        if (code) {
          setIsScanning(false);          // stop scanning after first detection
          setScannedData(code);
          Alert.alert('Scanned', `Barcode: ${code}`);
          // Here you can call an API to fetch product details using the barcode
        }
      }
    },
  });

  // Handle permission denied
  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Camera Permission Required
          </Text>
          <Text className="text-base text-gray-600 text-center mb-4">
            Please grant camera access to scan barcodes.
          </Text>
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Handle missing camera device (e.g., emulator without camera)
  if (device == null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Camera Unavailable
          </Text>
          <Text className="text-base text-gray-600">
            No camera device found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main camera view
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1">
        <Camera
          style={{ flex: 1 }}
          device={device}
          isActive={isScanning}          // camera only active when scanning
          codeScanner={codeScanner}
        />

        {/* Overlay with scanned result */}
        {scannedData && (
          <View className="absolute bottom-10 left-5 right-5 bg-white p-4 rounded-lg shadow-lg">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              Scanned Data:
            </Text>
            <Text className="text-base text-gray-600 mb-3">{scannedData}</Text>
            <Button
              title="Scan Again"
              onPress={() => {
                setScannedData(null);
                setIsScanning(true);
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Scan;
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

// For Expo projects, use these instead:
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';

export const downloadAndOpenPDF = async (pdfUrl, fileName = 'invoice.pdf') => {
  try {
    // Request storage permission for Android
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to download PDF files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Cannot download PDF without storage permission');
        return false;
      }
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    // Set download path
    let downloadPath;
    if (Platform.OS === 'android') {
      downloadPath = `${RNFS.DownloadDirectoryPath}/${uniqueFileName}`;
    } else {
      downloadPath = `${RNFS.DocumentDirectoryPath}/${uniqueFileName}`;
    }

    // Show downloading alert
    Alert.alert('Downloading', 'Please wait while downloading PDF...');

    // Download the file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: pdfUrl,
      toFile: downloadPath,
    }).promise;

    if (downloadResult.statusCode === 200) {
      Alert.alert(
        'Download Complete',
        'PDF downloaded successfully! Would you like to open it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open', 
            onPress: () => FileViewer.open(downloadPath)
          },
        ]
      );
      return true;
    } else {
      throw new Error('Download failed');
    }
  } catch (error) {
    console.error('PDF Download Error:', error);
    Alert.alert('Download Failed', 'Unable to download PDF. Please try again.');
    return false;
  }
};

// For Expo projects:
export const downloadAndOpenPDFExpo = async (pdfUrl, fileName = 'invoice.pdf') => {
  try {
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const downloadPath = `${FileSystem.documentDirectory}${uniqueFileName}`;

    const downloadResumable = FileSystem.createDownloadResumable(
      pdfUrl,
      downloadPath
    );

    const result = await downloadResumable.downloadAsync();
    
    if (result && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri);
      return true;
    } else {
      Alert.alert('Error', 'Unable to share/download the PDF');
      return false;
    }
  } catch (error) {
    console.error('PDF Download Error:', error);
    Alert.alert('Download Failed', 'Unable to download PDF. Please try again.');
    return false;
  }
}; 
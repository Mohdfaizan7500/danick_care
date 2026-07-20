import messaging from '@react-native-firebase/messaging'

export const getFCMToken = async () => {
        try {
            const token = await messaging().getToken();
            return token;

        }
        catch (err) {

        }

    }

import messaging from '@react-native-firebase/messaging'

export const getFCMToken = async () => {
        try {
            const token = await messaging().getToken();
            console.log("FCM Token is :", token);
            return token;

        }
        catch (err) {
            console.log("Erroe generate FCM token:", err);
            console.error("Erroe generate FCM token:", err);

        }

    }

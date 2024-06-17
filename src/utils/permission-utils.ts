import { Alert, Linking, PermissionsAndroid } from "react-native";

export const requestLocationPermissions = async () => {
    const fineLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
            title: "Location Permission Required",
            message:
            "This app needs access to your location.",

            buttonPositive: "OK",
        }
    );

    const backgroundLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION, {
            title: "Location Permission Required",
            message:
            'This app needs access to your location, Please grant "Always Allow" location permission to continue.',
            buttonPositive: "OK",
        }
    );

    const areAnyPermissionsDenied = Object.values([backgroundLocationPermission, fineLocationPermission]).some(permission => permission !== PermissionsAndroid.RESULTS.GRANTED);

    if (areAnyPermissionsDenied) {
        Alert.alert(
          'Insufficient Permissions',
          'Please manually grant "Always Allow" location permission to continue.',
          [{ text: 'OK', onPress: () => Linking.openSettings()}],
          { cancelable: false }
        );
    }
};

export const requestNotificationPermissions = async () => {
    await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, {
          title: "App Notification Permission",
          message: "This app needs access to post notifications.",
          buttonPositive: "OK",
        }
    );
};
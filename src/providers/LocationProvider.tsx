import React, { useState, useEffect, FC, createContext, useContext, ReactNode } from 'react';
import { PermissionsAndroid, NativeModules, AppState, Alert, Linking } from 'react-native';
import GetLocation, { Location } from 'react-native-get-location';
import { Dirs, FileSystem, getEx } from 'react-native-file-access';
import BackgroundTimer from "react-native-background-timer"

const { LocationModule, LockDetector } = NativeModules;

interface LocationContextProps {
  location?: FileLocation,
  changeGetLocationMethod: () => void,
  useNativeAndroidModule: boolean
}

interface LocationProviderProps {
  children: ReactNode
}

interface BaseLocation {
  latitude: number,
  longitude: number,
}

interface FileLocation extends BaseLocation {
  date: Date,
  isLocked: boolean
}

const LocationContext = createContext<LocationContextProps>({} as LocationContextProps);
export const useLocationContext = () => useContext(LocationContext);

const LocationProvider: FC<LocationProviderProps> = ({ children }) => {
  const [useNativeAndroidModule, setUseNativeAndroidModule] = useState(true);
  const [location, setLocation] = useState<FileLocation>();
  const [intervalId, setIntervalId] = useState(0);

  const requestPermissions = async () => {
    const permissions = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    ]);

    const areAnyPermissionsDenied = Object.values(permissions).some(permission => permission!== PermissionsAndroid.RESULTS.GRANTED);

    if (areAnyPermissionsDenied) {
        Alert.alert(
          'Insufficient Permissions',
          'Please manually grant "Always Allow" location permission to continue.',
          [{ text: 'OK', onPress: () => Linking.openSettings()}],
          { cancelable: false }
        );
    }
  };

  const updateLocation = async () => {
    const isLocked = await LockDetector.isDeviceLocked();

    console.log(isLocked)

    if (useNativeAndroidModule) {
      await LocationModule.getLocation()
      .then((location: Location) => {
        saveLocation(location);
      })
      .catch((error: Error) => {
        console.error(error);
      });
    }
    else {
      await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000
      })
        .then(location => {
          saveLocation(location);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const saveLocation = async (location: BaseLocation) => {
    const filePath = `${Dirs.DocumentDir}/locations.json`;
    const date = new Date();
    const isLocked = await LockDetector.isDeviceLocked() as boolean;
    const newLocation = { date, isLocked, ...location };

    setLocation(newLocation);

    try {
      const doesFileExist = await FileSystem.exists(filePath);

      if (!doesFileExist) {
        await FileSystem.writeFile(filePath, JSON.stringify([newLocation]), 'utf8');
      } else {
        const fileContent = await FileSystem.readFile(filePath);
        const locations = JSON.parse(fileContent);

        locations.push(newLocation);

        await FileSystem.writeFile(filePath, JSON.stringify(locations), 'utf8');
      }
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
      requestPermissions();
  }, [])

  useEffect(() => {
    BackgroundTimer.clearInterval(intervalId)

     const interval = BackgroundTimer.setInterval(updateLocation, 5000);

     setIntervalId(interval)

     return () => BackgroundTimer.clearInterval(intervalId);
   }, [useNativeAndroidModule]);

  const changeGetLocationMethod = () => setUseNativeAndroidModule(useNative => !useNative);

  return (
    <LocationContext.Provider value={{changeGetLocationMethod, location, useNativeAndroidModule}}>
      { children }
    </LocationContext.Provider>
  );
};

export default LocationProvider;
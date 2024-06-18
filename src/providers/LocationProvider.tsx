import React, { useState, useEffect, FC, createContext, useContext, ReactNode } from 'react';
import { NativeModules } from 'react-native';
import GetLocation from 'react-native-get-location';
import { Dirs, FileSystem } from 'react-native-file-access';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import { requestLocationPermissions, requestNotificationPermissions } from '../utils/permission-utils';

const { LocationModule, LockDetector } = NativeModules;

interface LocationContextProps {
  location?: BaseLocation,
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

interface LocationContextProps {
  location?: BaseLocation,
  changeGetLocationMethod: () => void,
  useNativeAndroidModule: boolean
}

const LocationContext = createContext<LocationContextProps>({} as LocationContextProps);
export const useLocationContext = () => useContext(LocationContext);

const LocationProvider: FC<LocationProviderProps> = ({ children }) => {
  const [useNativeAndroidModule, setUseNativeAndroidModule] = useState(true);
  const [location, setLocation] = useState<BaseLocation>();

  const saveLocationToFile = async ({ latitude, longitude }: BaseLocation) => {
    const filePath = `${Dirs.DocumentDir}/location-tracking.json`;
    const date = new Date();
    const isLocked = await LockDetector.isDeviceLocked() as boolean;
    const newLocation = { date, isLocked, latitude, longitude } as FileLocation;

    try {
      const doesFileExist = await FileSystem.exists(filePath);

      if (!doesFileExist) {
        await FileSystem.writeFile(filePath, JSON.stringify([newLocation]));
      } else {
        const fileContent = await FileSystem.readFile(filePath);
        const locations = JSON.parse(fileContent);

        locations.push(newLocation);

        await FileSystem.writeFile(filePath, JSON.stringify(locations));
      }
    } catch (error) {
        console.error(error);
    }
  };

  const updateLocationByAndroidModule = async () => 
    await LocationModule.getLocation()
      .then((location: BaseLocation) => {
        setLocation(location)
        saveLocationToFile(location);
      })
      .catch((error: Error) => {
        console.error(error);
      })

  const updateLocationByReactNativeModule = async () => 
    await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000
    })
      .then(({ latitude, longitude }) => {
        setLocation({ latitude, longitude })
        saveLocationToFile({ latitude, longitude });
      })
      .catch(error => {
        console.error(error);
      });

  const updateLocation = () => {
    if (useNativeAndroidModule) {
      updateLocationByAndroidModule()
    }
    else {
      updateLocationByReactNativeModule()
    }
  };

  useEffect(() => {
      if(!location) {
        requestLocationPermissions();
        requestNotificationPermissions();
      }
  }, [location])

  useEffect(() => {
    ReactNativeForegroundService.add_task(updateLocation, { 
        delay: 5000,
        onLoop: true,
        onError: (error: Error) => console.error(`Error:`, error.stack),
      }
    );

    ReactNativeForegroundService.start({
      id: 1000,
      title: "Location Tracker",
      message: "Running in the background",
      icon: "ic_launcher",
      visibility: 'public',
    });
   }, []);

  const changeGetLocationMethod = () => setUseNativeAndroidModule(useNative => !useNative);

  return (
    <LocationContext.Provider value={{changeGetLocationMethod, location, useNativeAndroidModule}}>
      { children }
    </LocationContext.Provider>
  );
};

export default LocationProvider;
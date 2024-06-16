import React, { useState, useEffect, FC, createContext, useContext, ReactNode } from 'react';
import { NativeModules } from 'react-native';
import GetLocation, { Location } from 'react-native-get-location';
import { Dirs, FileSystem } from 'react-native-file-access';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import { requestLocationPermissions, requestNotificationPermissions } from '../utils/permission-utils';

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

  const updateLocation = async () => {
    const isLocked = await LockDetector.isDeviceLocked();

    console.log(isLocked)

    if (useNativeAndroidModule) {
      await LocationModule.getLocation()
      .then((location: Location) => {
        console.log(location)
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
          console.log(location)
          saveLocation(location);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const saveLocation = async ({ latitude, longitude }: BaseLocation) => {
    const filePath = `${Dirs.DocumentDir}/locations.json`;
    const date = new Date();
    const isLocked = await LockDetector.isDeviceLocked() as boolean;
    const newLocation = { date, isLocked, latitude, longitude };

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
      if(!location) {
        requestLocationPermissions();
      }
  }, [location])

  useEffect(() => {
    requestNotificationPermissions();
  }, [])

  useEffect(() => {
    ReactNativeForegroundService.add_task(updateLocation,
      { 
        delay: 5000,
        onLoop: true,
        taskId: "taskid",
        onError: (error: Error) => console.error(`Error:`, error.stack),
      }
    );

    ReactNativeForegroundService.start({
      id: 1243,
      title: "Location Tracker",
      message: "Running in the background",
      icon: "ic_launcher",
      importance: 'high',
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
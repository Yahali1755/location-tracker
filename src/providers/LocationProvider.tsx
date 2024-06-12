import React, { useState, useEffect, FC, createContext, useContext, ReactNode } from 'react';
import { PermissionsAndroid, NativeModules } from 'react-native';
import GetLocation, { Location } from 'react-native-get-location';
import { Dirs, FileSystem } from 'react-native-file-access';

const { LocationModule, LockDetector } = NativeModules;

interface LocationContextProps {
  location: Location,
  changeGetLocationMethod: () => void
}

interface LocationProviderProps {
  children: ReactNode
}

const LocationContext = createContext<LocationContextProps>({} as LocationContextProps)
export const useLocationContext = () => useContext(LocationContext)

const LocationProvider: FC<LocationProviderProps> = ({ children }) => {
  const [useNative, setUseNative] = useState(true);
  const [location, setLocation] = useState({} as Location);

  const requestPermissions = async () => {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
  };

  useEffect(() => {
    requestPermissions();

    const interval = setInterval(() => {
        if (useNative) {
            getLocation()
        }
    }, 5000);

    return () => clearInterval(interval);
  }, [useNative]);

  const getLocation = async () => {
    if (!useNative) {
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
    else {
      await LocationModule.getLocation()
      .then((location: any) => {
        console.log(location)
        saveLocation(location);
      })
      .catch((error: any) => {
        console.error(error);
      });
    }
  };

  const saveLocation = async (location: Location) => {
    const filePath = `${Dirs.DocumentDir}/locations.json`;
    const timestamp = new Date();
    const { latitude, longitude} = location
    const newLocation = { timestamp, latitude, longitude };
    const isLocked = await LockDetector.isDeviceLocked();

    console.log(isLocked)

    setLocation(location);

    try {
      const fileExists = await FileSystem.exists(filePath);

      if (!fileExists) {
        await FileSystem.writeFile(filePath, JSON.stringify([newLocation]), 'utf8');
      } else {
        const fileContent = await FileSystem.readFile(filePath);
        const locations = JSON.parse(fileContent);

        locations.push(newLocation);

        await FileSystem.writeFile(filePath, JSON.stringify(locations), 'utf8');
      }
    } catch (error) {
        console.warn(error);
    }
  };

  const changeGetLocationMethod = () => setUseNative(useNative => !useNative);

  return (
    <LocationContext.Provider value={{changeGetLocationMethod, location}}>
      { children }
    </LocationContext.Provider>
  );
};

export default LocationProvider;
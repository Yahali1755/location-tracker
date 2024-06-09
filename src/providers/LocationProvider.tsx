import React, { useState, useEffect, FC, createContext, useContext, ReactNode } from 'react';
import { PermissionsAndroid } from 'react-native';
import * as GetLocation from 'react-native-get-location';
import FileSystem from 'expo-file-system';

interface LocationContextProps {
  getReactNativeLocation: () => void
  location: any,  
  changeGetLocationMethod: () => void
}

interface LocationProviderProps {
  children: ReactNode
}

const LocationContext = createContext<LocationContextProps>({} as LocationContextProps)
export const useLocationContext = () => useContext(LocationContext)

const LocationProvider: FC<LocationProviderProps> = ({ children }) => {
  const [useNative, setUseNative] = useState(true);
  const [location, setLocation] = useState(null);

  const requestPermissions = async () => {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
  };

  useEffect(() => {
    requestPermissions();

    const interval = setInterval(() => {
        if (useNative) {
            getReactNativeLocation()
        }
    }, 5000);

    return () => clearInterval(interval);
  }, [useNative]);

  const getReactNativeLocation = async () => {
    if (useNative) {
      await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      })
        .then(location => {
          saveLocation(location);
        })
        .catch(error => {
          console.warn(error);
        });
    }
  };

  const saveLocation = async (location) => {
    const filePath = `${FileSystem.documentDirectory}/locations.json`;
    const timestamp = new Date().toDateString();
    const newLocation = { timestamp, ...location.coords };

    setLocation(location);

    try {
      const contents = await FileSystem.readAsStringAsync(filePath);
      const data = JSON.parse(contents);
      
      data.push(newLocation);
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
    } catch (error) {
        console.warn(error);
    }
  };

  const changeGetLocationMethod = () => setUseNative(useNative => !useNative);

  return (
    <LocationContext.Provider value={{getReactNativeLocation, changeGetLocationMethod, location}}>
      { children }
    </LocationContext.Provider>
  );
};

export default LocationProvider;
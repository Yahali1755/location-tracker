import React, { useState, useEffect, FC, createContext, useContext, ReactNode } from 'react';
import { PermissionsAndroid, NativeModules, AppState } from 'react-native';
import GetLocation, { Location } from 'react-native-get-location';
import RNFS from 'react-native-fs';

const { LocationModule } = NativeModules;

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
        timeout: 15000,
      })
        .then(location => {
          console.log(AppState.currentState)
          saveLocation(location);
        })
        .catch(error => {
          console.error(error);
        });
    }
    else {
      await LocationModule.getLocation()
      .then((location: any) => {
        saveLocation(location);
      })
      .catch((error: any) => {
        console.error(error);
      });
    }
  };

  const saveLocation = async (location: Location) => {
    const filePath = `${RNFS.DocumentDirectoryPath}/locations.json`;
    const timestamp = new Date().toDateString();
    const { latitude, longitude} = location
    const newLocation = { timestamp, latitude, longitude };

    setLocation(location);

    try {
      const fileExists = await RNFS.exists(filePath);

      if (!fileExists) {
        await RNFS.writeFile(filePath, JSON.stringify([newLocation]), 'utf8');
      } else {
        const fileContent = await RNFS.readFile(filePath);
        const locations = JSON.parse(fileContent);

        locations.push(newLocation);

        await RNFS.writeFile(filePath, JSON.stringify(locations), 'utf8');
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
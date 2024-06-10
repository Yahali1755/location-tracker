/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { FC } from 'react';

import LocationProvider from './src/providers/LocationProvider';
import CurrentLocation from './src/location/CurrentLocation';

const App: FC = () => {

  return (
    <LocationProvider>
      <CurrentLocation/>
    </LocationProvider>
  );
}

export default App;

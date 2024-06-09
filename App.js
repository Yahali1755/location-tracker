import React, { useEffect } from 'react';
import CurrentLocation from './src/location/CurrentLocation';
import LocationProvider from './src/providers/LocationProvider';

const App = () => {
  return (
    <LocationProvider>
        <CurrentLocation/>
    </LocationProvider>      
  );
};

export default App;
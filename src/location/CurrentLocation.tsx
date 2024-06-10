import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { useLocationContext } from '../providers/LocationProvider';

const CurrentLocation: FC = () => {
  const { location } = useLocationContext();

  console.log(location)

  return (
    <View style={{ padding: 20 }}>
      <Text>Current Location:</Text>
      { location ? (
        <Text>Latitude: {location.latitude}, Longitude: {location.longitude}</Text>
      ) : (
        <Text>No location data</Text>
      )}
    </View>
  );
};

export default CurrentLocation;
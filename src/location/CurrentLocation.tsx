import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { useLocationContext } from '../providers/LocationProvider';

const CurrentLocation: FC = () => {
  const { location } = useLocationContext();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }} >Current Location:</Text>
      { location ? (
        <Text style={{ fontSize: 20 }}>Latitude: {location.latitude}, Longitude: {location.longitude}</Text>
      ) : (
        <Text style={{ fontSize: 20 }}>No location data</Text>
      )}
    </View>
  );
};

export default CurrentLocation;
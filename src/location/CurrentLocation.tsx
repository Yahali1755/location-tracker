import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocationContext } from '../providers/LocationProvider';
import LocationMethodSwitch from './LocationMethodSwitch';

const DARK_GREY_COLOR = '#282828'

const styles = StyleSheet.create({
  defaultText: {
    color: 'white',
    fontSize: 20
  }
});

const CurrentLocation: FC = () => {
  const { location } = useLocationContext();

  return (
    <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1, 
        backgroundColor: DARK_GREY_COLOR
    }}>
      <Text style={{ ...styles.defaultText }} > Current Location: </Text>
      { 
        location ? 
          <>
            <Text style={{ ...styles.defaultText, paddingTop: 20 }}> Latitude: {location.latitude} </Text>
            <Text style={{ ...styles.defaultText }}> Longitude: {location.longitude} </Text>
          </>
          : 
          <Text style={{ ...styles.defaultText }}>No location data</Text>
      } 
      <LocationMethodSwitch/>
    </View>
  );
};

export default CurrentLocation;
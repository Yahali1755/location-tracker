import React, { FC } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useLocationContext } from '../providers/LocationProvider';

const DARK_GREY_COLOR = '#282828'

const styles = StyleSheet.create({
  defaultText: {
    color: 'white',
    fontSize: 20
  }
});

const CurrentLocation: FC = () => {
  const { location, useNativeAndroidModule, changeGetLocationMethod } = useLocationContext();

  return (
    <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1, 
        backgroundColor: DARK_GREY_COLOR
    }}>
      <Text style={{ ...styles.defaultText }} > Current Location: </Text>
      { 
        location ? (
          <>
            <Text style={{ ...styles.defaultText, paddingTop: 20 }}> Latitude: {location.latitude} </Text>
            <Text style={{ ...styles.defaultText }}> Longitude: {location.longitude} </Text>
          </>
      ) : (
        <Text style={{ ...styles.defaultText }}>No location data</Text>
      )}
      <Text style={{...styles.defaultText, paddingTop: 20, fontSize: 16}}>Use Native Android Code: { useNativeAndroidModule ? 'Yes' : 'No'}</Text>
      <Switch onValueChange={changeGetLocationMethod} value={useNativeAndroidModule} />
    </View>
  );
};

export default CurrentLocation;
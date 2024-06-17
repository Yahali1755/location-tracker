import React, { FC } from 'react';
import { Text, Switch } from 'react-native';
import { useLocationContext } from '../providers/LocationProvider';

const LocationMethodSwitch: FC = () => {
  const { useNativeAndroidModule, changeGetLocationMethod } = useLocationContext();

  return (
    <>
        <Text style={{ color: 'white', paddingTop: 20, fontSize: 16}}>
        Use Native Android Code: { useNativeAndroidModule ? 'Yes' : 'No'}
        </Text>
        <Switch onValueChange={changeGetLocationMethod} value={useNativeAndroidModule} />
    </>
  );
};

export default LocationMethodSwitch;
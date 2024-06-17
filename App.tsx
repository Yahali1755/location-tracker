import React, { FC } from 'react';

import CurrentLocation from './src/location/CurrentLocation';
import Providers from './src/providers/Providers';

const App: FC = () => {
  return (
    <Providers>
      <CurrentLocation/>
    </Providers>
  );
}

export default App;

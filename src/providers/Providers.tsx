import React, { FC, ReactNode } from 'react';
import LocationProvider from './LocationProvider';

interface ProvidersProps {
    children: ReactNode
}

const Providers: FC<ProvidersProps> = ({ children }) => 
    <LocationProvider>
       { children }
    </LocationProvider>

export default Providers;
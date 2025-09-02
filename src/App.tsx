import './fonts.css';

import store, { persistor } from './store';

import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider, useDispatch } from 'react-redux';
import Views from './views';
import { useEffect } from 'react';
import { googleFontsService } from './services/GoogleFontsService';
import { setCurrentApp } from './store/slices/currentApp/currentAppState';
import appConfig from '../appConfig.json';

// import { ConsoleText } from './consoleText';

// import Layout from '@/components/layouts';

// Component to handle initialization inside the Provider
function AppInitializer() {
  const dispatch = useDispatch();

  // Initialize app on startup
  useEffect(() => {
    console.log('🚀 AppInitializer: Starting initialization...');
    console.log('📦 AppConfig to dispatch:', appConfig);
    
    // Set the current app with appConfig
    dispatch(setCurrentApp(appConfig));
    console.log('✅ AppInitializer: Dispatched setCurrentApp');
    
    // Initialize Google Fonts service
    googleFontsService.initialize();
    console.log('✅ AppInitializer: Google Fonts initialized');
  }, [dispatch]);

  return <Views />;
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AppInitializer />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;

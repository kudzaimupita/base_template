import './fonts.css';

import store, { persistor } from './store';

import { BrowserRouter } from 'react-router-dom';
import { ConsoleText } from './consoleText';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import Views from './views';
import { useEffect } from 'react';

// import Layout from '@/components/layouts';

function App() {
  useEffect(() => {
    console.log(`
    
  We're hiring soon! Visit https://servly.app/careers
  
  ${ConsoleText}

  `);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Views />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;

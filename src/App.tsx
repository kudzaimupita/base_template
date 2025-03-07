import './fonts.css';

import store, { persistor } from './store';

import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import Views from './views';
import { useEffect } from 'classnames';

// import { ConsoleText } from './consoleText';

// import Layout from '@/components/layouts';

function App() {
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

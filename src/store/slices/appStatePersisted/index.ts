import { combineReducers } from '@reduxjs/toolkit';
import appState from './appStateSlice';

const reducer = combineReducers({
  persistedAppState: appState,
});

export * from './appStateSlice';

export default reducer;

import { combineReducers } from '@reduxjs/toolkit';
import appState from './appState';

const reducer = combineReducers({
  appState,
});

export * from './appState';

export default reducer;

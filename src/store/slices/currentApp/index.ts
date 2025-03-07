import { combineReducers } from '@reduxjs/toolkit';
import currentAppState from './currentAppState';

const reducer = combineReducers({
  currentAppState,
});

export * from './currentAppState';

export default reducer;

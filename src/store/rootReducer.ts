import { AnyAction, CombinedState, Reducer, combineReducers } from 'redux';

import appState from './slices/appState/appState';

// import auth, { AuthState } from './slices/auth';
// import base, { BaseState } from './slices/base';
// import locale, { LocaleState } from './slices/locale/localeSlice';
// import theme, { ThemeState } from './slices/theme/themeSlice';
// import dragAndDropReducer, { DragAndDropState } from './slices/builder/dragAndDropSlice';

// import appPersistedState from './slices/appStatePersisted/appStateSlice';

// import currentAppState from './slices/currentApp/currentAppState';

export type RootState = CombinedState<{
  /* eslint-disable @typescript-eslint/no-explicit-any */
}>;

export interface AsyncReducers {
  [key: string]: Reducer<any, AnyAction>;
}

const staticReducers = {
  appState: appState,
};

const rootReducer = (asyncReducers?: AsyncReducers) => (state: RootState, action: AnyAction) => {
  const combinedReducer = combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
  return combinedReducer(state, action);
};

export default rootReducer;

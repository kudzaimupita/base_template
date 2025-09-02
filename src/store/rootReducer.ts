import { AnyAction, CombinedState, Reducer, combineReducers } from 'redux';
import auth, { AuthState } from './slices/auth';
import base, { BaseState } from './slices/base';
import dragAndDropReducer, { DragAndDropState } from './slices/builder/dragAndDropSlice';
import locale, { LocaleState } from './slices/locale/localeSlice';

import appPersistedState from './slices/appStatePersisted/appStateSlice';
import appState from './slices/appState/appState';
import currentAppState from './slices/currentApp/currentAppState';

// import theme, { ThemeState } from './slices/theme/themeSlice';

// import RtkQueryService from '@/services/RtkQueryService';

export type RootState = {
  auth: CombinedState<AuthState>;
  base: CombinedState<BaseState>;
  locale: LocaleState;
  // theme: ThemeState;
  dragAndDrop: DragAndDropState;
  appState: any;
  appPersistedState: any;
  currentApp: any;

  /* eslint-disable @typescript-eslint/no-explicit-any */
};

export interface AsyncReducers {
  [key: string]: Reducer<any, AnyAction>;
}

const staticReducers = {
  auth,
  base,
  locale,
  // theme,
  dragAndDrop: dragAndDropReducer,
  appState: appState,
  appPersistedState,
  currentApp: currentAppState,
  // [RtkQueryService.reducerPath]: RtkQueryService.reducer,
};

const rootReducer = (asyncReducers?: AsyncReducers) => (state: any, action: AnyAction) => {
  const combinedReducer = combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
  return combinedReducer(state, action);
};

export default rootReducer;

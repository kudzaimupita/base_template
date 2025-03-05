import { Action, AnyAction, Reducer, Store, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import rootReducer, { AsyncReducers, RootState } from './rootReducer';

// import { PERSIST_STORE_NAME } from '@/constants/app.constant';
// import RtkQueryService from '@/services/RtkQueryService';
import storage from 'redux-persist/lib/storage';

/* eslint-disable @typescript-eslint/no-explicit-any */
const middlewares: any[] = [];

const persistConfig = {
  key: 'servly',
  keyPrefix: '',
  storage,
  whitelist: [''],
};

interface CustomStore extends Store<RootState, AnyAction> {
  asyncReducers?: AsyncReducers;
}

const store: CustomStore = configureStore({
  reducer: persistReducer(persistConfig, rootReducer() as Reducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(middlewares),
  devTools: process.env.NODE_ENV === 'development',
});

store.asyncReducers = {};

export const persistor = persistStore(store);

export function injectReducer<S>(key: string, reducer: Reducer<S, Action>) {
  if (store.asyncReducers) {
    if (store.asyncReducers[key]) {
      return false;
    }
    store.asyncReducers[key] = reducer;
    store.replaceReducer(persistReducer(persistConfig, rootReducer(store.asyncReducers) as Reducer));
  }
  persistor.persist();
  return store;
}

export type AppDispatch = typeof store.dispatch;

export default store;

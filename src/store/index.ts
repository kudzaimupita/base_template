import store from './storeSetup';

export * from './storeSetup';
export * from './slices/auth';
export * from './slices/base';
export * from './slices/currentApp';
export * from './slices/appState';
export * from './slices/builder';
export * from './slices/appStatePersisted/appStateSlice';
// export * from './slices/theme/themeSlice';
export * from './slices/locale/localeSlice';
export * from './rootReducer';
export * from './hook';
export default store;

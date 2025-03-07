import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SLICE_BASE_NAME } from './constants';

export interface SessionState {
  signedIn: boolean;
  token: string | null;
  refreshToken: string;
}

const initialState: SessionState = {
  signedIn: false,
  token: null,
  refreshToken: '',
  companyId: '',
  appState: {},
};

const sessionSlice = createSlice({
  name: `${SLICE_BASE_NAME}/session`,
  initialState,
  extraReducers: (builder) => {
    builder.addCase('LOGOUT', (state) => {
      Object.assign(state, {
        token: '',
        signedIn: false,
        refreshToken: '',
        companyId: '',
      });
    });
  },
  reducers: {
    signInSuccess(state, action: PayloadAction<string>) {
      state.signedIn = true;
      state.token = action.payload;
    },
    signOutSuccess(state) {
      state.signedIn = false;
      state.token = null;
    },
    onSignOutSuccess: (state) => {
      state = { signedIn: false, token: null, refreshToken: '', appState: {} };
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setCompanyId: (state, action) => {
      state.companyId = action.payload;
      // window.location.reload()
    },
    setAppState: (state, action) => {
      state.appState = action.payload;
    },
    setAppStatePartial: (state, action) => {
      const { key, payload } = action.payload;
      // Split the key into an array
      const keys = key.split('.');
      let nestedState = state?.appState || {};

      // Traverse down the nested state object and create nested properties if they don't exist
      for (const nestedKey of keys.slice(0, -1)) {
        if (!nestedState?.[nestedKey]) {
          nestedState[nestedKey] = {}; // Create the nested object if it doesn't exist
        }

        nestedState = nestedState?.[nestedKey];
      }

      nestedState[keys[keys.length - 1]] = payload;

      state.appState = { ...state?.appState, ...nestedState };
    },
  },
});

export const {
  setToken,
  signInSuccess,
  signOutSuccess,
  onSignOutSuccess,
  setRefreshToken,
  setAppState,
  setAppStatePartial,
  setCompanyId,
} = sessionSlice.actions;
export default sessionSlice.reducer;

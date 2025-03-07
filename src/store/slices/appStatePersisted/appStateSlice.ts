import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SLICE_BASE_NAME } from './constants';
import { message } from 'antd';

export interface SessionState {
  signedIn: boolean;
  token: string | null;
  refreshToken: string;
}

const initialState: SessionState = {
  sessionInfo: {},
};

const sessionSlice = createSlice({
  name: `appStatePersisted`,
  initialState,
  //   extraReducers: (builder) => {
  //     builder.addCase('LOGOUT', (state) => {
  //       Object.assign(state, {
  //         token: '',
  //         signedIn: false,
  //         refreshToken: '',
  //       });
  //     });
  //   },
  reducers: {
    setSessionInfo: (state, action) => {
      // state.sessionInfo = {
      //   ...action.payload,
      // };
      // state.signedIn = true;
      const key = action.payload?.key;
      // Retrieve the existing data from localStorage
      const existingData = JSON.parse(localStorage.getItem(action.payload?.id)) || {};

      // Merge the existing data with the new data using the spread operator
      const updatedData = {
        ...existingData,
        [key]: action.payload?.data,
        // ...action.payload?.data,
      };
      console.log(updatedData);

      // Update localStorage with the new merged data
      localStorage.setItem(action.payload?.id, JSON.stringify(updatedData));
    },
    setDestroyInfo: (state, action) => {
      state.sessionInfo = {};
      state.signedIn = false;

      localStorage.removeItem(action.payload?.id);
    },
    setPersistedAppStatePartial: (state, action) => {
      if (action.key === 'sessinInfo') {
        message.error('Not allowed to modify session info using this action');
        return;
      }
      const { key, payload } = action.payload;
      // Split the key into an array
      const keys = key?.split('.');
      let nestedState = state || {};

      // Traverse down the nested state object and create nested properties if they don't exist
      for (const nestedKey of keys.slice(0, -1)) {
        if (!nestedState?.[nestedKey]) {
          nestedState[nestedKey] = {}; // Create the nested object if it doesn't exist
        }

        nestedState = nestedState?.[nestedKey];
      }

      // Update the nested property
      nestedState[keys[keys.length - 1]] = payload;

      state = { ...state, ...nestedState };
    },
  },
});

export const { setSessionInfo, setDestroyInfo, setPersistedAppStatePartial } = sessionSlice.actions;
export default sessionSlice.reducer;

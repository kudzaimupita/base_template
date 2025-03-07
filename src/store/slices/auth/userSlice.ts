import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SLICE_BASE_NAME } from './constants';

export type UserState = {
  avatar?: string;
  userName?: string;
  email?: string;
  authority?: string[];
  isBoarded: boolean;
};

const initialState: UserState = {
  avatar: '',
  userName: '',
  email: '',
  authority: [],
  isBoarded: false,
};

const userSlice = createSlice({
  name: `${SLICE_BASE_NAME}/user`,
  initialState,
  // extraReducers: (state) => {
  //   Object.assign(state, {

  //   });
  // },
  extraReducers: (builder) => {
    builder.addCase('LOGOUT', (state) => {
      state = {};
      // Object.assign(state, {
      //   avatar: '',
      //   userName: '',
      //   email: '',
      //   authority: [],
      //   isBoarded: false,
      // });
      localStorage.removeItem('admin');
    });
  },
  // extraReducers: (builder) => {
  //   builder.addCase('LOGOUT', (state) => () => initialState);

  // },
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

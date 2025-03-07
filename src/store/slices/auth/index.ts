import { combineReducers } from '@reduxjs/toolkit';
import session, { SessionState } from './sessionSlice';
import user, { UserState } from './userSlice';
import company from './companySlice';

const reducer = combineReducers({
  session,
  user,
  company,
});

export type AuthState = {
  session: SessionState;
  user: UserState;
  company?: any;
};

export * from './sessionSlice';
export * from './userSlice';
export * from './companySlice';

export default reducer;

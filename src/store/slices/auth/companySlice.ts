import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// import { getApplication } from '@/services/ApplicationService';

// import { getApplication } from './api'; // Replace with the actual API import

// import { navigate } from 'react-router-dom'; // Adjust based on your routing library

// Async thunk for fetching the application
export const fetchAppPersist = createAsyncThunk(
  'company/fetchApp',
  async ({ id, tab, setting }, { dispatch, rejectWithValue }) => {
    try {
      const res = {};

      // Handle navigation and state updates
      const firstModuleId = res.data?.views?.[0]?.id;
      // if (!tab) {
      //   navigate(`/applications/${id}/${setting}/${firstModuleId}`);
      // }

      const selectedView = res.data?.views?.find((item) => item.id === tab);
      const savedLayout = selectedView?.layout;

      dispatch(setCurrentApplication(res.data)); // Dispatch current application
      return { selectedView, savedLayout, application: res.data }; // Return additional data for extraReducers
    } catch (error) {
      // Handle errors
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
export const initialState = {
  applications: [],
  currentApplication: null,
  components: [],
  events: [],
};

// Redux slice
export const companySlice = createSlice({
  name: 'auth/company',
  initialState,
  reducers: {
    setCompany: (_, action) => action.payload,
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
    setApplication: (state, action) => {
      state.application = action.payload;
    },
    setCurrentApplication: (state, action) => {
      state.currentApplication = action.payload;
    },
    // setCurrentView: (state, action) => {
    //   state.currentApplication = action.payload;
    // },
    setComponents: (state, action) => {
      state.components = action.payload;
    },
    setEvents: (state, action) => {
      state.events = [action.payload, ...(state.events || [])];
    },
    userLoggedOut: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppPersist.fulfilled, (state, action) => {
        const { selectedView, savedLayout } = action.payload;
        state.currentApplication = action.payload.application;
        state.selectedView = selectedView;
        state.savedLayout = savedLayout;
      })
      .addCase(fetchAppPersist.rejected, (state, action) => {
        // Error handled by the action payload
      });
  },
});

// Export actions and reducer
export const { setCompany, setApplications, setApplication, setComponents, setCurrentApplication, setEvents } =
  companySlice.actions;

export default companySlice.reducer;

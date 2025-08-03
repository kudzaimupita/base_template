import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { message } from 'antd';

// import { getApplication } from '@/services/ApplicationService';

// import { getApplication } from './api'; // Replace with the actual API import

// import { navigate } from 'react-router-dom'; // Adjust based on your routing library
// export const getApp = createAsyncThunk(
//   'app/data',
//   async (data: TableQueries & { filterData?: Filter }) => {
//       const response = await apiGetCrmCustomers<
//           GetCrmCustomersResponse,
//           TableQueries
//       >(data)
//       return response.data
//   }
// )
// Async thunk for fetching the application
export const fetchApp = createAsyncThunk('app/fetchApp', async ({ id, tab, setting }, { dispatch, rejectWithValue }) => {
  try {
    const res = {};

    // Handle navigation and state updates
    const firstModuleId = res.data?.views?.[0]?.id;
    // if (!tab) {
    //   navigate(`/applications/${id}/${setting}/${firstModuleId}`);
    // }

    const selectedView = res.data?.views?.find((item) => item.id === tab);
    const savedLayout = selectedView?.layout;

    // dispatch(setCurrentApplication(res.data)); // Dispatch current application
    return { selectedView, savedLayout, application: res.data }; // Return additional data for extraReducers
  } catch (error) {
    // Handle errors
    return rejectWithValue(error.message);
  }
});

// Initial state
export const initialState = {
  applications: [],
  currentApplication: null,
  components: [],
  events: [],
};

// Redux slice
export const applicationSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setApplication: (state, action) => {
      // state.application = action.payload;
    },
    setCurrentApp: (state, action) => {
      state.currentApplication = action.payload;
    },
    updateCurrentAppLayout: (state, action) => {
      const { tab, layout } = action.payload;

      // Ensure the action payload is sanitized (i.e., no non-serializable values)
      if (!tab || !layout || !Array.isArray(layout)) {
        if (!tab) {
          message.error('Tab is required');
        }
        if (!layout) {
          message.error('Layout is required');
        }
        if (!Array.isArray(layout)) {
          message.error('Layout must be an array');
        }
        // message.error(JSON.stringify(action.payload));
        state = { ...state };
      }

      // If currentApplication exists and views is an array, perform the update
      if (state.currentApplication && Array.isArray(state.currentApplication?.views)) {
        state.currentApplication = {
          ...state.currentApplication,
          views: state.currentApplication?.views.map((view) => {
            if (view.id === tab) {
              return {
                ...view,
                layout: JSON.parse(JSON.stringify(layout)), // Ensure layout is serializable
              };
            }
            return view;
          }),
        };
      } else {
        // Invalid state structure
      }
    },
    updateCurrentAppViewStyle: (state, action) => {
      const { tab, style } = action.payload;

      // Ensure the action payload is sanitized (i.e., no non-serializable values)
      if (!tab) {
        message.error('Tab is required');

        // message.error(JSON.stringify(action.payload));
        return; // Prevent update if invalid payload
      }

      // If currentApplication exists and views is an array, perform the update
      if (state.currentApplication && Array.isArray(state.currentApplication?.views)) {
        state.currentApplication = {
          ...state.currentApplication,
          views: state.currentApplication?.views.map((view) => {
            if (view.id === tab) {
              return {
                ...view,
                style: { ...view?.style, ...style }, // Ensure layout is serializable
              };
            }
            return view;
          }),
        };
      } else {
        // Invalid state structure
      }
    },
    // setCurrentView: (state, action) => {
    //   state.currentApplication = action.payload;
    // },

    userLoggedOut: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApp.fulfilled, (state, action) => {
        const { selectedView, savedLayout } = action.payload;
        state.currentApplication = action.payload.application;
        state.selectedView = selectedView;
        state.savedLayout = savedLayout;
      })
      .addCase(fetchApp.rejected, (state, action) => {
        // Error handled by the action payload
      });
  },
});

// Export actions and reducer
export const { setCurrentApp, updateCurrentAppLayout, updateCurrentAppViewStyle } = applicationSlice.actions;

export default applicationSlice.reducer;

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface SetStatePartialPayload {
  key: string;
  payload: any;
}

// Add type safety to the nested object creation function
function createNestedObject(key: string, payload: any): Record<string, any> {
  if (!key) {
    console.error('Empty key provided to createNestedObject');
    return {};
  }
  
  const keys = key.split('.');
  const result: Record<string, any> = {};
  let current = result;
  
  try {
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    // Handle the last key separately
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = payload;
    }
  } catch (error) {
    console.error('Error in createNestedObject:', error);
    return {};
  }
  
  return result;
}

// Define state interface
interface AppState {
  [key: string]: any;
}

const sessionSlice = createSlice({
  name: 'appState',
  initialState: {} as AppState,
  reducers: {
    setAppStatePartial: (state, action: PayloadAction<SetStatePartialPayload>) => {
      const { key, payload } = action.payload;
      
      // Add input validation
      if (!key || typeof key !== 'string') {
        console.error('Invalid key provided to setAppStatePartial');
        return;
      }
      
      console.log('Processing state update:', { key, payload });
      
      try {
        const newData = createNestedObject(key, payload);
        console.log('Created nested object:', newData);
        
        const topKey = key.split('.')[0];
        
        // Ensure top-level state initialization
        if (!state[topKey] || typeof state[topKey] !== 'object') {
          state[topKey] = {};
        }
        
        // Enhanced recursive state update with type checking and array preservation
        function updateNestedState(currentState: Record<string, any>, updateData: Record<string, any>) {
          Object.entries(updateData).forEach(([key, value]) => {
            // Skip if the key is empty
            if (!key) return;
            
            // Handle null values explicitly
            if (value === null) {
              currentState[key] = null;
              return;
            }
            
            // Handle array values - preserve array type
            if (Array.isArray(value)) {
              currentState[key] = [...value];
              return;
            }
            
            // Handle object values
            if (typeof value === 'object') {
              if (!currentState[key] || typeof currentState[key] !== 'object') {
                currentState[key] = {};
              }
              updateNestedState(currentState[key], value);
            } else {
              // Handle primitive values
              currentState[key] = value;
            }
          });
        }
        
        console.log('Updating state with:', newData);
        updateNestedState(state, newData);
        console.log('State updated successfully');
      } catch (error) {
        console.error('Error in setAppStatePartial:', error);
      }
    },
  },
});

export const { setAppStatePartial } = sessionSlice.actions;
export default sessionSlice.reducer;
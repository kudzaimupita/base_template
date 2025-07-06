import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import set from 'lodash/set';
import get from 'lodash/get';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import unset from 'lodash/unset';

// Define payload interfaces
interface SetStatePartialPayload {
  key: string;
  payload: any;
}

interface BulkStateUpdate {
  key: string;
  payload: any;
  operation?: 'set' | 'merge' | 'delete' | 'append' | 'prepend';
}

interface MergeStatePayload {
  key: string;
  payload: any;
  strategy?: 'shallow' | 'deep' | 'replace';
}

interface ArrayOperationPayload {
  key: string;
  operation: 'push' | 'unshift' | 'pop' | 'shift' | 'splice' | 'filter' | 'map' | 'sort';
  payload?: any;
  index?: number;
  deleteCount?: number;
}

interface ConditionalUpdatePayload {
  key: string;
  payload: any;
  condition: string | ((currentValue: any, state: any) => boolean);
}

interface TransformUpdatePayload {
  key: string;
  transform: (currentValue: any, state: any) => any;
}

// Define state interface
interface AppState {
  [key: string]: any;
}

const initialState = {} as AppState;

// Helper functions
const safeGet = (state: any, path: string, defaultValue: any = undefined) => {
  try {
    return get(state, path, defaultValue);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error getting path ${path}:`, error);
    }
    return defaultValue;
  }
};

const safeSet = (state: any, path: string, value: any) => {
  try {
    set(state, path, value);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error setting path ${path}:`, error);
    }
    return false;
  }
};

const evaluateCondition = (condition: string | Function, currentValue: any, state: any): boolean => {
  try {
    if (typeof condition === 'function') {
      return condition(currentValue, state);
    }
    
    if (typeof condition === 'string') {
      // Create a safe evaluation function
      const func = new Function('currentValue', 'state', `return ${condition}`);
      return func(currentValue, state);
    }
    
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Condition evaluation failed:', error);
    }
    return false;
  }
};

const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    // Basic set operation using lodash's optimized set function
    setAppStatePartial: (state, action: PayloadAction<SetStatePartialPayload>) => {
      const { key, payload } = action.payload;
      
      if (!key) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('setAppStatePartial: key is required');
        }
        return;
      }

      safeSet(state, key, payload);
    },

    // Advanced merge operations
    mergeAppState: (state, action: PayloadAction<MergeStatePayload>) => {
      const { key, payload, strategy = 'shallow' } = action.payload;
      
      if (!key) return;

      const currentValue = safeGet(state, key, {});
      
      if (typeof currentValue !== 'object' || Array.isArray(currentValue)) {
        // If current value is not an object, just set the new value
        safeSet(state, key, payload);
        return;
      }

      let mergedValue;
      
      switch (strategy) {
        case 'deep':
          mergedValue = merge(cloneDeep(currentValue), cloneDeep(payload));
          break;
        case 'shallow':
          mergedValue = { ...currentValue, ...payload };
          break;
        case 'replace':
        default:
          mergedValue = payload;
          break;
      }
      
      safeSet(state, key, mergedValue);
    },

    // Bulk state updates with multiple operations
    bulkSetAppState: (state, action: PayloadAction<Array<BulkStateUpdate>>) => {
      const updates = action.payload;
      
      if (!Array.isArray(updates)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('bulkSetAppState: payload must be an array');
        }
        return;
      }

      for (const update of updates) {
        const { key, payload, operation = 'set' } = update;
        
        if (!key) continue;

        try {
          switch (operation) {
            case 'set':
              safeSet(state, key, payload);
              break;
              
            case 'merge':
              const currentObj = safeGet(state, key, {});
              if (typeof currentObj === 'object' && !Array.isArray(currentObj)) {
                safeSet(state, key, { ...currentObj, ...payload });
              } else {
                safeSet(state, key, payload);
              }
              break;
              
            case 'delete':
              unset(state, key);
              break;
              
            case 'append':
              const currentArrayAppend = safeGet(state, key, []);
              if (Array.isArray(currentArrayAppend)) {
                safeSet(state, key, [...currentArrayAppend, payload]);
              } else {
                safeSet(state, key, [payload]);
              }
              break;
              
            case 'prepend':
              const currentArrayPrepend = safeGet(state, key, []);
              if (Array.isArray(currentArrayPrepend)) {
                safeSet(state, key, [payload, ...currentArrayPrepend]);
              } else {
                safeSet(state, key, [payload]);
              }
              break;
              
            default:
              safeSet(state, key, payload);
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error(`Error in bulk update for key ${key}:`, error);
          }
        }
      }
    },

    // Array-specific operations
    arrayOperation: (state, action: PayloadAction<ArrayOperationPayload>) => {
      const { key, operation, payload, index = 0, deleteCount = 1 } = action.payload;
      
      if (!key) return;

      const currentArray = safeGet(state, key, []);
      
      if (!Array.isArray(currentArray)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`arrayOperation: value at ${key} is not an array`);
        }
        return;
      }

      let newArray = [...currentArray];

      try {
        switch (operation) {
          case 'push':
            newArray.push(payload);
            break;
            
          case 'unshift':
            newArray.unshift(payload);
            break;
            
          case 'pop':
            newArray.pop();
            break;
            
          case 'shift':
            newArray.shift();
            break;
            
          case 'splice':
            if (index >= 0 && index < newArray.length) {
              newArray.splice(index, deleteCount, ...(Array.isArray(payload) ? payload : [payload]));
            }
            break;
            
          case 'filter':
            if (typeof payload === 'function') {
              newArray = newArray.filter(payload);
            } else if (typeof payload === 'string') {
              // Evaluate filter expression
              const filterFunc = new Function('item', 'index', 'array', `return ${payload}`);
              newArray = newArray.filter(filterFunc);
            }
            break;
            
          case 'map':
            if (typeof payload === 'function') {
              newArray = newArray.map(payload);
            } else if (typeof payload === 'string') {
              // Evaluate map expression
              const mapFunc = new Function('item', 'index', 'array', `return ${payload}`);
              newArray = newArray.map(mapFunc);
            }
            break;
            
          case 'sort':
            if (typeof payload === 'function') {
              newArray.sort(payload);
            } else if (typeof payload === 'string') {
              // Evaluate sort comparison
              const compareFunc = new Function('a', 'b', `return ${payload}`);
              newArray.sort(compareFunc);
            } else {
              newArray.sort();
            }
            break;
            
          default:
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Unknown array operation: ${operation}`);
            }
            return;
        }

        safeSet(state, key, newArray);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`Error in array operation ${operation}:`, error);
        }
      }
    },

    // Conditional updates
    conditionalUpdate: (state, action: PayloadAction<ConditionalUpdatePayload>) => {
      const { key, payload, condition } = action.payload;
      
      if (!key) return;

      const currentValue = safeGet(state, key);
      
      if (evaluateCondition(condition, currentValue, state)) {
        safeSet(state, key, payload);
      }
    },

    // Transform existing values
    transformValue: (state, action: PayloadAction<TransformUpdatePayload>) => {
      const { key, transform } = action.payload;
      
      if (!key || typeof transform !== 'function') return;

      const currentValue = safeGet(state, key);
      
      try {
        const transformedValue = transform(currentValue, state);
        safeSet(state, key, transformedValue);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`Error in transform for key ${key}:`, error);
        }
      }
    },

    // Toggle boolean values
    toggleValue: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      
      if (!key) return;

      const currentValue = safeGet(state, key, false);
      safeSet(state, key, !currentValue);
    },

    // Increment/decrement numeric values
    incrementValue: (state, action: PayloadAction<{ key: string; amount?: number }>) => {
      const { key, amount = 1 } = action.payload;
      
      if (!key) return;

      const currentValue = safeGet(state, key, 0);
      const numericValue = typeof currentValue === 'number' ? currentValue : 0;
      safeSet(state, key, numericValue + amount);
    },

    decrementValue: (state, action: PayloadAction<{ key: string; amount?: number }>) => {
      const { key, amount = 1 } = action.payload;
      
      if (!key) return;

      const currentValue = safeGet(state, key, 0);
      const numericValue = typeof currentValue === 'number' ? currentValue : 0;
      safeSet(state, key, numericValue - amount);
    },

    // Delete state properties
    deleteProperty: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      
      if (!key) return;

      try {
        unset(state, key);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`Error deleting property ${key}:`, error);
        }
      }
    },

    // Spread operations
    spreadProperties: (state, action: PayloadAction<{ 
      targetKey: string; 
      sourceKey: string; 
      properties?: string[]; 
      overwrite?: boolean 
    }>) => {
      const { targetKey, sourceKey, properties, overwrite = true } = action.payload;
      
      if (!targetKey || !sourceKey) return;

      const sourceObj = safeGet(state, sourceKey, {});
      const targetObj = safeGet(state, targetKey, {});
      
      if (typeof sourceObj !== 'object' || Array.isArray(sourceObj)) return;

      let spreadData = {};
      
      if (properties && Array.isArray(properties)) {
        // Spread only specific properties
        properties.forEach(prop => {
          if (sourceObj.hasOwnProperty(prop)) {
            spreadData[prop] = sourceObj[prop];
          }
        });
      } else {
        // Spread all properties
        spreadData = { ...sourceObj };
      }

      const newTargetObj = overwrite 
        ? { ...targetObj, ...spreadData }
        : { ...spreadData, ...targetObj };

      safeSet(state, targetKey, newTargetObj);
    },

    // Reset state to initial or specified values
    resetState: (state, action: PayloadAction<{ 
      keys?: string[]; 
      resetValues?: Record<string, any> 
    }>) => {
      const { keys, resetValues = {} } = action.payload;
      
      if (keys && Array.isArray(keys)) {
        // Reset specific keys
        keys.forEach(key => {
          if (resetValues.hasOwnProperty(key)) {
            safeSet(state, key, resetValues[key]);
          } else {
            unset(state, key);
          }
        });
      } else {
        // Reset entire state
        Object.keys(state).forEach(key => {
          delete state[key];
        });
        
        // Apply reset values if provided
        Object.entries(resetValues).forEach(([key, value]) => {
          safeSet(state, key, value);
        });
      }
    },

    // Batch operations with transaction-like behavior
    batchUpdate: (state, action: PayloadAction<{
      operations: Array<{
        type: string;
        key: string;
        payload?: any;
        [key: string]: any;
      }>;
      rollbackOnError?: boolean;
    }>) => {
      const { operations, rollbackOnError = false } = action.payload;
      
      if (!Array.isArray(operations)) return;

      const snapshot = rollbackOnError ? cloneDeep(state) : null;
      const errors: string[] = [];

      for (const operation of operations) {
        try {
          switch (operation.type) {
            case 'set':
              safeSet(state, operation.key, operation.payload);
              break;
              
            case 'merge':
              const currentMerge = safeGet(state, operation.key, {});
              if (typeof currentMerge === 'object' && !Array.isArray(currentMerge)) {
                safeSet(state, operation.key, { ...currentMerge, ...operation.payload });
              }
              break;
              
            case 'delete':
              unset(state, operation.key);
              break;
              
            case 'toggle':
              const currentToggle = safeGet(state, operation.key, false);
              safeSet(state, operation.key, !currentToggle);
              break;
              
            case 'increment':
              const currentInc = safeGet(state, operation.key, 0);
              const incAmount = operation.amount || 1;
              safeSet(state, operation.key, currentInc + incAmount);
              break;
              
            default:
              errors.push(`Unknown operation type: ${operation.type}`);
          }
        } catch (error) {
          const errorMsg = `Error in batch operation ${operation.type} for key ${operation.key}: ${error.message}`;
          errors.push(errorMsg);
          
          if (rollbackOnError && snapshot) {
            // Rollback to snapshot
            Object.keys(state).forEach(key => delete state[key]);
            Object.assign(state, snapshot);
            break;
          }
        }
      }

      if (process.env.NODE_ENV !== 'production' && errors.length > 0) {
        console.warn('Batch update errors:', errors);
      }
    },

    // Deep clone and update
    deepCloneAndUpdate: (state, action: PayloadAction<{ 
      sourceKey: string; 
      targetKey: string; 
      modifications?: Record<string, any> 
    }>) => {
      const { sourceKey, targetKey, modifications = {} } = action.payload;
      
      if (!sourceKey || !targetKey) return;

      const sourceValue = safeGet(state, sourceKey);
      if (sourceValue === undefined) return;

      const clonedValue = cloneDeep(sourceValue);
      
      // Apply modifications to the clone
      Object.entries(modifications).forEach(([modKey, modValue]) => {
        safeSet(clonedValue, modKey, modValue);
      });

      safeSet(state, targetKey, clonedValue);
    },
  },
});

export const {
  setAppStatePartial,
  mergeAppState,
  bulkSetAppState,
  arrayOperation,
  conditionalUpdate,
  transformValue,
  toggleValue,
  incrementValue,
  decrementValue,
  deleteProperty,
  spreadProperties,
  resetState,
  batchUpdate,
  deepCloneAndUpdate,
} = appStateSlice.actions;

export default appStateSlice.reducer;
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import set from 'lodash/set';
import get from 'lodash/get';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import unset from 'lodash/unset';

interface SetStatePartialPayload {
  key: string;
  payload: any;
  operationType?:
    | 'set'
    | 'merge'
    | 'spread'
    | 'append'
    | 'prepend'
    | 'delete'
    | 'toggle'
    | 'increment'
    | 'decrement'
    | 'bulk'
    | 'concat'
    | 'stringAppend'
    | 'stringPrepend'
    | 'stringRemove';
  operationConfig?: {
    mergeStrategy?: 'shallow' | 'deep' | 'replace';
    spreadProperties?: string[];
    arrayOperation?: 'push' | 'unshift' | 'pop' | 'shift' | 'splice' | 'filter' | 'map' | 'sort';
    arrayIndex?: number;
    deleteCount?: number;
    condition?: string | ((currentValue: any, state: any) => boolean);
    transform?: (currentValue: any, state: any) => any;
    separator?: string; // For string operations
  };
  elementContext?: {
    elementId: string;
    elementConfiguration?: any;
    allElements?: any[];
    viewId?: string;
    pageId?: string;
    compId?: string;
    completeElement?: any;
  };
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

interface AppState {
  [key: string]: any;
}

const initialState = {} as AppState;

const safeGet = (state: any, path: string, defaultValue: any = undefined) => {
  try {
    return get(state, path, defaultValue);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
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
    }
    return false;
  }
};

const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    // Enhanced setAppStatePartial to handle all operation types
    setAppStatePartial: (state, action: PayloadAction<SetStatePartialPayload>) => {
      const { key, payload, operationType = 'set', operationConfig = {} } = action.payload;

      if (!key) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('setAppStatePartial: key is required');
        }
        return;
      }

      const currentValue = safeGet(state, key);
      let finalPayload = payload;

      try {
        switch (operationType) {
          case 'set':
            safeSet(state, key, finalPayload);
            break;

          case 'merge': {
            const { mergeStrategy = 'shallow' } = operationConfig;
            const currentObj = currentValue || {};

            if (typeof currentObj !== 'object' || Array.isArray(currentObj)) {
              safeSet(state, key, finalPayload);
              return;
            }

            let mergedValue;
            switch (mergeStrategy) {
              case 'deep':
                mergedValue = merge(cloneDeep(currentObj), cloneDeep(finalPayload));
                break;
              case 'shallow':
                mergedValue = { ...currentObj, ...finalPayload };
                break;
              case 'replace':
              default:
                mergedValue = finalPayload;
                break;
            }
            safeSet(state, key, mergedValue);
            break;
          }

          case 'spread': {
            const { spreadProperties } = operationConfig;

            // Handle different data types for spread
            if (typeof currentValue === 'string' && typeof finalPayload === 'string') {
              // String concatenation for strings
              finalPayload = currentValue + finalPayload;
            } else if (Array.isArray(currentValue) && Array.isArray(finalPayload)) {
              // Array spread
              finalPayload = [...currentValue, ...finalPayload];
            } else {
              // Object spread (original behavior)
              const sourceObj = finalPayload || {};
              const targetObj = currentValue || {};

              let spreadData: any = {};
              if (Array.isArray(spreadProperties) && spreadProperties.length > 0) {
                // Spread only specific properties
                spreadProperties.forEach((prop) => {
                  if (Object.prototype.hasOwnProperty.call(sourceObj, prop)) {
                    spreadData[prop] = (sourceObj as any)[prop];
                  }
                });
              } else {
                // Spread all properties
                spreadData = { ...sourceObj };
              }

              finalPayload = { ...targetObj, ...spreadData };
            }

            safeSet(state, key, finalPayload);
            break;
          }

          case 'append':
          case 'prepend': {
            const currentArray = Array.isArray(currentValue) ? currentValue : [];
            if (operationType === 'append') {
              finalPayload = [...currentArray, finalPayload];
            } else {
              finalPayload = [finalPayload, ...currentArray];
            }
            safeSet(state, key, finalPayload);
            break;
          }

          case 'delete':
            unset(state, key);
            break;

          case 'toggle':
            finalPayload = !currentValue;
            safeSet(state, key, finalPayload);
            break;

          case 'increment': {
            const currentNum = typeof currentValue === 'number' ? currentValue : 0;
            const incrementBy = typeof finalPayload === 'number' ? finalPayload : 1;
            finalPayload = currentNum + incrementBy;
            safeSet(state, key, finalPayload);
            break;
          }

          case 'decrement': {
            const currentNumDec = typeof currentValue === 'number' ? currentValue : 0;
            const decrementBy = typeof finalPayload === 'number' ? finalPayload : 1;
            finalPayload = currentNumDec - decrementBy;
            safeSet(state, key, finalPayload);
            break;
          }

          case 'bulk':
            // Handle bulk operations as array of operations
            if (Array.isArray(finalPayload)) {
              finalPayload.forEach((operation) => {
                if (operation.key) {
                  const operationPayload = {
                    key: operation.key,
                    payload: operation.payload,
                    operationType: operation.operation || 'set',
                    operationConfig: operation.config || {},
                  };
                  // Recursively call this reducer for each bulk operation
                  appStateSlice.caseReducers.setAppStatePartial(state, {
                    ...action,
                    payload: operationPayload,
                  });
                }
              });
            }
            break;

          case 'concat':
          case 'stringAppend': {
            
            // Concatenate strings with optional separator
            const { separator = '' } = operationConfig;
            const currentStr = typeof currentValue === 'string' ? currentValue : '';
            const appendStr = typeof finalPayload === 'string' ? finalPayload : String(finalPayload);

            // Get element configuration context if available
            const { elementContext } = action.payload;
      
            if (elementContext?.elementId && elementContext?.elementConfiguration) {
              // Check if we're working with a configuration property like className
              const currentConfigValue = get(elementContext.elementConfiguration, key.split('.').slice(1).join('.')) || '';
              if (typeof currentConfigValue === 'string') {
                finalPayload = currentConfigValue + separator + appendStr;
              } else {
                finalPayload = currentStr + separator + appendStr;
              }
            } else {
              finalPayload = currentStr + separator + appendStr;
            }

            safeSet(state, key, finalPayload);
            break;
          }

          case 'stringPrepend': {
            // Prepend to strings with optional separator
            const { separator = '' } = operationConfig;
            const currentStr = typeof currentValue === 'string' ? currentValue : '';
            const prependStr = typeof finalPayload === 'string' ? finalPayload : String(finalPayload);

            // Get element configuration context if available
            const { elementContext } = action.payload;
            if (elementContext?.elementId && elementContext?.elementConfiguration) {
              // Check if we're working with a configuration property like className
              const currentConfigValue = get(elementContext.elementConfiguration, key.split('.').slice(1).join('.')) || '';
              if (typeof currentConfigValue === 'string') {
                finalPayload = prependStr + separator + currentConfigValue;
              } else {
                finalPayload = prependStr + separator + currentStr;
              }
            } else {
              finalPayload = prependStr + separator + currentStr;
            }

            safeSet(state, key, finalPayload);
            break;
          }

          case 'stringRemove': {
            // Remove specific text/classes from strings (supports multiple values)
            const { separator = ' ' } = operationConfig;
    
            
            const removeStr = typeof finalPayload === 'string' ? finalPayload : String(finalPayload);

            // Get element configuration context if available
            const { elementContext } = action.payload;
            let targetString = '';
            
            // Use element configuration passed from actions (via store.getState())
            if (elementContext?.elementConfiguration) {
              // Extract property name from key
              const keyParts = key.split('.');
              const propertyName = keyParts[keyParts.length - 1];

              // Try multiple possible paths in element configuration
              const possiblePaths = [
                propertyName, 
                `configuration.${propertyName}`, 
                keyParts.slice(1).join('.'),
                // Also try direct property access
                `${propertyName}`,
                // For classNames specifically, try common variations
                ...(propertyName === 'classNames' ? ['classNames', 'className', 'class'] : [])
              ];

              for (const path of possiblePaths) {
                const configValue = get(elementContext.elementConfiguration, path);
                if (typeof configValue === 'string' && configValue.trim() !== '') {
                  targetString = configValue;
                  break;
                }
              }
              
              // If still not found, try the complete element's configuration
              if (!targetString && elementContext.completeElement?.configuration) {
                const configValue = get(elementContext.completeElement.configuration, propertyName);
                if (typeof configValue === 'string' && configValue.trim() !== '') {
                  targetString = configValue;
                }
              }
            }

            // Fallback strategies
            if (!targetString) {
              // Try current state value first
              if (typeof currentValue === 'string' && currentValue.trim() !== '') {
                targetString = currentValue;
              } else {
                const stateValue = get(state, key);
                if (typeof stateValue === 'string' && stateValue.trim() !== '') {
                  targetString = stateValue;
                } else {
                  // Last resort: try to get from complete element directly
                  if (elementContext?.completeElement) {
                    const directValue = elementContext.completeElement.classNames || 
                                      elementContext.completeElement.configuration?.classNames ||
                                      elementContext.completeElement.className;
                    if (typeof directValue === 'string' && directValue.trim() !== '') {
                      targetString = directValue;
                    }
                  }
                }
              }
            }

            // Skip if nothing to remove or no target string
            if (!removeStr?.trim() || !targetString?.trim()) {
              break;
            }
            
            // Split the removeStr to check if ANY of the values exist in target
            const removeValues = removeStr
              .split(separator)
              .map((val) => val.trim())
              .filter((val) => val !== '');
            
            // Check if at least one of the values to remove exists in the target
            const hasAnyRemoveValue = removeValues.some(val => targetString.includes(val));
            
            if (!hasAnyRemoveValue) {
              break;
            }
            

            // Split target string by separator, remove all matching items, and rejoin
            let parts = targetString.split(separator).filter((part) => {
              const trimmedPart = part.trim();
              return trimmedPart !== '' && !removeValues.includes(trimmedPart);
            });
            
            
            // Fallback: if split didn't work properly (parts length is 1 and contains the full string), 
            // try splitting by single space regardless of separator
            if (parts.length === 1 && parts[0] === targetString) {
              parts = targetString.split(' ').filter((part) => {
                const trimmedPart = part.trim();
                return trimmedPart !== '' && !removeValues.includes(trimmedPart);
              });
            }

            finalPayload = parts.join(' ').replace(/\s+/g, ' ').trim();
            


            safeSet(state, key, finalPayload);
            
            // Also log the final state to confirm it was set
            const verifyValue = get(state, key);
            break;
          }

          default: {
            // Handle array operations if specified
            const { arrayOperation, arrayIndex = -1, deleteCount = 1 } = operationConfig;

            if (arrayOperation && Array.isArray(currentValue)) {
              let newArray = [...currentValue];

              switch (arrayOperation) {
                case 'push':
                  newArray.push(finalPayload);
                  break;
                case 'unshift':
                  newArray.unshift(finalPayload);
                  break;
                case 'pop':
                  newArray.pop();
                  break;
                case 'shift':
                  newArray.shift();
                  break;
                case 'splice':
                  if (arrayIndex >= 0) {
                    newArray.splice(arrayIndex, deleteCount, finalPayload);
                  }
                  break;
                case 'filter':
                  if (typeof finalPayload === 'string') {
                    const filterFunc = new Function('item', 'index', 'array', `return ${finalPayload}`) as any;
                    newArray = newArray.filter(filterFunc);
                  }
                  break;
                case 'map':
                  if (typeof finalPayload === 'string') {
                    const mapFunc = new Function('item', 'index', 'array', `return ${finalPayload}`) as any;
                    newArray = newArray.map(mapFunc);
                  }
                  break;
                case 'sort':
                  if (typeof finalPayload === 'string') {
                    const compareFunc = new Function('a', 'b', `return ${finalPayload}`) as any;
                    newArray.sort(compareFunc);
                  } else {
                    newArray.sort();
                  }
                  break;
              }

              finalPayload = newArray;
              safeSet(state, key, finalPayload);
            } else {
              // Default to set operation
              safeSet(state, key, finalPayload);
            }
            break;
          }
        }

        if (process.env.NODE_ENV !== 'production') {
        }
      } catch (error: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`State operation '${operationType}' failed for key: ${key}`, error);
        }
      }
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

            case 'merge': {
              const currentObj = safeGet(state, key, {});
              if (typeof currentObj === 'object' && !Array.isArray(currentObj)) {
                safeSet(state, key, { ...currentObj, ...payload });
              } else {
                safeSet(state, key, payload);
              }
              break;
            }

            case 'delete':
              unset(state, key);
              break;

            case 'append': {
              const currentArrayAppend = safeGet(state, key, []);
              if (Array.isArray(currentArrayAppend)) {
                safeSet(state, key, [...currentArrayAppend, payload]);
              } else {
                safeSet(state, key, [payload]);
              }
              break;
            }

            case 'prepend': {
              const currentArrayPrepend = safeGet(state, key, []);
              if (Array.isArray(currentArrayPrepend)) {
                safeSet(state, key, [payload, ...currentArrayPrepend]);
              } else {
                safeSet(state, key, [payload]);
              }
              break;
            }

            default:
              safeSet(state, key, payload);
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
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
              const filterFunc = new Function('item', 'index', 'array', `return ${payload}`) as any;
              newArray = newArray.filter(filterFunc);
            }
            break;

          case 'map':
            if (typeof payload === 'function') {
              newArray = newArray.map(payload);
            } else if (typeof payload === 'string') {
              // Evaluate map expression
              const mapFunc = new Function('item', 'index', 'array', `return ${payload}`) as any;
              newArray = newArray.map(mapFunc);
            }
            break;

          case 'sort':
            if (typeof payload === 'function') {
              newArray.sort(payload);
            } else if (typeof payload === 'string') {
              // Evaluate sort comparison
              const compareFunc = new Function('a', 'b', `return ${payload}`) as any;
              newArray.sort(compareFunc);
            } else {
              newArray.sort();
            }
            break;

          default:
            if (process.env.NODE_ENV !== 'production') {
            }
            return;
        }

        safeSet(state, key, newArray);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
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
        }
      }
    },

    // Spread operations
    spreadProperties: (
      state,
      action: PayloadAction<{
        targetKey: string;
        sourceKey: string;
        properties?: string[];
        overwrite?: boolean;
      }>
    ) => {
      const { targetKey, sourceKey, properties, overwrite = true } = action.payload;

      if (!targetKey || !sourceKey) return;

      const sourceObj = safeGet(state, sourceKey, {});
      const targetObj = safeGet(state, targetKey, {});

      if (typeof sourceObj !== 'object' || Array.isArray(sourceObj)) return;

      let spreadData = {};

      if (properties && Array.isArray(properties)) {
        // Spread only specific properties
        properties.forEach((prop) => {
          if (Object.prototype.hasOwnProperty.call(sourceObj, prop)) {
            spreadData[prop] = (sourceObj as any)[prop];
          }
        });
      } else {
        // Spread all properties
        spreadData = { ...sourceObj };
      }

      const newTargetObj = overwrite ? { ...targetObj, ...spreadData } : { ...spreadData, ...targetObj };

      safeSet(state, targetKey, newTargetObj);
    },

    // Reset state to initial or specified values
    resetState: (
      state,
      action: PayloadAction<{
        keys?: string[];
        resetValues?: Record<string, any>;
      }>
    ) => {
      const { keys, resetValues = {} } = action.payload;

      if (keys && Array.isArray(keys)) {
        // Reset specific keys
        keys.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(resetValues, key)) {
            safeSet(state, key, resetValues[key]);
          } else {
            unset(state, key);
          }
        });
      } else {
        // Reset entire state
        Object.keys(state).forEach((key) => {
          delete state[key];
        });

        // Apply reset values if provided
        Object.entries(resetValues).forEach(([key, value]) => {
          safeSet(state, key, value);
        });
      }
    },

    // Batch operations with transaction-like behavior
    batchUpdate: (
      state,
      action: PayloadAction<{
        operations: Array<{
          type: string;
          key: string;
          payload?: any;
          [key: string]: any;
        }>;
        rollbackOnError?: boolean;
      }>
    ) => {
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
            Object.keys(state).forEach((key) => delete state[key]);
            Object.assign(state, snapshot);
            break;
          }
        }
      }

      if (process.env.NODE_ENV !== 'production' && errors.length > 0) {
      }
    },

    // Deep clone and update
    deepCloneAndUpdate: (
      state,
      action: PayloadAction<{
        sourceKey: string;
        targetKey: string;
        modifications?: Record<string, any>;
      }>
    ) => {
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

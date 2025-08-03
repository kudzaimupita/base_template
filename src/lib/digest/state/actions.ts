import { getUrlDetails, getValueByPath, retrieveBody } from './utils';
import { initJsonDebugStyles, logJsonDebug } from './debug';

import axios from 'axios';
import _ from 'lodash';
import { message } from 'antd';
import { messageLogger } from '../digester';
import { createEventHandler } from '../../utils';

async function downloadFile(input, filename, mimeType = 'application/octet-stream') {
  let url;
  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      url = input;
    } else if (/^[A-Za-z0-9+/=]+\s*$/.test(input)) {
      url = `data:${mimeType};base64,${input}`;
    } else if (input.startsWith('http') || input.startsWith('www')) {
      const response = await fetch(input);
      const blob = await response.blob();
      url = URL.createObjectURL(blob);
    } else {
      const blob = new Blob([input], {
        type: mimeType,
      });
      url = URL.createObjectURL(blob);
    }
  } else {
    url = URL.createObjectURL(input);
  }
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof input !== 'string' || input.startsWith('data:')) {
    URL.revokeObjectURL(url);
  }
}
export const statePlugin = {
  disabled: false,
  name: 'State',
  label: 'App State',
  desc: 'Application State',
  img: 'https://static-00.iconduck.com/assets.00/office-database-icon-1966x2048-mah3mrgd.png',
  type: 'State',
  operations: [
    {
      key: 'ui-mapElements',
      label: 'Simple Map',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          // level: {
          //   type: 'string',
          //   title: 'Level',
          //   enum: ['element', 'page'],
          //   default: 'element',
          // },
          targetElement: {
            type: 'string',
            title: 'Target Element',
            pattern: '',
            // description: 'No spaces, fullstops ',
            config: {
              uiType: 'elementSelect',
            },
          },
          dataSource: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          // cssStyling: {
          //   type: ['string', 'object'],
          //   config: {
          //     uiType: 'style',
          //   },
          // },
        },
        required: ['name', 'dataSource', 'targetElement'],
      },
      process: async (
        process,
        globalObj,
        globalErrors,
        event,
        currentLog,
        appId,
        navigate,
        paramState,
        sessionKey,
        tes,
        renderElementUtil
      ) => {
        let key = '';
        const newState = {};
        try {
          if (process.level === 'element') {
            if (process?.elementOverride) {
              key = `${process.pageId}.${process.elementOverride}`;
            } else {
              key = `${process.pageId}.${process.compId}`;
            }
          }
          if (process.level === 'page') {
            if (process.pageId) key = process.pageId;
            key = process.pageId;
          }

          process?.store.dispatch(
            process?.setAppStatePartial({
              payload: process?.cssStyling,
              key,
            })
          );
          globalObj[process.name] = {
            data: newState,
          };
        } catch (error) {
          
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
    {
      key: 'ui-styleElement',
      label: 'Style Element',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          level: {
            type: 'string',
            title: 'Level',
            enum: ['element', 'page'],
            default: 'element',
          },
          elementOverride: {
            type: 'string',
            title: 'Element',
            pattern: '',
            description: 'No spaces, fullstops ',
            config: {
              uiType: 'elementSelect',
            },
          },
          cssStyling: {
            type: ['string', 'object'],
            config: {
              uiType: 'style',
            },
          },
        },
        required: ['name', 'level'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let key = '';
        const newState = {};
        try {
          if (process.level === 'element') {
            if (process?.elementOverride) {
              key = `${process.pageId}.${process.elementOverride}`;
            } else {
              key = `${process.pageId}.${process.compId}`;
            }
          }
          if (process.level === 'page') {
            if (process.pageId) key = process.pageId;
            key = process.pageId;
          }
        
          process?.store.dispatch(
            process?.setAppStatePartial({
              payload: process?.cssStyling,
              key,
            })
          );
          globalObj[process.name] = {
            data: newState,
          };
        } catch (error) {
          
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
    {
      key: 'ui-renderElements',
      label: 'Render Element',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          // actionType: {
          //   type: 'string',
          //   title: 'type',
          //   enum: ['add', 'inject'],
          //   default: 'add',
          // },
          // renderInto: {
          //   type: 'string',
          //   pattern: '^[^.]+$',
          //   description: 'No spaces, fullstops ',
          //   config: {
          //     uiType: 'elementSelect',
          //   },
          // },
          // blueprint: {
          //   type: 'string',
          //   pattern: '^[^.]+$',
          //   description: 'No spaces, fullstops ',
          //   config: {
          //     uiType: 'elementSelect',
          //   },
          // },
          propsMapper: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, fullstops ',
            config: {
              uiType: 'propsMapper',
            },
          },
        },
        required: ['name'],
      },
      process: async (
        process,
        globalObj,
        globalErrors,
        event,
        currentLog,
        appId,
        navigate,
        paramState,
        sessionKey,
        te,
        renderElementUtil
      ) => {


        renderElementUtil({ ...process, event, globalObj, sessionKey, paramState });
        try {
          globalObj[process.name] = {
            data: '',
          };
        } catch (error) {
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
{
  key: 'state-setState',
  label: 'Set State',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Step Name',
        pattern: '^[^.]+$',
        description: 'Name for this state operation',
        default: 'setState'
      },
      stateConfig: {
        type: 'string',
        title: 'State Configuration', 
        config: {
          uiType: 'SetStateField'
        },
        default: JSON.stringify({
          operation: 'set',
          key: '',
          payload: '',
          elementOverride: '',
          mergeStrategy: 'shallow',
          arrayOperation: 'push',
          arrayIndex: 0,
          deleteCount: 1,
          separator: ' '
        })
      },
    },
    required: ['name', 'stateConfig'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Extract config from the stateConfig property (now a JSON string)
      let config = {};
      try {
        config = typeof process.stateConfig === 'string' 
          ? JSON.parse(process.stateConfig) 
          : (process.stateConfig || {});
      } catch (e) {
        config = {};
      }
      
      // Extract parameters from config
      const operation = config.operation || 'set';
      const mergeStrategy = config.mergeStrategy || 'shallow';
      const arrayOperation = config.arrayOperation || 'push';
      const arrayIndex = parseInt(String(config.arrayIndex || 0), 10);
      const deleteCount = parseInt(String(config.deleteCount || 1), 10);

      // Build state key path
      let keyPath = '';
      // if (level === 'view') {
        // if (process.pageId) keyPath = process.pageId;
        if (config?.elementOverride) {
          keyPath = keyPath ? `${config.elementOverride}` : config.elementOverride;
        } else {
          keyPath = keyPath ? `${process.compId}` : process.compId;
        }
      // }

      const baseKey = retrieveBody('', String(config.key || ''), event, globalObj, paramState, sessionKey, process);
      const fullKey = keyPath ? `${keyPath}.${baseKey}` : baseKey;

      if (!fullKey) {
        throw new Error('State key path is required');
      }

      // Process payload
      let payload;
      if (typeof config.payload === 'string') {
        // If it's a string, process it with retrieveBody and try to parse as JSON
        payload = retrieveBody('', config.payload, event, globalObj, paramState, sessionKey, process);
        if (typeof payload === 'string' && payload.trim()) {
          try {
            payload = JSON.parse(payload);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
      } else if (config.payload !== undefined && config.payload !== null) {
        // If it's already an object, use it directly
        payload = config.payload;
      } else {
        // Default to empty string if no payload
        payload = '';
      }

      // Apply transform function if provided
      if (config.transformFunction) {
        try {
          const currentValue = _.get(globalObj.appState || {}, fullKey);
          const transformContext = {
            currentValue,
            payload,
            event,
            globalObj,
            paramState,
            fullKey,
          };
          
          payload = createEventHandler(transformContext, config.transformFunction, process.compId, {}, navigate, paramState, 
            process.pageId, process.editMode, process.store, process?.refreshAppAuth,
            process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
        } catch (transformError) {
          messageLogger.error(`Transform function error: ${transformError.message}`);
          throw transformError;
        }
      }



      // Helper function to safely parse JSON
      const safeJsonParse = (str, fallback = []) => {
        if (!str || typeof str !== 'string' || str.trim() === '') {
          return fallback;
        }
        try {
          return JSON.parse(str);
        } catch (e) {
          return fallback;
        }
      };

      // Prepare operation config
      const operationConfig = {
        mergeStrategy,
        arrayOperation,
        arrayIndex: arrayIndex >= 0 ? arrayIndex : undefined,
        deleteCount,
        separator: config.separator || ' ',
      };

      // Define the update operation
      const performUpdate = () => {
        try {
          if (process?.store?.dispatch && process?.setAppStatePartial) {
            // Get element context for operations that need access to element configuration
            const elementContext = config.elementOverride ? (() => {
              // Find the element in allElements first (immediate access)
              const elementFromAllElements = globalObj.allElements?.find(el => el.i === config.elementOverride);
              
              // Use store.getState() to access currentApplication from Redux store
              let elementFromCurrentApp = null;
              if (process.store) {
                const rootState = process.store.getState();
                const currentApplication = rootState.currentAppState?.currentApplication;
                
                if (currentApplication?.views && process.pageId) {
                  const targetView = currentApplication.views.find(view => view.id === process.pageId);
                  if (targetView?.layout) {
                    elementFromCurrentApp = targetView.layout.find(element => element.i === config.elementOverride);
                  }
                }
              }
              
              // Use the most complete element configuration available
              const bestElement = elementFromCurrentApp || elementFromAllElements;
              
              return {
                elementId: config.elementOverride,
                elementConfiguration: bestElement?.configuration || bestElement,
                allElements: globalObj.allElements,
                viewId: process.pageId,
                pageId: process.pageId,
                compId: config.elementOverride,
                // Pass the complete element for debugging
                completeElement: bestElement
              };
            })() : undefined;

            // Dispatch to the enhanced setAppStatePartial reducer
            process.store.dispatch(process.setAppStatePartial({
              key: fullKey,
              payload,
              operationType: operation,
              operationConfig,
              elementContext
            }));



            // Store operation result
            globalObj[process.name || 'setState'] = {
              success: true,
              operation,
              key: fullKey,
              payload,
              timestamp: new Date().toISOString(),
              metadata: {
                operation,
                key: config?.key,
                payload: config?.payload,
                elementOverride: config?.elementOverride,
                mergeStrategy,
                compId: process.compId,
                keyPath,
                baseKey,
              },
            };

            messageLogger.success(`State ${operation} operation completed for key: ${fullKey}`);
          } else {
            throw new Error('Redux store or setAppStatePartial action not available');
          }
        } catch (operationError) {
          throw new Error(`${operation} operation failed: ${operationError.message}`);
        }
      };

      // Execute the update
      performUpdate();

    } catch (error) {
   
      // Prepare error details  
      const errorName = process?.name || 'setState';
      const errorDetails = {
        ...globalErrors?.[errorName],
        error: error.message || 'State operation failed',
        // operation: config?.operation || 'set',
        // key: config?.key,
        timestamp: new Date().toISOString(),
      };

      // Store error
      globalErrors[errorName] = errorDetails;



      messageLogger.error(`State operation failed: ${error.message}`);
      throw error;
    }
  },
},
    {
      key: 'state-setSessionInfo',
      label: 'Set Local Store',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          key: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Storage Key Path (e.g., user.preferences.theme)',
              },
            },
          },
          payload: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value to store',
              },
            },
          },
          operationType: {
            type: 'string',
            title: 'Operation Type',
            enum: ['set', 'merge', 'append', 'prepend', 'delete'],
            default: 'set',
            description: 'set: Set value, merge: Merge objects, append: Add to array end, prepend: Add to array start, delete: Remove key'
          },
          mergeStrategy: {
            type: 'string',
            title: 'Merge Strategy (for merge operation)',
            enum: ['shallow', 'deep'],
            default: 'shallow',
            description: 'shallow: Simple object merge, deep: Deep merge with nested objects'
          },
        },
        required: ['name', 'payload', 'key'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const key = retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process);
          const payload = retrieveBody('', process.payload.value, event, globalObj, paramState, sessionKey, process);
          const operationType = retrieveBody('', process.operationType, event, globalObj, paramState, sessionKey, process);
          const mergeStrategy = retrieveBody('', process.mergeStrategy, event, globalObj, paramState, sessionKey, process);

          // Utility functions for safe nested operations
          const safeGet = (obj, path, defaultValue) => {
            const keys = path.split('.');
            let result = obj;
            for (const keyPart of keys) {
              result = result?.[keyPart];
              if (result === undefined) return defaultValue;
            }
            return result;
          };

          const safeSet = (obj, path, value) => {
            const keys = path.split('.');
            let current = obj;
            
            for (let i = 0; i < keys.length - 1; i++) {
              const keyPart = keys[i];
              if (!current[keyPart] || typeof current[keyPart] !== 'object') {
                current[keyPart] = {};
              }
              current = current[keyPart];
            }
            
            current[keys[keys.length - 1]] = value;
          };

          const unset = (obj, path) => {
            const keys = path.split('.');
            let current = obj;
            
            for (let i = 0; i < keys.length - 1; i++) {
              current = current?.[keys[i]];
              if (!current) return;
            }
            
            delete current[keys[keys.length - 1]];
          };

          const merge = (target, source) => {
            if (mergeStrategy === 'deep') {
              return deepMerge(target, source);
            } else {
              return { ...target, ...source };
            }
          };

          const deepMerge = (target, source) => {
            const output = { ...target };
            if (isObject(target) && isObject(source)) {
              Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                  if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                  } else {
                    output[key] = deepMerge(target[key], source[key]);
                  }
                } else {
                  Object.assign(output, { [key]: source[key] });
                }
              });
            }
            return output;
          };

          const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

          // Get existing localStorage data
          const existingData = JSON.parse(localStorage.getItem(sessionKey) || '{}');
          const currentValue = safeGet(existingData, key);

          // Perform the operation based on type
          switch (operationType) {
            case 'set':
              safeSet(existingData, key, payload);
              break;

            case 'merge': {
              const currentObj = currentValue || {};
              
              if (typeof currentObj !== 'object' || Array.isArray(currentObj)) {
                safeSet(existingData, key, payload);
                break;
              }

              const mergedValue = merge(currentObj, payload);
              safeSet(existingData, key, mergedValue);
              break;
            }

            case 'append': {
              const currentArray = currentValue || [];
              if (Array.isArray(currentArray)) {
                safeSet(existingData, key, [...currentArray, payload]);
              } else {
                safeSet(existingData, key, [payload]);
              }
              break;
            }

            case 'prepend': {
              const currentArray = currentValue || [];
              if (Array.isArray(currentArray)) {
                safeSet(existingData, key, [payload, ...currentArray]);
              } else {
                safeSet(existingData, key, [payload]);
              }
              break;
            }

            case 'delete':
              unset(existingData, key);
              break;

            default:
              safeSet(existingData, key, payload);
          }

          // Save back to localStorage
          localStorage.setItem(sessionKey, JSON.stringify(existingData));

          globalObj[process.name] = {
            data: {
              sessionInfo: {
                id: sessionKey,
                key: key,
                data: payload,
                operationType: operationType,
                previousValue: currentValue,
                newValue: safeGet(existingData, key)
              },
            },
            success: true,
            message: `Successfully performed ${operationType} operation on ${key}`
          };

        } catch (error) {
          messageLogger.error(`LocalStore operation failed: ${error.message}`);
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'Local store operation failed',
            operationType: process.operationType,
            key: process.key?.value,
            timestamp: new Date().toISOString(),
          };
        }
      },
    },
    {
      key: 'state-bulkSetSessionInfo',
      label: 'Bulk Set Local Store',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          operations: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Operations Array (JSON string)',
                description: 'Array of operations: [{"key":"user.name","payload":"John","operation":"set"},{"key":"cache","operation":"delete"}]'
              },
            },
          },
        },
        required: ['name', 'operations'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const operationsString = retrieveBody('', process.operations.value, event, globalObj, paramState, sessionKey, process);
          const operations = JSON.parse(operationsString);

          if (!Array.isArray(operations)) {
            throw new Error('Operations must be an array');
          }

          // Utility functions for safe nested operations (same as above)
          const safeGet = (obj, path, defaultValue) => {
            const keys = path.split('.');
            let result = obj;
            for (const keyPart of keys) {
              result = result?.[keyPart];
              if (result === undefined) return defaultValue;
            }
            return result;
          };

          const safeSet = (obj, path, value) => {
            const keys = path.split('.');
            let current = obj;
            
            for (let i = 0; i < keys.length - 1; i++) {
              const keyPart = keys[i];
              if (!current[keyPart] || typeof current[keyPart] !== 'object') {
                current[keyPart] = {};
              }
              current = current[keyPart];
            }
            
            current[keys[keys.length - 1]] = value;
          };

          const unset = (obj, path) => {
            const keys = path.split('.');
            let current = obj;
            
            for (let i = 0; i < keys.length - 1; i++) {
              current = current?.[keys[i]];
              if (!current) return;
            }
            
            delete current[keys[keys.length - 1]];
          };

          // Get existing localStorage data
          const existingData = JSON.parse(localStorage.getItem(sessionKey) || '{}');
          const results = [];

          // Process each operation
          for (const op of operations) {
            const { key, payload, operation = 'set' } = op;
            
            if (!key) {
              results.push({ key: 'unknown', operation, success: false, error: 'Key is required' });
              continue;
            }

            try {
              const currentValue = safeGet(existingData, key);

              switch (operation) {
                case 'set':
                  safeSet(existingData, key, payload);
                  break;
                  
                case 'merge': {
                  const currentObj = currentValue || {};
                  if (typeof currentObj === 'object' && !Array.isArray(currentObj)) {
                    safeSet(existingData, key, { ...currentObj, ...payload });
                  } else {
                    safeSet(existingData, key, payload);
                  }
                  break;
                }
                  
                case 'delete':
                  unset(existingData, key);
                  break;
                  
                case 'append': {
                  const currentArray = currentValue || [];
                  if (Array.isArray(currentArray)) {
                    safeSet(existingData, key, [...currentArray, payload]);
                  } else {
                    safeSet(existingData, key, [payload]);
                  }
                  break;
                }
                  
                case 'prepend': {
                  const currentArray = currentValue || [];
                  if (Array.isArray(currentArray)) {
                    safeSet(existingData, key, [payload, ...currentArray]);
                  } else {
                    safeSet(existingData, key, [payload]);
                  }
                  break;
                }
                  
                default:
                  safeSet(existingData, key, payload);
              }

              results.push({ 
                key, 
                operation, 
                success: true, 
                previousValue: currentValue,
                newValue: safeGet(existingData, key)
              });

            } catch (opError) {
              results.push({ 
                key, 
                operation, 
                success: false, 
                error: opError.message 
              });
            }
          }

          // Save back to localStorage
          localStorage.setItem(sessionKey, JSON.stringify(existingData));

          globalObj[process.name] = {
            data: {
              sessionInfo: {
                id: sessionKey,
                operations: results,
                totalOperations: operations.length,
                successfulOperations: results.filter(r => r.success).length,
                failedOperations: results.filter(r => !r.success).length
              },
            },
            success: true,
            message: `Bulk operation completed: ${results.filter(r => r.success).length}/${operations.length} successful`
          };

        } catch (error) {
          messageLogger.error(`Bulk LocalStore operation failed: ${error.message}`);
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'Bulk local store operation failed',
            timestamp: new Date().toISOString(),
          };
        }
      },
    },
    {
      key: 'state-destroySessionInfo',
      label: 'Destroy Session Info',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // process?.store.dispatch(
          //   process?.setDestroyInfo({
          //     id: sessionKey,
          //   })
          // );
          localStorage.removeItem(sessionKey);
          // process?.store.dispatch(process?.refreshAppAuth());
          globalObj[process.name] = {
            data: {},
          };
        } catch (error) {
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
    {
      key: 'controller-invoke',
      label: 'Invoke Controller',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          // returnKey: {
          //   type: 'string',
          // },
          controller: {
            type: 'string',
            config: {
              uiType: 'controller',
            },
          },
          body: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          headers: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
                default: JSON.stringify(
                  {
                    authorization: 'Bearer {{localStore.token}}',
                  },
                  null,
                  2
                ),
              },
            },
          },
          sendAsMultipart: {
            type: 'boolean',
            title: 'Send as Multipart',
            description: 'Enable to send as FormData (multipart/form-data). Disable to send as JSON.',
            default: false,
          },
          filesSource: {
            type: 'object',
            title: 'Files Source',
            properties: {

              value: {
                type: 'string',
                title: 'Source Path',
                description: 'Path to the files source (e.g., target.files for event, or a state path)',
                default: '{{event.target.files}}',
              },
            },
            description: 'Optional: Specify where to get files from for multipart requests',
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
         
          const body = retrieveBody('', process.body?.value, event, globalObj, paramState, sessionKey, process);
          const headers = retrieveBody('', process.headers?.value, event, globalObj, paramState, sessionKey, process);



          let requestData;
          let files = null;
          
          // Get files from the specified source (only if multipart is enabled)
          if (process.sendAsMultipart && process.filesSource?.value) {
            try {
              files = retrieveBody(
                process.filesSource.from || 'event',
                process.filesSource.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
            } catch (error) {
              
            }
          }
          
          // Check if we should send as multipart (based on checkbox, not automatic file detection)
          if (process.sendAsMultipart) {
           
            // Create FormData for multipart request
            requestData = new FormData();
            
            // Add each body property as individual form fields
            if (body && typeof body === 'object') {
              Object.keys(body).forEach(key => {
                requestData.append(key, body[key]);
              });
            }
            
            // Add files if available
            if (files) {
              const fileArray = Array.isArray(files) ? files : Array.from(files || []);
              fileArray.forEach((fileItem: any, index) => {
                if (fileItem.originFileObj) {
                  // Ant Design file object
                  requestData.append(`files`, fileItem.originFileObj, fileItem.name);
                } else if (fileItem instanceof File) {
                  // Native File object
                  requestData.append(`files`, fileItem, fileItem.name);
                }
              });
            }

          } else {
            // Regular JSON request (default behavior)
            requestData = body;
          }
    





          const res = await process?.storeInvocation(
            requestData,
            appId,
            process.controller,
            process?.componentId,
            process?.viewId,
            headers,
            import.meta.env.VITE_ISDEPLOYED ? 'production' : 'development'
          );

          if (Object.keys(res.data?.errors || {})?.length > 0) {
            messageLogger.error(JSON.stringify(res.data?.errors, null, 2));
          }
          globalObj[process.name] = process?.returnKey
            ? getValueByPath(res.data, process?.returnKey)
            : {
              ...res.data,
            };
        } catch (error) {
          // messageLogger.error('err ');
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
{
  key: 'websocket-connect',
  label: 'WebSocket Connect',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store connection result (no spaces, caps)',
      },
      url: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'WebSocket URL',
            description: 'URL for the WebSocket connection (ws:// or wss://)',
            pattern: '^wss?://.+',
          },
        },
        required: ['value'],
      },
      protocols: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Protocols',
            description: 'WebSocket protocols (comma-separated, optional)',
          },
        },
      },
      onMessage: {
       type: 'string',
        config: { uiType: 'eventHandler' },

      },
      storeMessages: {
        type: 'string',
        title: 'Store Messages',
        description: 'Whether to store received messages in memory',
        enum: ['true', 'false'],
        default: 'true',
      },
      connectionTimeout: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Connection Timeout (ms)',
            description: 'Timeout for connection attempt in milliseconds',
            default: 10000,
            minimum: 1000,
            maximum: 60000,
          },
        },
      },
      reconnectAttempts: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Reconnect Attempts',
            description: 'Number of automatic reconnection attempts',
            default: 3,
            minimum: 0,
            maximum: 10,
          },
        },
      },
      reconnectDelay: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Reconnect Delay (ms)',
            description: 'Delay between reconnection attempts',
            default: 1000,
            minimum: 100,
            maximum: 30000,
          },
        },
      },
    },
    required: ['name', 'url'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Message utility


      // Verify WebSocket is available
      if (typeof WebSocket === 'undefined') {
        throw new Error('WebSocket is not supported in this environment');
      }

      // Extract parameters
      const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
      const protocolsStr = retrieveBody('', process.protocols?.value, event, globalObj, paramState, sessionKey, process);
      const onMessageBody = retrieveBody('', process.onMessage?.value, event, globalObj, paramState, sessionKey, process);
      const storeMessages = retrieveBody('true', process?.storeMessages, event, globalObj, paramState, sessionKey, process) === 'true';
      const connectionTimeout = retrieveBody(10000, process.connectionTimeout?.value, event, globalObj, paramState, sessionKey, process);
      const reconnectAttempts = retrieveBody(3, process.reconnectAttempts?.value, event, globalObj, paramState, sessionKey, process);
      const reconnectDelay = retrieveBody(1000, process.reconnectDelay?.value, event, globalObj, paramState, sessionKey, process);

      // Validate URL
      if (!url) {
        throw new Error('WebSocket URL is required');
      }

      if (!url.match(/^wss?:\/\/.+/)) {
        throw new Error('Invalid WebSocket URL format. Must start with ws:// or wss://');
      }

      // Initialize WebSocket connections storage
      if (!globalStorage._wsConnections) {
        globalStorage._wsConnections = new Map();
      }

      // Check if there's already an active connection to this URL
      let existingConnectionId = null;
      for (const [connId, connection] of globalStorage._wsConnections.entries()) {
        if (connection.url === url && (connection.status === 'connected' || connection.status === 'connecting')) {
          existingConnectionId = connId;
          break;
        }
      }

      // If already connected, return existing connection info
      if (existingConnectionId) {
        const existingConnection = globalStorage._wsConnections.get(existingConnectionId);
        
        if (existingConnection.status === 'connected') {
          messageLogger.warn(`WebSocket already connected to: ${url}. Using existing connection.`);
          globalObj[process.name] = {
            data: {
              connectionId: existingConnectionId,
              status: 'connected',
              url: url,
              reusedConnection: true,
              timestamp: new Date().toISOString()
            }
          };
          return;
        } else if (existingConnection.status === 'connecting') {
          messageLogger.info(`WebSocket connection already in progress to: ${url}. Waiting for existing connection.`);
          
          // Wait for the existing connection to complete
          await new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkConnection = () => {
              const conn = globalStorage._wsConnections.get(existingConnectionId);
              if (conn && conn.status === 'connected') {
                resolve();
              } else if (conn && (conn.status === 'error' || conn.status === 'closed')) {
                reject(new Error(`Existing connection failed: ${conn.error || 'Connection closed'}`));
              } else if (Date.now() - startTime > connectionTimeout) {
                reject(new Error('Timeout waiting for existing connection'));
              } else {
                setTimeout(checkConnection, 100);
              }
            };
            checkConnection();
          });

          globalObj[process.name] = {
            data: {
              connectionId: existingConnectionId,
              status: 'connected',
              url: url,
              reusedConnection: true,
              timestamp: new Date().toISOString()
            }
          };
          return;
        }
      }

      // Parse protocols
      const protocols = protocolsStr ? protocolsStr.split(',').map(p => p.trim()).filter(p => p) : undefined;

      // Connection function with retry logic
      const connectWithRetry = async (attempt = 1) => {
        const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        messageLogger.info(`Connecting to WebSocket: ${url} (Attempt ${attempt}/${reconnectAttempts + 1})`);
        
        // Create native browser WebSocket
        const websocket = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
        
        // Connection state
        const connectionState = {
          ws: websocket,
          url: url,
          status: 'connecting',
          messages: storeMessages ? [] : null,
          error: null,
          closeCode: null,
          closeReason: null,
          createdAt: new Date().toISOString(),
          attempt: attempt
        };

        // Store connection
        globalStorage._wsConnections.set(connectionId, connectionState);

        try {
          // Wait for connection to open or error with timeout
          await new Promise((resolve, reject) => {
            let timeoutId;
            
            const cleanup = () => {
              if (timeoutId) clearTimeout(timeoutId);
              websocket.removeEventListener('open', onOpen);
              websocket.removeEventListener('error', onError);
            };

            const onOpen = () => {
              cleanup();
              connectionState.status = 'connected';
              connectionState.connectedAt = new Date().toISOString();
              messageLogger.success(`WebSocket connected to: ${url}`);
              resolve();
            };

            const onError = (errorEvent) => {
              cleanup();
              const errorMsg = `WebSocket connection failed: ${errorEvent.message || 'Unknown error'}`;
              connectionState.status = 'error';
              connectionState.error = errorMsg;
              reject(new Error(errorMsg));
            };

            // Set connection timeout
            timeoutId = setTimeout(() => {
              cleanup();
              websocket.close();
              connectionState.status = 'error';
              connectionState.error = 'Connection timeout';
              reject(new Error('WebSocket connection timeout'));
            }, connectionTimeout);

            websocket.addEventListener('open', onOpen);
            websocket.addEventListener('error', onError);
          });

          // Set up message handler
          websocket.addEventListener('message', (event) => {
            
           
            let messageData;
            try {
              messageData = JSON.parse(event.data);
            } catch (e) {
              messageData = event.data;
            }
 createEventHandler(messageData,process?.onMessage, process.compId,{},navigate,paramState,process.pageId,process.editMode,process.store,process?.refreshAppAuth,
  process?.setDestroyInfo,process.setSessionInfo,process?.setAppStatePartial,()=>''
 )
            // Store message if enabled
            if (storeMessages && connectionState.messages) {
              connectionState.messages.push({
                timestamp: new Date().toISOString(),
                data: messageData,
                type: typeof messageData
              });
            }

            // Execute custom message handler
            if (onMessageBody) {
              try {
                const handler = new Function('data', 'globalObj', 'connectionId', onMessageBody);
                handler(messageData, globalObj, connectionId);
                messageLogger.warning('hhhh')
              } catch (handlerError) {
                messageLogger.error(`Message handler error: ${handlerError.message}`);
              }
            }
          });

          // Set up close handler with reconnection logic
          websocket.addEventListener('close', (event) => {
            connectionState.status = 'closed';
            connectionState.closeCode = event.code;
            connectionState.closeReason = event.reason;
            connectionState.closedAt = new Date().toISOString();
            
            messageLogger.info(`WebSocket closed: ${url} (Code: ${event.code}, Reason: ${event.reason || 'No reason provided'})`);
            
            // Auto-reconnect if it wasn't a clean close and we have attempts left
            if (event.code !== 1000 && attempt <= reconnectAttempts) {
              messageLogger.info(`Attempting to reconnect in ${reconnectDelay}ms...`);
              setTimeout(() => {
                globalStorage._wsConnections.delete(connectionId);
                connectWithRetry(attempt + 1).catch(err => {
                  messageLogger.error(`Reconnection failed: ${err.message}`);
                });
              }, reconnectDelay);
            }
          });

          // Return successful connection
          return {
            connectionId: connectionId,
            status: 'connected',
            url: url,
            protocols: protocols,
            reusedConnection: false,
            attempt: attempt,
            timestamp: new Date().toISOString()
          };

        } catch (error) {
          // Clean up failed connection
          globalStorage._wsConnections.delete(connectionId);
          
          // Retry if we have attempts left
          if (attempt <= reconnectAttempts) {
            messageLogger.warn(`Connection attempt ${attempt} failed: ${error.message}. Retrying in ${reconnectDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, reconnectDelay));
            return connectWithRetry(attempt + 1);
          } else {
            throw new Error(`Failed to connect after ${attempt} attempts: ${error.message}`);
          }
        }
      };

      // Attempt connection
      const result = await connectWithRetry();
      
      // Store successful result
      globalObj[process.name] = {
        data: result
      };

    } catch (error) {
      // Store error in globalErrors
      messageLogger.error(JSON.stringify(error))
      globalErrors[process.name] = {
        ...globalErrors?.[process.name],
        error: error.message || 'WebSocket connection failed',
        timestamp: new Date().toISOString()
      };

      // Log error
      if (typeof message !== 'undefined' && messageLogger.error) {
        messageLogger.error(`WebSocket connection failed: ${error.message}`);
      } else {
        
      }

      // Re-throw to ensure calling code knows about the failure
      throw error;
    }
  }
} 
,
{
  key: 'websocket-get-connections',
  label: 'WebSocket Get Connections',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store connections list (no spaces, caps)',
      },
      filterByUrl: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Filter by URL',
            description: 'Optional: Filter connections by specific URL',
          },
        },
      },
      includeDetails: {
        type: 'string',
        title: 'Include Details',
        description: 'Include detailed connection information',
        enum: ['true', 'false'],
        default: 'true',
      },
    },
    required: ['name'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Extract parameters
      const filterByUrl = retrieveBody('', process.filterByUrl?.value, event, globalObj, paramState, sessionKey, process);
      const includeDetails = retrieveBody('true', process?.includeDetails, event, globalObj, paramState, sessionKey, process) === 'true';

      // Check if WebSocket connections storage exists
      if (!globalStorage._wsConnections) {
        globalObj[process.name] = {
          data: {
            connections: [],
            count: 0,
            timestamp: new Date().toISOString()
          }
        };
        return;
      }

      const connections = [];
      
      for (const [connectionId, connection] of globalStorage._wsConnections.entries()) {
        // Filter by URL if specified
        if (filterByUrl && connection.url !== filterByUrl) {
          continue;
        }

        const connectionInfo = {
          connectionId: connectionId,
          url: connection.url,
          status: connection.status,
          readyState: connection.ws ? connection.ws.readyState : null,
        };

        if (includeDetails) {
          connectionInfo.details = {
            connectedAt: connection.connectedAt,
            lastActivity: connection.lastActivity,
            messageCount: connection.messages ? connection.messages.length : 0,
            protocol: connection.protocol,
            extensions: connection.extensions,
            binaryType: connection.ws ? connection.ws.binaryType : null,
            bufferedAmount: connection.ws ? connection.ws.bufferedAmount : null,
          };
        }

        connections.push(connectionInfo);
      }

      messageLogger.info(`Found ${connections.length} WebSocket connections${filterByUrl ? ` for URL: ${filterByUrl}` : ''}`);

      // Store successful result
      globalObj[process.name] = {
        data: {
          connections: connections,
          count: connections.length,
          filterByUrl: filterByUrl,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      // Store error in globalErrors
      messageLogger.error(JSON.stringify(error))
      globalErrors[process.name] = {
        ...globalErrors?.[process.name],
        error: error.message || 'WebSocket get connections operation failed',
        timestamp: new Date().toISOString()
      };

      messageLogger.error(`WebSocket get connections failed: ${error.message}`);
      throw error;
    }
  }
},

{
  key: 'websocket-send',
  label: 'WebSocket Send Message',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store send result (no spaces, caps)',
      },
      url: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'WebSocket URL',
            description: 'URL of the WebSocket connection to send message to',
          },
        },
        required: ['value'],
      },
      message: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Message',
            description: 'Message to send over the WebSocket connection (JSON string or plain text)',
          },
        },
        required: ['value'],
      },
      messageType: {
        type: 'string',
        title: 'Message Type',
        description: 'How to interpret the message content',
        enum: ['auto', 'json', 'text', 'binary'],
        default: 'auto',
      },
      waitForAck: {
        type: 'string',
        title: 'Wait for Acknowledgment',
        description: 'Wait for a response message after sending',
        enum: ['true', 'false'],
        default: 'false',
      },
      ackTimeout: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Acknowledgment Timeout (ms)',
            description: 'Timeout for waiting for acknowledgment',
            default: 5000,
            minimum: 1000,
            maximum: 30000,
          },
        },
      },
      retryAttempts: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Retry Attempts',
            description: 'Number of retry attempts if send fails',
            default: 2,
            minimum: 0,
            maximum: 5,
          },
        },
      },
      retryDelay: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Retry Delay (ms)',
            description: 'Delay between retry attempts',
            default: 1000,
            minimum: 100,
            maximum: 10000,
          },
        },
      },
    },
    required: ['name', 'url', 'message'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Verify WebSocket connections storage exists
      if (!globalStorage._wsConnections) {
        throw new Error('No WebSocket connections found. Please establish a connection first.');
      }

      // Extract parameters
      const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
      const messageData = retrieveBody('', process.message?.value, event, globalObj, paramState, sessionKey, process);
      const messageType = retrieveBody('auto', process?.messageType, event, globalObj, paramState, sessionKey, process);
      const waitForAck = retrieveBody('false', process?.waitForAck, event, globalObj, paramState, sessionKey, process) === 'true';
      const ackTimeout = retrieveBody(5000, process.ackTimeout?.value, event, globalObj, paramState, sessionKey, process);
      const retryAttempts = retrieveBody(2, process.retryAttempts?.value, event, globalObj, paramState, sessionKey, process);
      const retryDelay = retrieveBody(1000, process.retryDelay?.value, event, globalObj, paramState, sessionKey, process);

      // Validate inputs
      if (!url) {
        throw new Error('WebSocket URL is required');
      }

      if (!messageData && messageData !== '') {
        throw new Error('Message is required');
      }

      // Find connection by URL
      let connection = null;
      let connectionId = null;
      
      for (const [connId, conn] of globalStorage._wsConnections.entries()) {
        if (conn.url === url) {
          connection = conn;
          connectionId = connId;
          break;
        }
      }

      if (!connection) {
        throw new Error(`WebSocket connection not found for URL: ${url}`);
      }

      // Check connection status
      if (connection.status !== 'connected') {
        throw new Error(`WebSocket not connected. Current status: ${connection.status}`);
      }

      // Check if WebSocket is still open
      if (connection.ws.readyState !== WebSocket.OPEN) {
        connection.status = 'closed';
        throw new Error(`WebSocket connection is no longer open. Ready state: ${connection.ws.readyState}`);
      }

      // Prepare message for sending based on type
      const prepareMessage = (data, type) => {
        switch (type) {
          case 'json':
            try {
              // If it's already a JSON string, parse and re-stringify to validate
              const parsed = typeof data === 'string' ? JSON.parse(data) : data;
              return JSON.stringify(parsed);
            } catch (e) {
              throw new Error(`Invalid JSON message: ${e.message}`);
            }

          case 'text':
            return String(data);

          case 'binary':
            if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
              return data;
            }
            throw new Error('Binary message type requires ArrayBuffer or Uint8Array');

          case 'auto':
          default:
            // Auto-detect message type
            if (typeof data === 'object' && data !== null && !(data instanceof ArrayBuffer) && !(data instanceof Uint8Array)) {
              return JSON.stringify(data);
            } else if (typeof data === 'string') {
              // Try to parse as JSON first, if it fails, send as text
              try {
                JSON.parse(data);
                return data; // Already valid JSON string
              } catch (e) {
                return data; // Send as plain text
              }
            } else {
              return String(data);
            }
        }
      };

      // Send message with retry logic
      const sendWithRetry = async (attempt = 1) => {
        try {
          const messageToSend = prepareMessage(messageData, messageType);
          const sendTimestamp = new Date().toISOString();

          // Generate unique message ID for tracking
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Send the message
          connection.ws.send(messageToSend);

          messageLogger.info(`Message sent via WebSocket to ${url} (Attempt ${attempt})`);

          let ackResponse = null;

          // Wait for acknowledgment if requested
          if (waitForAck) {
            ackResponse = await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                connection.ws.removeEventListener('message', ackHandler);
                reject(new Error('Acknowledgment timeout'));
              }, ackTimeout);

              const ackHandler = (event) => {
                clearTimeout(timeoutId);
                connection.ws.removeEventListener('message', ackHandler);

                let responseData;
                try {
                  responseData = JSON.parse(event.data);
                } catch (e) {
                  responseData = event.data;
                }

                resolve({
                  timestamp: new Date().toISOString(),
                  data: responseData
                });
              };

              connection.ws.addEventListener('message', ackHandler);
            });
          }

          // Store message in connection history if enabled
          if (connection.messages) {
            connection.messages.push({
              id: messageId,
              type: 'sent',
              timestamp: sendTimestamp,
              data: messageToSend,
              messageType: messageType,
              attempt: attempt,
              acknowledgment: ackResponse
            });
          }

          return {
            messageId: messageId,
            connectionId: connectionId,
            url: url,
            sent: true,
            timestamp: sendTimestamp,
            messageSize: new Blob([messageToSend]).size,
            messageType: messageType,
            attempt: attempt,
            acknowledgment: ackResponse
          };

        } catch (error) {
          if (attempt <= retryAttempts) {
            messageLogger.warn(`Send attempt ${attempt} failed: ${error.message}. Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return sendWithRetry(attempt + 1);
          } else {
            throw new Error(`Failed to send message after ${attempt} attempts: ${error.message}`);
          }
        }
      };

      // Send the message
      const result = await sendWithRetry();

      // Store successful result
      globalObj[process.name] = {
        data: result
      };

    } catch (error) {
      // Store error in globalErrors
      messageLogger.error(JSON.stringify(error))
      globalErrors[process.name] = {
        ...globalErrors?.[process.name],
        error: error.message || 'WebSocket send operation failed',
        timestamp: new Date().toISOString()
      };

      messageLogger.error(`WebSocket send failed: ${error.message}`);
      throw error;
    }
  }
},

{
  key: 'websocket-disconnect',
  label: 'WebSocket Disconnect',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store disconnect result (no spaces, caps)',
      },
      url: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'WebSocket URL',
            description: 'URL of the WebSocket connection to close',
          },
        },
        required: ['value'],
      },
      closeCode: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Close Code',
            description: 'WebSocket close code (1000 = normal closure)',
            default: 1000,
            minimum: 1000,
            maximum: 4999,
          },
        },
      },
      closeReason: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Close Reason',
            description: 'Reason for closing the connection (optional)',
            maxLength: 123,
          },
        },
      },
      forceClose: {
        type: 'string',
        title: 'Force Close',
        description: 'Force immediate closure without waiting for close handshake',
        enum: ['true', 'false'],
        default: 'false',
      },
      closeTimeout: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Close Timeout (ms)',
            description: 'Maximum time to wait for graceful closure',
            default: 5000,
            minimum: 1000,
            maximum: 30000,
          },
        },
      },
      preserveMessages: {
        type: 'string',
        title: 'Preserve Messages',
        description: 'Keep message history after disconnection',
        enum: ['true', 'false'],
        default: 'true',
      },
      disconnectAll: {
        type: 'string',
        title: 'Disconnect All',
        description: 'Disconnect all WebSocket connections (ignores url)',
        enum: ['true', 'false'],
        default: 'false',
      },
    },
    required: ['name'],
    anyOf: [
      {
        properties: {
          disconnectAll: {
            enum: ['true']
          }
        }
      },
      {
        required: ['url']
      }
    ],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Verify WebSocket connections storage exists
      if (!globalStorage._wsConnections) {
        messageLogger.warn('No WebSocket connections storage found');
        globalObj[process.name] = {
          data: {
            message: 'No WebSocket connections to disconnect',
            disconnectedConnections: [],
            timestamp: new Date().toISOString()
          }
        };
        return;
      }

      // Extract parameters
      const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
      const closeCode = retrieveBody(1000, process.closeCode?.value, event, globalObj, paramState, sessionKey, process);
      const closeReason = retrieveBody('Connection closed by application', process.closeReason?.value, event, globalObj, paramState, sessionKey, process);
      const forceClose = retrieveBody('false', process?.forceClose, event, globalObj, paramState, sessionKey, process) === 'true';
      const closeTimeout = retrieveBody(5000, process.closeTimeout?.value, event, globalObj, paramState, sessionKey, process);
      const preserveMessages = retrieveBody('true', process?.preserveMessages, event, globalObj, paramState, sessionKey, process) === 'true';
      const disconnectAll = retrieveBody('false', process?.disconnectAll, event, globalObj, paramState, sessionKey, process) === 'true';

      // Validate close code
      if (closeCode < 1000 || closeCode > 4999) {
        throw new Error('Invalid close code. Must be between 1000 and 4999');
      }

      // Validate close reason length
      if (closeReason && closeReason.length > 123) {
        throw new Error('Close reason must be 123 bytes or less');
      }

      // Function to gracefully close a single connection
      const closeConnection = async (connId, connection) => {
        const startTime = Date.now();
        const connectionInfo = {
          connectionId: connId,
          url: connection.url,
          status: connection.status,
          closeCode: null,
          closeReason: null,
          closedAt: null,
          closeTime: null,
          messages: preserveMessages ? connection.messages : null,
          forced: forceClose
        };

        try {
          if (connection.status === 'closed') {
            messageLogger.info(`WebSocket connection already closed: ${connection.url}`);
            connectionInfo.closeCode = connection.closeCode || closeCode;
            connectionInfo.closeReason = connection.closeReason || closeReason;
            connectionInfo.closedAt = connection.closedAt || new Date().toISOString();
            connectionInfo.closeTime = 0;
            return connectionInfo;
          }

          if (connection.status !== 'connected' && connection.ws.readyState !== WebSocket.OPEN) {
            messageLogger.warn(`WebSocket connection not in connected state: ${connection.url} (status: ${connection.status}, readyState: ${connection.ws.readyState})`);
            // Still attempt to close
          }

          messageLogger.info(`Closing WebSocket connection: ${connection.url} (Code: ${closeCode}, Reason: ${closeReason})`);

          if (forceClose) {
            // Force immediate closure
            connection.ws.close();
            connection.status = 'closed';
            connectionInfo.closeCode = closeCode;
            connectionInfo.closeReason = 'Forced closure';
            connectionInfo.closedAt = new Date().toISOString();
            connectionInfo.closeTime = Date.now() - startTime;
            messageLogger.info(`WebSocket connection force closed: ${connection.url}`);
          } else {
            // Graceful closure with timeout
            await new Promise((resolve, reject) => {
              let resolved = false;

              const timeoutId = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  connection.ws.removeEventListener('close', closeHandler);
                  // Force close if graceful close times out
                  if (connection.ws.readyState !== WebSocket.CLOSED) {
                    connection.ws.close();
                  }
                  messageLogger.warn(`WebSocket close timeout, forced closure: ${connection.url}`);
                  connectionInfo.forced = true;
                  resolve();
                }
              }, closeTimeout);

              const closeHandler = (event) => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeoutId);
                  connection.ws.removeEventListener('close', closeHandler);

                  connection.status = 'closed';
                  connection.closeCode = event.code;
                  connection.closeReason = event.reason;
                  connection.closedAt = new Date().toISOString();

                  connectionInfo.closeCode = event.code;
                  connectionInfo.closeReason = event.reason || closeReason;
                  connectionInfo.closedAt = connection.closedAt;
                  connectionInfo.closeTime = Date.now() - startTime;

                  messageLogger.success(`WebSocket connection closed gracefully: ${connection.url} (Code: ${event.code})`);
                  resolve();
                }
              };

              connection.ws.addEventListener('close', closeHandler);

              // Initiate close
              try {
                connection.ws.close(closeCode, closeReason);
              } catch (closeError) {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeoutId);
                  connection.ws.removeEventListener('close', closeHandler);
                  messageLogger.error(`Error initiating close: ${closeError.message}`);
                  reject(closeError);
                }
              }
            });
          }

          return connectionInfo;

        } catch (error) {
          connectionInfo.error = error.message;
          messageLogger.error(`Error closing WebSocket connection ${connection.url}: ${error.message}`);

          // Attempt force close as fallback
          try {
            connection.ws.close();
            connection.status = 'closed';
            connectionInfo.forced = true;
            connectionInfo.closedAt = new Date().toISOString();
            connectionInfo.closeTime = Date.now() - startTime;
          } catch (forceError) {
            messageLogger.error(`Failed to force close connection ${connection.url}: ${forceError.message}`);
          }

          return connectionInfo;
        }
      };

      let disconnectedConnections = [];
      let totalConnections = globalStorage._wsConnections.size;

      if (disconnectAll) {
        // Disconnect all connections
        messageLogger.info(`Disconnecting all WebSocket connections (${totalConnections} total)`);

        const connectionPromises = [];
        for (const [connId, connection] of globalStorage._wsConnections.entries()) {
          connectionPromises.push(closeConnection(connId, connection));
        }

        // Wait for all connections to close
        disconnectedConnections = await Promise.all(connectionPromises);

        // Clear all connections from storage
        globalStorage._wsConnections.clear();

        messageLogger.success(`All WebSocket connections disconnected (${disconnectedConnections.length} connections)`);

      } else {
        // Disconnect specific connection by URL
        if (!url) {
          throw new Error('WebSocket URL is required when not disconnecting all connections');
        }

        // Find connection by URL
        let connection = null;
        let connectionId = null;
        
        for (const [connId, conn] of globalStorage._wsConnections.entries()) {
          if (conn.url === url) {
            connection = conn;
            connectionId = connId;
            break;
          }
        }

        if (!connection) {
          throw new Error(`WebSocket connection not found for URL: ${url}`);
        }

        const connectionInfo = await closeConnection(connectionId, connection);
        disconnectedConnections = [connectionInfo];

        // Remove connection from storage
        globalStorage._wsConnections.delete(connectionId);

        messageLogger.success(`WebSocket connection disconnected: ${url}`);
      }

      // Prepare result summary
      const successfulDisconnects = disconnectedConnections.filter(conn => !conn.error).length;
      const failedDisconnects = disconnectedConnections.filter(conn => conn.error).length;
      const forcedDisconnects = disconnectedConnections.filter(conn => conn.forced).length;

      // Store successful result
      globalObj[process.name] = {
        data: {
          success: true,
          disconnectAll: disconnectAll,
          totalConnections: totalConnections,
          disconnectedConnections: disconnectedConnections,
          summary: {
            total: disconnectedConnections.length,
            successful: successfulDisconnects,
            failed: failedDisconnects,
            forced: forcedDisconnects
          },
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      // Store error in globalErrors
      messageLogger.error(JSON.stringify(error))
      globalErrors[process.name] = {
        ...globalErrors?.[process.name],
        error: error.message || 'WebSocket disconnect operation failed',
        timestamp: new Date().toISOString()
      };

      messageLogger.error(`WebSocket disconnect failed: ${error.message}`);
      throw error;
    }
  }
},
{
  key: 'interval',
  label: 'Set Interval with Handler',
  schema: {
    type: 'object',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store interval result and used as interval identifier (no spaces, caps)',
      },
      duration: {
        title: 'Duration',
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Interval Duration (ms)',
            description: 'Duration between interval executions in milliseconds',
          },
        },
        required: ['value'],
      },
      handler: {
        type: 'string',
        title: 'Event Handler',
        description: 'Handler function to execute on each interval tick',
        config: { uiType: 'eventHandler' },
      },
      maxExecutions: {
        title: 'Max Executions',
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Maximum Executions',
            description: 'Maximum number of times to execute (optional, 0 = unlimited)',
            default: 0,
            minimum: 0,
          },
        },
      },
      startImmediately: {
        title: 'Start Immediately',
        type: 'boolean',
        description: 'Execute handler immediately before starting interval',
        default: false,
      },
      debug: {
        title: 'Debug',
        type: 'boolean',
        default: false,
      },
    },
    required: ['name', 'duration', 'handler'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object for interval management
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Initialize intervals storage if it doesn't exist
      if (!globalStorage._intervals) {
        globalStorage._intervals = new Map();
      }

      // Check if interval with this name already exists
      if (globalStorage._intervals.has(process.name)) {
        const existingInterval = globalStorage._intervals.get(process.name);
        if (existingInterval.status === 'running') {
          throw new Error(`Interval with name '${process.name}' is already running. Clear it first or use a different name.`);
        }
      }

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Extract parameters
      const duration = retrieveBody('', process?.duration?.value, event, globalObj, paramState, sessionKey, process);
      const maxExecutions = retrieveBody(0, process?.maxExecutions?.value, event, globalObj, paramState, sessionKey, process);
      const startImmediately = process?.startImmediately || false;
      const debug = process?.debug || false;

      // Validate duration
      if (isNaN(duration) || duration <= 0) {
        throw new Error(`Invalid interval duration: ${duration}. Must be a positive number.`);
      }

      // Validate maxExecutions
      if (isNaN(maxExecutions) || maxExecutions < 0) {
        throw new Error(`Invalid max executions: ${maxExecutions}. Must be 0 or positive number.`);
      }

      // Create event handler
      const eventHandler = createEventHandler(
        {},
        process.compId,
        {},
        navigate,
        paramState,
        process.pageId,
        process.editMode,
        process.store,
        process?.refreshAppAuth,
        process?.setDestroyInfo,
        process.setSessionInfo,
        process?.setAppStatePartial,
        () => ''
      );

      // Use the name as the interval identifier
      const intervalName = process.name;
      
      // Execution counter
      let executionCount = 0;
      const startTime = new Date().toISOString();

      // Interval execution function
      const executeHandler = async () => {
        try {
          executionCount++;
          
          if (debug) {
            messageLogger.info(`Executing interval '${intervalName}' - Execution #${executionCount}`);
          }

          // Execute the handler
          if (process.handler && eventHandler) {
            createEventHandler(
              {},
              process.handler,
              process.compId,
              {},
              navigate,
              paramState,
              process.pageId,
              process.editMode,
              process.store,
              process?.refreshAppAuth,
              process?.setDestroyInfo,
              process.setSessionInfo,
              process?.setAppStatePartial,
              () => ''
            );
          }

          // Update execution count in stored data
          if (globalStorage._intervals.has(intervalName)) {
            const intervalData = globalStorage._intervals.get(intervalName);
            intervalData.executionCount = executionCount;
            globalStorage._intervals.set(intervalName, intervalData);
          }

          // Check if we've reached max executions
          if (maxExecutions > 0 && executionCount >= maxExecutions) {
            if (debug) {
              messageLogger.info(`Interval '${intervalName}' reached max executions (${maxExecutions}). Stopping.`);
            }
            
            // Clear the interval
            if (globalStorage._intervals.has(intervalName)) {
              const intervalData = globalStorage._intervals.get(intervalName);
              clearInterval(intervalData.handle);
              
              // Update status to completed
              intervalData.status = 'completed';
              intervalData.completedAt = new Date().toISOString();
              intervalData.finalExecutionCount = executionCount;
              globalStorage._intervals.set(intervalName, intervalData);
              
              // Update result in globalObj
              globalObj[process.name] = {
                ...globalObj[process.name],
                status: 'completed',
                completedAt: new Date().toISOString(),
                finalExecutionCount: executionCount
              };
            }
          }

        } catch (error) {
          messageLogger.error(`Error in interval '${intervalName}' execution #${executionCount}: ${error.message}`);
          
          // Store error but don't stop the interval unless it's critical
          if (!globalErrors[`${process.name}_executions`]) {
            globalErrors[`${process.name}_executions`] = [];
          }
          globalErrors[`${process.name}_executions`].push({
            executionCount: executionCount,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      };

      // Execute immediately if requested
      if (startImmediately) {
        await executeHandler();
      }

      // Set up the interval
      const handle = setInterval(executeHandler, parseInt(duration));

      // Store interval information using name as key
      const intervalData = {
        name: intervalName,
        handle: handle,
        duration: parseInt(duration),
        maxExecutions: maxExecutions,
        executionCount: executionCount,
        startTime: startTime,
        status: 'running',
        handler: process.handler,
        debug: debug
      };

      globalStorage._intervals.set(intervalName, intervalData);

      // Store result in globalObj
      globalObj[process.name] = {
        intervalName: intervalName,
        duration: parseInt(duration),
        maxExecutions: maxExecutions,
        startImmediately: startImmediately,
        status: 'running',
        startTime: startTime,
        executionCount: executionCount,
        message: `Interval '${intervalName}' started with ${duration}ms duration${maxExecutions > 0 ? ` (max ${maxExecutions} executions)` : ' (unlimited)'}`
      };

      if (debug) {
        messageLogger.success(`Interval '${intervalName}' started successfully`);
      }

    } catch (error) {
      // Store error in globalErrors
      globalErrors[process.name] = {
        error: error.message || 'Interval setup failed',
        timestamp: new Date().toISOString()
      };

      // Log error
      
      throw error;
    }
  }
},


{
  key: 'clear-interval',
  label: 'Clear/Cancel Interval',
  schema: {
    type: 'object',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
      },
        // pattern:
      clearAll: {
        title: 'Clear All Intervals',
        type: 'boolean',
        description: 'Clear all running intervals (ignores intervalName)',
        default: false,
      },

      clearCompleted: {
        title: 'Clear Completed',
        type: 'boolean',
        description: 'Also clear completed intervals from store',
        default: true,
      },
       intervalName: {
        title: 'Interval Name',
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Interval Name',
            description: 'Name of the interval to clear (same as the name used when creating the interval)',
          },
        },
      },


      debug: {
        title: 'Debug',
        type: 'boolean',
        default: false,
      },
    },
    required: ['name'],

  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Check if intervals storage exists
      if (!globalStorage._intervals) {
        globalObj[process.name] = {
          message: 'No intervals storage found',
          clearedIntervals: [],
          timestamp: new Date().toISOString()
        };
        return;
      }

      // Extract parameters
      const intervalNameValue = retrieveBody('', process?.intervalName?.value, event, globalObj, paramState, sessionKey, process);
      const clearAll = process?.clearAll || false;
      const clearCompleted = process?.clearCompleted !== false; // Default true
      const debug = process?.debug || false;

      const clearedIntervals = [];
      const totalIntervals = globalStorage._intervals.size;

      if (clearAll) {
        // Clear all intervals
        if (debug) {
          messageLogger.info(`Clearing all intervals (${totalIntervals} total)`);
        }

        for (const [intervalName, intervalData] of globalStorage._intervals.entries()) {
          try {
            // Only clear interval if it's still running
            if (intervalData.status === 'running') {
              clearInterval(intervalData.handle);
            }

            // Remove from store if it's running or if clearCompleted is true
            if (intervalData.status === 'running' || clearCompleted) {
              clearedIntervals.push({
                intervalName: intervalName,
                duration: intervalData.duration,
                maxExecutions: intervalData.maxExecutions,
                executionCount: intervalData.executionCount,
                startTime: intervalData.startTime,
                status: intervalData.status,
                endTime: new Date().toISOString(),
                action: intervalData.status === 'running' ? 'cancelled' : 'removed'
              });
              
              if (debug) {
                messageLogger.info(`${intervalData.status === 'running' ? 'Cancelled' : 'Removed'} interval: ${intervalName}`);
              }
            }
          } catch (error) {
            clearedIntervals.push({
              intervalName: intervalName,
              error: error.message,
              status: 'error'
            });
            messageLogger.error(`Error clearing interval ${intervalName}: ${error.message}`);
          }
        }

        // Clear based on clearCompleted setting
        if (clearCompleted) {
          globalStorage._intervals.clear();
        } else {
          // Only remove running intervals
          for (const [intervalName, intervalData] of globalStorage._intervals.entries()) {
            if (intervalData.status === 'running') {
              globalStorage._intervals.delete(intervalName);
            }
          }
        }
        
        if (debug) {
          messageLogger.success(`Intervals processed (${clearedIntervals.length} intervals)`);
        }

      } else {
        // Clear specific interval
        if (!intervalNameValue) {
          throw new Error('Interval Name is required when not clearing all intervals');
        }

        if (!globalStorage._intervals.has(intervalNameValue)) {
          throw new Error(`Interval not found: ${intervalNameValue}`);
        }

        const intervalData = globalStorage._intervals.get(intervalNameValue);
        
        try {
          // Only clear interval if it's still running
          if (intervalData.status === 'running') {
            clearInterval(intervalData.handle);
          }

          globalStorage._intervals.delete(intervalNameValue);
          
          clearedIntervals.push({
            intervalName: intervalNameValue,
            duration: intervalData.duration,
            maxExecutions: intervalData.maxExecutions,
            executionCount: intervalData.executionCount,
            startTime: intervalData.startTime,
            status: intervalData.status,
            endTime: new Date().toISOString(),
            action: intervalData.status === 'running' ? 'cancelled' : 'removed'
          });

          if (debug) {
            messageLogger.success(`Interval ${intervalData.status === 'running' ? 'cancelled' : 'removed'}: ${intervalNameValue}`);
          }
        } catch (error) {
          throw new Error(`Error clearing interval ${intervalNameValue}: ${error.message}`);
        }
      }

      // Store successful result
      globalObj[process.name] = {
        success: true,
        clearAll: clearAll,
        clearCompleted: clearCompleted,
        totalIntervals: totalIntervals,
        clearedIntervals: clearedIntervals,
        summary: {
          total: clearedIntervals.length,
          cancelled: clearedIntervals.filter(i => i.action === 'cancelled').length,
          removed: clearedIntervals.filter(i => i.action === 'removed').length,
          failed: clearedIntervals.filter(i => i.status === 'error').length
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Store error in globalErrors
      globalErrors[process.name] = {
        error: error.message || 'Clear interval operation failed',
        timestamp: new Date().toISOString()
      };

      messageLogger.error(`Clear interval failed: ${error.message}`);
      throw error;
    }
  }
},
   

,{
  key: 'set-timeout',
  label: 'Set Timeout with Handler',
  schema: {
    type: 'object',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store timeout ID (no spaces, caps)',
      },
      delay: {
        title: 'Delay',
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Timeout Delay (ms)',
            description: 'Delay before execution in milliseconds',
          },
        },
        required: ['value'],
      },
      handler: {
        type: 'string',
        title: 'Event Handler',
        description: 'Handler function to execute after timeout',
        config: { uiType: 'eventHandler' },
      },
      customId: {
        title: 'Custom ID',
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Custom Timeout ID',
            description: 'Optional custom ID for the timeout (auto-generated if not provided)',
          },
        },
      },
      executeImmediately: {
        title: 'Execute Immediately',
        type: 'boolean',
        description: 'Execute handler immediately and still set timeout',
        default: false,
      },
      debug: {
        title: 'Debug',
        type: 'boolean',
        default: false,
      },
    },
    required: ['name', 'delay', 'handler'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object for timeout management
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Initialize timeouts storage if it doesn't exist
      if (!globalStorage._timeouts) {
        globalStorage._timeouts = new Map();
      }

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Extract parameters
      const delay = retrieveBody('', process?.delay?.value, event, globalObj, paramState, sessionKey, process);
      const customIdValue = retrieveBody('', process?.customId?.value, event, globalObj, paramState, sessionKey, process);
      const executeImmediately = process?.executeImmediately || false;
      const debug = process?.debug || false;

      // Validate delay
      if (isNaN(delay) || delay < 0) {
        throw new Error(`Invalid timeout delay: ${delay}. Must be 0 or positive number.`);
      }

      // Generate timeout ID (use custom if provided, otherwise auto-generate)
      const timeoutId = customIdValue || `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Check if custom ID already exists
      if (customIdValue && globalStorage._timeouts.has(timeoutId)) {
        throw new Error(`Timeout ID '${timeoutId}' already exists. Please use a different custom ID.`);
      }

      const startTime = new Date().toISOString();

      // Create event handler
      const eventHandler = createEventHandler(
        {},
        process.compId,
        {},
        navigate,
        paramState,
        process.pageId,
        process.editMode,
        process.store,
        process?.refreshAppAuth,
        process?.setDestroyInfo,
        process.setSessionInfo,
        process?.setAppStatePartial,
        () => ''
      );

      // Timeout execution function
      const executeHandler = async () => {
        try {
          const executionTime = new Date().toISOString();
          
          if (debug) {
            messageLogger.info(`Executing timeout ${timeoutId}`);
          }

          // Execute the handler
          if (process.handler && eventHandler) {

            createEventHandler(
        {},process.handler,
        process.compId,
        {},
        navigate,
        paramState,
        process.pageId,
        process.editMode,
        process.store,
        process?.refreshAppAuth,
        process?.setDestroyInfo,
        process.setSessionInfo,
        process?.setAppStatePartial,
        () => ''
      )
          }

          // Update timeout data to mark as completed
          if (globalStorage._timeouts.has(timeoutId)) {
            const timeoutData = globalStorage._timeouts.get(timeoutId);
            timeoutData.status = 'completed';
            timeoutData.completedAt = executionTime;
            globalStorage._timeouts.set(timeoutId, timeoutData);

            // Update result in globalObj
            globalObj[process.name] = {
              ...globalObj[process.name],
              status: 'completed',
              completedAt: executionTime
            };
          }

          if (debug) {
            messageLogger.success(`Timeout ${timeoutId} executed successfully`);
          }

        } catch (error) {
          messageLogger.error(`Error in timeout ${timeoutId} execution: ${error.message}`);
          
          // Store error
          if (!globalErrors[`${process.name}_execution`]) {
            globalErrors[`${process.name}_execution`] = [];
          }
          globalErrors[`${process.name}_execution`].push({
            timeoutId: timeoutId,
            error: error.message,
            timestamp: new Date().toISOString()
          });

          // Update status to error
          if (globalStorage._timeouts.has(timeoutId)) {
            const timeoutData = globalStorage._timeouts.get(timeoutId);
            timeoutData.status = 'error';
            timeoutData.error = error.message;
            globalStorage._timeouts.set(timeoutId, timeoutData);
          }
        }
      };

      // Execute immediately if requested
      if (executeImmediately) {
        await executeHandler();
      }

      // Set up the timeout
      const handle = setTimeout(executeHandler, parseInt(delay));

      // Store timeout information
      const timeoutData = {
        id: timeoutId,
        handle: handle,
        delay: parseInt(delay),
        startTime: startTime,
        status: 'pending',
        handler: process.handler,
        debug: debug,
        customId: customIdValue || null,
        executeImmediately: executeImmediately
      };

      globalStorage._timeouts.set(timeoutId, timeoutData);

      // Store result in globalObj
      globalObj[process.name] = {
        timeoutId: timeoutId,
        delay: parseInt(delay),
        executeImmediately: executeImmediately,
        status: 'pending',
        startTime: startTime,
        message: `Timeout set for ${delay}ms${customIdValue ? ` with custom ID: ${customIdValue}` : ''}`
      };

      if (debug) {
        messageLogger.success(`Timeout ${timeoutId} started successfully`);
      }

    } catch (error) {
      // Store error in globalErrors
      globalErrors[process.name] = {
        error: error.message || 'Timeout setup failed',
        timestamp: new Date().toISOString()
      };

      
      throw error;
    }
  }
},
{
  key: 'clear-interval',
  label: 'Clear/Cancel Interval',
  schema: {
    type: 'object',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store clear result (no spaces, caps)',
      },
      intervalId: {
        title: 'Interval ID',
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Interval ID',
            description: 'ID of the interval to clear (from interval result)',
          },
        },
      },
      clearAll: {
        title: 'Clear All Intervals',
        type: 'boolean',
        description: 'Clear all running intervals (ignores intervalId)',
        default: false,
      },
      clearCompleted: {
        title: 'Clear Completed',
        type: 'boolean',
        description: 'Also clear completed intervals from store',
        default: true,
      },
      debug: {
        title: 'Debug',
        type: 'boolean',
        default: false,
      },
    },
    required: ['name'],
    anyOf: [
      {
        properties: {
          clearAll: {
            enum: [true]
          }
        }
      },
      {
        required: ['intervalId']
      }
    ],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Check if intervals storage exists
      if (!globalStorage._intervals) {
        globalObj[process.name] = {
          message: 'No intervals storage found',
          clearedIntervals: [],
          timestamp: new Date().toISOString()
        };
        return;
      }

      // Extract parameters
      const intervalIdValue = retrieveBody('', process?.intervalId?.value, event, globalObj, paramState, sessionKey, process);
      const clearAll = process?.clearAll || false;
      const clearCompleted = process?.clearCompleted !== false; // Default true
      const debug = process?.debug || false;

      const clearedIntervals = [];
      const totalIntervals = globalStorage._intervals.size;

      if (clearAll) {
        // Clear all intervals
        if (debug) {
          messageLogger.info(`Clearing all intervals (${totalIntervals} total)`);
        }

        for (const [id, intervalData] of globalStorage._intervals.entries()) {
          try {
            // Only clear interval if it's still running
            if (intervalData.status === 'running') {
              clearInterval(intervalData.handle);
            }

            // Remove from store if it's running or if clearCompleted is true
            if (intervalData.status === 'running' || clearCompleted) {
              clearedIntervals.push({
                intervalId: id,
                duration: intervalData.duration,
                maxExecutions: intervalData.maxExecutions,
                executionCount: intervalData.executionCount,
                startTime: intervalData.startTime,
                status: intervalData.status,
                endTime: new Date().toISOString(),
                action: intervalData.status === 'running' ? 'cancelled' : 'removed'
              });
              
              if (debug) {
                messageLogger.info(`${intervalData.status === 'running' ? 'Cancelled' : 'Removed'} interval: ${id}`);
              }
            }
          } catch (error) {
            clearedIntervals.push({
              intervalId: id,
              error: error.message,
              status: 'error'
            });
            messageLogger.error(`Error clearing interval ${id}: ${error.message}`);
          }
        }

        // Clear based on clearCompleted setting
        if (clearCompleted) {
          globalStorage._intervals.clear();
        } else {
          // Only remove running intervals
          for (const [id, intervalData] of globalStorage._intervals.entries()) {
            if (intervalData.status === 'running') {
              globalStorage._intervals.delete(id);
            }
          }
        }
        
        if (debug) {
          messageLogger.success(`Intervals processed (${clearedIntervals.length} intervals)`);
        }

      } else {
        // Clear specific interval
        if (!intervalIdValue) {
          throw new Error('Interval ID is required when not clearing all intervals');
        }

        if (!globalStorage._intervals.has(intervalIdValue)) {
          throw new Error(`Interval not found: ${intervalIdValue}`);
        }

        const intervalData = globalStorage._intervals.get(intervalIdValue);
        
        try {
          // Only clear interval if it's still running
          if (intervalData.status === 'running') {
            clearInterval(intervalData.handle);
          }

          globalStorage._intervals.delete(intervalIdValue);
          
          clearedIntervals.push({
            intervalId: intervalIdValue,
            duration: intervalData.duration,
            maxExecutions: intervalData.maxExecutions,
            executionCount: intervalData.executionCount,
            startTime: intervalData.startTime,
            status: intervalData.status,
            endTime: new Date().toISOString(),
            action: intervalData.status === 'running' ? 'cancelled' : 'removed'
          });

          if (debug) {
            messageLogger.success(`Interval ${intervalData.status === 'running' ? 'cancelled' : 'removed'}: ${intervalIdValue}`);
          }
        } catch (error) {
          throw new Error(`Error clearing interval ${intervalIdValue}: ${error.message}`);
        }
      }

      // Store successful result
      globalObj[process.name] = {
        success: true,
        clearAll: clearAll,
        clearCompleted: clearCompleted,
        totalIntervals: totalIntervals,
        clearedIntervals: clearedIntervals,
        summary: {
          total: clearedIntervals.length,
          cancelled: clearedIntervals.filter(i => i.action === 'cancelled').length,
          removed: clearedIntervals.filter(i => i.action === 'removed').length,
          failed: clearedIntervals.filter(i => i.status === 'error').length
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Store error in globalErrors
      globalErrors[process.name] = {
        error: error.message || 'Clear interval operation failed',
        timestamp: new Date().toISOString()
      };

      messageLogger.error(`Clear interval failed: ${error.message}`);
      throw error;
    }
  }
},
{
  key: 'clear-timeout',
  label: 'Clear/Cancel Timeout',
  schema: {
    type: 'object',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store clear result (no spaces, caps)',
      },
      timeoutId: {
        title: 'Timeout ID',
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Timeout ID',
            description: 'ID of the timeout to clear (from timeout result)',
          },
        },
      },
      clearAll: {
        title: 'Clear All Timeouts',
        type: 'boolean',
        description: 'Clear all pending timeouts (ignores timeoutId)',
        default: false,
      },
      clearCompleted: {
        title: 'Clear Completed',
        type: 'boolean',
        description: 'Also clear completed/executed timeouts from store',
        default: true,
      },
      debug: {
        title: 'Debug',
        type: 'boolean',
        default: false,
      },
    },
    required: ['name'],
    anyOf: [
      {
        properties: {
          clearAll: {
            enum: [true]
          }
        }
      },
      {
        required: ['timeoutId']
      }
    ],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get the global storage object
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Message utility
      const messageLogger = {
        info: (text) => {
          if (typeof message !== 'undefined' && messageLogger.info) {
            messageLogger.info(text);
          } else {
            
          }
        },
        success: (text) => {
          if (typeof message !== 'undefined' && messageLogger.success) {
            messageLogger.success(text);
          } else {
            
          }
        },
        error: (text) => {
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(text);
          } else {
            
          }
        },
        warn: (text) => {
          if (typeof message !== 'undefined' && messageLogger.warning) {
            messageLogger.warning(text);
          } else {
            
          }
        }
      };

      // Check if timeouts storage exists
      if (!globalStorage._timeouts) {
        globalObj[process.name] = {
          message: 'No timeouts storage found',
          clearedTimeouts: [],
          timestamp: new Date().toISOString()
        };
        return;
      }

      // Extract parameters
      const timeoutIdValue = retrieveBody('', process?.timeoutId?.value, event, globalObj, paramState, sessionKey, process);
      const clearAll = process?.clearAll || false;
      const clearCompleted = process?.clearCompleted !== false; // Default true
      const debug = process?.debug || false;

      const clearedTimeouts = [];
      const totalTimeouts = globalStorage._timeouts.size;

      if (clearAll) {
        // Clear all timeouts
        if (debug) {
          messageLogger.info(`Clearing all timeouts (${totalTimeouts} total)`);
        }

        for (const [id, timeoutData] of globalStorage._timeouts.entries()) {
          try {
            // Only clear timeout if it's still pending
            if (timeoutData.status === 'pending') {
              clearTimeout(timeoutData.handle);
            }

            // Remove from store if it's pending or if clearCompleted is true
            if (timeoutData.status === 'pending' || clearCompleted) {
              clearedTimeouts.push({
                timeoutId: id,
                delay: timeoutData.delay,
                startTime: timeoutData.startTime,
                status: timeoutData.status,
                endTime: new Date().toISOString(),
                action: timeoutData.status === 'pending' ? 'cancelled' : 'removed'
              });
              
              if (debug) {
                messageLogger.info(`${timeoutData.status === 'pending' ? 'Cancelled' : 'Removed'} timeout: ${id}`);
              }
            }
          } catch (error) {
            clearedTimeouts.push({
              timeoutId: id,
              error: error.message,
              status: 'error'
            });
            messageLogger.error(`Error clearing timeout ${id}: ${error.message}`);
          }
        }

        // Clear based on clearCompleted setting
        if (clearCompleted) {
          globalStorage._timeouts.clear();
        } else {
          // Only remove pending timeouts
          for (const [id, timeoutData] of globalStorage._timeouts.entries()) {
            if (timeoutData.status === 'pending') {
              globalStorage._timeouts.delete(id);
            }
          }
        }
        
        if (debug) {
          messageLogger.success(`Timeouts processed (${clearedTimeouts.length} timeouts)`);
        }

      } else {
        // Clear specific timeout
        if (!timeoutIdValue) {
          throw new Error('Timeout ID is required when not clearing all timeouts');
        }

        if (!globalStorage._timeouts.has(timeoutIdValue)) {
          throw new Error(`Timeout not found: ${timeoutIdValue}`);
        }

        const timeoutData = globalStorage._timeouts.get(timeoutIdValue);
        
        try {
          // Only clear timeout if it's still pending
          if (timeoutData.status === 'pending') {
            clearTimeout(timeoutData.handle);
          }

          globalStorage._timeouts.delete(timeoutIdValue);
          
          clearedTimeouts.push({
            timeoutId: timeoutIdValue,
            delay: timeoutData.delay,
            startTime: timeoutData.startTime,
            status: timeoutData.status,
            endTime: new Date().toISOString(),
            action: timeoutData.status === 'pending' ? 'cancelled' : 'removed'
          });

          if (debug) {
            messageLogger.success(`Timeout ${timeoutData.status === 'pending' ? 'cancelled' : 'removed'}: ${timeoutIdValue}`);
          }
        } catch (error) {
          throw new Error(`Error clearing timeout ${timeoutIdValue}: ${error.message}`);
        }
      }

      // Store successful result
      globalObj[process.name] = {
        success: true,
        clearAll: clearAll,
        clearCompleted: clearCompleted,
        totalTimeouts: totalTimeouts,
        clearedTimeouts: clearedTimeouts,
        summary: {
          total: clearedTimeouts.length,
          cancelled: clearedTimeouts.filter(t => t.action === 'cancelled').length,
          removed: clearedTimeouts.filter(t => t.action === 'removed').length,
          failed: clearedTimeouts.filter(t => t.status === 'error').length
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Store error in globalErrors
      globalErrors[process.name] = {
        error: error.message || 'Clear timeout operation failed',
        timestamp: new Date().toISOString()
      };

      messageLogger.error(`Clear timeout failed: ${error.message}`);
      throw error;
    }
  }
},
{
  key: 'graphql-request',
  label: 'GraphQL Request',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store response (no spaces, caps)',
      },
      endpoint: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'GraphQL Endpoint URL',
            description: 'URL of the GraphQL endpoint',
            pattern: '^https?://.+',
          },
        },
        required: ['value'],
      },
      operationType: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Operation Type',
            enum: ['query', 'mutation', 'subscription'],
            default: 'query',
            description: 'Type of GraphQL operation',
          },
        },
      },
      operation: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'GraphQL Operation',
            description: 'The GraphQL query, mutation, or subscription',
          },
        },
        required: ['value'],
      },
      variables: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Variables (JSON)',
            description: 'Variables for the GraphQL operation as JSON string',
            default: '{}',
          },
        },
      },
      headers: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Request Headers (JSON)',
            description: 'Additional headers as JSON string',
            default: '{}',
          },
        },
      },
      timeout: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Timeout (ms)',
            description: 'Request timeout in milliseconds',
            default: 30000,
            minimum: 1000,
            maximum: 300000,
          },
        },
      },
      retryAttempts: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Retry Attempts',
            description: 'Number of retry attempts on failure',
            default: 3,
            minimum: 0,
            maximum: 10,
          },
        },
      },
      retryDelay: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Retry Delay (ms)',
            description: 'Delay between retry attempts',
            default: 1000,
            minimum: 100,
            maximum: 30000,
          },
        },
      },
      validateResponse: {
        type: 'string',
        title: 'Validate Response',
        description: 'Whether to validate GraphQL response structure',
        enum: ['true', 'false'],
        default: 'true',
      },
      onSuccess: {
        type: 'string',
        config: { uiType: 'eventHandler' },
        title: 'On Success Handler',
        description: 'Code to execute when request succeeds',
      },
      onError: {
        type: 'string',
        config: { uiType: 'eventHandler' },
        title: 'On Error Handler',
        description: 'Code to execute when request fails',
      },
      cacheResponse: {
        type: 'string',
        title: 'Cache Response',
        description: 'Whether to cache successful responses',
        enum: ['true', 'false'],
        default: 'false',
      },
      cacheTTL: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Cache TTL (ms)',
            description: 'Cache time-to-live in milliseconds',
            default: 300000, // 5 minutes
            minimum: 1000,
          },
        },
      },
    },
    required: ['name', 'endpoint', 'operation'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get global storage for caching
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Initialize GraphQL cache if needed
      if (!globalStorage._graphqlCache) {
        globalStorage._graphqlCache = new Map();
      }

      // Extract and validate parameters
      const endpoint = retrieveBody('', process.endpoint?.value, event, globalObj, paramState, sessionKey, process);
      if (!endpoint) {
        throw new Error('GraphQL endpoint URL is required');
      }
      if (!endpoint.match(/^https?:\/\/.+/)) {
        throw new Error('Invalid endpoint URL format. Must start with http:// or https://');
      }

      const operationType = retrieveBody('query', process.operationType?.value, event, globalObj, paramState, sessionKey, process);
      const operation = retrieveBody('', process.operation?.value, event, globalObj, paramState, sessionKey, process);
      if (!operation) {
        throw new Error('GraphQL operation is required');
      }

      const timeout = parseInt(retrieveBody(30000, process.timeout?.value, event, globalObj, paramState, sessionKey, process), 10) || 30000;
      const retryAttempts = parseInt(retrieveBody(3, process.retryAttempts?.value, event, globalObj, paramState, sessionKey, process), 10) || 3;
      const retryDelay = parseInt(retrieveBody(1000, process.retryDelay?.value, event, globalObj, paramState, sessionKey, process), 10) || 1000;
      const validateResponse = retrieveBody('true', process.validateResponse, event, globalObj, paramState, sessionKey, process) === 'true';
      const cacheResponse = retrieveBody('false', process.cacheResponse, event, globalObj, paramState, sessionKey, process) === 'true';
      const cacheTTL = parseInt(retrieveBody(300000, process.cacheTTL?.value, event, globalObj, paramState, sessionKey, process), 10) || 300000;

      // Process variables with better error handling
      let variables = {};
      if (process.variables?.value) {
        try {
          const variablesStr = retrieveBody('{}', process.variables.value, event, globalObj, paramState, sessionKey, process);
          if (variablesStr && variablesStr.trim()) {
            variables = typeof variablesStr === 'string' ? JSON.parse(variablesStr) : variablesStr;
            if (typeof variables !== 'object' || Array.isArray(variables)) {
              throw new Error('Variables must be a JSON object');
            }
          }
        } catch (varError) {
          throw new Error(`Invalid variables format: ${varError.message}`);
        }
      }

      // Process headers with better error handling
      let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (process.headers?.value) {
        try {
          const headersStr = retrieveBody('{}', process.headers.value, event, globalObj, paramState, sessionKey, process);
          if (headersStr && headersStr.trim()) {
            const parsedHeaders = typeof headersStr === 'string' ? JSON.parse(headersStr) : headersStr;
            if (typeof parsedHeaders !== 'object' || Array.isArray(parsedHeaders)) {
              throw new Error('Headers must be a JSON object');
            }
            headers = { ...headers, ...parsedHeaders };
          }
        } catch (headerError) {
          throw new Error(`Invalid headers format: ${headerError.message}`);
        }
      }

      // Create cache key for GET-like operations (queries)
      const cacheKey = cacheResponse && operationType === 'query' 
        ? `${endpoint}:${JSON.stringify({ operation, variables })}` 
        : null;

      // Check cache for queries
      if (cacheKey && globalStorage._graphqlCache.has(cacheKey)) {
        const cached = globalStorage._graphqlCache.get(cacheKey);
        if (Date.now() - cached.timestamp < cacheTTL) {
          messageLogger.info(`Using cached GraphQL response for ${operationType}`);
          globalObj[process.name] = cached.data;
          
          // Execute success handler
          if (process.onSuccess) {
            try {
              createEventHandler(cached.data, process.onSuccess, process.compId, {}, navigate, paramState, 
                process.pageId, process.editMode, process.store, process?.refreshAppAuth,
                process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
            } catch (handlerError) {
              messageLogger.error(`Success handler error: ${handlerError.message}`);
            }
          }
          return;
        } else {
          // Remove expired cache entry
          globalStorage._graphqlCache.delete(cacheKey);
        }
      }

      // Prepare GraphQL request payload
      const graphqlPayload = {
        query: operation,
        variables: variables,
      };

      // Add operation name if it can be extracted
      const operationMatch = operation.match(/(?:query|mutation|subscription)\s+(\w+)/);
      if (operationMatch) {
        graphqlPayload.operationName = operationMatch[1];
      }

      // Request function with retry logic
      const makeRequest = async (attempt = 1) => {
        messageLogger.info(`Making GraphQL ${operationType} request to ${endpoint} (Attempt ${attempt}/${retryAttempts + 1})`);
        
        const requestConfig = {
          method: 'POST',
          url: endpoint,
          headers: headers,
          timeout: timeout,
          data: graphqlPayload,
        };

        try {
          const response = await axios(requestConfig);
          
          // Validate response structure if enabled
          if (validateResponse) {
            if (!response.data) {
              throw new Error('Invalid GraphQL response: missing data property');
            }
            if (typeof response.data !== 'object') {
              throw new Error('Invalid GraphQL response: data must be an object');
            }
          }

          // Check for GraphQL errors
          if (response.data.errors && response.data.errors.length > 0) {
            const errorMessages = response.data.errors.map(e => e.message || 'Unknown GraphQL error').join(', ');
            
            // Some GraphQL errors might still include partial data
            if (response.data.data) {
              messageLogger.warn(`GraphQL ${operationType} completed with errors: ${errorMessages}`);
            } else {
              throw {
                message: 'GraphQL operation returned errors',
                graphqlErrors: response.data.errors,
                isGraphQLError: true,
              };
            }
          }

          // Prepare successful response
          const successResponse = {
            data: response.data.data,
            errors: response.data.errors || null,
            extensions: response.data.extensions || null,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            operationType: operationType,
            endpoint: endpoint,
            timestamp: new Date().toISOString(),
            attempt: attempt,
            cached: false,
          };

          // Cache successful queries
          if (cacheKey && !response.data.errors) {
            globalStorage._graphqlCache.set(cacheKey, {
              data: { ...successResponse, cached: true },
              timestamp: Date.now(),
            });
          }

          return successResponse;

        } catch (error) {
          // Handle different types of errors
          let errorDetails = {
            error: error.message || 'GraphQL request failed',
            operationType: operationType,
            endpoint: endpoint,
            attempt: attempt,
            timestamp: new Date().toISOString(),
          };

          // GraphQL-specific errors (don't retry these)
          if (error.isGraphQLError) {
            errorDetails.graphqlErrors = error.graphqlErrors;
            throw errorDetails;
          }

          // HTTP response errors
          if (error.response) {
            errorDetails.response = {
              data: error.response.data,
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
            };

            // Don't retry client errors (4xx)
            if (error.response.status >= 400 && error.response.status < 500) {
              throw errorDetails;
            }
          }

          // Network/timeout errors - retry if we have attempts left
          if (attempt <= retryAttempts) {
            messageLogger.warn(`GraphQL request attempt ${attempt} failed: ${error.message}. Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return makeRequest(attempt + 1);
          } else {
            throw errorDetails;
          }
        }
      };

      // Execute the request
      const result = await makeRequest();
      
      // Store successful result
      globalObj[process.name] = result;
      
      // Execute success handler
      if (process.onSuccess) {
        try {
          createEventHandler(result, process.onSuccess, process.compId, {}, navigate, paramState, 
            process.pageId, process.editMode, process.store, process?.refreshAppAuth,
            process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
        } catch (handlerError) {
          messageLogger.error(`Success handler error: ${handlerError.message}`);
        }
      }

      messageLogger.success(`GraphQL ${operationType} completed successfully`);

    } catch (error) {
      // Prepare comprehensive error object
      const errorDetails = {
        ...globalErrors?.[process.name],
        ...(typeof error === 'object' ? error : { error: error.message || 'GraphQL request failed' }),
      };

      // Store error information
      globalErrors[process.name] = errorDetails;

      // Execute error handler
      if (process.onError) {
        try {
          createEventHandler(errorDetails, process.onError, process.compId, {}, navigate, paramState, 
            process.pageId, process.editMode, process.store, process?.refreshAppAuth,
            process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
        } catch (handlerError) {
          messageLogger.error(`Error handler error: ${handlerError.message}`);
        }
      }

      // Determine error message to display
      let errorMessage = 'GraphQL request failed';
      if (error.graphqlErrors) {
        errorMessage = `GraphQL errors: ${error.graphqlErrors.map(e => e.message || 'Unknown error').join(', ')}`;
      } else if (error.error || error.message) {
        errorMessage = error.error || error.message;
      }

      messageLogger.error(errorMessage);
      messageLogger.error(JSON.stringify(errorDetails));

      // Re-throw to ensure calling code knows about the failure
      throw error;
    }
  },
},
{
  key: 'window-dom-functions',
  label: 'Window & DOM Functions Action',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Unique name for the window/DOM action result storage',
      },
      actionType: {
        type: 'string',
        title: 'Action Type',
        enum: [
          // Window Management
          'open', 'close', 'print', 'focus', 'blur', 'resize', 'resizeBy', 'moveTo', 'moveBy',
          
          // Dialog Functions
          'alert', 'confirm', 'prompt',
          
          // Scrolling
          'scroll', 'scrollTo', 'scrollBy', 'scrollIntoView',
          
          // Navigation & History
          'reload', 'back', 'forward', 'go', 'pushState', 'replaceState',
          
          // Window Events
          'addEventListener', 'removeEventListener', 'dispatchEvent',
          
          // DOM Manipulation
          'getElementById', 'querySelector', 'querySelectorAll', 'createElement', 
          'appendChild', 'removeChild', 'insertBefore', 'replaceChild',
          'setAttribute', 'getAttribute', 'removeAttribute', 'classList',
          'innerHTML', 'textContent', 'outerHTML', 'cloneNode',
          
          // DOM Events
          // 'click', 'submit', 'change', 'input', 'keydown', 'keyup', 'mousedown', 'mouseup',
          // 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'touchstart', 'touchend',
          
          // CSS & Styles
          'getComputedStyle', 'setStyle', 'getStyle', 'addCSS', 'removeCSS',
          
          // Media & Device APIs
          'matchMedia', 'getUserMedia', 'getDisplayMedia', 'requestFullscreen', 'exitFullscreen',
          
          // Storage APIs
          'localStorage', 'sessionStorage', 'indexedDB',
          
          // Network & Communication
          // 'fetch', 'postMessage', 'broadcastChannel',
          
          // Performance & Timing
          // 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout',
          // 'setInterval', 'clearInterval', 'requestIdleCallback', 'cancelIdleCallback',
          // 'performance',
          
          // Geolocation & Sensors
          'geolocation', 'deviceOrientation', 'deviceMotion',
          
          // Notifications & Permissions
          'notification', 'permissions', 'vibrate',
          
          // Clipboard
          'clipboard',
          
          // File System
          'fileReader', 'filePicker',
          
          // WebRTC & Media
          'webRTC', 'mediaRecorder',
          
          // Custom JavaScript Execution
          // 'executeJS', 'evaluateExpression',
          
          // Window Properties
          'getWindowProperty', 'setWindowProperty',
          
          // Console Operations
          'console',
        ],
      },
      target: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Target Element (CSS selector, ID, or element reference)',
            description: 'For DOM operations - CSS selector, element ID, or stored element reference',
          },
        },
      },
      value: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Primary Value',
            description: 'Main value/parameter for the action',
          },
        },
      },
      options: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Options (JSON)',
            description: 'Additional options and parameters as JSON',
            default: '{}',
          },
        },
      },
      eventType: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Event Type',
            description: 'Event type for event-related actions',
          },
        },
      },
      callback: {
        type: 'string',
        config: { uiType: 'eventHandler' },
        title: 'Event Callback Handler',
        description: 'Code to execute for event handlers',
      },
      // jsCode: {
      //   type: 'object',
      //   properties: {
      //     value: {
      //       type: 'string',
      //       title: 'JavaScript Code',
      //       description: 'Custom JavaScript code to execute',
      //     },
      //   },
      // },
      returnValue: {
        type: 'string',
        title: 'Return Value Type',
        enum: ['element', 'value', 'boolean', 'array', 'object', 'auto'],
        default: 'auto',
        description: 'Expected return value type',
      },
    },
    required: ['name', 'actionType'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Helper function to get element reference
      const getElement = (target) => {
        if (!target) return null;
        if (typeof target === 'object' && target.nodeType) return target; // Already an element
        if (target.startsWith('#')) return document.getElementById(target.slice(1));
        return document.querySelector(target);
      };

      // Helper function to get multiple elements
      const getElements = (target) => {
        if (!target) return [];
        return Array.from(document.querySelectorAll(target));
      };

      // Extract parameters
      const actionType = retrieveBody('', process.actionType, event, globalObj, paramState, sessionKey, process);
      const target = retrieveBody('', process.target?.value, event, globalObj, paramState, sessionKey, process);
      const value = retrieveBody('', process.value?.value, event, globalObj, paramState, sessionKey, process);
      const optionsStr = retrieveBody('{}', process.options?.value, event, globalObj, paramState, sessionKey, process);
      const eventType = retrieveBody('', process.eventType?.value, event, globalObj, paramState, sessionKey, process);
      const jsCode = retrieveBody('', process.jsCode?.value, event, globalObj, paramState, sessionKey, process);
      const returnType = retrieveBody('auto', process.returnValue, event, globalObj, paramState, sessionKey, process);

      // Parse options
      let options = {};
      try {
        options = typeof optionsStr === 'string' ? JSON.parse(optionsStr) : optionsStr;
      } catch {
        options = {};
      }

      let result = { success: true, actionType, timestamp: new Date().toISOString() };

      switch (actionType) {
        // ===================
        // WINDOW MANAGEMENT
        // ===================
        case 'open':
          const newWindow = window.open(
            value || options.url || 'about:blank',
            options.target || '_blank',
            options.features || 'width=800,height=600'
          );
          result = { ...result, windowOpened: !!newWindow, windowReference: newWindow };
          break;

        case 'close':
          window.close();
          result = { ...result, message: 'Window close requested' };
          break;

        case 'resize':
          window.resizeTo(options.width || 800, options.height || 600);
          result = { ...result, width: options.width || 800, height: options.height || 600 };
          break;

        case 'resizeBy':
          window.resizeBy(options.widthDelta || 0, options.heightDelta || 0);
          result = { ...result, widthDelta: options.widthDelta || 0, heightDelta: options.heightDelta || 0 };
          break;

        case 'moveTo':
          window.moveTo(options.x || 0, options.y || 0);
          result = { ...result, x: options.x || 0, y: options.y || 0 };
          break;

        case 'moveBy':
          window.moveBy(options.xDelta || 0, options.yDelta || 0);
          result = { ...result, xDelta: options.xDelta || 0, yDelta: options.yDelta || 0 };
          break;

        case 'focus':
          window.focus();
          result = { ...result, message: 'Window focused' };
          break;

        case 'blur':
          window.blur();
          result = { ...result, message: 'Window blurred' };
          break;

        case 'print':
          window.print();
          result = { ...result, message: 'Print dialog opened' };
          break;

        // ===================
        // DIALOG FUNCTIONS
        // ===================
        case 'alert':
          window.alert(value || 'Alert');
          result = { ...result, message: 'Alert displayed', alertText: value };
          break;

        case 'confirm':
          const confirmed = window.confirm(value || 'Confirm?');
          result = { ...result, confirmed, confirmText: value };
          break;

        case 'prompt':
          const promptResult = window.prompt(value || 'Enter value:', options.defaultValue || '');
          result = { ...result, promptResult, promptText: value };
          break;

        // ===================
        // SCROLLING
        // ===================
        case 'scroll':
        case 'scrollTo':
          window.scrollTo(options.x || 0, options.y || 0);
          result = { ...result, scrollX: options.x || 0, scrollY: options.y || 0 };
          break;

        case 'scrollBy':
          window.scrollBy(options.xDelta || 0, options.yDelta || 0);
          result = { ...result, scrollXDelta: options.xDelta || 0, scrollYDelta: options.yDelta || 0 };
          break;

        case 'scrollIntoView':
          const scrollTarget = getElement(target);
          if (scrollTarget) {
            scrollTarget.scrollIntoView(options);
            result = { ...result, message: 'Element scrolled into view', element: target };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        // ===================
        // NAVIGATION & HISTORY
        // ===================
        case 'reload':
          window.location.reload(options.forceReload || false);
          result = { ...result, message: 'Page reload requested' };
          break;

        case 'back':
          window.history.back();
          result = { ...result, message: 'Navigated back' };
          break;

        case 'forward':
          window.history.forward();
          result = { ...result, message: 'Navigated forward' };
          break;

        case 'go':
          window.history.go(parseInt(value) || 0);
          result = { ...result, steps: parseInt(value) || 0 };
          break;

        case 'pushState':
          window.history.pushState(options.state || {}, options.title || '', value);
          result = { ...result, url: value, state: options.state };
          break;

        case 'replaceState':
          window.history.replaceState(options.state || {}, options.title || '', value);
          result = { ...result, url: value, state: options.state };
          break;

        // ===================
        // WINDOW EVENTS
        // ===================
        case 'addEventListener':
          const eventHandler = (e) => {
            if (process.callback) {
              try {
                createEventHandler(e, process.callback, process.compId, {}, navigate, paramState,
                  process.pageId, process.editMode, process.store, process?.refreshAppAuth,
                  process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
              } catch (handlerError) {
                
              }
            }
          };
          
          const eventTarget = target ? getElement(target) : window;
          eventTarget.addEventListener(eventType || value, eventHandler, options);
          
          // Store handler reference for removal
          if (!globalObj._eventHandlers) globalObj._eventHandlers = new Map();
          const handlerKey = `${target || 'window'}_${eventType || value}_${process.name}`;
          globalObj._eventHandlers.set(handlerKey, { target: eventTarget, type: eventType || value, handler: eventHandler });
          
          result = { ...result, eventType: eventType || value, handlerKey };
          break;

        case 'removeEventListener':
          const handlerToRemove = globalObj._eventHandlers?.get(value);
          if (handlerToRemove) {
            handlerToRemove.target.removeEventListener(handlerToRemove.type, handlerToRemove.handler, options);
            globalObj._eventHandlers.delete(value);
            result = { ...result, message: 'Event listener removed', handlerKey: value };
          } else {
            result = { ...result, message: 'Handler not found', handlerKey: value };
          }
          break;

        case 'dispatchEvent':
          const customEvent = new CustomEvent(eventType || value, {
            detail: options.detail || {},
            bubbles: options.bubbles !== false,
            cancelable: options.cancelable !== false
          });
          const dispatchTarget = target ? getElement(target) : window;
          const dispatched = dispatchTarget.dispatchEvent(customEvent);
          result = { ...result, dispatched, eventType: eventType || value };
          break;

        // ===================
        // DOM MANIPULATION
        // ===================
        case 'getElementById':
          const elementById = document.getElementById(value);
          result = { ...result, element: elementById, found: !!elementById };
          break;

        case 'querySelector':
          const singleElement = document.querySelector(value);
          result = { ...result, element: singleElement, found: !!singleElement };
          break;

        case 'querySelectorAll':
          const multipleElements = Array.from(document.querySelectorAll(value));
          result = { ...result, elements: multipleElements, count: multipleElements.length };
          break;

        case 'createElement':
          const newElement = document.createElement(value);
          if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, val]) => {
              newElement.setAttribute(key, val);
            });
          }
          if (options.textContent) newElement.textContent = options.textContent;
          if (options.innerHTML) newElement.innerHTML = options.innerHTML;
          result = { ...result, element: newElement };
          break;

        case 'appendChild':
          const parentElement = getElement(target);
          const childElement = options.element || globalObj[value];
          if (parentElement && childElement) {
            parentElement.appendChild(childElement);
            result = { ...result, message: 'Child appended' };
          } else {
            throw new Error('Parent or child element not found');
          }
          break;

        case 'removeChild':
          const parentForRemoval = getElement(target);
          const childForRemoval = getElement(value) || globalObj[value];
          if (parentForRemoval && childForRemoval) {
            parentForRemoval.removeChild(childForRemoval);
            result = { ...result, message: 'Child removed' };
          } else {
            throw new Error('Parent or child element not found');
          }
          break;

        case 'setAttribute':
          const attrElement = getElement(target);
          if (attrElement) {
            attrElement.setAttribute(options.attribute || value, options.value || '');
            result = { ...result, attribute: options.attribute || value, value: options.value };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'getAttribute':
          const getAttrElement = getElement(target);
          if (getAttrElement) {
            const attrValue = getAttrElement.getAttribute(value);
            result = { ...result, attribute: value, value: attrValue };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'removeAttribute':
          const removeAttrElement = getElement(target);
          if (removeAttrElement) {
            removeAttrElement.removeAttribute(value);
            result = { ...result, attribute: value, message: 'Attribute removed' };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'classList':
          const classListElement = getElement(target);
          if (classListElement) {
            const action = options.action || 'add'; // add, remove, toggle, contains
            const className = value;
            
            switch (action) {
              case 'add':
                classListElement.classList.add(className);
                break;
              case 'remove':
                classListElement.classList.remove(className);
                break;
              case 'toggle':
                classListElement.classList.toggle(className);
                break;
              case 'contains':
                result.contains = classListElement.classList.contains(className);
                break;
            }
            result = { ...result, action, className, classList: Array.from(classListElement.classList) };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'innerHTML':
          const innerHTMLElement = getElement(target);
          if (innerHTMLElement) {
            if (value !== undefined) {
              innerHTMLElement.innerHTML = value;
              result = { ...result, message: 'innerHTML set', content: value };
            } else {
              result = { ...result, content: innerHTMLElement.innerHTML };
            }
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'textContent':
          const textElement = getElement(target);
          if (textElement) {
            if (value !== undefined) {
              textElement.textContent = value;
              result = { ...result, message: 'textContent set', content: value };
            } else {
              result = { ...result, content: textElement.textContent };
            }
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        // ===================
        // DOM EVENTS (TRIGGER)
        // ===================
        case 'click':
        case 'submit':
        case 'change':
        case 'input':
        case 'keydown':
        case 'keyup':
        case 'mousedown':
        case 'mouseup':
        case 'mouseover':
        case 'mouseout':
        case 'mouseenter':
        case 'mouseleave':
        case 'touchstart':
        case 'touchend':
          const eventElement = getElement(target);
          if (eventElement) {
            const domEvent = new Event(actionType, { bubbles: true, cancelable: true });
            Object.assign(domEvent, options.eventProperties || {});
            eventElement.dispatchEvent(domEvent);
            result = { ...result, message: `${actionType} event triggered`, element: target };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        // ===================
        // CSS & STYLES
        // ===================
        case 'getComputedStyle':
          const computedElement = getElement(target);
          if (computedElement) {
            const computedStyle = window.getComputedStyle(computedElement);
            const property = value;
            result = {
              ...result,
              computedStyle: property ? computedStyle.getPropertyValue(property) : Object.fromEntries(
                Array.from(computedStyle).map(prop => [prop, computedStyle.getPropertyValue(prop)])
              ),
              property
            };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'setStyle':
          const styleElement = getElement(target);
          if (styleElement) {
            if (typeof options.styles === 'object') {
              Object.assign(styleElement.style, options.styles);
            } else {
              styleElement.style.setProperty(options.property || value, options.value || '');
            }
            result = { ...result, message: 'Styles applied', styles: options.styles };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'getStyle':
          const getStyleElement = getElement(target);
          if (getStyleElement) {
            const styleValue = getStyleElement.style.getPropertyValue(value);
            result = { ...result, property: value, value: styleValue };
          } else {
            throw new Error(`Element not found: ${target}`);
          }
          break;

        case 'addCSS':
          const styleSheet = document.createElement('style');
          styleSheet.textContent = value;
          document.head.appendChild(styleSheet);
          result = { ...result, message: 'CSS added', css: value };
          break;

        // ===================
        // MEDIA & DEVICE APIs
        // ===================
        case 'matchMedia':
          const mediaQuery = value || '(max-width: 768px)';
          const mql = window.matchMedia(mediaQuery);
          result = { ...result, matches: mql.matches, query: mediaQuery, media: mql.media };
          break;

        case 'getUserMedia':
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const constraints = options.constraints || { video: true, audio: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            result = { ...result, stream, message: 'Media stream obtained' };
          } else {
            throw new Error('getUserMedia not supported');
          }
          break;

        case 'requestFullscreen':
          const fullscreenElement = target ? getElement(target) : document.documentElement;
          if (fullscreenElement.requestFullscreen) {
            await fullscreenElement.requestFullscreen(options);
            result = { ...result, message: 'Fullscreen requested' };
          } else {
            throw new Error('Fullscreen not supported');
          }
          break;

        case 'exitFullscreen':
          if (document.exitFullscreen) {
            await document.exitFullscreen();
            result = { ...result, message: 'Exited fullscreen' };
          }
          break;

        // ===================
        // STORAGE APIs
        // ===================
        case 'localStorage':
          const localAction = options.action || 'get'; // get, set, remove, clear
          switch (localAction) {
            case 'get':
              result.value = localStorage.getItem(value);
              break;
            case 'set':
              localStorage.setItem(value, options.value || '');
              result.message = 'Item stored';
              break;
            case 'remove':
              localStorage.removeItem(value);
              result.message = 'Item removed';
              break;
            case 'clear':
              localStorage.clear();
              result.message = 'Storage cleared';
              break;
          }
          result = { ...result, action: localAction, key: value };
          break;

        case 'sessionStorage':
          const sessionAction = options.action || 'get';
          switch (sessionAction) {
            case 'get':
              result.value = sessionStorage.getItem(value);
              break;
            case 'set':
              sessionStorage.setItem(value, options.value || '');
              result.message = 'Item stored';
              break;
            case 'remove':
              sessionStorage.removeItem(value);
              result.message = 'Item removed';
              break;
            case 'clear':
              sessionStorage.clear();
              result.message = 'Storage cleared';
              break;
          }
          result = { ...result, action: sessionAction, key: value };
          break;

        // ===================
        // NETWORK & COMMUNICATION
        // ===================
        case 'fetch':
          const fetchOptions = {
            method: options.method || 'GET',
            headers: options.headers || {},
            ...options
          };
          if (options.body) fetchOptions.body = JSON.stringify(options.body);
          
          const response = await fetch(value, fetchOptions);
          const data = options.responseType === 'text' ? await response.text() : await response.json();
          result = {
            ...result,
            data,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          };
          break;

        case 'postMessage':
          window.postMessage(options.data || value, options.targetOrigin || '*');
          result = { ...result, message: 'Message posted', data: options.data || value };
          break;

        // ===================
        // PERFORMANCE & TIMING
        // ===================
        case 'requestAnimationFrame':
          const rafId = requestAnimationFrame(() => {
            if (process.callback) {
              createEventHandler({}, process.callback, process.compId, {}, navigate, paramState,
                process.pageId, process.editMode, process.store, process?.refreshAppAuth,
                process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
            }
          });
          result = { ...result, rafId };
          break;

        case 'setTimeout':
          const timeoutId = setTimeout(() => {
            if (process.callback) {
              createEventHandler({}, process.callback, process.compId, {}, navigate, paramState,
                process.pageId, process.editMode, process.store, process?.refreshAppAuth,
                process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
            }
          }, parseInt(value) || 1000);
          result = { ...result, timeoutId, delay: parseInt(value) || 1000 };
          break;

        case 'setInterval':
          const intervalId = setInterval(() => {
            if (process.callback) {
              createEventHandler({}, process.callback, process.compId, {}, navigate, paramState,
                process.pageId, process.editMode, process.store, process?.refreshAppAuth,
                process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
            }
          }, parseInt(value) || 1000);
          result = { ...result, intervalId, interval: parseInt(value) || 1000 };
          break;

        case 'clearTimeout':
          clearTimeout(parseInt(value));
          result = { ...result, message: 'Timeout cleared', timeoutId: parseInt(value) };
          break;

        case 'clearInterval':
          clearInterval(parseInt(value));
          result = { ...result, message: 'Interval cleared', intervalId: parseInt(value) };
          break;

        case 'performance':
          const perfAction = options.action || 'now'; // now, mark, measure, getEntries
          switch (perfAction) {
            case 'now':
              result.timestamp = performance.now();
              break;
            case 'mark':
              performance.mark(value);
              result.message = `Mark '${value}' created`;
              break;
            case 'measure':
              performance.measure(value, options.startMark, options.endMark);
              result.message = `Measure '${value}' created`;
              break;
            case 'getEntries':
              result.entries = performance.getEntries();
              break;
          }
          result = { ...result, action: perfAction };
          break;

        // ===================
        // GEOLOCATION
        // ===================
        case 'geolocation':
          if (navigator.geolocation) {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
            result = {
              ...result,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
          } else {
            throw new Error('Geolocation not supported');
          }
          break;

        // ===================
        // NOTIFICATIONS
        // ===================
        case 'notification':
          if (Notification.permission === 'granted') {
            const notification = new Notification(value, options);
            result = { ...result, message: 'Notification created', notification };
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const notification = new Notification(value, options);
              result = { ...result, message: 'Notification created', notification, permission };
            } else {
              result = { ...result, message: 'Notification permission denied', permission };
            }
          } else {
            result = { ...result, message: 'Notifications blocked', permission: 'denied' };
          }
          break;

        // ===================
        // CLIPBOARD
        // ===================
        case 'clipboard':
          const clipAction = options.action || 'write'; // read, write
          if (navigator.clipboard) {
            if (clipAction === 'write') {
              await navigator.clipboard.writeText(value);
              result = { ...result, message: 'Text copied to clipboard', text: value };
            } else if (clipAction === 'read') {
              const text = await navigator.clipboard.readText();
              result = { ...result, text, message: 'Text read from clipboard' };
            }
          } else {
            throw new Error('Clipboard API not supported');
          }
          break;

        // ===================
        // CUSTOM JAVASCRIPT
        // ===================
        case 'executeJS':
          const jsResult = eval(jsCode || value);
          result = { ...result, jsResult, code: jsCode || value };
          break;

        case 'evaluateExpression':
          const exprResult = new Function('globalObj', 'options', 'return ' + (jsCode || value))(globalObj, options);
          result = { ...result, expressionResult: exprResult, expression: jsCode || value };
          break;

        // ===================
        // WINDOW PROPERTIES
        // ===================
        case 'getWindowProperty':
          const propValue = window[value];
          result = { ...result, property: value, value: propValue };
          break;

        case 'setWindowProperty':
          window[value] = options.value;
          result = { ...result, property: value, value: options.value, message: 'Property set' };
          break;

        // ===================
        // CONSOLE OPERATIONS
        // ===================
        case 'console':
          const consoleMethod = options.method || 'log'; // log, warn, error, info, debug, table, group, time, etc.
          const consoleArgs = options.args || [value];
          console[consoleMethod](...consoleArgs);
          result = { ...result, method: consoleMethod, args: consoleArgs, message: 'Console output' };
          break;

        default:
          throw new Error(`Unsupported action type: ${actionType}`);
      }

      // Format result based on return type preference
      if (returnType !== 'auto') {
        switch (returnType) {
          case 'element':
            result = result.element || result.elements || result;
            break;
          case 'value':
            result = result.value || result.jsResult || result.expressionResult || result;
            break;
          case 'boolean':
            result = result.success || result.confirmed || result.matches || Boolean(result);
            break;
          case 'array':
            result = result.elements || result.entries || (Array.isArray(result) ? result : [result]);
            break;
          case 'object':
            // Keep as full object
            break;
        }
      }

      // Store result in global object
      globalObj[process.name] = result;

      // Log success
      messageLogger.success(`${actionType} action completed successfully`);

      return result;

    } catch (error) {
      // Comprehensive error handling
      const errorDetails = {
        error: error.message || 'Window/DOM action failed',
        actionType: process.actionType,
        target: process.target?.value,
        value: process.value?.value,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      // Store error in global errors
      globalErrors[process.name] = errorDetails;

      // Log error
      messageLogger.error(`${process.actionType} action failed: ${error.message}`);
      

      // Re-throw to maintain error propagation
      throw error;
    }
  },

  // Helper methods for common operations
  helpers: {
    // Element selection helpers
    selectElement: (selector) => {
      if (!selector) return null;
      if (typeof selector === 'object' && selector.nodeType) return selector;
      if (selector.startsWith('#')) return document.getElementById(selector.slice(1));
      return document.querySelector(selector);
    },

    selectElements: (selector) => {
      if (!selector) return [];
      return Array.from(document.querySelectorAll(selector));
    },

    // Event management
    createEventHandler: (eventData, callback, compId, extraData, navigate, paramState, pageId, editMode, store, refreshAppAuth, setDestroyInfo, setSessionInfo, setAppStatePartial, sessionKey) => {
      return createEventHandler(eventData, callback, compId, extraData, navigate, paramState, pageId, editMode, store, refreshAppAuth, setDestroyInfo, setSessionInfo, setAppStatePartial, sessionKey);
    },

    // DOM manipulation utilities
    createElementWithProps: (tagName, props = {}) => {
      const element = document.createElement(tagName);
      
      // Set attributes
      if (props.attributes) {
        Object.entries(props.attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      
      // Set properties
      if (props.properties) {
        Object.assign(element, props.properties);
      }
      
      // Set styles
      if (props.styles) {
        Object.assign(element.style, props.styles);
      }
      
      // Set content
      if (props.textContent) element.textContent = props.textContent;
      if (props.innerHTML) element.innerHTML = props.innerHTML;
      
      // Add event listeners
      if (props.events) {
        Object.entries(props.events).forEach(([eventType, handler]) => {
          element.addEventListener(eventType, handler);
        });
      }
      
      return element;
    },

    // CSS utilities
    addGlobalCSS: (css, id) => {
      // Remove existing style with same ID
      if (id) {
        const existing = document.getElementById(id);
        if (existing) existing.remove();
      }
      
      const style = document.createElement('style');
      if (id) style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    },

    // Storage utilities
    storageManager: {
      set: (key, value, storage = 'localStorage') => {
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        storageObj.setItem(key, JSON.stringify(value));
      },
      
      get: (key, storage = 'localStorage') => {
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        const item = storageObj.getItem(key);
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      },
      
      remove: (key, storage = 'localStorage') => {
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        storageObj.removeItem(key);
      },
      
      clear: (storage = 'localStorage') => {
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        storageObj.clear();
      }
    },

    // Async utilities
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    waitForElement: (selector, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);
        
        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
      });
    },

    // Performance utilities
    measurePerformance: (name, fn) => {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
 
      return result;
    },

    // Device detection
    getDeviceInfo: () => {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: /iPad|Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth > 768,
        isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      };
    },

    // URL utilities
    parseURL: (url = window.location.href) => {
      const urlObj = new URL(url);
      return {
        full: url,
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        params: Object.fromEntries(urlObj.searchParams)
      };
    },

    // Cookie utilities
    cookieManager: {
      set: (name, value, options = {}) => {
        let cookieString = `${name}=${encodeURIComponent(value)}`;
        
        if (options.expires) {
          cookieString += `; expires=${options.expires.toUTCString()}`;
        }
        if (options.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
        }
        if (options.domain) {
          cookieString += `; domain=${options.domain}`;
        }
        if (options.path) {
          cookieString += `; path=${options.path}`;
        }
        if (options.secure) {
          cookieString += '; secure';
        }
        if (options.httpOnly) {
          cookieString += '; httponly';
        }
        if (options.sameSite) {
          cookieString += `; samesite=${options.sameSite}`;
        }
        
        document.cookie = cookieString;
      },
      
      get: (name) => {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {});
        return cookies[name];
      },
      
      remove: (name, options = {}) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options.path || '/'}`;
      },
      
      getAll: () => {
        return document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key) acc[key] = decodeURIComponent(value || '');
          return acc;
        }, {});
      }
    },

    // Form utilities
    formManager: {
      serialize: (form) => {
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
      },
      
      populate: (form, data) => {
        Object.entries(data).forEach(([key, value]) => {
          const element = form.elements[key];
          if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
              element.checked = Boolean(value);
            } else {
              element.value = value;
            }
          }
        });
      },
      
      validate: (form, rules = {}) => {
        const errors = {};
        const data = this.serialize(form);
        
        Object.entries(rules).forEach(([field, rule]) => {
          const value = data[field];
          
          if (rule.required && (!value || value.trim() === '')) {
            errors[field] = 'This field is required';
          }
          
          if (rule.minLength && value && value.length < rule.minLength) {
            errors[field] = `Minimum length is ${rule.minLength}`;
          }
          
          if (rule.maxLength && value && value.length > rule.maxLength) {
            errors[field] = `Maximum length is ${rule.maxLength}`;
          }
          
          if (rule.pattern && value && !rule.pattern.test(value)) {
            errors[field] = rule.message || 'Invalid format';
          }
          
          if (rule.custom && typeof rule.custom === 'function') {
            const customResult = rule.custom(value, data);
            if (customResult !== true) {
              errors[field] = customResult;
            }
          }
        });
        
        return {
          isValid: Object.keys(errors).length === 0,
          errors,
          data
        };
      }
    },

    // Animation utilities
    animate: (element, keyframes, options = {}) => {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      
      if (!element) throw new Error('Element not found for animation');
      
      const animation = element.animate(keyframes, {
        duration: 300,
        easing: 'ease',
        fill: 'forwards',
        ...options
      });
      
      return animation;
    },

    // Intersection Observer utility
    observeIntersection: (elements, callback, options = {}) => {
      const observer = new IntersectionObserver(callback, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
        ...options
      });
      
      if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
      }
      
      if (elements.length) {
        elements.forEach(el => observer.observe(el));
      } else {
        observer.observe(elements);
      }
      
      return observer;
    },

    // Debounce and throttle utilities
    debounce: (func, wait, immediate = false) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
      };
    },

    throttle: (func, limit) => {
      let inThrottle;
      return function executedFunction(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  }
},
{
  key: 'rest-request',
  label: 'REST API Request',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[^.]+$',
        description: 'Variable name to store response (no spaces, caps)',
      },
      method: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'HTTP Method',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            default: 'GET',
            description: 'HTTP method for the request',
          },
        },
        required: ['value'],
      },
      url: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Request URL',
            description: 'URL for the API endpoint',
            pattern: '^https?://.+',
          },
        },
        required: ['value'],
      },
      queryParams: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Query Parameters (JSON)',
            description: 'URL query parameters as JSON string',
            default: '{}',
          },
        },
      },
      headers: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Request Headers (JSON)',
            description: 'HTTP headers as JSON string',
            default: '{}',
          },
        },
      },
      body: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Request Body',
            description: 'Request body data (JSON or string)',
          },
        },
      },
      timeout: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Timeout (ms)',
            description: 'Request timeout in milliseconds',
            default: 30000,
            minimum: 1000,
            maximum: 300000,
          },
        },
      },
      responseType: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Response Type',
            enum: ['json', 'text', 'blob', 'arraybuffer', 'document', 'stream'],
            default: 'json',
            description: 'Expected response data type',
          },
        },
      },
      streamHandler: {
        type: 'string',
        config: { uiType: 'eventHandler' },
        title: 'Stream Data Handler',
        description: 'Code to execute for each chunk of streaming data',
      },
      retryAttempts: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Retry Attempts',
            description: 'Number of retry attempts on failure',
            default: 3,
            minimum: 0,
            maximum: 10,
          },
        },
      },
      retryDelay: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Retry Delay (ms)',
            description: 'Delay between retry attempts',
            default: 1000,
            minimum: 100,
            maximum: 30000,
          },
        },
      },
      validateResponse: {
        type: 'string',
        title: 'Validate Response',
        description: 'Whether to validate response structure',
        enum: ['true', 'false'],
        default: 'true',
      },
      onSuccess: {
        type: 'string',
        config: { uiType: 'eventHandler' },
        title: 'On Success Handler',
        description: 'Code to execute when request succeeds',
      },
      onError: {
        type: 'string',
        config: { uiType: 'eventHandler' },
        title: 'On Error Handler',
        description: 'Code to execute when request fails',
      },
      cacheResponse: {
        type: 'string',
        title: 'Cache Response',
        description: 'Whether to cache successful GET responses',
        enum: ['true', 'false'],
        default: 'false',
      },
      cacheTTL: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            title: 'Cache TTL (ms)',
            description: 'Cache time-to-live in milliseconds',
            default: 300000, // 5 minutes
            minimum: 1000,
          },
        },
      },
    },
    required: ['name', 'method', 'url'],
  },
  process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
    try {
      // Get global storage for caching
      const globalStorage = (() => {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      // Initialize REST cache if needed
      if (!globalStorage._restCache) {
        globalStorage._restCache = new Map();
      }

      // Extract and validate parameters
      const method = retrieveBody('GET', process.method?.value, event, globalObj, paramState, sessionKey, process);
      const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
      if (!url) {
        throw new Error('Request URL is required');
      }
      if (!url.match(/^https?:\/\/.+/)) {
        throw new Error('Invalid URL format. Must start with http:// or https://');
      }

      const timeout = parseInt(retrieveBody(30000, process.timeout?.value, event, globalObj, paramState, sessionKey, process), 10) || 30000;
      const responseType = retrieveBody('json', process.responseType?.value, event, globalObj, paramState, sessionKey, process);
      const retryAttempts = parseInt(retrieveBody(3, process.retryAttempts?.value, event, globalObj, paramState, sessionKey, process), 10) || 3;
      const retryDelay = parseInt(retrieveBody(1000, process.retryDelay?.value, event, globalObj, paramState, sessionKey, process), 10) || 1000;
      const validateResponse = retrieveBody('true', process.validateResponse, event, globalObj, paramState, sessionKey, process) === 'true';
      const cacheResponse = retrieveBody('false', process.cacheResponse, event, globalObj, paramState, sessionKey, process) === 'true';
      const cacheTTL = parseInt(retrieveBody(300000, process.cacheTTL?.value, event, globalObj, paramState, sessionKey, process), 10) || 300000;

      // Process query parameters with better error handling
      let finalUrl = url;
      if (process.queryParams?.value) {
        try {
          const queryParamsStr = retrieveBody('{}', process.queryParams.value, event, globalObj, paramState, sessionKey, process);
          if (queryParamsStr && queryParamsStr.trim()) {
            const queryParams = typeof queryParamsStr === 'string' ? JSON.parse(queryParamsStr) : queryParamsStr;
            if (typeof queryParams !== 'object' || Array.isArray(queryParams)) {
              throw new Error('Query parameters must be a JSON object');
            }

            // Append query parameters to URL
            const urlObj = new URL(finalUrl);
            Object.entries(queryParams).forEach(([key, value]) => {
              urlObj.searchParams.append(key, value);
            });
            finalUrl = urlObj.toString();
          }
        } catch (queryError) {
          throw new Error(`Invalid query parameters format: ${queryError.message}`);
        }
      }

      // Process headers with better error handling
      let headers = {
        'Accept': 'application/json',
      };
      if (process.headers?.value) {
        try {
          const headersStr = retrieveBody('{}', process.headers.value, event, globalObj, paramState, sessionKey, process);
          if (headersStr && headersStr.trim()) {
            const parsedHeaders = typeof headersStr === 'string' ? JSON.parse(headersStr) : headersStr;
            if (typeof parsedHeaders !== 'object' || Array.isArray(parsedHeaders)) {
              throw new Error('Headers must be a JSON object');
            }
            headers = { ...headers, ...parsedHeaders };
          }
        } catch (headerError) {
          throw new Error(`Invalid headers format: ${headerError.message}`);
        }
      }

      // Process request body
      let requestBody = null;
      if (['POST', 'PUT', 'PATCH'].includes(method) && process.body?.value) {
        requestBody = retrieveBody('', process.body.value, event, globalObj, paramState, sessionKey, process);

        // Try to parse JSON if string
        if (typeof requestBody === 'string' && requestBody.trim()) {
          try {
            const parsed = JSON.parse(requestBody);
            requestBody = parsed;
            if (!headers['Content-Type']) {
              headers['Content-Type'] = 'application/json';
            }
          } catch (e) {
            // Keep as string if not valid JSON
            if (!headers['Content-Type']) {
              headers['Content-Type'] = 'text/plain';
            }
          }
        }
      }

      // Check if this is a streaming request
      const isStreaming = responseType === 'stream';
      
      // Don't cache streaming responses
      const cacheKey = cacheResponse && method === 'GET' && !isStreaming
        ? `${finalUrl}:${JSON.stringify(headers)}` 
        : null;

      // Check cache for GET requests
      if (cacheKey && globalStorage._restCache.has(cacheKey)) {
        const cached = globalStorage._restCache.get(cacheKey);
        if (Date.now() - cached.timestamp < cacheTTL) {
          messageLogger.info(`Using cached REST response for ${method} ${finalUrl}`);
          globalObj[process.name] = cached.data;
          
          // Execute success handler
          if (process.onSuccess) {
            try {
              createEventHandler(cached.data, process.onSuccess, process.compId, {}, navigate, paramState, 
                process.pageId, process.editMode, process.store, process?.refreshAppAuth,
                process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
            } catch (handlerError) {
              messageLogger.error(`Success handler error: ${handlerError.message}`);
            }
          }
          return;
        } else {
          // Remove expired cache entry
          globalStorage._restCache.delete(cacheKey);
        }
      }

      // Request function with retry logic
      const makeRequest = async (attempt = 1) => {
        messageLogger.info(`Making ${method} request to ${finalUrl} (Attempt ${attempt}/${retryAttempts + 1})`);
        
        const requestConfig = {
          method: method,
          url: finalUrl,
          headers: headers,
          timeout: timeout,
          responseType: isStreaming ? 'stream' : responseType,
        };

        // Add data for non-GET requests
        if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
          requestConfig.data = requestBody;
        }

        try {
          const startTime = Date.now();
          
          // Handle streaming responses differently
          if (isStreaming) {
            return new Promise((resolve, reject) => {
              let chunks = [];
              let totalBytes = 0;
              
              axios(requestConfig).then(response => {
                const stream = response.data;
                
                // Validate response if enabled
                if (validateResponse) {
                  if (response.status < 200 || response.status >= 300) {
                    reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
                    return;
                  }
                }

                stream.on('data', (chunk) => {
                  chunks.push(chunk);
                  totalBytes += chunk.length;
                  
                  // Execute stream handler for each chunk
                  if (process.streamHandler) {
                    try {
                      const chunkData = {
                        chunk: chunk.toString(),
                        chunkSize: chunk.length,
                        totalBytes: totalBytes,
                        chunkIndex: chunks.length - 1,
                      };
                      
                      createEventHandler(chunkData, process.streamHandler, process.compId, {}, navigate, paramState, 
                        process.pageId, process.editMode, process.store, process?.refreshAppAuth,
                        process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
                    } catch (handlerError) {
                      messageLogger.error(`Stream handler error: ${handlerError.message}`);
                    }
                  }
                });

                stream.on('end', () => {
                  const requestDuration = Date.now() - startTime;
                  const fullData = Buffer.concat(chunks).toString();
                  
                  const successResponse = {
                    data: fullData,
                    chunks: chunks.length,
                    totalBytes: totalBytes,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    config: response.config,
                    duration: requestDuration,
                    method: method,
                    url: finalUrl,
                    timestamp: new Date().toISOString(),
                    attempt: attempt,
                    streaming: true,
                  };
                  
                  resolve(successResponse);
                });

                stream.on('error', (streamError) => {
                  reject({
                    error: `Stream error: ${streamError.message}`,
                    method: method,
                    url: finalUrl,
                    attempt: attempt,
                    timestamp: new Date().toISOString(),
                    streaming: true,
                  });
                });

              }).catch(reject);
            });
          } else {
            // Non-streaming request
            const response = await axios(requestConfig);
            const requestDuration = Date.now() - startTime;
            
            // Validate response if enabled
            if (validateResponse) {
              if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
            }

            // Prepare successful response
            const successResponse = {
              data: response.data,
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              config: response.config,
              duration: requestDuration,
              method: method,
              url: finalUrl,
              timestamp: new Date().toISOString(),
              attempt: attempt,
              cached: false,
              streaming: false,
            };

            // Cache successful GET requests (non-streaming only)
            if (cacheKey && response.status >= 200 && response.status < 300) {
              globalStorage._restCache.set(cacheKey, {
                data: { ...successResponse, cached: true },
                timestamp: Date.now(),
              });
            }

            return successResponse;
          }

        } catch (error) {
          // Handle different types of errors
          let errorDetails = {
            error: error.message || 'REST request failed',
            method: method,
            url: finalUrl,
            attempt: attempt,
            timestamp: new Date().toISOString(),
            streaming: isStreaming,
          };

          // HTTP response errors
          if (error.response) {
            errorDetails.response = {
              data: error.response.data,
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
            };

            // Don't retry client errors (4xx)
            if (error.response.status >= 400 && error.response.status < 500) {
              throw errorDetails;
            }
          }

          // Network/timeout errors - retry if we have attempts left
          // Note: Streaming requests are typically not retried due to their nature
          if (!isStreaming && attempt <= retryAttempts && (!error.response || error.response.status >= 500)) {
            messageLogger.warn(`REST request attempt ${attempt} failed: ${error.message}. Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return makeRequest(attempt + 1);
          } else {
            throw errorDetails;
          }
        }
      };

      // Execute the request
      const result = await makeRequest();
      
      // Store successful result
      globalObj[process.name] = result;
      
      // Execute success handler
      if (process.onSuccess) {
        try {
          createEventHandler(result, process.onSuccess, process.compId, {}, navigate, paramState, 
            process.pageId, process.editMode, process.store, process?.refreshAppAuth,
            process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
        } catch (handlerError) {
          messageLogger.error(`Success handler error: ${handlerError.message}`);
        }
      }

      messageLogger.success(`${method} request to ${finalUrl} completed successfully${isStreaming ? ' (streaming)' : ''}`);

      return {
        success: true,
        data: result.data,
        streaming: isStreaming,
      };

    } catch (error) {
      // Prepare comprehensive error object
      const errorDetails = {
        ...globalErrors?.[process.name],
        ...(typeof error === 'object' ? error : { error: error.message || 'REST request failed' }),
      };

      // Store error information
      globalErrors[process.name] = errorDetails;

      // Execute error handler
      if (process.onError) {
        try {
          createEventHandler(errorDetails, process.onError, process.compId, {}, navigate, paramState, 
            process.pageId, process.editMode, process.store, process?.refreshAppAuth,
            process?.setDestroyInfo, process.setSessionInfo, process?.setAppStatePartial, () => '');
        } catch (handlerError) {
          messageLogger.error(`Error handler error: ${handlerError.message}`);
        }
      }

      // Determine error message to display
      let errorMessage = 'REST request failed';
      if (error.response) {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else if (error.error || error.message) {
        errorMessage = error.error || error.message;
      }

      messageLogger.error(errorMessage);
      messageLogger.error(JSON.stringify(errorDetails));

      // Re-throw to ensure calling code knows about the failure
      throw error;
    }
  },
},
    {
      key: 'controller-invoke',
      label: 'Invoke Controller',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          returnKey: {
            type: 'string',
          },
          controller: {
            type: 'string',
          },
          body: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          headers: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const body = retrieveBody('', process.body?.value, event, globalObj, paramState, sessionKey, process);
          const res = await process?.storeInvocation(
            body,
            appId,
            process.controller,
            process?.componentId,
            process?.viewId,
            process?.headers, 'development'
          );
          if (Object.keys(res.data.errors).length > 0) {
            // messageLogger.error(JSON.stringify(res.data.errors, null, 2));
          }

          globalObj[process.name] = process?.returnKey
            ? getValueByPath(res.data.data, process?.returnKey)
            : {
              ...res.data.data,
            };
        } catch (error) {
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
    {
      key: 'overlay-setMessage',
      label: 'Invoke message',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          messageType: {
            enum: ['success', 'info', 'warning', 'error'],
            type: 'string',
            default: 'info',
            // properties: {
            //   value: {
            //     type: 'string',
            //     type: 'string',
            //     title: 'Value',
            //   },
            // },
          },
          text: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
        },
        required: ['name', 'text'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const type = retrieveBody('', process.messageType, event, globalObj, paramState, sessionKey, process);
          const text = retrieveBody('', process.text?.value, event, globalObj, paramState, sessionKey, process);
          message[type || 'info'](text || 'message');

          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
        } catch (error) {
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
    {
      key: 'navigateTo',
      label: 'Navigate To',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          pageToNavigate: {
            type: 'string',
            config: {
              uiType: 'page',
            },
          },
          isExternalPath: {
            readOnly: true,
            type: 'boolean',
            title: 'Is External Path',
          },
          keepCurrentQueryParams: {
            type: 'boolean',
            title: 'Keep Current Query Params',
            default: true,
          },
          constructPath: {
            title: 'Param Constructor',
            type: 'array',
            readOnly: true,
            items: {
              type: 'object',
              properties: {
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          constructQuery: {
            title: 'Query Constructor',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'object',
                  properties: {
                    value: {
                      type: 'string',
                      title: 'Value',
                    },
                  },
                  required: ['value'],
                },
                queryValue: {
                  type: 'object',
                  properties: {
                    value: {
                      type: 'string',
                      title: 'Value',
                    },
                  },
                  required: ['value'],
                },
              },
              required: ['queryValue', 'key'],
            },
          },
          deleteQuery: {
            readOnly: true,
            title: 'Delete Query',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'object',
                  properties: {
                    value: {
                      type: 'string',
                      title: 'Value',
                    },
                  },
                  required: ['value'],
                },
              },
            },
          },
        },
        required: ['name', 'pageToNavigate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          if (process.editMode) {
            return
          }
          
          // Prevent double navigation by stopping event propagation
          // Only prevent default and stop propagation if not explicitly disabled in the process configuration

          // messageLogger.info(process.compId);
          const currentParams = process?.keepCurrentQueryParams
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams();
          const newPath = process?.constructPath
            ?.map((item) => retrieveBody('', item.value, event, globalObj, paramState, sessionKey, process))
            .join('/');
          const newQueryParams = process?.constructQuery?.map(({ key, queryValue }) => {
            const resolvedKey = retrieveBody('', key?.value, event, globalObj, paramState, sessionKey, process);
            const resolvedValue = retrieveBody('', queryValue?.value, event, globalObj, paramState, sessionKey, process);
            return [resolvedKey, resolvedValue];
          });
          const queriesToDelete = process?.constructQuery?.map(({ key }) => {
            const resolvedKey = retrieveBody('', key?.value, event, globalObj, paramState, sessionKey, process);
            return resolvedKey;
          });
          if (queriesToDelete) {
            queriesToDelete.forEach((key) => {
              currentParams.delete(key);
            });
          }
          if (newQueryParams) {
            newQueryParams.forEach(([key, value]) => {
              currentParams.set(encodeURIComponent(key), encodeURIComponent(value));
            });
          }
          let baseUrl = '';
          if (import.meta.env.VITE_ISDEPLOYED) {
            baseUrl = `/${process?.pageToNavigate}`;

          } else {
            
            baseUrl = `/applications/${appId}/views/${process?.pageToNavigate}`;
          }

          // const baseUrl = ;
          const fullPath = newPath ? `${baseUrl}/${newPath}` : baseUrl;
          const fullUrl = `${fullPath}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
          if (process.isExternalPath) {
            window.location.href = process?.pageToNavigate;
          } else if (!process.editMode) {
            // Debounce navigation to prevent double calls
            if (!globalObj._lastNavigation || Date.now() - globalObj._lastNavigation > 300) {
              globalObj._lastNavigation = Date.now();
              navigate(fullUrl);
             
            }
          } else if (process.editMode) {
            // navigate(fullUrl);
            messageLogger.info('Tried to navigate to ' + process?.pageToNavigate)
          }
          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
        } catch (error) {
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
    {
      key: 'copyToClipboard',
      label: 'copyToClipboard',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          await navigator.clipboard.writeText(JSON.stringify(body || {}));

          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
        } catch (error) {
          
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error?.message || 'something went wrong',
          };
        }
      },
    },
    {
      key: 'debug',
      label: 'debug',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          // body: {
          //   type: 'object',
          //   properties: {
          //     value: {
          //       type: 'string',
          //       title: 'Value',
          //     },
          //   },
          // },
        },
        required: ['name', 'body'],
      },
      // import { notification } from 'antd';

      process: async (
        process,
        globalObj,
        globalErrors,
        event,
        currentLog,
        appId,
        navigate,
        paramState,
        sessionKey,
        debug
      ) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
          // debug(globalObj);
          initJsonDebugStyles();

          // Replace with this simple call:
          logJsonDebug(globalObj, paramState, event, sessionKey, getUrlDetails, process);
          // messageLogger.info('kkkk');
        } catch (error) {
          
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error?.message || 'something went wrong',
          };
        }
      },
    },
    {
      key: 'download',
      label: 'download',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          fileName: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const fileName = retrieveBody(
          process.fileName.from,
          process.fileName.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        try {
          downloadFile(body, fileName);
          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
        } catch (error) {
          
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error?.message || 'something went wrong',
          };
        }
      },
    },
    {
      key: 'object-builder',
      label: 'object-builder',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
          },
          maps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'object',
                  properties: {
             
                    value: {
                      type: 'string',
                      title: 'Value',
                    },
                  },
                },
                value: {
                  title: 'Payload',
                  type: 'object',
                  properties: {
           
                    value: {
                      type: 'string',
                      title: 'Value',
                    },
                  },
                },
              },
            },
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const data = {
            data: generateObject(process.maps, event, globalObj, paramState, sessionKey, process),
          };
          globalObj[process.name] = {
            ...data?.data,
          };
        } catch (error) {
          
          messageLogger.error(JSON.stringify(error))
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error?.message || 'something went wrong',
          };
        }
      },
    },
    {
      key: 'trigger-element-event',
      label: 'Trigger Element Event',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Name',
            pattern: '^[^.]+$',
            description: 'Operation name (no spaces, dots)',
          },
          targetElementId: {
            type: 'string',
            title: 'Target Element ID',
            config: {
              uiType: 'elementSelect',
            },
        
          },
          eventType: {
            type: 'string',
            title: 'Event Type',
            enum: [
              // Mouse Events
              'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
              'mousemove', 'mouseenter', 'mouseleave', 'contextmenu', 'wheel',
              // Keyboard Events
              'keydown', 'keyup', 'keypress',
              // Form Events
              'submit', 'reset', 'change', 'input', 'focus', 'blur', 'select',
              // Drag Events
              'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop',
              // Touch Events (for mobile)
              'touchstart', 'touchend', 'touchmove', 'touchcancel',
              // Animation Events
              'animationstart', 'animationend', 'animationiteration',
              // Transition Events
              'transitionstart', 'transitionend', 'transitionrun', 'transitioncancel',
              // Media Events
              'play', 'pause', 'ended', 'volumechange', 'loadstart', 'loadeddata',
              'loadedmetadata', 'canplay', 'canplaythrough', 'seeking', 'seeked',
              // Clipboard Events
              'copy', 'cut', 'paste',
              // Window/Document Events
              'load', 'unload', 'beforeunload', 'resize', 'scroll',
              // Other Common Events
              'error', 'abort', 'toggle', 'invalid'
            ],
            default: 'click',
            description: 'Type of event to trigger on the target element',
          },
          eventData: {
            type: 'object',
            title: 'Event Data (Optional)',
            properties: {
              value: {
                type: 'string',
                title: 'Event Data',
                description: 'Optional data to pass with the event (JSON string)',
              },
            },
          },
          bubbles: {
            type: 'boolean',
            title: 'Bubbles',
            default: true,
            description: 'Whether the event should bubble up the DOM tree',
          },
          cancelable: {
            type: 'boolean',
            title: 'Cancelable',
            default: true,
            description: 'Whether the event can be canceled',
          },
        },
        required: ['name', 'targetElementId', 'eventType'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // Get the target element ID
          const elementId = process.targetElementId;

          // Get optional event data
          let eventData = null;
          if (process.eventData?.value) {
            const rawEventData = retrieveBody(
              process.eventData.from || 'static',
              process.eventData.value,
              event,
              globalObj,
              paramState,
              sessionKey
            );
            try {
              eventData = typeof rawEventData === 'string' ? JSON.parse(rawEventData) : rawEventData;
            } catch (e) {
              
              eventData = rawEventData;
            }
          }

          // Find the target element
          const targetElement = document.getElementById(elementId);
          
          if (!targetElement) {
            throw new Error(`Element with ID '${elementId}' not found`);
          }

          const eventType = process.eventType || 'click';
          const bubbles = process.bubbles !== false; // Default to true
          const cancelable = process.cancelable !== false; // Default to true

          // Create and dispatch the appropriate event
          let customEvent;

          // Handle different event categories
          if (['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'contextmenu'].includes(eventType)) {
            // Mouse events
            customEvent = new MouseEvent(eventType, {
              bubbles,
              cancelable,
              view: window,
              detail: eventData?.detail || 1,
              screenX: eventData?.screenX || 0,
              screenY: eventData?.screenY || 0,
              clientX: eventData?.clientX || 0,
              clientY: eventData?.clientY || 0,
              ctrlKey: eventData?.ctrlKey || false,
              altKey: eventData?.altKey || false,
              shiftKey: eventData?.shiftKey || false,
              metaKey: eventData?.metaKey || false,
              button: eventData?.button || 0,
            });
          } else if (['keydown', 'keyup', 'keypress'].includes(eventType)) {
            // Keyboard events
            customEvent = new KeyboardEvent(eventType, {
              bubbles,
              cancelable,
              view: window,
              key: eventData?.key || '',
              code: eventData?.code || '',
              location: eventData?.location || 0,
              ctrlKey: eventData?.ctrlKey || false,
              altKey: eventData?.altKey || false,
              shiftKey: eventData?.shiftKey || false,
              metaKey: eventData?.metaKey || false,
              repeat: eventData?.repeat || false,
            });
          } else if (['touchstart', 'touchend', 'touchmove', 'touchcancel'].includes(eventType)) {
            // Touch events
            customEvent = new TouchEvent(eventType, {
              bubbles,
              cancelable,
              view: window,
              touches: eventData?.touches || [],
              targetTouches: eventData?.targetTouches || [],
              changedTouches: eventData?.changedTouches || [],
              ctrlKey: eventData?.ctrlKey || false,
              altKey: eventData?.altKey || false,
              shiftKey: eventData?.shiftKey || false,
              metaKey: eventData?.metaKey || false,
            });
          } else if (['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].includes(eventType)) {
            // Drag events
            customEvent = new DragEvent(eventType, {
              bubbles,
              cancelable,
              view: window,
              detail: eventData?.detail || 0,
              dataTransfer: eventData?.dataTransfer || null,
            });
          } else if (['animationstart', 'animationend', 'animationiteration'].includes(eventType)) {
            // Animation events
            customEvent = new AnimationEvent(eventType, {
              bubbles,
              cancelable,
              animationName: eventData?.animationName || '',
              elapsedTime: eventData?.elapsedTime || 0,
              pseudoElement: eventData?.pseudoElement || '',
            });
          } else if (['transitionstart', 'transitionend', 'transitionrun', 'transitioncancel'].includes(eventType)) {
            // Transition events
            customEvent = new TransitionEvent(eventType, {
              bubbles,
              cancelable,
              propertyName: eventData?.propertyName || '',
              elapsedTime: eventData?.elapsedTime || 0,
              pseudoElement: eventData?.pseudoElement || '',
            });
          } else if (['wheel'].includes(eventType)) {
            // Wheel events
            customEvent = new WheelEvent(eventType, {
              bubbles,
              cancelable,
              view: window,
              deltaX: eventData?.deltaX || 0,
              deltaY: eventData?.deltaY || 0,
              deltaZ: eventData?.deltaZ || 0,
              deltaMode: eventData?.deltaMode || 0,
            });
          } else {
            // Generic events (including form events, clipboard events, etc.)
            customEvent = new CustomEvent(eventType, {
              bubbles,
              cancelable,
              detail: eventData || null,
            });
          }

          // Dispatch the event
          const result = targetElement.dispatchEvent(customEvent);

          // Store result in global object
          globalObj[process.name] = {
            success: true,
            elementId: elementId,
            eventType: eventType,
            eventDispatched: true,
            eventNotCanceled: result, // true if event was not canceled
            timestamp: new Date().toISOString(),
            eventData: eventData,
          };


          messageLogger.success(`Event '${eventType}' triggered on element '${elementId}'`);

        } catch (error) {
          
          messageLogger.error(`Failed to trigger element event: ${error.message}`);
          
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error?.message || 'Failed to trigger element event',
            timestamp: new Date().toISOString(),
          };
        }
      },
    },
  ],
};
export function generateObject(array, event, globalObj, paramState, sessionKey, process) {
  const result = {};
  array.forEach((item) => {
    const key = retrieveBody(item.key.from, item.key.value, event, globalObj, paramState, sessionKey, process) || {};
    const value = retrieveBody(item.value.from, item.value.value, event, globalObj, paramState, sessionKey, process) || {};
    result[key] = value;
  });
  return result;
}

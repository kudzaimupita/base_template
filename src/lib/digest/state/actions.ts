import { getUrlDetails, getValueByPath, retrieveBody, isEmpty } from './utils';
import { initJsonDebugStyles, logJsonDebug } from './debug';

import axios from 'axios';
import _ from 'lodash';
import { message } from 'antd';
import { messageLogger} from '../digester';
import { createEventHandler } from '../../utils';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import * as R from 'ramda';
import validator from 'validator';
import numeral from 'numeral';
import Fuse from 'fuse.js';
import qs from 'qs';
import yaml from 'js-yaml';
import Papa from 'papaparse';
import chroma from 'chroma-js';
import he from 'he';
import slugify from 'slugify';
import DOMPurify from 'dompurify';
import { escape as escapeHTML, unescape as unescapeHTML } from 'html-escaper';

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
          messageLogger.error(JSON.stringify(error));
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
          messageLogger.error(JSON.stringify(error));
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
          messageLogger.error(JSON.stringify(error));
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
            default: 'setState',
          },
          stateConfig: {
            type: 'string',
            title: 'State Configuration',
            config: {
              uiType: 'SetStateField',
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
              separator: ' ',
            }),
          },
        },
        required: ['name', 'stateConfig'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // Extract config from the stateConfig property (now a JSON string)
          let config = {};
          try {
            config = typeof process.stateConfig === 'string' ? JSON.parse(process.stateConfig) : process.stateConfig || {};
          } catch (e) {
            console.error('Failed to parse stateConfig:', e);
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
          
          // Enhanced key path logic for global vs element-specific state
          let fullKey;
          
          // Check if this is a global state operation (no element context needed)
          const isGlobalState = config.stateScope === 'global' || 
                               config.elementOverride === false ||
                               baseKey.startsWith('global.') ||
                               // Simple keys without dots are considered global by default
                               (!baseKey.includes('.') && !config.elementOverride);
          
          if (isGlobalState) {
            // Global state: store directly as top-level key
            fullKey = baseKey.startsWith('global.') ? baseKey.replace('global.', '') : baseKey;
          } else {
            // Element-specific state: use element path
            fullKey = keyPath ? `${keyPath}.${baseKey}` : baseKey;
          }

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

              payload = createEventHandler(
                transformContext,
                config.transformFunction,
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
              console.warn('JSON parse error:', e.message, 'Input:', str);
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
                const elementContext = config.elementOverride
                  ? (() => {
                      // Find the element in allElements first (immediate access)
                      const elementFromAllElements = globalObj.allElements?.find((el) => el.i === config.elementOverride);

                      // Use store.getState() to access currentApplication from Redux store
                      let elementFromCurrentApp = null;
                      if (process.store) {
                        const rootState = process.store.getState();
                        const currentApplication = rootState.currentAppState?.currentApplication;

                        if (currentApplication?.views && process.pageId) {
                          const targetView = currentApplication.views.find((view) => view.id === process.pageId);
                          if (targetView?.layout) {
                            elementFromCurrentApp = targetView.layout.find(
                              (element) => element.i === config.elementOverride
                            );
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
                        completeElement: bestElement,
                      };
                    })()
                  : undefined;

                // Dispatch to the enhanced setAppStatePartial reducer
                process.store.dispatch(
                  process.setAppStatePartial({
                    key: fullKey,
                    payload,
                    operationType: operation,
                    operationConfig,
                    elementContext,
                  })
                );

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
      key: 'localStorage-set',
      label: 'Set localStorage',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'Step name',
          },
          storageKey: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Raw localStorage Key (user-controlled)',
                description: 'Direct localStorage key name (e.g., "myAppData", "userPreferences")',
                placeholder: 'myAppData'
              },
            },
          },
          key: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Property Path (e.g., user.preferences.theme)',
                description: 'Nested property path within the localStorage object',
                placeholder: 'user.theme'
              },
            },
          },
          payload: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value to store',
                description: 'Value to store at the specified path',
              },
            },
          },
          operationType: {
            type: 'string',
            title: 'Operation Type',
            enum: ['set', 'merge', 'append', 'prepend', 'delete'],
            default: 'set',
            description:
              'set: Set value, merge: Merge objects, append: Add to array end, prepend: Add to array start, delete: Remove key',
          },
          mergeStrategy: {
            type: 'string',
            title: 'Merge Strategy (for merge operation)',
            enum: ['shallow', 'deep'],
            default: 'shallow',
            description: 'shallow: Simple object merge, deep: Deep merge with nested objects',
          },
        },
        required: ['name', 'storageKey', 'key', 'payload'],
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
              Object.keys(source).forEach((key) => {
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

          // Use raw localStorage key provided by user - no automatic prefixing
          const localStorageKey = retrieveBody('', process.storageKey?.value || key, event, globalObj, paramState, sessionKey, process);
          
          if (!localStorageKey) {
            throw new Error('localStorage key is required');
          }

          // Get existing localStorage data using raw key
          const existingData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
          const currentValue = safeGet(existingData, key, undefined);

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

          // Save back to localStorage using raw key
          localStorage.setItem(localStorageKey, JSON.stringify(existingData));

          globalObj[process.name] = {
            data: {
              localStorage: {
                storageKey: localStorageKey,
                key: key,
                data: payload,
                operationType: operationType,
                previousValue: currentValue,
                newValue: safeGet(existingData, key, undefined),
              },
            },
            success: true,
            message: `Successfully performed ${operationType} operation on localStorage key: ${localStorageKey}`,
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
      key: 'localStorage-bulk',
      label: 'Bulk localStorage Operations',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'Step name',
          },
          storageKey: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Raw localStorage Key (user-controlled)',
                description: 'Direct localStorage key name for all operations',
                placeholder: 'myAppData'
              },
            },
          },
          operations: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Operations Array (JSON string)',
                description:
                  'Array of operations: [{"key":"user.name","payload":"John","operation":"set"},{"key":"cache","operation":"delete"}]',
              },
            },
          },
        },
        required: ['name', 'storageKey', 'operations'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const operationsString = retrieveBody(
            '',
            process.operations.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
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

          // Use raw localStorage key provided by user - no automatic prefixing
          const localStorageKey = retrieveBody('', process.storageKey?.value || 'bulkStorage', event, globalObj, paramState, sessionKey, process);
          
          if (!localStorageKey) {
            throw new Error('localStorage key is required for bulk operations');
          }

          // Get existing localStorage data using raw key
          const existingData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
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
                newValue: safeGet(existingData, key),
              });
            } catch (opError) {
              results.push({
                key,
                operation,
                success: false,
                error: opError.message,
              });
            }
          }

          // Save back to localStorage using raw key
          localStorage.setItem(localStorageKey, JSON.stringify(existingData));

          globalObj[process.name] = {
            data: {
              localStorage: {
                storageKey: localStorageKey,
                operations: results,
                totalOperations: operations.length,
                successfulOperations: results.filter((r) => r.success).length,
                failedOperations: results.filter((r) => !r.success).length,
              },
            },
            success: true,
            message: `Bulk localStorage operations completed on key: ${localStorageKey}. ${results.filter((r) => r.success).length}/${operations.length} successful`,
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
      key: 'localStorage-clear',
      label: 'Clear localStorage',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'Step name',
          },
          storageKey: {
            type: 'string',
            description: 'Raw localStorage key to clear (user-controlled)',
            placeholder: 'myAppData'
          },
        },
        required: ['name', 'storageKey'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // Get raw localStorage key from config
          const localStorageKey = retrieveBody('', process.storageKey, event, globalObj, paramState, sessionKey, process);
          
          if (!localStorageKey) {
            throw new Error('localStorage key is required');
          }

          // Remove from localStorage using raw key
          localStorage.removeItem(localStorageKey);
          
          globalObj[process.name] = {
            data: {
              localStorage: {
                storageKey: localStorageKey,
                action: 'clear',
              },
            },
            success: true,
            message: `localStorage key '${localStorageKey}' cleared successfully`,
          };
        } catch (error) {
          messageLogger.error(`localStorage clear failed: ${error.message}`);
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'localStorage clear operation failed',
            timestamp: new Date().toISOString(),
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
          let headers = retrieveBody('', process.headers?.value, event, globalObj, paramState, sessionKey, process);

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
              // Silently ignore header parsing errors
            }
          }

          // Check if we should send as multipart (based on checkbox, not automatic file detection)
          if (process.sendAsMultipart) {
            // Create FormData for multipart request
            requestData = new FormData();

            // Add each body property as individual form fields
            if (body && typeof body === 'object') {
              Object.keys(body).forEach((key) => {
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
            // Ensure requestData is always a JSON-serializable object/array
            if (typeof body === 'object' && body !== null) {
              requestData = body;
            } else {
              // If body is a primitive (string, number, boolean), wrap it in an object
              // This ensures the server receives valid JSON structure
              requestData = { value: body };
            }
            
            // Ensure JSON Content-Type header is set for non-multipart requests
            if (headers && typeof headers === 'object') {
              headers['Content-Type'] = 'application/json';
            } else {
              headers = { 'Content-Type': 'application/json' };
            }
          }

          const res = await process?.storeInvocation(
            requestData,
            appId,
            process.controller,
            process?.componentId,
            process?.viewId,
            headers,
            import.meta.env.MODE || 'development'
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
          console.error(error);
          // messageLogger.error('err ');
          messageLogger.error(JSON.stringify(error));
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
          const onMessageBody = retrieveBody(
            '',
            process.onMessage?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const storeMessages =
            retrieveBody('true', process?.storeMessages, event, globalObj, paramState, sessionKey, process) === 'true';
          const connectionTimeout = retrieveBody(
            10000,
            process.connectionTimeout?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const reconnectAttempts = retrieveBody(
            3,
            process.reconnectAttempts?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const reconnectDelay = retrieveBody(
            1000,
            process.reconnectDelay?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );

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
                  timestamp: new Date().toISOString(),
                },
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
                  timestamp: new Date().toISOString(),
                },
              };
              return;
            }
          }

          // Parse protocols
          const protocols = protocolsStr
            ? protocolsStr
                .split(',')
                .map((p) => p.trim())
                .filter((p) => p)
            : undefined;

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
              attempt: attempt,
            };

            // Store connection
            globalStorage._wsConnections.set(connectionId, connectionState);

            try {
              // Wait for connection to open or error with timeout
              await new Promise((resolve, reject) => {
                const cleanup = () => {
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
                createEventHandler(
                  messageData,
                  process?.onMessage,
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
                // Store message if enabled
                if (storeMessages && connectionState.messages) {
                  connectionState.messages.push({
                    timestamp: new Date().toISOString(),
                    data: messageData,
                    type: typeof messageData,
                  });
                }

                // Execute custom message handler
                if (onMessageBody) {
                  try {
                    const handler = new Function('data', 'globalObj', 'connectionId', onMessageBody);
                    handler(messageData, globalObj, connectionId);
                    messageLogger.warning('hhhh');
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

                messageLogger.info(
                  `WebSocket closed: ${url} (Code: ${event.code}, Reason: ${event.reason || 'No reason provided'})`
                );

                // Auto-reconnect if it wasn't a clean close and we have attempts left
                if (event.code !== 1000 && attempt <= reconnectAttempts) {
                  messageLogger.info(`Attempting to reconnect in ${reconnectDelay}ms...`);
                  setTimeout(() => {
                    globalStorage._wsConnections.delete(connectionId);
                    connectWithRetry(attempt + 1).catch((err) => {
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
                timestamp: new Date().toISOString(),
              };
            } catch (error) {
              // Clean up failed connection
              globalStorage._wsConnections.delete(connectionId);

              // Retry if we have attempts left
              if (attempt <= reconnectAttempts) {
                messageLogger.warn(
                  `Connection attempt ${attempt} failed: ${error.message}. Retrying in ${reconnectDelay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, reconnectDelay));
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
            data: result,
          };
        } catch (error) {
          // Store error in globalErrors
          messageLogger.error(JSON.stringify(error));
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'WebSocket connection failed',
            timestamp: new Date().toISOString(),
          };

          // Log error
          if (typeof message !== 'undefined' && messageLogger.error) {
            messageLogger.error(`WebSocket connection failed: ${error.message}`);
          } else {
          }

          // Re-throw to ensure calling code knows about the failure
          throw error;
        }
      },
    },
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
            },
          };

          // Extract parameters
          const filterByUrl = retrieveBody(
            '',
            process.filterByUrl?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const includeDetails =
            retrieveBody('true', process?.includeDetails, event, globalObj, paramState, sessionKey, process) === 'true';

          // Check if WebSocket connections storage exists
          if (!globalStorage._wsConnections) {
            globalObj[process.name] = {
              data: {
                connections: [],
                count: 0,
                timestamp: new Date().toISOString(),
              },
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

          messageLogger.info(
            `Found ${connections.length} WebSocket connections${filterByUrl ? ` for URL: ${filterByUrl}` : ''}`
          );

          // Store successful result
          globalObj[process.name] = {
            data: {
              connections: connections,
              count: connections.length,
              filterByUrl: filterByUrl,
              timestamp: new Date().toISOString(),
            },
          };
        } catch (error) {
          // Store error in globalErrors
          messageLogger.error(JSON.stringify(error));
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'WebSocket get connections operation failed',
            timestamp: new Date().toISOString(),
          };

          messageLogger.error(`WebSocket get connections failed: ${error.message}`);
          throw error;
        }
      },
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
            },
          };

          // Verify WebSocket connections storage exists
          if (!globalStorage._wsConnections) {
            throw new Error('No WebSocket connections found. Please establish a connection first.');
          }

          // Extract parameters
          const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
          const messageData = retrieveBody('', process.message?.value, event, globalObj, paramState, sessionKey, process);
          const messageType = retrieveBody('auto', process?.messageType, event, globalObj, paramState, sessionKey, process);
          const waitForAck =
            retrieveBody('false', process?.waitForAck, event, globalObj, paramState, sessionKey, process) === 'true';
          const ackTimeout = retrieveBody(
            5000,
            process.ackTimeout?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const retryAttempts = retrieveBody(
            2,
            process.retryAttempts?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const retryDelay = retrieveBody(
            1000,
            process.retryDelay?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );

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
                if (
                  typeof data === 'object' &&
                  data !== null &&
                  !(data instanceof ArrayBuffer) &&
                  !(data instanceof Uint8Array)
                ) {
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
                      data: responseData,
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
                  acknowledgment: ackResponse,
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
                acknowledgment: ackResponse,
              };
            } catch (error) {
              if (attempt <= retryAttempts) {
                messageLogger.warn(`Send attempt ${attempt} failed: ${error.message}. Retrying in ${retryDelay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
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
            data: result,
          };
        } catch (error) {
          // Store error in globalErrors
          messageLogger.error(JSON.stringify(error));
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'WebSocket send operation failed',
            timestamp: new Date().toISOString(),
          };

          messageLogger.error(`WebSocket send failed: ${error.message}`);
          throw error;
        }
      },
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
                enum: ['true'],
              },
            },
          },
          {
            required: ['url'],
          },
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
            },
          };

          // Verify WebSocket connections storage exists
          if (!globalStorage._wsConnections) {
            messageLogger.warn('No WebSocket connections storage found');
            globalObj[process.name] = {
              data: {
                message: 'No WebSocket connections to disconnect',
                disconnectedConnections: [],
                timestamp: new Date().toISOString(),
              },
            };
            return;
          }

          // Extract parameters
          const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
          const closeCode = retrieveBody(1000, process.closeCode?.value, event, globalObj, paramState, sessionKey, process);
          const closeReason = retrieveBody(
            'Connection closed by application',
            process.closeReason?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const forceClose =
            retrieveBody('false', process?.forceClose, event, globalObj, paramState, sessionKey, process) === 'true';
          const closeTimeout = retrieveBody(
            5000,
            process.closeTimeout?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const preserveMessages =
            retrieveBody('true', process?.preserveMessages, event, globalObj, paramState, sessionKey, process) === 'true';
          const disconnectAll =
            retrieveBody('false', process?.disconnectAll, event, globalObj, paramState, sessionKey, process) === 'true';

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
              forced: forceClose,
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
                messageLogger.warn(
                  `WebSocket connection not in connected state: ${connection.url} (status: ${connection.status}, readyState: ${connection.ws.readyState})`
                );
                // Still attempt to close
              }

              messageLogger.info(
                `Closing WebSocket connection: ${connection.url} (Code: ${closeCode}, Reason: ${closeReason})`
              );

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

                      messageLogger.success(
                        `WebSocket connection closed gracefully: ${connection.url} (Code: ${event.code})`
                      );
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
          const totalConnections = globalStorage._wsConnections.size;

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
          const successfulDisconnects = disconnectedConnections.filter((conn) => !conn.error).length;
          const failedDisconnects = disconnectedConnections.filter((conn) => conn.error).length;
          const forcedDisconnects = disconnectedConnections.filter((conn) => conn.forced).length;

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
                forced: forcedDisconnects,
              },
              timestamp: new Date().toISOString(),
            },
          };
        } catch (error) {
          // Store error in globalErrors
          messageLogger.error(JSON.stringify(error));
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'WebSocket disconnect operation failed',
            timestamp: new Date().toISOString(),
          };

          messageLogger.error(`WebSocket disconnect failed: ${error.message}`);
          throw error;
        }
      },
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
              throw new Error(
                `Interval with name '${process.name}' is already running. Clear it first or use a different name.`
              );
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
            },
          };

          // Extract parameters
          const duration = retrieveBody('', process?.duration?.value, event, globalObj, paramState, sessionKey, process);
          const maxExecutions = retrieveBody(
            0,
            process?.maxExecutions?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
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
                    finalExecutionCount: executionCount,
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
                timestamp: new Date().toISOString(),
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
            debug: debug,
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
            message: `Interval '${intervalName}' started with ${duration}ms duration${
              maxExecutions > 0 ? ` (max ${maxExecutions} executions)` : ' (unlimited)'
            }`,
          };

          if (debug) {
            messageLogger.success(`Interval '${intervalName}' started successfully`);
          }
        } catch (error) {
          // Store error in globalErrors
          globalErrors[process.name] = {
            error: error.message || 'Interval setup failed',
            timestamp: new Date().toISOString(),
          };

          // Log error

          throw error;
        }
      },
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
            },
          };

          // Check if intervals storage exists
          if (!globalStorage._intervals) {
            globalObj[process.name] = {
              message: 'No intervals storage found',
              clearedIntervals: [],
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Extract parameters
          const intervalNameValue = retrieveBody(
            '',
            process?.intervalName?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
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
                    action: intervalData.status === 'running' ? 'cancelled' : 'removed',
                  });

                  if (debug) {
                    messageLogger.info(
                      `${intervalData.status === 'running' ? 'Cancelled' : 'Removed'} interval: ${intervalName}`
                    );
                  }
                }
              } catch (error) {
                clearedIntervals.push({
                  intervalName: intervalName,
                  error: error.message,
                  status: 'error',
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
                action: intervalData.status === 'running' ? 'cancelled' : 'removed',
              });

              if (debug) {
                messageLogger.success(
                  `Interval ${intervalData.status === 'running' ? 'cancelled' : 'removed'}: ${intervalNameValue}`
                );
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
              cancelled: clearedIntervals.filter((i) => i.action === 'cancelled').length,
              removed: clearedIntervals.filter((i) => i.action === 'removed').length,
              failed: clearedIntervals.filter((i) => i.status === 'error').length,
            },
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          // Store error in globalErrors
          globalErrors[process.name] = {
            error: error.message || 'Clear interval operation failed',
            timestamp: new Date().toISOString(),
          };

          messageLogger.error(`Clear interval failed: ${error.message}`);
          throw error;
        }
      },
    },
    {
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
            },
          };

          // Extract parameters
          const delay = retrieveBody('', process?.delay?.value, event, globalObj, paramState, sessionKey, process);
          const customIdValue = retrieveBody(
            '',
            process?.customId?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
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
                  completedAt: executionTime,
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
                timestamp: new Date().toISOString(),
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
            executeImmediately: executeImmediately,
          };

          globalStorage._timeouts.set(timeoutId, timeoutData);

          // Store result in globalObj
          globalObj[process.name] = {
            timeoutId: timeoutId,
            delay: parseInt(delay),
            executeImmediately: executeImmediately,
            status: 'pending',
            startTime: startTime,
            message: `Timeout set for ${delay}ms${customIdValue ? ` with custom ID: ${customIdValue}` : ''}`,
          };

          if (debug) {
            messageLogger.success(`Timeout ${timeoutId} started successfully`);
          }
        } catch (error) {
          // Store error in globalErrors
          globalErrors[process.name] = {
            error: error.message || 'Timeout setup failed',
            timestamp: new Date().toISOString(),
          };

          throw error;
        }
      },
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
                enum: [true],
              },
            },
          },
          {
            required: ['intervalId'],
          },
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
            },
          };

          // Check if intervals storage exists
          if (!globalStorage._intervals) {
            globalObj[process.name] = {
              message: 'No intervals storage found',
              clearedIntervals: [],
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Extract parameters
          const intervalIdValue = retrieveBody(
            '',
            process?.intervalId?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
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
                    action: intervalData.status === 'running' ? 'cancelled' : 'removed',
                  });

                  if (debug) {
                    messageLogger.info(`${intervalData.status === 'running' ? 'Cancelled' : 'Removed'} interval: ${id}`);
                  }
                }
              } catch (error) {
                clearedIntervals.push({
                  intervalId: id,
                  error: error.message,
                  status: 'error',
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
                action: intervalData.status === 'running' ? 'cancelled' : 'removed',
              });

              if (debug) {
                messageLogger.success(
                  `Interval ${intervalData.status === 'running' ? 'cancelled' : 'removed'}: ${intervalIdValue}`
                );
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
              cancelled: clearedIntervals.filter((i) => i.action === 'cancelled').length,
              removed: clearedIntervals.filter((i) => i.action === 'removed').length,
              failed: clearedIntervals.filter((i) => i.status === 'error').length,
            },
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          // Store error in globalErrors
          globalErrors[process.name] = {
            error: error.message || 'Clear interval operation failed',
            timestamp: new Date().toISOString(),
          };

          messageLogger.error(`Clear interval failed: ${error.message}`);
          throw error;
        }
      },
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
                enum: [true],
              },
            },
          },
          {
            required: ['timeoutId'],
          },
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
            },
          };

          // Check if timeouts storage exists
          if (!globalStorage._timeouts) {
            globalObj[process.name] = {
              message: 'No timeouts storage found',
              clearedTimeouts: [],
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Extract parameters
          const timeoutIdValue = retrieveBody(
            '',
            process?.timeoutId?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
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
                    action: timeoutData.status === 'pending' ? 'cancelled' : 'removed',
                  });

                  if (debug) {
                    messageLogger.info(`${timeoutData.status === 'pending' ? 'Cancelled' : 'Removed'} timeout: ${id}`);
                  }
                }
              } catch (error) {
                clearedTimeouts.push({
                  timeoutId: id,
                  error: error.message,
                  status: 'error',
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
                action: timeoutData.status === 'pending' ? 'cancelled' : 'removed',
              });

              if (debug) {
                messageLogger.success(
                  `Timeout ${timeoutData.status === 'pending' ? 'cancelled' : 'removed'}: ${timeoutIdValue}`
                );
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
              cancelled: clearedTimeouts.filter((t) => t.action === 'cancelled').length,
              removed: clearedTimeouts.filter((t) => t.action === 'removed').length,
              failed: clearedTimeouts.filter((t) => t.status === 'error').length,
            },
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          // Store error in globalErrors
          globalErrors[process.name] = {
            error: error.message || 'Clear timeout operation failed',
            timestamp: new Date().toISOString(),
          };

          messageLogger.error(`Clear timeout failed: ${error.message}`);
          throw error;
        }
      },
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

          const operationType = retrieveBody(
            'query',
            process.operationType?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const operation = retrieveBody('', process.operation?.value, event, globalObj, paramState, sessionKey, process);
          if (!operation) {
            throw new Error('GraphQL operation is required');
          }

          const timeout =
            parseInt(retrieveBody(30000, process.timeout?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            30000;
          const retryAttempts =
            parseInt(retrieveBody(3, process.retryAttempts?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            3;
          const retryDelay =
            parseInt(retrieveBody(1000, process.retryDelay?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            1000;
          const validateResponse =
            retrieveBody('true', process.validateResponse, event, globalObj, paramState, sessionKey, process) === 'true';
          const cacheResponse =
            retrieveBody('false', process.cacheResponse, event, globalObj, paramState, sessionKey, process) === 'true';
          const cacheTTL =
            parseInt(retrieveBody(300000, process.cacheTTL?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            300000;

          // Process variables with better error handling
          let variables = {};
          if (process.variables?.value) {
            try {
              const variablesStr = retrieveBody(
                '{}',
                process.variables.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
              if (!isEmpty(variablesStr) && variablesStr?.trim()) {
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
            Accept: 'application/json',
          };
          if (process.headers?.value) {
            try {
              const headersStr = retrieveBody(
                '{}',
                process.headers.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
              if (!isEmpty(headersStr) && headersStr?.trim()) {
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
          const cacheKey =
            cacheResponse && operationType === 'query' ? `${endpoint}:${JSON.stringify({ operation, variables })}` : null;

          // Check cache for queries
          if (cacheKey && globalStorage._graphqlCache.has(cacheKey)) {
            const cached = globalStorage._graphqlCache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheTTL) {
              messageLogger.info(`Using cached GraphQL response for ${operationType}`);
              globalObj[process.name] = cached.data;

              // Execute success handler
              if (process.onSuccess) {
                try {
                  createEventHandler(
                    cached.data,
                    process.onSuccess,
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
            messageLogger.info(
              `Making GraphQL ${operationType} request to ${endpoint} (Attempt ${attempt}/${retryAttempts + 1})`
            );

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
                const errorMessages = response.data.errors.map((e) => e.message || 'Unknown GraphQL error').join(', ');

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
              const errorDetails = {
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
                messageLogger.warn(
                  `GraphQL request attempt ${attempt} failed: ${error.message}. Retrying in ${retryDelay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
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
              createEventHandler(
                result,
                process.onSuccess,
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
              createEventHandler(
                errorDetails,
                process.onError,
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
            } catch (handlerError) {
              messageLogger.error(`Error handler error: ${handlerError.message}`);
            }
          }

          // Determine error message to display
          let errorMessage = 'GraphQL request failed';
          if (error.graphqlErrors) {
            errorMessage = `GraphQL errors: ${error.graphqlErrors.map((e) => e.message || 'Unknown error').join(', ')}`;
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
              'open',
              'close',
              'print',
              'focus',
              'blur',
              'resize',
              'resizeBy',
              'moveTo',
              'moveBy',

              // Dialog Functions
              'alert',
              'confirm',
              'prompt',

              // Scrolling
              'scroll',
              'scrollTo',
              'scrollBy',
              'scrollIntoView',

              // Navigation & History
              'reload',
              'back',
              'forward',
              'go',
              'pushState',
              'replaceState',

              // Window Events
              'addEventListener',
              'removeEventListener',
              'dispatchEvent',

              // DOM Manipulation
              'getElementById',
              'querySelector',
              'querySelectorAll',
              'createElement',
              'appendChild',
              'removeChild',
              'insertBefore',
              'replaceChild',
              'setAttribute',
              'getAttribute',
              'removeAttribute',
              'classList',
              'innerHTML',
              'textContent',
              'outerHTML',
              'cloneNode',

              // DOM Events
              // 'click', 'submit', 'change', 'input', 'keydown', 'keyup', 'mousedown', 'mouseup',
              // 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'touchstart', 'touchend',

              // CSS & Styles
              'getComputedStyle',
              'setStyle',
              'getStyle',
              'addCSS',
              'removeCSS',

              // Media & Device APIs
              'matchMedia',
              'getUserMedia',
              'getDisplayMedia',
              'requestFullscreen',
              'exitFullscreen',

              // Storage APIs
              'localStorage',
              'sessionStorage',
              'indexedDB',

              // Network & Communication
              // 'fetch', 'postMessage', 'broadcastChannel',

              // Performance & Timing
              // 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout',
              // 'setInterval', 'clearInterval', 'requestIdleCallback', 'cancelIdleCallback',
              // 'performance',

              // Geolocation & Sensors
              'geolocation',
              'deviceOrientation',
              'deviceMotion',

              // Notifications & Permissions
              'notification',
              'permissions',
              'vibrate',

              // Clipboard
              'clipboard',

              // File System
              'fileReader',
              'filePicker',

              // WebRTC & Media
              'webRTC',
              'mediaRecorder',

              // Custom JavaScript Execution
              // 'executeJS', 'evaluateExpression',

              // Window Properties
              'getWindowProperty',
              'setWindowProperty',

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
                    createEventHandler(
                      e,
                      process.callback,
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
                  } catch (handlerError) {}
                }
              };

              const eventTarget = target ? getElement(target) : window;
              eventTarget.addEventListener(eventType || value, eventHandler, options);

              // Store handler reference for removal
              if (!globalObj._eventHandlers) globalObj._eventHandlers = new Map();
              const handlerKey = `${target || 'window'}_${eventType || value}_${process.name}`;
              globalObj._eventHandlers.set(handlerKey, {
                target: eventTarget,
                type: eventType || value,
                handler: eventHandler,
              });

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
                cancelable: options.cancelable !== false,
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
                  computedStyle: property
                    ? computedStyle.getPropertyValue(property)
                    : Object.fromEntries(
                        Array.from(computedStyle).map((prop) => [prop, computedStyle.getPropertyValue(prop)])
                      ),
                  property,
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
                ...options,
              };
              if (options.body) fetchOptions.body = JSON.stringify(options.body);

              const response = await fetch(value, fetchOptions);
              const data = options.responseType === 'text' ? await response.text() : await response.json();
              result = {
                ...result,
                data,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
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
                  createEventHandler(
                    {},
                    process.callback,
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
              });
              result = { ...result, rafId };
              break;

            case 'setTimeout':
              const timeoutId = setTimeout(() => {
                if (process.callback) {
                  createEventHandler(
                    {},
                    process.callback,
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
              }, parseInt(value) || 1000);
              result = { ...result, timeoutId, delay: parseInt(value) || 1000 };
              break;

            case 'setInterval':
              const intervalId = setInterval(() => {
                if (process.callback) {
                  createEventHandler(
                    {},
                    process.callback,
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
                  timestamp: position.timestamp,
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
        createEventHandler: (
          eventData,
          callback,
          compId,
          extraData,
          navigate,
          paramState,
          pageId,
          editMode,
          store,
          refreshAppAuth,
          setDestroyInfo,
          setSessionInfo,
          setAppStatePartial,
          sessionKey
        ) => {
          return createEventHandler(
            eventData,
            callback,
            compId,
            extraData,
            navigate,
            paramState,
            pageId,
            editMode,
            store,
            refreshAppAuth,
            setDestroyInfo,
            setSessionInfo,
            setAppStatePartial,
            sessionKey
          );
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
          },
        },

        // Async utilities
        wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

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
              subtree: true,
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
              pixelDepth: screen.pixelDepth,
            },
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet:
              /iPad|Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
              window.innerWidth > 768,
            isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
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
            params: Object.fromEntries(urlObj.searchParams),
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
          },
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
              data,
            };
          },
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
            ...options,
          });

          return animation;
        },

        // Intersection Observer utility
        observeIntersection: (elements, callback, options = {}) => {
          const observer = new IntersectionObserver(callback, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            ...options,
          });

          if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
          }

          if (elements.length) {
            elements.forEach((el) => observer.observe(el));
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
              setTimeout(() => (inThrottle = false), limit);
            }
          };
        },
      },
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
          // if (!url.match(/^https?:\/\/.+/)) {
          //   throw new Error('Invalid URL format. Must start with http:// or https://');
          // }

          const timeout =
            parseInt(retrieveBody(30000, process.timeout?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            30000;
          const responseType = retrieveBody(
            'json',
            process.responseType?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const retryAttempts =
            parseInt(retrieveBody(3, process.retryAttempts?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            3;
          const retryDelay =
            parseInt(retrieveBody(1000, process.retryDelay?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            1000;
          const validateResponse =
            retrieveBody('true', process.validateResponse, event, globalObj, paramState, sessionKey, process) === 'true';
          const cacheResponse =
            retrieveBody('false', process.cacheResponse, event, globalObj, paramState, sessionKey, process) === 'true';
          const cacheTTL =
            parseInt(retrieveBody(300000, process.cacheTTL?.value, event, globalObj, paramState, sessionKey, process), 10) ||
            300000;

          // Process query parameters with better error handling
          let finalUrl = url;
          if (process.queryParams?.value) {
            try {
              const queryParamsStr = retrieveBody(
                '{}',
                process.queryParam?.value||'{}',
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
              if (!isEmpty(queryParamsStr) && queryParamsStr?.trim()) {
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
            Accept: 'application/json',
          };
          if (process.headers?.value) {
            try {
              const headersStr = retrieveBody(
                '{}',
                process.headers.value||'{}',
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
             
              if (!isEmpty(headersStr) && headersStr?.trim()) {
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
          const cacheKey =
            cacheResponse && method === 'GET' && !isStreaming ? `${finalUrl}:${JSON.stringify(headers)}` : null;

          // Check cache for GET requests
          if (cacheKey && globalStorage._restCache.has(cacheKey)) {
            const cached = globalStorage._restCache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheTTL) {
              messageLogger.info(`Using cached REST response for ${method} ${finalUrl}`);
              globalObj[process.name] = cached.data;

              // Execute success handler
              if (process.onSuccess) {
                try {
                  createEventHandler(
                    cached.data,
                    process.onSuccess,
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
                  const chunks = [];
                  let totalBytes = 0;

                  axios(requestConfig)
                    .then((response) => {
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

                            createEventHandler(
                              chunkData,
                              process.streamHandler,
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
                    })
                    .catch(reject);
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
              const errorDetails = {
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
                messageLogger.warn(
                  `REST request attempt ${attempt} failed: ${error.message}. Retrying in ${retryDelay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
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
              createEventHandler(
                result,
                process.onSuccess,
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
            } catch (handlerError) {
              messageLogger.error(`Success handler error: ${handlerError.message}`);
            }
          }

          messageLogger.success(
            `${method} request to ${finalUrl} completed successfully${isStreaming ? ' (streaming)' : ''}`
          );

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
              createEventHandler(
                errorDetails,
                process.onError,
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
            process?.headers,
            'development'
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
          messageLogger.error(JSON.stringify(error));
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
          messageLogger.error(JSON.stringify(error));
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
            return;
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
            messageLogger.info('Tried to navigate to ' + process?.pageToNavigate);
          }
          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
        } catch (error) {
          message.error(process?.pageToNavigate)

        
          messageLogger.error(JSON.stringify(error));
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
          messageLogger.error(JSON.stringify(error));
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
          messageLogger.error(JSON.stringify(error));
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
          messageLogger.error(JSON.stringify(error));
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
          messageLogger.error(JSON.stringify(error));
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
              'click',
              'dblclick',
              'mousedown',
              'mouseup',
              'mouseover',
              'mouseout',
              'mousemove',
              'mouseenter',
              'mouseleave',
              'contextmenu',
              'wheel',
              // Keyboard Events
              'keydown',
              'keyup',
              'keypress',
              // Form Events
              'submit',
              'reset',
              'change',
              'input',
              'focus',
              'blur',
              'select',
              // Drag Events
              'drag',
              'dragstart',
              'dragend',
              'dragover',
              'dragenter',
              'dragleave',
              'drop',
              // Touch Events (for mobile)
              'touchstart',
              'touchend',
              'touchmove',
              'touchcancel',
              // Animation Events
              'animationstart',
              'animationend',
              'animationiteration',
              // Transition Events
              'transitionstart',
              'transitionend',
              'transitionrun',
              'transitioncancel',
              // Media Events
              'play',
              'pause',
              'ended',
              'volumechange',
              'loadstart',
              'loadeddata',
              'loadedmetadata',
              'canplay',
              'canplaythrough',
              'seeking',
              'seeked',
              // Clipboard Events
              'copy',
              'cut',
              'paste',
              // Window/Document Events
              'load',
              'unload',
              'beforeunload',
              'resize',
              'scroll',
              // Other Common Events
              'error',
              'abort',
              'toggle',
              'invalid',
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
          if (
            [
              'click',
              'dblclick',
              'mousedown',
              'mouseup',
              'mouseover',
              'mouseout',
              'mousemove',
              'mouseenter',
              'mouseleave',
              'contextmenu',
            ].includes(eventType)
          ) {
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
    {
      key: 'executeCode',
      label: 'Execute Code (Secure)',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Step Name',
            pattern: '^[^.]+$',
            description: 'Name for this code execution operation',
            default: 'executeCode',
          },
          code: {
            type: 'string',
            title: 'Code to Execute',
            description: 'JavaScript code to execute',
            minLength: 1,
            maxLength: 10000, // Limit code length
            default: `// ===== EXECUTION CONTEXT VARIABLES =====
// - globalObj: Global state object
// - paramState: Current parameters  
// - event: Event data
// - sessionKey: Current session key
// - process: Process utilities
// - appId: Current application ID
// - navigate: Navigation function
// - getState(): Get Redux state
// - dispatch(): Dispatch Redux actions
// - setAppStatePartial(): Update app state


return '';  // Return value will be stored in state if storeResult is true`,
            config: {
              uiType: 'CodeEditor',
              language: 'javascript',
              theme: 'vs-dark',
              fullScreen: true,
              options: {
                minimap: { enabled: true },
                lineNumbers: 'on',
                folding: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, Monaco, Menlo, monospace',
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                snippetSuggestions: 'inline',
                parameterHints: { enabled: true },
                tabCompletion: 'on',
                contextmenu: true,
                mouseWheelZoom: true,
                suggest: {
                  localityBonus: true,
                  snippetsPreventQuickSuggestions: false,
                  showIcons: true,
                  maxVisibleSuggestions: 12,
                  filteredTypes: {
                    keyword: false,
                    script: false
                  }
                }
              }
            }
          },
          // timeout: {
          //   type: 'number',
          //   title: 'Execution Timeout (ms)',
          //   description: 'Maximum execution time in milliseconds',
          //   default: 5000,
          //   minimum: 100,
          //   maximum: 30000,
          // },
          // memoryLimit: {
          //   type: 'number',
          //   title: 'Memory Limit (MB)',
          //   description: 'Maximum memory usage in megabytes',
          //   default: 100,
          //   minimum: 10,
          //   maximum: 500,
          // },

          storeResult: {
            type: 'boolean',
            title: 'Store Result',
            description: 'Whether to store the result in state',
            default: true
          },
          resultPath: {
            type: 'string',
            title: 'Result Path',
            description: 'State path to store the result',
            pattern: '^[a-zA-Z0-9_.-]+$',
            maxLength: 100
          }
        },
        required: ['name', 'code']
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
                  try {
              const renderElementUtil= process?.renderElementUtil ;   
            // Input validation
            if (!process.code || typeof process.code !== 'string') {
              throw new Error('Invalid code input');
            }

            // Add timeout wrapper
            const timeoutCode = `
              return (async () => {
                try {
                  ${process.code}
                } catch (error) {
                  throw error;
                }
              })();
            `;

                      // Create safe execution environment using Function constructor
            const createSafeFunction = (code, context) => {
              const contextKeys = Object.keys(context);
              const contextValues = contextKeys.map(key => context[key]);
              
              return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                  reject(new Error('Execution timeout exceeded (5000ms)'));
                }, 5000);

                try {
                  // Create function with context parameters
                  const fn = new Function(...contextKeys, code);
                  // Execute with context values
                  Promise.resolve(fn.apply(null, contextValues))
                    .then(result => {
                      clearTimeout(timeoutId);
                      resolve(result);
                    })
                    .catch(error => {
                      clearTimeout(timeoutId);
                      reject(new Error(`Code execution failed: ${error.message}`));
                    });
                } catch (error) {
                  clearTimeout(timeoutId);
                  reject(new Error(`Code execution failed: ${error.message}`));
                }
              });
            };

                                  // Create restricted execution context
            const restrictedContext = {
              // Core libraries and utilities
              _: _,  // Full Lodash
              R: R,  // Ramda
              axios: axios,  // Full Axios
              dayjs: dayjs,  // Full Day.js
              nanoid: nanoid,  // ID generation
            validator: validator,  // String validation
            numeral: numeral,  // Number formatting
            Fuse: Fuse,  // Fuzzy search
            qs: qs,  // Query string parsing
            yaml: yaml,  // YAML parsing
            Papa: Papa,  // CSV parsing
            chroma: chroma,  // Color manipulation
            he: he,  // HTML entity encoding/decoding
            slugify: slugify,  // URL-friendly slugs
            DOMPurify: DOMPurify,  // HTML sanitization
            escapeHTML: escapeHTML,  // HTML escaping
            unescapeHTML: unescapeHTML,  // HTML unescaping
            JSON: JSON,
            Math: Math,
            Date: Date,
            Array: Array,
            Object: Object,
            String: String,
            Number: Number,
            Boolean: Boolean,
            RegExp: RegExp,
            Promise: Promise,
            Set: Set,
            Map: Map,

            // Browser APIs and Utilities
            setTimeout,
            setInterval,
            clearTimeout,
            clearInterval,
            console,
            localStorage,
            sessionStorage,
            URL,
            URLSearchParams,
            Blob,
            FileReader,
            FormData,
            fetch,
            Headers,
            Request,
            Response,
            
            // Encoding/Decoding
            encodeURI,
            decodeURI,
            encodeURIComponent,
            decodeURIComponent,
            btoa,
            atob,

            // Type Conversion
            parseInt,
            parseFloat,
            isNaN,
            isFinite,

            // Timing
            performance,
            requestAnimationFrame,
            cancelAnimationFrame,

            // Message Channel
            MessageChannel,
            MessagePort,
            BroadcastChannel,

            // Crypto
            crypto,
            
            // Execution context
            event,
            globalObj,
            paramState,
            sessionKey,
            process,
            appId,
            navigate,

            // Safe logging
            log: (...args) => messageLogger.info(...args),
            error: (...args) => messageLogger.error(...args),
            warn: (...args) => messageLogger.warn(...args),

            // State management
            getState: process?.store?.getState,
            dispatch: process?.store?.dispatch,
            setAppStatePartial: process?.setAppStatePartial,

            // ===================
            // APPLICATION HELPER UTILITIES
            // ===================
            
            // VIEW MANAGEMENT UTILITIES
            views: {
              // Get all views in the current application
              getAll: () => {
                const state = process?.store?.getState();
                return state?.currentAppState?.currentApplication?.views || [];
              },

              // Get current/active view
              getCurrent: () => {
                const views = restrictedContext.views.getAll();
                return views.find(view => view.id === process?.pageId) || null;
              },

              // Get view by ID
              getById: (viewId) => {
                const views = restrictedContext.views.getAll();
                return views.find(view => view.id === viewId) || null;
              },

              // Create new view
              create: (viewConfig) => {
                const state = process?.store?.getState();
                const currentApp = state?.currentAppState?.currentApplication;
                if (!currentApp) throw new Error('No current application found');

                const newView = {
                  id: viewConfig.id || `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name: viewConfig.name || 'New View',
                  layout: viewConfig.layout || [],
                  configuration: viewConfig.configuration || {},
                  ...viewConfig
                };

                const updatedApp = {
                  ...currentApp,
                  views: [...(currentApp.views || []), newView]
                };

                process?.store?.dispatch({ type: 'app/setCurrentApp', payload: updatedApp });
                return newView;
              },

              // Update view configuration
              update: (viewId, updates) => {
                const state = process?.store?.getState();
                const currentApp = state?.currentAppState?.currentApplication;
                if (!currentApp?.views) throw new Error('No views found');

                const updatedApp = {
                  ...currentApp,
                  views: currentApp.views.map(view => 
                    view.id === viewId 
                      ? { ...view, ...updates }
                      : view
                  )
                };

                process?.store?.dispatch({ type: 'app/setCurrentApp', payload: updatedApp });
                return restrictedContext.views.getById(viewId);
              },

              // Delete view
              delete: (viewId) => {
                const state = process?.store?.getState();
                const currentApp = state?.currentAppState?.currentApplication;
                if (!currentApp?.views) throw new Error('No views found');

                const updatedApp = {
                  ...currentApp,
                  views: currentApp.views.filter(view => view.id !== viewId)
                };

                process?.store?.dispatch({ type: 'app/setCurrentApp', payload: updatedApp });
                return true;
              },

              // Duplicate view
              duplicate: (viewId, newName) => {
                const sourceView = restrictedContext.views.getById(viewId);
                if (!sourceView) throw new Error('Source view not found');

                const duplicatedView = {
                  ..._.cloneDeep(sourceView),
                  id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name: newName || `${sourceView.name} Copy`,
                  layout: sourceView.layout?.map(element => ({
                    ..._.cloneDeep(element),
                    i: `${element.i}_copy_${Math.random().toString(36).substr(2, 6)}`
                  })) || []
                };

                return restrictedContext.views.create(duplicatedView);
              }
            },

            // ELEMENT MANAGEMENT UTILITIES
            elements: {
              // Get all elements in current or specific view
              getAll: (viewId) => {
                const targetViewId = viewId || process?.pageId;
                const view = restrictedContext.views.getById(targetViewId);
                return view?.layout || [];
              },

              // Get element by ID in current or specific view
              get: (elementId, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const elements = restrictedContext.elements.getAll(targetViewId);
                return elements.find(el => el.i === elementId) || null;
              },

              // Get element with its children
              getWithChildren: (elementId, viewId) => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element) return null;

                const allElements = restrictedContext.elements.getAll(viewId);
                const children = allElements.filter(el => el.parentId === elementId);
                
                return {
                  ...element,
                  children: children,
                  childCount: children.length
                };
              },

              // Get element's parent
              getParent: (elementId, viewId) => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element?.parentId) return null;
                return restrictedContext.elements.get(element.parentId, viewId);
              },

              // Get element's siblings
              getSiblings: (elementId, viewId) => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element) return [];

                const allElements = restrictedContext.elements.getAll(viewId);
                return allElements.filter(el => 
                  el.parentId === element.parentId && el.i !== elementId
                );
              },

              // Add new element to view
              add: (elementConfig, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const view = restrictedContext.views.getById(targetViewId);
                if (!view) throw new Error('Target view not found');

                const newElement = {
                  i: elementConfig.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  x: elementConfig.x || 0,
                  y: elementConfig.y || 0,
                  w: elementConfig.w || 4,
                  h: elementConfig.h || 4,
                  type: elementConfig.type || 'div',
                  configuration: elementConfig.configuration || {},
                  parentId: elementConfig.parentId || null,
                  children: elementConfig.children || [],
                  ...elementConfig
                };

                // Update parent's children array if parentId is specified
                let updatedLayout = [...view.layout, newElement];
                
                if (newElement.parentId) {
                  updatedLayout = updatedLayout.map(el => {
                    if (el.i === newElement.parentId) {
                      return {
                        ...el,
                        children: [...(el.children || []), newElement.i]
                      };
                    }
                    return el;
                  });
                }

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return newElement;
              },

              // Delete element from view
              delete: (elementId, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const view = restrictedContext.views.getById(targetViewId);
                if (!view) throw new Error('Target view not found');

                const element = restrictedContext.elements.get(elementId, targetViewId);
                if (!element) throw new Error('Element not found');

                // Get all children that need to be deleted too
                const childrenToDelete = restrictedContext.elements.getAllChildren(elementId, targetViewId);
                const elementsToDelete = [elementId, ...childrenToDelete.map(child => child.i)];

                // Remove from parent's children array if element has a parent
                let updatedLayout = view.layout.filter(el => !elementsToDelete.includes(el.i));
                
                if (element.parentId) {
                  updatedLayout = updatedLayout.map(el => {
                    if (el.i === element.parentId) {
                      return {
                        ...el,
                        children: (el.children || []).filter(childId => childId !== elementId)
                      };
                    }
                    return el;
                  });
                }

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return elementsToDelete;
              },

              // Delete multiple elements
              deleteMultiple: (elementIds, viewId) => {
                const deletedElements = [];
                elementIds.forEach(id => {
                  try {
                    const deleted = restrictedContext.elements.delete(id, viewId);
                    deletedElements.push(...deleted);
                  } catch (error) {
                    // Continue with other elements
                  }
                });
                return deletedElements;
              },

              // Hide element (set display: none or visibility: hidden)
              hide: (elementId, viewId, method = 'display') => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element) throw new Error('Element not found');

                const styleUpdate = method === 'display' 
                  ? { display: 'none' }
                  : { visibility: 'hidden' };

                return restrictedContext.elements.updateStyle(elementId, styleUpdate, viewId);
              },

              // Show element
              show: (elementId, viewId, displayValue = 'block') => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element) throw new Error('Element not found');

                return restrictedContext.elements.updateStyle(elementId, { 
                  display: displayValue, 
                  visibility: 'visible' 
                }, viewId);
              },

              // Update element configuration
              updateConfig: (elementId, config, viewId) => {
                const targetViewId = viewId || process?.pageId;
                
                process?.store?.dispatch({
                  type: 'app/updateElementConfiguration',
                  payload: {
                    viewId: targetViewId,
                    elementId: elementId,
                    configuration: config
                  }
                });

                return restrictedContext.elements.get(elementId, targetViewId);
              },

              // Update element style
              updateStyle: (elementId, styleUpdates, viewId) => {
                const targetViewId = viewId || process?.pageId;
                
                process?.store?.dispatch({
                  type: 'app/updateElementStyle',
                  payload: {
                    viewId: targetViewId,
                    elementId: elementId,
                    style: styleUpdates
                  }
                });

                return restrictedContext.elements.get(elementId, targetViewId);
              },

              // Get all children recursively
              getAllChildren: (elementId, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const allElements = restrictedContext.elements.getAll(targetViewId);
                const children = [];

                const findChildren = (parentId) => {
                  const directChildren = allElements.filter(el => el.parentId === parentId);
                  children.push(...directChildren);
                  
                  // Recursively find grandchildren
                  directChildren.forEach(child => {
                    findChildren(child.i);
                  });
                };

                findChildren(elementId);
                return children;
              },

              // Move element to different parent
              changeParent: (elementId, newParentId, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const view = restrictedContext.views.getById(targetViewId);
                if (!view) throw new Error('Target view not found');

                const element = restrictedContext.elements.get(elementId, targetViewId);
                if (!element) throw new Error('Element not found');

                const updatedLayout = view.layout.map(el => {
                  // Remove from old parent's children
                  if (el.i === element.parentId) {
                    return {
                      ...el,
                      children: (el.children || []).filter(childId => childId !== elementId)
                    };
                  }
                  // Add to new parent's children
                  if (el.i === newParentId) {
                    return {
                      ...el,
                      children: [...(el.children || []), elementId]
                    };
                  }
                  // Update the element itself
                  if (el.i === elementId) {
                    return {
                      ...el,
                      parentId: newParentId
                    };
                  }
                  return el;
                });

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return restrictedContext.elements.get(elementId, targetViewId);
              },

              // Duplicate element
              duplicate: (elementId, viewId, newPosition = {}) => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element) throw new Error('Element not found');

                const duplicatedElement = {
                  ..._.cloneDeep(element),
                  i: `${elementId}_copy_${Math.random().toString(36).substr(2, 6)}`,
                  x: newPosition.x !== undefined ? newPosition.x : element.x + 1,
                  y: newPosition.y !== undefined ? newPosition.y : element.y + 1,
                  children: [] // Reset children for duplicated element
                };

                return restrictedContext.elements.add(duplicatedElement, viewId);
              },

              // Find elements by type
              findByType: (elementType, viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(el => el.type === elementType);
              },

              // Find elements by configuration property
              findByConfig: (configPath, configValue, viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(el => {
                  const value = _.get(el.configuration, configPath);
                  return configValue !== undefined ? value === configValue : value !== undefined;
                });
              },

              // Get element tree (hierarchical structure)
              getTree: (viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                const elementMap = {};
                const rootElements = [];

                // Create element map
                elements.forEach(el => {
                  elementMap[el.i] = { ...el, children: [] };
                });

                // Build tree structure
                elements.forEach(el => {
                  if (el.parentId && elementMap[el.parentId]) {
                    elementMap[el.parentId].children.push(elementMap[el.i]);
                  } else {
                    rootElements.push(elementMap[el.i]);
                  }
                });

                return rootElements;
              }
            },

            // STATE MANAGEMENT UTILITIES
            state: {
              // Set state value (enhanced wrapper around setAppStatePartial)
              set: (key, value, options = {}) => {
                if (!process?.store?.dispatch || !process?.setAppStatePartial) {
                  throw new Error('State management not available');
                }

                process.store.dispatch(
                  process.setAppStatePartial({
                    key: key,
                    payload: value,
                    operationType: options.operation || 'set',
                    operationConfig: options.config || {},
                    elementContext: options.elementContext
                  })
                );

                return true;
              },

              // Get state value
              get: (key, defaultValue) => {
                const appState = process?.store?.getState()?.appState || {};
                return _.get(appState, key, defaultValue);
              },

              // Delete state key
              delete: (key) => {
                return restrictedContext.state.set(key, null, { operation: 'delete' });
              },

              // Merge state
              merge: (key, value, strategy = 'shallow') => {
                return restrictedContext.state.set(key, value, { 
                  operation: 'merge',
                  config: { mergeStrategy: strategy }
                });
              },

              // Array operations
              append: (key, value) => {
                return restrictedContext.state.set(key, value, { operation: 'append' });
              },

              prepend: (key, value) => {
                return restrictedContext.state.set(key, value, { operation: 'prepend' });
              },

              // Toggle boolean state
              toggle: (key) => {
                return restrictedContext.state.set(key, null, { operation: 'toggle' });
              },

              // Increment/decrement numeric state
              increment: (key, amount = 1) => {
                return restrictedContext.state.set(key, amount, { operation: 'increment' });
              },

              decrement: (key, amount = 1) => {
                return restrictedContext.state.set(key, amount, { operation: 'decrement' });
              },

              // Bulk state updates
              setBulk: (updates) => {
                if (!Array.isArray(updates)) throw new Error('Updates must be an array');
                
                updates.forEach(({ key, value, operation = 'set', config = {} }) => {
                  restrictedContext.state.set(key, value, { operation, config });
                });

                return true;
              },

              // Get full state tree
              getAll: () => {
                return process?.store?.getState()?.appState || {};
              },

              // Clear all state
              clear: () => {
                const currentState = restrictedContext.state.getAll();
                Object.keys(currentState).forEach(key => {
                  restrictedContext.state.delete(key);
                });
                return true;
              }
            },

            // LOCAL STORAGE UTILITIES
            storage: {
              // Get entire localStorage data (raw access)
              getRaw: (storageKey = null) => {
                try {
                  if (storageKey) {
                    // Get specific storage key (like sessionInfo)
                    const data = localStorage.getItem(storageKey);
                    return data ? JSON.parse(data) : {};
                  } else {
                    // Get entire localStorage (filter out main app data)
                    const allData = {};
                    const hiddenKeys = ['user', 'accessToken', 'refreshToken', 'admin', 'googleFontsCache', 'googleFontsCacheExpiry'];
                    
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && !hiddenKeys.includes(key)) {
                        try {
                          const value = localStorage.getItem(key);
                          allData[key] = value ? JSON.parse(value) : value;
                        } catch (error) {
                          // If JSON parsing fails, store as raw string
                          allData[key] = value;
                        }
                      }
                    }
                    return allData;
                  }
                } catch (error) {
                  console.error('Failed to get raw localStorage data:', error);
                  return {};
                }
              },

              // Get localStorage data by application ID (like DeviceFrameWrapper)
              getAppStorage: (appId) => {
                if (!appId) return {};
                const storageKey = `${appId}-sessionInfo`;
                return restrictedContext.storage.getRaw(storageKey);
              },

              // Get all localStorage keys
              getAllKeys: () => {
                const keys = [];
                const hiddenKeys = ['user', 'accessToken', 'refreshToken', 'admin', 'googleFontsCache', 'googleFontsCacheExpiry'];
                
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && !hiddenKeys.includes(key)) keys.push(key);
                }
                return keys;
              },

              // Get localStorage size and usage
              getStorageInfo: () => {
                let totalSize = 0;
                const keys = restrictedContext.storage.getAllKeys();
                
                keys.forEach(key => {
                  const item = localStorage.getItem(key);
                  if (item) totalSize += item.length;
                });

                return {
                  totalKeys: keys.length,
                  totalSize: totalSize,
                  totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
                  totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
                };
              },

              // Set item in localStorage
              set: (key, value, options = {}) => {
                const { 
                  scope = 'local', 
                  namespace = null, // null means use appId + sessionInfo pattern
                  ttl = null,
                  encrypt = false 
                } = options;

                // Use appId + sessionInfo pattern by default, or custom namespace if provided
                const fullKey = namespace 
                  ? `${namespace}:${key}`
                  : `${appId}-sessionInfo`;
                
                let dataToStore = value;

                // Add metadata if TTL is specified
                if (ttl) {
                  dataToStore = {
                    value: value,
                    metadata: {
                      expiresAt: Date.now() + ttl,
                      createdAt: Date.now(),
                      ttl: ttl
                    }
                  };
                }

                // Encrypt data if requested
                if (encrypt) {
                  try {
                    const encrypted = restrictedContext.crypto.subtle.encrypt(
                      'AES-GCM',
                      restrictedContext.crypto.getRandomValues(new Uint8Array(32)),
                      new TextEncoder().encode(JSON.stringify(dataToStore))
                    );
                    dataToStore = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
                  } catch (error) {
                    console.warn('Encryption failed, storing unencrypted:', error);
                  }
                }

                try {
                  const storage = scope === 'session' ? sessionStorage : localStorage;
                  
                  if (namespace) {
                    // Custom namespace - store directly
                    storage.setItem(fullKey, JSON.stringify(dataToStore));
                  } else {
                    // App-specific storage - use Redux action for consistency
                    process?.store?.dispatch(
                      process?.setSessionInfoPartial({
                        id: fullKey,
                        key: key,
                        payload: value,
                        operationType: 'set',
                      })
                    );
                  }
                  
                  return true;
                } catch (error) {
                  console.error('Failed to store data:', error);
                  return false;
                }
              },

              // Get item from localStorage
              get: (key, options = {}) => {
                const { 
                  scope = 'local', 
                  namespace = null, // null means use appId + sessionInfo pattern
                  defaultValue = null,
                  decrypt = false 
                } = options;

                // Use appId + sessionInfo pattern by default, or custom namespace if provided
                const fullKey = namespace 
                  ? `${namespace}:${key}`
                  : `${appId}-sessionInfo`;
                
                const storage = scope === 'session' ? sessionStorage : localStorage;

                try {
                  const stored = storage.getItem(fullKey);
                  if (stored === null) return defaultValue;

                  let data = JSON.parse(stored);

                  // Check TTL if metadata exists
                  if (data.metadata && data.metadata.expiresAt) {
                    if (Date.now() > data.metadata.expiresAt) {
                      // Data expired, remove it
                      storage.removeItem(fullKey);
                      return defaultValue;
                    }
                    // Return just the value, not the metadata
                    data = data.value;
                  }

                  // Decrypt data if it was encrypted
                  if (decrypt && typeof data === 'string') {
                    try {
                      const decrypted = restrictedContext.crypto.subtle.decrypt(
                        'AES-GCM',
                        restrictedContext.crypto.getRandomValues(new Uint8Array(32)),
                        new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)))
                      );
                      data = JSON.parse(new TextDecoder().decode(decrypted));
                    } catch (error) {
                      console.warn('Decryption failed, returning encrypted data:', error);
                    }
                  }

                  return data;
                } catch (error) {
                  console.error('Failed to retrieve data:', error);
                  return defaultValue;
                }
              },

              // Delete item from localStorage
              delete: (key, options = {}) => {
                const { scope = 'local', namespace = null } = options;
                
                // Use appId + sessionInfo pattern by default, or custom namespace if provided
                const fullKey = namespace 
                  ? `${namespace}:${key}`
                  : `${appId}-sessionInfo`;
                
                const storage = scope === 'local' ? localStorage : sessionStorage;

                try {
                  if (namespace) {
                    // Custom namespace - delete directly
                    storage.removeItem(fullKey);
                  } else {
                    // App-specific storage - use Redux action for consistency
                    process?.store?.dispatch(
                      process?.setSessionInfoPartial({
                        id: fullKey,
                        key: key,
                        payload: null,
                        operationType: 'delete',
                      })
                    );
                  }
                  return true;
                } catch (error) {
                  console.error('Failed to delete data:', error);
                  return false;
                }
              },

              // Check if item exists
              has: (key, options = {}) => {
                const { scope = 'local', namespace = null } = options;
                
                // Use appId + sessionInfo pattern by default, or custom namespace if provided
                const fullKey = namespace 
                  ? `${namespace}:${key}`
                  : `${appId}-sessionInfo`;
                
                const storage = scope === 'local' ? localStorage : sessionStorage;

                try {
                  if (namespace) {
                    // Custom namespace - check directly
                    return storage.getItem(fullKey) !== null;
                  } else {
                    // App-specific storage - check via Redux state
                    const appStorage = restrictedContext.storage.getAppStorage(appId);
                    return appStorage && appStorage[key] !== undefined;
                  }
                } catch (error) {
                  console.error('Failed to check data existence:', error);
                  return false;
                }
              },

              // Get all keys with a specific namespace
              getKeys: (namespace = null, scope = 'local') => {
                const storage = scope === 'local' ? localStorage : sessionStorage;
                const keys = [];

                try {
                  if (namespace) {
                    // Custom namespace - get keys with prefix
                    for (let i = 0; i < storage.length; i++) {
                      const key = storage.key(i);
                      if (key && key.startsWith(`${namespace}:`)) {
                        keys.push(key.replace(`${namespace}:`, ''));
                      }
                    }
                  } else {
                    // App-specific storage - get keys from app storage
                    const appStorage = restrictedContext.storage.getAppStorage(appId);
                    if (appStorage && typeof appStorage === 'object') {
                      keys.push(...Object.keys(appStorage));
                    }
                  }
                  return keys;
                } catch (error) {
                  console.error('Failed to get keys:', error);
                  return [];
                }
              },

              // Get all items with a specific namespace
              getAll: (namespace = null, scope = 'local') => {
                const keys = restrictedContext.storage.getKeys(namespace, scope);
                const result = {};

                keys.forEach(key => {
                  const value = restrictedContext.storage.get(key, { namespace, scope });
                  if (value !== null) {
                    result[key] = value;
                  }
                });

                return result;
              },

              // Clear all items with a specific namespace
              clear: (namespace = 'app', scope = 'local') => {
                const keys = restrictedContext.storage.getKeys(namespace, scope);
                let deletedCount = 0;

                keys.forEach(key => {
                  if (restrictedContext.storage.delete(key, { namespace, scope })) {
                    deletedCount++;
                  }
                });

                return deletedCount;
              },

              // Set multiple items at once
              setBulk: (items, options = {}) => {
                const { scope = 'local', namespace = 'app' } = options;
                const results = [];

                items.forEach(({ key, value, ttl, encrypt }) => {
                  const success = restrictedContext.storage.set(key, value, {
                    scope,
                    namespace,
                    ttl,
                    encrypt
                  });
                  results.push({ key, success });
                });

                return results;
              },

              // Get multiple items at once
              getBulk: (keys, options = {}) => {
                const { scope = 'local', namespace = 'app' } = options;
                const result = {};

                keys.forEach(key => {
                  result[key] = restrictedContext.storage.get(key, { scope, namespace });
                });

                return result;
              },

              // Set item with automatic expiration
              setWithExpiry: (key, value, ttl, options = {}) => {
                return restrictedContext.storage.set(key, value, { ...options, ttl });
              },

              // Set item that expires at a specific time
              setUntil: (key, value, expiryTime, options = {}) => {
                const ttl = expiryTime - Date.now();
                if (ttl <= 0) {
                  console.warn('Expiry time is in the past');
                  return false;
                }
                return restrictedContext.storage.set(key, value, { ...options, ttl });
              },

              // Get item and refresh its TTL
              getAndRefresh: (key, newTtl, options = {}) => {
                const value = restrictedContext.storage.get(key, options);
                if (value !== null) {
                  restrictedContext.storage.set(key, value, { ...options, ttl: newTtl });
                }
                return value;
              },

              // Get storage usage statistics
              getStats: (namespace = 'app') => {
                const localKeys = restrictedContext.storage.getKeys(namespace, 'local');
                const sessionKeys = restrictedContext.storage.getKeys(namespace, 'session');
                
                let localSize = 0;
                let sessionSize = 0;

                try {
                  localKeys.forEach(key => {
                    const fullKey = `${namespace}:${key}`;
                    const item = localStorage.getItem(fullKey);
                    if (item) localSize += item.length;
                  });

                  sessionKeys.forEach(key => {
                    const fullKey = `${namespace}:${key}`;
                    const item = sessionStorage.getItem(fullKey);
                    if (item) sessionSize += item.length;
                  });
                } catch (error) {
                  console.error('Failed to calculate storage size:', error);
                }

                return {
                  local: {
                    keys: localKeys.length,
                    size: localSize,
                    sizeKB: Math.round(localSize / 1024 * 100) / 100
                  },
                  session: {
                    keys: sessionKeys.length,
                    size: sessionSize,
                    sizeKB: Math.round(sessionSize / 1024 * 100) / 100
                  },
                  total: {
                    keys: localKeys.length + sessionKeys.length,
                    size: localSize + sessionSize,
                    sizeKB: Math.round((localSize + sessionSize) / 1024 * 100) / 100
                  }
                };
              },

              // Migrate data between storage types
              migrate: (fromScope, toScope, namespace = 'app', options = {}) => {
                const { overwrite = false, deleteSource = false } = options;
                const sourceKeys = restrictedContext.storage.getKeys(namespace, fromScope);
                const migratedCount = 0;

                sourceKeys.forEach(key => {
                  const value = restrictedContext.storage.get(key, { namespace, scope: fromScope });
                  if (value !== null) {
                    const success = restrictedContext.storage.set(key, value, { namespace, scope: toScope });
                    if (success && deleteSource) {
                      restrictedContext.storage.delete(key, { namespace, scope: fromScope });
                    }
                    if (success) migratedCount++;
                  }
                });

                return migratedCount;
              }
            },

            // LAYOUT AND POSITIONING UTILITIES
            layout: {
              // Get element bounds and position
              getBounds: (elementId, viewId) => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element) throw new Error('Element not found');

                return {
                  x: element.x || 0,
                  y: element.y || 0,
                  w: element.w || 4,
                  h: element.h || 4,
                  minW: element.minW,
                  minH: element.minH,
                  maxW: element.maxW,
                  maxH: element.maxH
                };
              },

              // Update element position and size
              updateBounds: (elementId, bounds, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const view = restrictedContext.views.getById(targetViewId);
                if (!view) throw new Error('Target view not found');

                const updatedLayout = view.layout.map(el => 
                  el.i === elementId 
                    ? { ...el, ...bounds }
                    : el
                );

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return restrictedContext.elements.get(elementId, targetViewId);
              },

              // Move element to specific position
              move: (elementId, x, y, viewId) => {
                return restrictedContext.layout.updateBounds(elementId, { x, y }, viewId);
              },

              // Resize element
              resize: (elementId, w, h, viewId) => {
                return restrictedContext.layout.updateBounds(elementId, { w, h }, viewId);
              },

              // Bring element to front/back
              bringToFront: (elementId, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const view = restrictedContext.views.getById(targetViewId);
                if (!view) throw new Error('Target view not found');

                const element = restrictedContext.elements.get(elementId, targetViewId);
                if (!element) throw new Error('Element not found');

                const otherElements = view.layout.filter(el => el.i !== elementId);
                const updatedLayout = [...otherElements, element];

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return true;
              },

              sendToBack: (elementId, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const view = restrictedContext.views.getById(targetViewId);
                if (!view) throw new Error('Target view not found');

                const element = restrictedContext.elements.get(elementId, targetViewId);
                if (!element) throw new Error('Element not found');

                const otherElements = view.layout.filter(el => el.i !== elementId);
                const updatedLayout = [element, ...otherElements];

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return true;
              },

              // Auto-arrange elements
              autoArrange: (viewId, options = {}) => {
                const elements = restrictedContext.elements.getAll(viewId);
                if (!elements.length) return false;

                const {
                  columns = 4,
                  padding = 1,
                  startX = 0,
                  startY = 0,
                  itemWidth = 4,
                  itemHeight = 4
                } = options;

                const updatedElements = elements.map((el, index) => ({
                  ...el,
                  x: startX + (index % columns) * (itemWidth + padding),
                  y: startY + Math.floor(index / columns) * (itemHeight + padding),
                  w: itemWidth,
                  h: itemHeight
                }));

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: viewId || process?.pageId, layout: updatedElements }
                });

                return true;
              }
            },

            // GROUP MANAGEMENT UTILITIES
            groups: {
              // Create element group
              create: (elementIds, groupConfig = {}, viewId) => {
                const groupId = groupConfig.id || `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const targetViewId = viewId || process?.pageId;

                // Get all elements to group
                const elements = elementIds.map(id => restrictedContext.elements.get(id, targetViewId)).filter(Boolean);
                if (elements.length === 0) throw new Error('No valid elements found');

                // Calculate group bounds
                const minX = Math.min(...elements.map(el => el.x));
                const minY = Math.min(...elements.map(el => el.y));
                const maxX = Math.max(...elements.map(el => el.x + el.w));
                const maxY = Math.max(...elements.map(el => el.y + el.h));

                // Create group container element
                const groupElement = {
                  i: groupId,
                  x: minX,
                  y: minY,
                  w: maxX - minX,
                  h: maxY - minY,
                  type: 'group',
                  configuration: {
                    isGroup: true,
                    groupName: groupConfig.name || 'Element Group',
                    ...groupConfig
                  },
                  children: elementIds,
                  parentId: groupConfig.parentId || null
                };

                // Update children to have group as parent and adjust positions
                const updatedElements = elements.map(el => ({
                  ...el,
                  parentId: groupId,
                  x: el.x - minX, // Relative to group
                  y: el.y - minY
                }));

                // Add group and update layout
                const view = restrictedContext.views.getById(targetViewId);
                const otherElements = view.layout.filter(el => !elementIds.includes(el.i));
                const updatedLayout = [...otherElements, groupElement, ...updatedElements];

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return groupElement;
              },

              // Ungroup elements
              ungroup: (groupId, viewId) => {
                const targetViewId = viewId || process?.pageId;
                const group = restrictedContext.elements.get(groupId, targetViewId);
                if (!group || !group.configuration?.isGroup) {
                  throw new Error('Group not found');
                }

                const view = restrictedContext.views.getById(targetViewId);
                const children = view.layout.filter(el => el.parentId === groupId);

                // Update children to have no parent and absolute positions
                const updatedChildren = children.map(child => ({
                  ...child,
                  parentId: group.parentId || null,
                  x: group.x + child.x, // Convert back to absolute position
                  y: group.y + child.y
                }));

                // Remove group, keep children with updated positions
                const updatedLayout = [
                  ...view.layout.filter(el => el.i !== groupId && el.parentId !== groupId),
                  ...updatedChildren
                ];

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return updatedChildren;
              },

              // Get all groups in view
              getAll: (viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(el => el.configuration?.isGroup);
              },

              // Get elements in group
              getMembers: (groupId, viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(el => el.parentId === groupId);
              }
            },

            // ADVANCED UTILITIES
            utils: {
              // Generate unique ID
              generateId: (prefix = 'item') => {
                return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              },

              // Clone deep object
              cloneDeep: (obj) => _.cloneDeep(obj),

              // Safe path operations
              safeGet: (obj, path, defaultValue) => _.get(obj, path, defaultValue),
              safeSet: (obj, path, value) => _.set(obj, path, value),

              // Find elements by CSS selector (in DOM)
              findInDOM: (selector) => {
                return Array.from(document.querySelectorAll(selector));
              },

              // Get element's computed styles (from DOM)
              getComputedStyles: (elementId) => {
                const domElement = document.getElementById(elementId);
                if (!domElement) return null;
                
                const computed = window.getComputedStyle(domElement);
                const styles = {};
                for (let i = 0; i < computed.length; i++) {
                  const prop = computed[i];
                  styles[prop] = computed.getPropertyValue(prop);
                }
                return styles;
              },

              // Validate element configuration
              validateElement: (element) => {
                const errors = [];
                
                if (!element.i) errors.push('Element ID is required');
                if (element.x !== undefined && isNaN(element.x)) errors.push('X position must be a number');
                if (element.y !== undefined && isNaN(element.y)) errors.push('Y position must be a number');
                if (element.w !== undefined && isNaN(element.w)) errors.push('Width must be a number');
                if (element.h !== undefined && isNaN(element.h)) errors.push('Height must be a number');

                return {
                  isValid: errors.length === 0,
                  errors
                };
              },

              // Get element dependencies (what this element references)
              getDependencies: (elementId, viewId) => {
                const element = restrictedContext.elements.get(elementId, viewId);
                if (!element) return [];

                const dependencies = [];
                const config = element.configuration || {};

                // Look for state references
                const stateRefs = JSON.stringify(config).match(/\{\{([^}]+)\}\}/g) || [];
                stateRefs.forEach(ref => {
                  const key = ref.replace(/\{\{|\}\}/g, '').trim();
                  dependencies.push({ type: 'state', key, reference: ref });
                });

                // Look for element references
                if (element.parentId) {
                  dependencies.push({ type: 'parent', elementId: element.parentId });
                }

                if (element.children?.length) {
                  element.children.forEach(childId => {
                    dependencies.push({ type: 'child', elementId: childId });
                  });
                }

                return dependencies;
              },

              // Find all elements that reference this element or state
              findReferences: (elementId, viewId) => {
                const allElements = restrictedContext.elements.getAll(viewId);
                const references = [];

                allElements.forEach(el => {
                  // Check if element is a child
                  if (el.parentId === elementId) {
                    references.push({ type: 'child', element: el });
                  }

                  // Check if element references this one in configuration
                  const configStr = JSON.stringify(el.configuration || {});
                  if (configStr.includes(elementId)) {
                    references.push({ type: 'config_reference', element: el });
                  }
                });

                return references;
              },

              // Export view/elements as JSON
              export: (viewId) => {
                const view = restrictedContext.views.getById(viewId);
                if (!view) throw new Error('View not found');

                return {
                  view: _.cloneDeep(view),
                  elements: _.cloneDeep(view.layout || []),
                  metadata: {
                    exportedAt: new Date().toISOString(),
                    exportedBy: 'executeCode',
                    viewId: viewId
                  }
                };
              },

              // Import elements to view
              import: (data, viewId, options = {}) => {
                const targetViewId = viewId || process?.pageId;
                const { 
                  overwrite = false, 
                  mergeElements = true,
                  generateNewIds = true,
                  positionOffset = { x: 0, y: 0 }
                } = options;

                if (!data.elements || !Array.isArray(data.elements)) {
                  throw new Error('Invalid import data: elements array required');
                }

                let importedElements = _.cloneDeep(data.elements);

                // Generate new IDs if requested
                if (generateNewIds) {
                  const idMap = {};
                  importedElements.forEach(el => {
                    const newId = restrictedContext.utils.generateId('imported');
                    idMap[el.i] = newId;
                    el.i = newId;
                  });

                  // Update parent-child references
                  importedElements.forEach(el => {
                    if (el.parentId && idMap[el.parentId]) {
                      el.parentId = idMap[el.parentId];
                    }
                    if (el.children?.length) {
                      el.children = el.children.map(childId => idMap[childId] || childId);
                    }
                  });
                }

                // Apply position offset
                if (positionOffset.x !== 0 || positionOffset.y !== 0) {
                  importedElements.forEach(el => {
                    el.x = (el.x || 0) + positionOffset.x;
                    el.y = (el.y || 0) + positionOffset.y;
                  });
                }

                const view = restrictedContext.views.getById(targetViewId);
                let updatedLayout;

                if (overwrite) {
                  updatedLayout = importedElements;
                } else if (mergeElements) {
                  updatedLayout = [...view.layout, ...importedElements];
                } else {
                  // Replace elements with same IDs
                  const existingIds = importedElements.map(el => el.i);
                  const filteredLayout = view.layout.filter(el => !existingIds.includes(el.i));
                  updatedLayout = [...filteredLayout, ...importedElements];
                }

                process?.store?.dispatch({
                  type: 'app/updateCurrentAppLayout',
                  payload: { tab: targetViewId, layout: updatedLayout }
                });

                return importedElements;
              },

              // Get layout grid information
              getGridInfo: (viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                if (!elements.length) return { cols: 12, rows: 0, occupied: [] };

                const maxX = Math.max(...elements.map(el => el.x + el.w));
                const maxY = Math.max(...elements.map(el => el.y + el.h));
                
                const occupied = [];
                elements.forEach(el => {
                  for (let x = el.x; x < el.x + el.w; x++) {
                    for (let y = el.y; y < el.y + el.h; y++) {
                      occupied.push({ x, y, elementId: el.i });
                    }
                  }
                });

                return {
                  cols: Math.max(maxX, 12),
                  rows: maxY,
                  occupied,
                  totalElements: elements.length
                };
              },

              // Find available space in grid
              findAvailableSpace: (width, height, viewId) => {
                const gridInfo = restrictedContext.layout.getGridInfo(viewId);
                const { occupied, cols } = gridInfo;

                for (let y = 0; y < 100; y++) { // Limit search to reasonable bounds
                  for (let x = 0; x <= cols - width; x++) {
                    let canPlace = true;
                    
                    // Check if space is available
                    for (let checkX = x; checkX < x + width && canPlace; checkX++) {
                      for (let checkY = y; checkY < y + height && canPlace; checkY++) {
                        if (occupied.some(pos => pos.x === checkX && pos.y === checkY)) {
                          canPlace = false;
                        }
                      }
                    }

                    if (canPlace) {
                      return { x, y, w: width, h: height };
                    }
                  }
                }

                // If no space found, place at end
                const maxY = Math.max(0, ...occupied.map(pos => pos.y));
                return { x: 0, y: maxY + 1, w: width, h: height };
              }
            },

            // SELECTION AND FILTERING UTILITIES
            select: {
              // Select elements by various criteria
              byType: (type, viewId) => restrictedContext.elements.findByType(type, viewId),
              
              byParent: (parentId, viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(el => el.parentId === parentId);
              },

              byRegex: (pattern, property = 'i', viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                const regex = new RegExp(pattern);
                return elements.filter(el => {
                  const value = _.get(el, property, '');
                  return regex.test(String(value));
                });
              },

              byPosition: (bounds, viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(el => {
                  return el.x >= bounds.minX && el.x <= bounds.maxX &&
                         el.y >= bounds.minY && el.y <= bounds.maxY;
                });
              },

              bySize: (sizeFilter, viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(el => {
                  const area = el.w * el.h;
                  if (sizeFilter.minArea !== undefined && area < sizeFilter.minArea) return false;
                  if (sizeFilter.maxArea !== undefined && area > sizeFilter.maxArea) return false;
                  if (sizeFilter.minWidth !== undefined && el.w < sizeFilter.minWidth) return false;
                  if (sizeFilter.maxWidth !== undefined && el.w > sizeFilter.maxWidth) return false;
                  if (sizeFilter.minHeight !== undefined && el.h < sizeFilter.minHeight) return false;
                  if (sizeFilter.maxHeight !== undefined && el.h > sizeFilter.maxHeight) return false;
                  return true;
                });
              },

              // Advanced query selection
              query: (queryFn, viewId) => {
                const elements = restrictedContext.elements.getAll(viewId);
                return elements.filter(queryFn);
              }
            },

            // BATCH OPERATIONS UTILITIES
            batch: {
              // Apply operation to multiple elements
              updateElements: (elementIds, updates, viewId) => {
                const results = [];
                elementIds.forEach(id => {
                  try {
                    const result = restrictedContext.elements.updateConfig(id, updates, viewId);
                    results.push({ success: true, elementId: id, result });
                  } catch (error) {
                    results.push({ success: false, elementId: id, error: error.message });
                  }
                });
                return results;
              },

              // Apply styles to multiple elements
              updateStyles: (elementIds, styleUpdates, viewId) => {
                const results = [];
                elementIds.forEach(id => {
                  try {
                    const result = restrictedContext.elements.updateStyle(id, styleUpdates, viewId);
                    results.push({ success: true, elementId: id, result });
                  } catch (error) {
                    results.push({ success: false, elementId: id, error: error.message });
                  }
                });
                return results;
              },

              // Move multiple elements
              moveElements: (elementIds, offset, viewId) => {
                const results = [];
                elementIds.forEach(id => {
                  try {
                    const element = restrictedContext.elements.get(id, viewId);
                    if (element) {
                      const newPos = {
                        x: element.x + (offset.x || 0),
                        y: element.y + (offset.y || 0)
                      };
                      const result = restrictedContext.layout.move(id, newPos.x, newPos.y, viewId);
                      results.push({ success: true, elementId: id, result });
                    }
                  } catch (error) {
                    results.push({ success: false, elementId: id, error: error.message });
                  }
                });
                return results;
              },

              // Delete multiple elements
              deleteElements: (elementIds, viewId) => {
                return restrictedContext.elements.deleteMultiple(elementIds, viewId);
              }
            },

            // UTILITY SHORTCUTS FOR COMMON OPERATIONS
            shortcuts: {
              // Quick element creation with common types
              addButton: (text, position = {}, viewId) => {
                return restrictedContext.elements.add({
                  type: 'button',
                  configuration: {
                    text: text,
                    variant: 'primary'
                  },
                  ...position
                }, viewId);
              },

              addText: (content, position = {}, viewId) => {
                return restrictedContext.elements.add({
                  type: 'text',
                  configuration: {
                    text: content
                  },
                  ...position
                }, viewId);
              },

              addInput: (placeholder, position = {}, viewId) => {
                return restrictedContext.elements.add({
                  type: 'input',
                  configuration: {
                    placeholder: placeholder
                  },
                  ...position
                }, viewId);
              },

              addContainer: (position = {}, viewId) => {
                return restrictedContext.elements.add({
                  type: 'div',
                  configuration: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column'
                    }
                  },
                  ...position
                }, viewId);
              },

              // Quick state operations
              setGlobalState: (key, value) => restrictedContext.state.set(`global.${key}`, value),
              getGlobalState: (key, defaultValue) => restrictedContext.state.get(`global.${key}`, defaultValue),
              
              setElementState: (elementId, key, value) => {
                const fullKey = `${process?.pageId}.${elementId}.${key}`;
                return restrictedContext.state.set(fullKey, value);
              },
              
              getElementState: (elementId, key, defaultValue) => {
                const fullKey = `${process?.pageId}.${elementId}.${key}`;
                return restrictedContext.state.get(fullKey, defaultValue);
              },

              // Enhanced navigation utilities
              navigateToView: (viewId, queryParams = {}, options = {}) => {
                try {
                  const { setState = {}, replace = false, external = false, preserveParams = true } = options;
                  
                  // Validate viewId input
                  if (!viewId || typeof viewId !== 'string') {
                    throw new Error('Invalid viewId provided');
                  }
                  
                  // Set state before navigation if specified
                  if (Object.keys(setState).length > 0) {
                    Object.entries(setState).forEach(([key, value]) => {
                      restrictedContext.state.set(key, value);
                    });
                  }
                  
                  // Build base URL - ensure proper formatting
                  let baseUrl;
                  if (import.meta.env.VITE_ISDEPLOYED) {
                    baseUrl = `/${viewId}`;
                  } else {
                    // Ensure appId is valid
                    if (!appId) {
                      throw new Error('Application ID is required for navigation');
                    }
                    baseUrl = `/applications/${appId}/views/${viewId}`;
                  }
                  
                  // Handle query parameters
                  let finalUrl = baseUrl;
                  if (Object.keys(queryParams).length > 0) {
                    const params = new URLSearchParams();
                    Object.entries(queryParams).forEach(([key, value]) => {
                      if (value !== null && value !== undefined) {
                        params.append(key, String(value));
                      }
                    });
                    finalUrl += `?${params.toString()}`;
                  }
                  
                  // Navigate with improved error handling
                  if (external) {
                    window.open(finalUrl, '_blank');
                  } else {
                    // Use setTimeout to prevent race conditions and ensure React Router is ready
                    setTimeout(() => {
                      try {
                        navigate(finalUrl, { replace });
                      } catch (navError) {
                        console.error('React Router navigation failed, falling back to window location:', navError);
                        // Fallback to window.location for problematic URLs
                        window.location.href = finalUrl;
                      }
                    }, 0);
                  }
                  
                  return { success: true, url: finalUrl };
                } catch (error) {
                  console.error('Navigation failed:', error);
                  return { success: false, error: error.message };
                }
              },

              navigateToPath: (path, queryParams = {}, options = {}) => {
                try {
                  const { setState = {}, replace = false, external = false } = options;
                  
                  // Set state before navigation if specified
                  if (Object.keys(setState).length > 0) {
                    Object.entries(setState).forEach(([key, value]) => {
                      restrictedContext.state.set(key, value);
                    });
                  }
                  
                  // Build final URL
                  let finalUrl = path;
                  if (Object.keys(queryParams).length > 0) {
                    const params = new URLSearchParams();
                    Object.entries(queryParams).forEach(([key, value]) => {
                      if (value !== null && value !== undefined) {
                        params.append(key, String(value));
                      }
                    });
                    finalUrl += `?${params.toString()}`;
                  }
                  
                  // Navigate
                  if (external) {
                    window.open(finalUrl, '_blank');
                  } else {
                    navigate(finalUrl, { replace });
                  }
                  
                  return { success: true, url: finalUrl };
                } catch (error) {
                  console.error('Navigation failed:', error);
                  return { success: false, error: error.message };
                }
              },

              // URL parameter management
              getUrlParams: () => {
                try {
                  const params = new URLSearchParams(window.location.search);
                  const result = {};
                  for (const [key, value] of params) {
                    result[key] = value;
                  }
                  return result;
                } catch (error) {
                  console.error('Failed to get URL params:', error);
                  return {};
                }
              },

              getUrlParam: (key, defaultValue = null) => {
                try {
                  const params = new URLSearchParams(window.location.search);
                  return params.get(key) || defaultValue;
                } catch (error) {
                  console.error('Failed to get URL param:', error);
                  return defaultValue;
                }
              },

              setUrlParams: (params, options = {}) => {
                try {
                  const { replace = false, merge = true, clearOthers = false } = options;
                  
                  const currentParams = new URLSearchParams(window.location.search);
                  
                  if (clearOthers) {
                    currentParams.clear();
                  }
                  
                  Object.entries(params).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                      currentParams.set(key, String(value));
                    } else {
                      currentParams.delete(key);
                    }
                  });
                  
                  const newUrl = `${window.location.pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
                  
                  if (replace) {
                    window.history.replaceState({}, '', newUrl);
                  } else {
                    window.history.pushState({}, '', newUrl);
                  }
                  
                  return { success: true, url: newUrl };
                } catch (error) {
                  console.error('Failed to set URL params:', error);
                  return { success: false, error: error.message };
                }
              },

              removeUrlParams: (keys, options = {}) => {
                try {
                  const { replace = false } = options;
                  const keyArray = Array.isArray(keys) ? keys : [keys];
                  
                  const currentParams = new URLSearchParams(window.location.search);
                  
                  keyArray.forEach(key => {
                    currentParams.delete(key);
                  });
                  
                  const newUrl = `${window.location.pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
                  
                  if (replace) {
                    window.history.replaceState({}, '', newUrl);
                  } else {
                    window.history.pushState({}, '', newUrl);
                  }
                  
                  return { success: true, url: newUrl };
                } catch (error) {
                  console.error('Failed to remove URL params:', error);
                  return { success: false, error: error.message };
                }
              },

              clearUrlParams: (options = {}) => {
                try {
                  const { replace = false } = options;
                  const newUrl = window.location.pathname;
                  
                  if (replace) {
                    window.history.replaceState({}, '', newUrl);
                  } else {
                    window.history.pushState({}, '', newUrl);
                  }
                  
                  return { success: true, url: newUrl };
                } catch (error) {
                  console.error('Failed to clear URL params:', error);
                  return { success: false, error: error.message };
                }
              },

              // Navigation state information
              getCurrentView: () => {
                try {
                  const pathSegments = window.location.pathname.split('/');
                  if (import.meta.env.VITE_ISDEPLOYED) {
                    return pathSegments[1] || null;
                  } else {
                    const viewsIndex = pathSegments.indexOf('views');
                    return viewsIndex !== -1 ? pathSegments[viewsIndex + 1] : null;
                  }
                } catch (error) {
                  console.error('Failed to get current view:', error);
                  return null;
                }
              },

              getCurrentPath: () => {
                try {
                  return window.location.pathname + window.location.search;
                } catch (error) {
                  console.error('Failed to get current path:', error);
                  return '';
                }
              },

              getNavigationHistory: () => {
                try {
                  return {
                    currentPath: window.location.pathname,
                    currentSearch: window.location.search,
                    currentHash: window.location.hash,
                    referrer: document.referrer,
                    timestamp: Date.now()
                  };
                } catch (error) {
                  console.error('Failed to get navigation history:', error);
                  return {};
                }
              },

              // Theme management utilities
              enableDarkMode: () => {
                try {
                  const root = document.documentElement;
                  root.classList.add('dark');
                  
                  // Also add data attribute for compatibility
                  root.setAttribute('data-theme', 'dark');
                  
                  // Update state
                  restrictedContext.state.set('theme.mode', 'dark');
                  restrictedContext.state.set('theme.lastUpdated', Date.now());
                  
                  // Store preference
                  restrictedContext.storage.set('theme.mode', 'dark', { 
                    namespace: 'ui',
                    scope: 'local'
                  });
                  
                  return { success: true, mode: 'dark' };
                } catch (error) {
                  console.error('Failed to enable dark mode:', error);
                  return { success: false, error: error.message };
                }
              },

              disableDarkMode: () => {
                try {
                  const root = document.documentElement;
                  root.classList.remove('dark');
                  
                  // Remove data attribute
                  root.removeAttribute('data-theme');
                  
                  // Update state
                  restrictedContext.state.set('theme.mode', 'light');
                  restrictedContext.state.set('theme.lastUpdated', Date.now());
                  
                  // Store preference
                  restrictedContext.storage.set('theme.mode', 'light', { 
                    namespace: 'ui',
                    scope: 'local'
                  });
                  
                  return { success: true, mode: 'light' };
                } catch (error) {
                  console.error('Failed to disable dark mode:', error);
                  return { success: false, error: error.message };
                }
              },

              toggleDarkMode: () => {
                try {
                  const root = document.documentElement;
                  const isDark = root.classList.contains('dark');
                  
                  if (isDark) {
                    return restrictedContext.shortcuts.disableDarkMode();
                  } else {
                    return restrictedContext.shortcuts.enableDarkMode();
                  }
                } catch (error) {
                  console.error('Failed to toggle dark mode:', error);
                  return { success: false, error: error.message };
                }
              },

              getThemeMode: () => {
                try {
                  const root = document.documentElement;
                  const isDark = root.classList.contains('dark');
                  
                  return {
                    mode: isDark ? 'dark' : 'light',
                    hasDarkClass: isDark,
                    hasDataAttribute: root.hasAttribute('data-theme'),
                    dataThemeValue: root.getAttribute('data-theme')
                  };
                } catch (error) {
                  console.error('Failed to get theme mode:', error);
                  return { mode: 'unknown', error: error.message };
                }
              },

              setThemeMode: (mode) => {
                try {
                  if (mode === 'dark') {
                    return restrictedContext.shortcuts.enableDarkMode();
                  } else if (mode === 'light') {
                    return restrictedContext.shortcuts.disableDarkMode();
                  } else if (mode === 'auto') {
                    // Auto mode - follow system preference
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    return restrictedContext.shortcuts.setThemeMode(prefersDark ? 'dark' : 'light');
                  } else {
                    throw new Error(`Invalid theme mode: ${mode}. Use 'dark', 'light', or 'auto'`);
                  }
                } catch (error) {
                  console.error('Failed to set theme mode:', error);
                  return { success: false, error: error.message };
                }
              },

              watchSystemTheme: (callback) => {
                try {
                  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                  
                  const handleChange = (e) => {
                    const newMode = e.matches ? 'dark' : 'light';
                    const result = restrictedContext.shortcuts.setThemeMode(newMode);
                    
                    if (typeof callback === 'function') {
                      callback(newMode, result);
                    }
                  };
                  
                  // Add listener
                  mediaQuery.addEventListener('change', handleChange);
                  
                  // Store listener reference for cleanup
                  const listenerId = `theme-listener-${Date.now()}`;
                  restrictedContext.state.set(`theme.listeners.${listenerId}`, {
                    mediaQuery,
                    handleChange,
                    timestamp: Date.now()
                  });
                  
                  return { 
                    success: true, 
                    listenerId,
                    currentMode: mediaQuery.matches ? 'dark' : 'light'
                  };
                } catch (error) {
                  console.error('Failed to watch system theme:', error);
                  return { success: false, error: error.message };
                }
              },

              removeThemeListener: (listenerId) => {
                try {
                  const listener = restrictedContext.state.get(`theme.listeners.${listenerId}`);
                  
                  if (listener && listener.mediaQuery) {
                    listener.mediaQuery.removeEventListener('change', listener.handleChange);
                    
                    // Remove from state
                    restrictedContext.state.delete(`theme.listeners.${listenerId}`);
                    
                    return { success: true, removed: listenerId };
                  } else {
                    throw new Error(`Theme listener ${listenerId} not found`);
                  }
                } catch (error) {
                  console.error('Failed to remove theme listener:', error);
                  return { success: false, error: error.message };
                }
              },

              // CSS Class Name Management Utilities
              addClass: (elementId, className, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  // Add new class if not already present
                  if (!classArray.includes(className)) {
                    classArray.push(className);
                  }
                  
                  // Update element with new classes
                  const newClassName = classArray.join(' ').trim();
                  restrictedContext.elements.updateStyle(elementId, { className: newClassName }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassName);
                  
                  return { success: true, className: newClassName, added: className };
                } catch (error) {
                  console.error('Failed to add class:', error);
                  return { success: false, error: error.message };
                }
              },

              removeClass: (elementId, className, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  // Remove specified class
                  const filteredClasses = classArray.filter(cls => cls !== className);
                  const newClassName = filteredClasses.join(' ').trim();
                  
                  // Update element
                  restrictedContext.elements.updateStyle(elementId, { className: newClassName }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassName);
                  
                  return { success: true, className: newClassName, removed: className };
                } catch (error) {
                  console.error('Failed to remove class:', error);
                  return { success: false, error: error.message };
                }
              },

              toggleClass: (elementId, className, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  let newClassName, action;
                  
                  if (classArray.includes(className)) {
                    // Remove class
                    const filteredClasses = classArray.filter(cls => cls !== className);
                    newClassName = filteredClasses.join(' ').trim();
                    action = 'removed';
                  } else {
                    // Add class
                    classArray.push(className);
                    newClassName = classArray.join(' ').trim();
                    action = 'added';
                  }
                  
                  // Update element
                  restrictedContext.elements.updateStyle(elementId, { className: newClassName }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassName);
                  
                  return { success: true, className: newClassName, action, className: className };
                } catch (error) {
                  console.error('Failed to toggle class:', error);
                  return { success: false, error: error.message };
                }
              },

              replaceClass: (elementId, oldClassName, newClassName, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  // Replace old class with new class
                  const updatedClasses = classArray.map(cls => cls === oldClassName ? newClassName : cls);
                  const newClassNameResult = updatedClasses.join(' ').trim();
                  
                  // Update element
                  restrictedContext.elements.updateStyle(elementId, { className: newClassNameResult }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassNameResult);
                  
                  return { 
                    success: true, 
                    className: newClassNameResult, 
                    replaced: { from: oldClassName, to: newClassName }
                  };
                } catch (error) {
                  console.error('Failed to replace class:', error);
                  return { success: false, error: error.message };
                }
              },

              hasClass: (elementId, className, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  return {
                    success: true,
                    hasClass: classArray.includes(className),
                    className: currentClasses,
                    classArray: classArray
                  };
                } catch (error) {
                  console.error('Failed to check class:', error);
                  return { success: false, error: error.message };
                }
              },

              getClasses: (elementId, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  return {
                    success: true,
                    className: currentClasses,
                    classArray: classArray,
                    count: classArray.length
                  };
                } catch (error) {
                  console.error('Failed to get classes:', error);
                  return { success: false, error: error.message };
                }
              },

              setClasses: (elementId, classNames, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Handle different input types
                  let newClassName;
                  if (Array.isArray(classNames)) {
                    newClassName = classNames.filter(cls => cls.trim()).join(' ').trim();
                  } else if (typeof classNames === 'string') {
                    newClassName = classNames.trim();
                  } else {
                    throw new Error('Class names must be a string or array');
                  }
                  
                  // Update element
                  restrictedContext.elements.updateStyle(elementId, { className: newClassName }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassName);
                  
                  return { 
                    success: true, 
                    className: newClassName,
                    classArray: newClassName ? newClassName.split(' ') : []
                  };
                } catch (error) {
                  console.error('Failed to set classes:', error);
                  return { success: false, error: error.message };
                }
              },

              concatClasses: (elementId, additionalClasses, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const currentArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  // Handle additional classes input
                  let additionalArray = [];
                  if (Array.isArray(additionalClasses)) {
                    additionalArray = additionalClasses.filter(cls => cls.trim());
                  } else if (typeof additionalClasses === 'string') {
                    additionalArray = additionalClasses.split(' ').filter(cls => cls.trim());
                  } else {
                    throw new Error('Additional classes must be a string or array');
                  }
                  
                  // Combine classes and remove duplicates
                  const combinedArray = [...new Set([...currentArray, ...additionalArray])];
                  const newClassName = combinedArray.join(' ').trim();
                  
                  // Update element
                  restrictedContext.elements.updateStyle(elementId, { className: newClassName }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassName);
                  
                  return { 
                    success: true, 
                    className: newClassName,
                    added: additionalArray,
                    total: combinedArray.length
                  };
                } catch (error) {
                  console.error('Failed to concat classes:', error);
                  return { success: false, error: error.message };
                }
              },

              removeTextFromClasses: (elementId, textToRemove, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  // Remove classes containing the specified text
                  const filteredClasses = classArray.filter(cls => !cls.includes(textToRemove));
                  const newClassName = filteredClasses.join(' ').trim();
                  
                  // Update element
                  restrictedContext.elements.updateStyle(elementId, { className: newClassName }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassName);
                  
                  const removedCount = classArray.length - filteredClasses.length;
                  
                  return { 
                    success: true, 
                    className: newClassName,
                    removedCount: removedCount,
                    removedText: textToRemove
                  };
                } catch (error) {
                  console.error('Failed to remove text from classes:', error);
                  return { success: false, error: error.message };
                }
              },

              filterClasses: (elementId, filterFunction, viewId) => {
                try {
                  const targetViewId = viewId || process?.pageId;
                  const element = restrictedContext.elements.get(elementId, targetViewId);
                  
                  if (!element) {
                    throw new Error(`Element ${elementId} not found`);
                  }
                  
                  if (typeof filterFunction !== 'function') {
                    throw new Error('Filter function must be a function');
                  }
                  
                  // Get current classes
                  const currentClasses = element.style?.className || '';
                  const classArray = currentClasses.split(' ').filter(cls => cls.trim());
                  
                  // Apply filter function
                  const filteredClasses = classArray.filter(filterFunction);
                  const newClassName = filteredClasses.join(' ').trim();
                  
                  // Update element
                  restrictedContext.elements.updateStyle(elementId, { className: newClassName }, targetViewId);
                  
                  // Update state
                  restrictedContext.state.set(`${elementId}.className`, newClassName);
                  
                  const removedCount = classArray.length - filteredClasses.length;
                  
                  return { 
                    success: true, 
                    className: newClassName,
                    filteredCount: filteredClasses.length,
                    removedCount: removedCount,
                    originalClasses: classArray
                  };
                } catch (error) {
                  console.error('Failed to filter classes:', error);
                  return { success: false, error: error.message };
                }
              },

              // Dynamic List Rendering Utilities
              renderDynamicList: (options) => {
                try {
                  const {
                    blueprint,
                    targetContainer,
                    data = [],
                    renderType = 'renderInto',
                    mappings = [],
                    defaults = {},
                  } = options;

                  if (!blueprint) {
                    throw new Error('Blueprint is required');
                  }

                  if (!targetContainer && renderType === 'renderInto') {
                    throw new Error('Target container is required for renderInto mode');
                  }

                  // Create process object for renderElementUtil
            
                  // Call the existing renderElementUtil
                  // Note: renderElementUtil needs to be available in this context
                  if (typeof renderElementUtil === 'function') {

            
                    data?.map((item,i)=>{
                      const process1 = {
                        ...process,
                        name: i,
                        currentItem: item,
                        currentIndex: i,
                        compId: process?.compId,
                        propsMapper: {
                          blueprint,
                          targetElement: targetContainer,
                          renderType,
                          mappings,
                          defaults
                        }
                      };
    
                      // message.info('Rendering dynamic list...');
                      renderElementUtil(process1);
                    })
                  
                    return { success: true, blueprint, targetContainer, renderType, dataLength: data.length };
                  } else {
                    // Fallback: store configuration for manual processing
                    const configKey = `renderConfig.${Date.now()}`;
                    restrictedContext.state.set(configKey, { blueprint, targetContainer, renderType, mappings, defaults, data });
                    return { success: true, configKey, message: 'Configuration stored, manual processing required' };
                  }
                } catch (error) {
                  console.error('Failed to render dynamic list:', error);
                  return { success: false, error: error.message };
                }
              },

              // Quick list rendering helpers
              renderList: (blueprint, targetContainer, data, options = {}) => {
                return restrictedContext.shortcuts.renderDynamicList({
                  blueprint,
                  targetContainer,
                  data,
                  renderType: 'renderInto',
                  ...options
                });
              },

              // Manual item rendering utility for custom loops
              renderListItem: (options) => {
                try {
                  const {
                    blueprint,
                    targetContainer,
                    currentItem,
                    currentIndex = 0,
                    renderType = 'renderInto',
                    mappings = [],
                    defaults = {}
                  } = options;

                  if (!blueprint) {
                    throw new Error('Blueprint is required for renderListItem');
                  }

                  if (!targetContainer && renderType === 'renderInto') {
                    throw new Error('Target container is required for renderInto mode');
                  }

                  // Get renderElementUtil from the current process context
                  const renderElementUtil = process?.renderElementUtil;
                  
                  if (typeof renderElementUtil === 'function') {
                    // Create process object for this specific item
                    const itemProcess = {
                      ...process,
                      name: currentIndex,
                      currentItem: currentItem,
                      currentIndex: currentIndex,
                      compId: process?.compId,
                      propsMapper: {
                        blueprint,
                        targetElement: targetContainer,
                        renderType,
                        mappings,
                        defaults
                      }
                    };

                    // Render the item
                    renderElementUtil(itemProcess);
                    
                    return { 
                      success: true, 
                      blueprint, 
                      targetContainer, 
                      renderType, 
                      currentItem, 
                      currentIndex 
                    };
                  } else {
                    // Fallback: store configuration for manual processing
                    const configKey = `renderItemConfig.${Date.now()}.${currentIndex}`;
                    restrictedContext.state.set(configKey, { 
                      blueprint, 
                      targetContainer, 
                      renderType, 
                      mappings, 
                      defaults, 
                      currentItem, 
                      currentIndex 
                    });
                    return { 
                      success: true, 
                      configKey, 
                      message: 'Item configuration stored, manual processing required' 
                    };
                  }
                } catch (error) {
                  console.error('Failed to render list item:', error);
                  return { success: false, error: error.message };
                }
              },

              renderTable: (blueprint, targetContainer, data, options = {}) => {
                return restrictedContext.shortcuts.renderDynamicList({
                  blueprint,
                  targetContainer,
                  data,
                  renderType: 'renderInto',
                  ...options
                });
              },

              renderCards: (blueprint, targetContainer, data, options = {}) => {
                return restrictedContext.shortcuts.renderDynamicList({
                  blueprint,
                  targetContainer,
                  data,
                  renderType: 'renderInto',
                  ...options
                });
              },

              renderForm: (blueprint, targetContainer, data, options = {}) => {
                return restrictedContext.shortcuts.renderDynamicList({
                  blueprint,
                  targetContainer,
                  data,
                  renderType: 'renderInto',
                  ...options
                });
              },

              // HTTP/REST Utilities
              http: {
                // Global configuration
                config: {
                  baseURL: '',
                  timeout: 10000,
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  }
                },

                // Get base URL based on deployment status and environment
                getBaseURL: (environment = 'auto') => {
                  try {
                    const isDeployed = import.meta.env.VITE_ISDEPLOYED;
                    const clientApiUrl = (import.meta as any).env?.VITE_CLIENT_API_URL || '';
                    
                    if (environment === 'auto') {
                      environment = isDeployed ? 'production' : 'development';
                    }
                    
                    if (environment === 'production') {
                      // Production: use VITE_CLIENT_API_URL if available, otherwise empty
                      return clientApiUrl;
                    } else if (environment === 'development') {
                      // Development: use VITE_CLIENT_API_URL if available, otherwise empty
                      return clientApiUrl;
                    } else {
                      // Custom environment
                      return clientApiUrl;
                    }
                  } catch (error) {
                    console.error('Failed to get base URL:', error);
                    return '';
                  }
                },

                // Set base URL based on deployment status
                setDeploymentBaseURL: () => {
                  try {
                    const isDeployed = import.meta.env.VITE_ISDEPLOYED;
                    const clientApiUrl = (import.meta as any).env?.VITE_CLIENT_API_URL || '';
                    
                    // Get current app ID from URL or context
                    let appId = 'development'; // default fallback
                    
                    // Try to get from URL path
                    try {
                      const pathParts = window.location.pathname.split('/');
                      const appIndex = pathParts.indexOf('applications');
                      if (appIndex !== -1 && pathParts[appIndex + 1]) {
                        appId = pathParts[appIndex + 1];
                      }
                    } catch (e) {
                      console.warn('Could not parse app ID from URL, using default:', e);
                    }
                    
                    // Construct the full controller API base URL
                    const controllerApiUrl = `${clientApiUrl}/v1/apps/development/${appId}`;
                    
                    if (isDeployed) {
                      // Production deployment
                      restrictedContext.shortcuts.http.config.baseURL = controllerApiUrl;
                      return { 
                        success: true, 
                        environment: 'production',
                        baseURL: controllerApiUrl,
                        appId: appId,
                        message: 'Set production controller API base URL'
                      };
                    } else {
                      // Development mode
                      restrictedContext.shortcuts.http.config.baseURL = controllerApiUrl;
                      return { 
                        success: true, 
                        environment: 'development',
                        baseURL: controllerApiUrl,
                        appId: appId,
                        message: 'Set development controller API base URL'
                      };
                    }
                  } catch (error) {
                    console.error('Failed to set deployment base URL:', error);
                    return { success: false, error: error.message };
                  }
                },

                // Set environment-specific base URL
                setEnvironmentBaseURL: (environment) => {
                  try {
                    const clientApiUrl = (import.meta as any).env?.VITE_CLIENT_API_URL || '';
                    
                    // Get current app ID from URL or context
                    let appId = 'development'; // default fallback
                    
                    // Try to get from URL path
                    try {
                      const pathParts = window.location.pathname.split('/');
                      const appIndex = pathParts.indexOf('applications');
                      if (appIndex !== -1 && pathParts[appIndex + 1]) {
                        appId = pathParts[appIndex + 1];
                      }
                    } catch (e) {
                      console.warn('Could not parse app ID from URL, using default:', e);
                    }
                    
                    // Construct the full controller API base URL
                    const controllerApiUrl = `${clientApiUrl}/v1/apps/development/${appId}`;
                    
                    if (environment === 'production') {
                      restrictedContext.shortcuts.http.config.baseURL = controllerApiUrl;
                      return { 
                        success: true, 
                        environment: 'production',
                        baseURL: controllerApiUrl,
                        appId: appId,
                        message: 'Set production controller API base URL'
                      };
                    } else if (environment === 'development') {
                      restrictedContext.shortcuts.http.config.baseURL = controllerApiUrl;
                      return { 
                        success: true, 
                        environment: 'development',
                        baseURL: controllerApiUrl,
                        appId: appId,
                        message: 'Set development controller API base URL'
                      };
                    } else {
                      throw new Error(`Invalid environment: ${environment}. Use 'production' or 'development'`);
                    }
                  } catch (error) {
                    console.error('Failed to set environment base URL:', error);
                    return { success: false, error: error.message };
                  }
                },

                // Set global configuration
                setConfig: (newConfig) => {
                  try {
                    // Auto-initialize base URL if not set
                    if (!restrictedContext.shortcuts.http.config.baseURL) {
                      restrictedContext.shortcuts.http.setDeploymentBaseURL();
                    }
                    
                    restrictedContext.shortcuts.http.config = {
                      ...restrictedContext.shortcuts.http.config,
                      ...newConfig
                    };
                    return { success: true, config: restrictedContext.shortcuts.http.config };
                  } catch (error) {
                    console.error('Failed to set HTTP config:', error);
                    return { success: false, error: error.message };
                  }
                },

                // Get current configuration
                getConfig: () => {
                  return { ...restrictedContext.shortcuts.http.config };
                },

                // Set app ID and rebuild base URL
                setAppId: (appId) => {
                  try {
                    if (!appId || typeof appId !== 'string') {
                      throw new Error('App ID must be a valid string');
                    }
                    
                    const clientApiUrl = (import.meta as any).env?.VITE_CLIENT_API_URL || '';
                    const controllerApiUrl = `${clientApiUrl}/v1/apps/development/${appId}`;
                    
                    restrictedContext.shortcuts.http.config.baseURL = controllerApiUrl;
                    
                    return { 
                      success: true, 
                      appId: appId,
                      baseURL: controllerApiUrl,
                      message: `Set controller API base URL for app: ${appId}`
                    };
                  } catch (error) {
                    console.error('Failed to set app ID:', error);
                    return { success: false, error: error.message };
                  }
                },

                // Get current app ID from base URL
                getAppId: () => {
                  try {
                    const baseURL = restrictedContext.shortcuts.http.config.baseURL || '';
                    const match = baseURL.match(/\/v1\/apps\/development\/([^\/]+)/);
                    return match ? match[1] : null;
                  } catch (error) {
                    console.error('Failed to get app ID:', error);
                    return null;
                  }
                },

                // Basic HTTP methods
                get: async (url, options = {}) => {
                  try {
                    // Auto-initialize base URL if not set
                    if (!restrictedContext.shortcuts.http.config.baseURL) {
                      restrictedContext.shortcuts.http.setDeploymentBaseURL();
                    }
                    
                    const config = {
                      ...restrictedContext.shortcuts.http.config,
                      ...options,
                      method: 'GET'
                    };

                    const response = await axios({
                      url,
                      ...config,
                      params: options.params || {},
                      timeout: options.timeout || config.timeout
                    });

                    return {
                      success: true,
                      data: response.data,
                      status: response.status,
                      headers: response.headers,
                      config: response.config
                    };
                  } catch (error) {
                    const errorResponse = {
                      success: false,
                      error: error.message,
                      status: error.response?.status || 0,
                      data: error.response?.data || null,
                      config: error.config
                    };

                    // Handle retry logic
                    if (options.retry && options.retry > 0) {
                      const retryCount = options.retry;
                      const retryDelay = options.retryDelay || 1000;
                      const retryCondition = options.retryCondition || (() => true);

                      if (retryCondition(errorResponse)) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return restrictedContext.shortcuts.http.get(url, { ...options, retry: retryCount - 1 });
                      }
                    }

                    return errorResponse;
                  }
                },

                post: async (url, data, options = {}) => {
                  try {
                    const config = {
                      ...restrictedContext.shortcuts.http.config,
                      ...options,
                      method: 'POST'
                    };

                    const response = await axios({
                      url,
                      data,
                      ...config,
                      timeout: options.timeout || config.timeout
                    });

                    return {
                      success: true,
                      data: response.data,
                      status: response.status,
                      headers: response.headers,
                      config: response.config
                    };
                  } catch (error) {
                    const errorResponse = {
                      success: false,
                      error: error.message,
                      status: error.response?.status || 0,
                      data: error.response?.data || null,
                      config: error.config
                    };

                    // Handle retry logic
                    if (options.retry && options.retry > 0) {
                      const retryCount = options.retry;
                      const retryDelay = options.retryDelay || 1000;
                      const retryCondition = options.retryCondition || (() => true);

                      if (retryCondition(errorResponse)) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return restrictedContext.shortcuts.http.post(url, data, { ...options, retry: retryCount - 1 });
                      }
                    }

                    return errorResponse;
                  }
                },

                put: async (url, data, options = {}) => {
                  try {
                    const config = {
                      ...restrictedContext.shortcuts.http.config,
                      ...options,
                      method: 'PUT'
                    };

                    const response = await axios({
                      url,
                      data,
                      ...config,
                      timeout: options.timeout || config.timeout
                    });

                    return {
                      success: true,
                      data: response.data,
                      status: response.status,
                      headers: response.headers,
                      config: response.config
                    };
                  } catch (error) {
                    const errorResponse = {
                      success: false,
                      error: error.message,
                      status: error.response?.status || 0,
                      data: error.response?.data || null,
                      config: error.config
                    };

                    // Handle retry logic
                    if (options.retry && options.retry > 0) {
                      const retryCount = options.retry;
                      const retryDelay = options.retryDelay || 1000;
                      const retryCondition = options.retryCondition || (() => true);

                      if (retryCondition(errorResponse)) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return restrictedContext.shortcuts.http.put(url, data, { ...options, retry: retryCount - 1 });
                      }
                    }

                    return errorResponse;
                  }
                },

                patch: async (url, data, options = {}) => {
                  try {
                    const config = {
                      ...restrictedContext.shortcuts.http.config,
                      ...options,
                      method: 'PATCH'
                    };

                    const response = await axios({
                      url,
                      data,
                      ...config,
                      timeout: options.timeout || config.timeout
                    });

                    return {
                      success: true,
                      data: response.data,
                      status: response.status,
                      headers: response.headers,
                      config: response.config
                    };
                  } catch (error) {
                    const errorResponse = {
                      success: false,
                      error: error.message,
                      status: error.response?.status || 0,
                      data: error.response?.data || null,
                      config: error.config
                    };

                    // Handle retry logic
                    if (options.retry && options.retry > 0) {
                      const retryCount = options.retry;
                      const retryDelay = options.retryDelay || 1000;
                      const retryCondition = options.retryCondition || (() => true);

                      if (retryCondition(errorResponse)) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return restrictedContext.shortcuts.http.patch(url, data, { ...options, retry: retryCount - 1 });
                      }
                    }

                    return errorResponse;
                  }
                },

                delete: async (url, options = {}) => {
                  try {
                    const config = {
                      ...restrictedContext.shortcuts.http.config,
                      ...options,
                      method: 'DELETE'
                    };

                    const response = await axios({
                      url,
                      ...config,
                      data: options.data || {},
                      timeout: options.timeout || config.timeout
                    });

                    return {
                      success: true,
                      data: response.data,
                      status: response.status,
                      headers: response.headers,
                      config: response.config
                    };
                  } catch (error) {
                    const errorResponse = {
                      success: false,
                      error: error.message,
                      status: error.response?.status || 0,
                      data: error.response?.data || null,
                      config: error.config
                    };

                    // Handle retry logic
                    if (options.retry && options.retry > 0) {
                      const retryCount = options.retry;
                      const retryDelay = options.retryDelay || 1000;
                      const retryCondition = options.retryCondition || (() => true);

                      if (retryCondition(errorResponse)) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return restrictedContext.shortcuts.http.delete(url, { ...options, retry: retryCount - 1 });
                      }
                    }

                    return errorResponse;
                  }
                },

                // Interceptors
                requestInterceptors: [],
                responseInterceptors: [],

                addRequestInterceptor: (interceptor) => {
                  try {
                    restrictedContext.shortcuts.http.requestInterceptors.push(interceptor);
                    return { success: true, count: restrictedContext.shortcuts.http.requestInterceptors.length };
                  } catch (error) {
                    console.error('Failed to add request interceptor:', error);
                    return { success: false, error: error.message };
                  }
                },

                addResponseInterceptor: (interceptor) => {
                  try {
                    restrictedContext.shortcuts.http.responseInterceptors.push(interceptor);
                    return { success: true, count: restrictedContext.shortcuts.http.responseInterceptors.length };
                  } catch (error) {
                    console.error('Failed to add response interceptor:', error);
                    return { success: false, error: error.message };
                  }
                },

                removeRequestInterceptor: (index) => {
                  try {
                    if (index >= 0 && index < restrictedContext.shortcuts.http.requestInterceptors.length) {
                      restrictedContext.shortcuts.http.requestInterceptors.splice(index, 1);
                      return { success: true, remaining: restrictedContext.shortcuts.http.requestInterceptors.length };
                    } else {
                      throw new Error('Invalid interceptor index');
                    }
                  } catch (error) {
                    console.error('Failed to remove request interceptor:', error);
                    return { success: false, error: error.message };
                  }
                },

                removeResponseInterceptor: (index) => {
                  try {
                    if (index >= 0 && index < restrictedContext.shortcuts.http.responseInterceptors.length) {
                      restrictedContext.shortcuts.http.responseInterceptors.splice(index, 1);
                      return { success: true, remaining: restrictedContext.shortcuts.http.responseInterceptors.length };
                    } else {
                      throw new Error('Invalid interceptor index');
                    }
                  } catch (error) {
                    console.error('Failed to remove response interceptor:', error);
                    return { success: false, error: error.message };
                  }
                },

                // Error handling
                errorHandler: null,

                setErrorHandler: (handler) => {
                  try {
                    if (typeof handler === 'function') {
                      restrictedContext.shortcuts.http.errorHandler = handler;
                      return { success: true, message: 'Error handler set' };
                    } else {
                      throw new Error('Error handler must be a function');
                    }
                  } catch (error) {
                    console.error('Failed to set error handler:', error);
                    return { success: false, error: error.message };
                  }
                },

                // Utility methods
                createFormData: (data) => {
                  try {
                    const formData = new FormData();
                    Object.entries(data).forEach(([key, value]) => {
                      if (value instanceof File) {
                        formData.append(key, value);
                      } else if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                          formData.append(`${key}[${index}]`, item);
                        });
                      } else if (value !== null && value !== undefined) {
                        formData.append(key, value);
                      }
                    });
                    return formData;
                  } catch (error) {
                    console.error('Failed to create FormData:', error);
                    return null;
                  }
                },

                downloadFile: async (url, filename, options = {}) => {
                  try {
                    const response = await restrictedContext.shortcuts.http.get(url, {
                      ...options,
                      responseType: 'blob'
                    });

                    if (response.success && response.data) {
                      const blob = new Blob([response.data]);
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(downloadUrl);
                      return { success: true, filename };
                    } else {
                      throw new Error('Download failed');
                    }
                  } catch (error) {
                    console.error('File download failed:', error);
                    return { success: false, error: error.message };
                  }
                }
              }
            },

            // Block dangerous globals
            eval: undefined,
            Function: undefined,
            WebAssembly: undefined
          };

          // Execute the code in safe environment
          const execResult = await createSafeFunction(timeoutCode, restrictedContext);

          // Store result if requested
          if (process.storeResult && execResult !== undefined) {
            if (process.resultPath) {
              await process.store.dispatch(
                process.setAppStatePartial({
                  key: process.resultPath,
                  payload: execResult
                })
              );
            }
            globalObj[process.name] = execResult
          }

          // Return the execution result
          return execResult;

          // Store result if requested
          if (process.storeResult && process?.store?.dispatch && process?.setAppStatePartial) {
            const validPath = process.resultPath || process.name;
            await process.store.dispatch(
              process.setAppStatePartial({
                key: validPath,
                payload: execResult,
                operationType: 'set'
              })
            );
          }

          // Track execution metrics
          const executionTime = Date.now() - executionTracker.startTime;
          const metrics = {
            executionTime,
            memoryUsed: process.memoryUsage().heapUsed / 1024 / 1024,
            codeSize: process.code.length
          };

          // Store operation result
          globalObj[process.name] = execResult

          messageLogger.success(`Code execution completed successfully (${executionTime}ms)`);
        } catch (error) {
          // Comprehensive error handling
          const errorDetails = {
            error: error.message || 'Code execution failed',
            code: process.code,
            timestamp: new Date().toISOString(),
            type: error.name,
            stack: error.stack,
            context: {
              name: process.name,
              timeout: process.timeout,
              memoryLimit: process.memoryLimit
            }
          };

          // Store error information
          globalErrors[process.name] = errorDetails;

          // Log error with context
          messageLogger.error(`Code execution failed: ${error.message}`, errorDetails);

          // Re-throw with sanitized message
          throw new Error(`Code execution failed: ${(error.message)}`);
        }
      }
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

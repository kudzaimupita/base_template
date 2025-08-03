import { getValueByPath, retrieveBody } from './utils';

import _ from 'lodash';
import { clearMemoizationCache, executeProcess, messageLogger, processBatch, Semaphore } from '../digester';
import { generateObject } from './actions';
import moment from 'moment';
import { message } from 'antd';
const BATCH_SIZE = 10; // Configurable batch size for concurrent processing
const MAX_CONCURRENT_OPERATIONS = 5; // Limit concurrent operations to prevent overwhelming

export const nativePlugins = {
  disabled: false,
  name: 'Servly',
  hideOnList: true,
  desc: 'MongoDB is an open-source NoSQL database known for its flexibility and scalability, storing data in JSON-like documents.',
  label: '',
  connectionSchema: {
    name: 'AppCompose DB',
    key: 'appComposeDB',
    desc: 'Upload your files to Google Drive',
    img: 'https://no-prompt-portal-aw91.vercel.app/logoo.png',
    type: 'Cloud storage',
    env: 'Testing',
    active: true,
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        active: {
          title: 'Active',
          type: 'boolean',
          default: true,
        },
        collections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        },
        isGlobal: {
          title: 'Is Global',
          type: 'boolean',
          default: true,
          description: 'Is db instance available to other applications',
        },
        env: {
          title: 'Enviroment Tag',
          type: 'string',
          enum: ['Test', 'Live'],
          default: 'Test',
          description: 'By default each app is connected to the AppCompose DB',
        },
        label: {
          type: 'string',
          description: 'Helps indentify the db',
          title: 'Name',
        },
      },
      required: ['label', 'active', 'env', 'isGlobal'],
    },
  },
  basicSchema: '',
  type: 'Storage',
  details: {
    logo: '',
    description: '',
  },
  operations: [
    {
      key: 'history-QueryParam',
      label: 'Set Query Param',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process.body?.value, event, globalObj, paramState, sessionKey, process);
        const isArray = _.isArray(body);
        try {
          globalObj[process.name] = isArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'refreshComponent',
      label: 'Refresh Component',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process.body?.value, event, globalObj, paramState, sessionKey, process);
        const isArray = _.isArray(body);
        try {
          globalObj[process.name] = isArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
{
  key: 'loop',
  label: 'Loop',
  schema: {
    type: 'object',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        pattern: '^[^.]+$',
        description: 'No spaces, caps',
      },
      list: {
        title: 'Array to Loop Over',
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'Value',
          },
        },
      },
      assignToKey: {
        title: 'Assign Key',
        type: 'string',
      },
      appendToGlobal: {
        title: 'Append To Global Return',
        type: 'boolean',
        default: true,
      },
      terminateOnError: {
        title: 'Short Circuit On Error',
        type: 'boolean',
        default: true,
      },
      // New performance options
      batchSize: {
        title: 'Batch Size',
        type: 'number',
        default: BATCH_SIZE,
        minimum: 1,
        maximum: 100,
      },
      maxConcurrent: {
        title: 'Max Concurrent Operations',
        type: 'number',
        default: 10,
        minimum: 1,
        maximum: 20,
      },
    },
    required: ['name', 'list'],
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
    debug
  ) => {
    const startTime = performance.now();

    let list;
    const localErrors = [];
    const processes = process.sequence || [];
  
    // Get the list data
list = retrieveBody('', process?.list?.value, event, globalObj, paramState, sessionKey, process);

if (process.editMode === true && Array.isArray(list)) {
  list = list.slice(0, 25);
  messageLogger.warn('List capped at 25 items on editMode')
}

const data = Array.from(list);

    
    if (!_.isArray(data)) {
      messageLogger.error(`Invalid list ${JSON.stringify(list)}`);
      globalErrors[process.name] = `Invalid list ${JSON.stringify(list)}`;
      return;
    }

    if (data.length === 0) {
      globalObj[process.name] = [];
      return;
    }

    const batchSize = process.batchSize || BATCH_SIZE;
    const maxConcurrent = process.maxConcurrent || MAX_CONCURRENT_OPERATIONS;
    const semaphore = new Semaphore(maxConcurrent);
    
    messageLogger.info(`Starting optimized loop processing`, {
      itemCount: data.length,
      batchSize,
      maxConcurrent,
      processName: process.name
    });

    try {
      // Optimized batch processing function
      const processItem = async (item, index) => {
        await semaphore.acquire();
        
        try {
          // Set current item context more efficiently
          const itemKey = `${process.name}._currentItem_`;
          const indexKey = `${process.name}._currentIndex_`;
          
          globalObj[itemKey] = item;
          globalObj[indexKey] = index;

          // Create optimized process configuration
          const optimizedProcesses = processes.map((processItem) => ({
            ...processItem,
            name: `${process.name}.${processItem.name}`,
            renderElementUtil: process?.renderElementUtil,
            currentItem: item,
            currentIndex: index,
            compId: process?.compId,
          }));

          const result = await executeProcess(
            0,
            optimizedProcesses,
            appId,
            navigate,
            paramState,
            debug,
            process.compId,
            process.pageId,
            event,
            process?.renderElementUtil,
            process?.editMode,
            process
          );

          // Clean up context immediately
          delete globalObj[itemKey];
          delete globalObj[indexKey];

          return getValueByPath(result?.data, process.name);
          
        } catch (error) {
          
          
          if (process.terminateOnError) {
            throw error;
          }
          
          localErrors.push({ index, error: error.message });
          return null;
        } finally {
          semaphore.release();
        }
      };

      // Process in optimized batches
      const results = await processBatch(data, batchSize, processItem);
      
      // Filter out null results (from errors) if not terminating on error
      const validResults = results.filter(result => result !== null);
      
      globalObj[process.name] = validResults;

      if (localErrors.length > 0 && !process.terminateOnError) {
        globalErrors[process.name] = localErrors;
      }

      const duration = performance.now() - startTime;
      messageLogger.success(`Optimized loop completed`, {
        processName: process.name,
        itemCount: data.length,
        resultCount: validResults.length,
        errorCount: localErrors.length,
        duration: `${duration.toFixed(2)}ms`,
        averagePerItem: `${(duration / data.length).toFixed(2)}ms`
      });

      // Clear memoization cache periodically
      clearMemoizationCache();

    } catch (error) {
      const duration = performance.now() - startTime;
      
      messageLogger.error('Optimized loop execution failed', {
        processName: process.name,
        error: error.message,
        duration: `${duration.toFixed(2)}ms`
      });
      
      
      globalErrors[process.name] = error.message || error;
    }
  },
},
    {
      key: 'array-isArray',
      label: 'Is Array',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process.body?.value, event, globalObj, paramState, sessionKey, process);
        const isArray = _.isArray(body);
        try {
          globalObj[process.name] = isArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-compact',
      label: 'Array Compact',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          const compactedArray = _.compact(body);
          globalObj[process.name] = compactedArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-uniq',
      label: 'Array Unique',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          const uniqueArray = _.uniq(body);
          globalObj[process.name] = uniqueArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-difference',
      label: 'Array Difference',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          compareArray: {
            title: 'Compare Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'compareArray', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        let compareArray = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        compareArray = retrieveBody('', process.compareArray?.value, event, globalObj, paramState, sessionKey, process);
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          if (!_.isArray(compareArray)) {
            messageLogger.error('Comparison input is not an array.');
          }
          const diffArray = _.difference(body, compareArray);
          globalObj[process.name] = diffArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-chunk',
      label: 'Array Chunk',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          chunkSize: {
            title: 'Size Of Chunks',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'chunkSize', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        let chunkSize = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        chunkSize = retrieveBody('', process.chunkSize?.value, event, globalObj, paramState, sessionKey, process);
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          if (!_.isNumber(chunkSize) || chunkSize < 1) {
            messageLogger.error('Chunk size must be a positive integer.');
          }
          const chunkedArray = _.chunk(body, chunkSize);
          globalObj[process.name] = chunkedArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-flatten',
      label: 'Array Flatten',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            type: 'object',
            title: 'Array',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          const flattenedArray = _.flatten(body);
          globalObj[process.name] = flattenedArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-shuffle',
      label: 'Array Shuffle',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          const shuffledArray = _.shuffle(body);
          globalObj[process.name] = shuffledArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-union',
      label: 'Array Union',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          compareArray: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'compareArray'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        let compareArray = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        compareArray = retrieveBody(
          process.compareArray?.from,
          process.compareArray?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          if (!_.isArray(compareArray)) {
            messageLogger.error('Comparison input is not an array.');
          }
          const unionArray = _.union(body, compareArray);
          globalObj[process.name] = unionArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-take',
      label: 'Take',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          count: {
            type: 'object',
            title: 'Count Of Items To Take',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'count'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        let count = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        count = retrieveBody(process.count?.from, process.count?.value, event, globalObj, paramState, sessionKey, process);
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          if (!_.isNumber(count) || count < 1) {
            messageLogger.error('Count must be a positive integer.');
          }
          const takenArray = _.take(body, count);
          globalObj[process.name] = takenArray;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-find',
      label: 'Array Find',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          predicate: {
            title: 'Filter(predicate)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'predicate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        let predicate = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        predicate = retrieveBody(
          process.predicate?.from,
          process.predicate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          if (!_.isPlainObject(predicate)) {
            messageLogger.error('Predicate must be an object.');
          }
          const foundItem = _.find(body, predicate);
          globalObj[process.name] = foundItem;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-filter',
      label: 'Array Filter',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          predicate: {
            title: 'Filter(predicate)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'predicate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        let predicate = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        predicate = retrieveBody(
          process.predicate?.from,
          process.predicate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          if (!_.isArray(body)) {
            messageLogger.error('Input is not an array.');
          }
          if (!_.isPlainObject(predicate)) {
            messageLogger.error('Predicate must be an object.');
          }
          const filteredItems = _.filter(body, predicate);
          globalObj[process.name] = filteredItems;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-reject',
      label: 'Array Reject',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          predicate: {
            title: 'Filter(predicate)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['manual', 'controller', 'request'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'predicate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const predicate = retrieveBody(
          process.predicate?.from,
          process.predicate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.reject(body, JSON.parse(predicate));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-some',
      label: 'Array Some',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          predicate: {
            title: 'Filter(predicate)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['manual', 'controller', 'request'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'predicate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const predicate = retrieveBody(
          process.predicate?.from,
          process.predicate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.some(body, JSON.parse(predicate));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-every',
      label: 'Array Every',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          predicate: {
            title: 'Filter(predicate)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['manual', 'controller', 'request'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'predicate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const predicate = retrieveBody(
          process.predicate?.from,
          process.predicate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.every(body, JSON.parse(predicate));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-groupBy',
      label: 'Array Group By',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          predicate: {
            title: 'Filter(predicate)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['manual', 'controller', 'request'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'predicate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const predicate = retrieveBody(
          process.predicate?.from,
          process.predicate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.groupBy(body, JSON.parse(predicate));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-sortBy',
      label: 'Array Sort By',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          predicate: {
            title: 'Filter(predicate)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['manual', 'controller', 'request'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'predicate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const predicate = retrieveBody(
          process.predicate?.from,
          process.predicate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.sortBy(body, JSON.parse(predicate));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-slice',
      label: 'Array Slice',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          start: {
            title: 'Start Index',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          end: {
            title: 'End Index',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'end', 'start'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const start = retrieveBody(
          process.start?.from,
          process.start?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        const end = retrieveBody(process.end?.from, process.end?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.slice(body, start, end);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-indexOf',
      label: 'Array Index Of',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          searchValue: {
            title: 'Filter',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'searchValue'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const searchValue = retrieveBody(
          process.searchValue?.from,
          process.searchValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.indexOf(body, searchValue);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-max',
      label: 'Array Max',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.max(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-min',
      label: 'Array Min',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.min(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-sum',
      label: 'Array Sum',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.sum(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-uniq',
      label: 'Array Unique',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.uniq(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-intersection',
      label: 'Array Intersection',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          compareArray: {
            title: 'Other Array',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['manual', 'controller', 'request'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'compareArray'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const compareArray = retrieveBody(
          process.compareArray?.from,
          process.compareArray?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.intersection(body, compareArray);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-concat',
      label: 'Array Concat',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          appendArray: {
            title: 'Other Array',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['manual', 'controller', 'request'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'appendArray'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const appendArray = retrieveBody(
          process.appendArray?.from,
          process.appendArray?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.concat(body, appendArray);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-camelCase',
      label: 'String Camel Case',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.camelCase(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-capitalize',
      label: 'String Capitalize',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Array',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.capitalize(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-deburr',
      label: 'String Deburr',
      schema: {
        type: 'object',
        properties: {
          title: 'String',
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
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.deburr(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-kebabCase',
      label: 'String Kebab Case',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.kebabCase(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-lowerCase',
      label: 'String Lower Case',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.lowerCase(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-snakeCase',
      label: 'String Snake Case',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.snakeCase(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-trim',
      label: 'String Trim',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.trim(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-truncate',
      label: 'String Truncate',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.trim(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    ,
    {
      key: 'string-lowerFirst',
      label: 'String Lower First',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.lowerFirst(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-pad',
      label: 'String Pad',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          length: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          padString: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'padString', 'length'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const length = retrieveBody(
          process.length?.from,
          process.length?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        const padString = retrieveBody(
          process.padString?.from,
          process.padString?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.pad(body, length, padString);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-padEnd',
      label: 'String Pad End',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          length: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          padString: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'padString', 'length'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const length = retrieveBody(
          process.length?.from,
          process.length?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        const padString = retrieveBody(
          process.padString?.from,
          process.padString?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.padEnd(body, length, padString);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-padStart',
      label: 'String Pad Start',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          length: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          padString: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'padString', 'length'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const length = retrieveBody(
          process.length?.from,
          process.length?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        const padString = retrieveBody(
          process.padString?.from,
          process.padString?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.padStart(body, length, padString);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-repeat',
      label: 'String Repeat',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          times: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'times'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const times = retrieveBody(
          process.times?.from,
          process.times?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        try {
          globalObj[process.name] = _.repeat(body, times);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-replace',
      label: 'String Replace',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          pattern: {
            type: 'string',
            title: 'Pattern',
            description: 'The pattern to search for',
          },
          replacement: {
            type: 'string',
            title: 'Replacement',
            description: 'The replacement string',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'pattern', 'replacement'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const pattern = process.pattern || '';
        const replacement = process.replacement || '';
        try {
          globalObj[process.name] = _.replace(body, pattern, replacement);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-split',
      label: 'String Split',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'separator'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const separator = retrieveBody(
          process.separator?.from,
          process.separator?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.split(body, separator);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-toLower',
      label: 'String To Lower Case',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.toLower(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-toUpper',
      label: 'String To Upper Case',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.toUpper(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-trimEnd',
      label: 'String Trim End',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.trimEnd(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-trimStart',
      label: 'String Trim Start',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.trimStart(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-length',
      label: 'Array Length',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps',
          },
          body: {
            title: 'Array or String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          let length = 0;
          if (Array.isArray(body)) {
            length = body.length;
          } else if (typeof body === 'string') {
            length = body.length;
          } else {
            messageLogger.error('Body must be an array or a string');
          }
          globalObj[process.name] = length;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'array-contains',
      label: 'Array Contains',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          valueToCheck: {
            title: 'Value To Check',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'valueToCheck'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody(
          process.includes?.from,
          process.includes?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        const valueToCheck = retrieveBody(
          process.valueToCheck?.from,
          process.valueToCheck?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        const isIncluded = _.includes(body, valueToCheck);
        try {
          globalObj[process.name] = isIncluded;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-unescape',
      label: 'String Unescape',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      required: ['from', 'body'],
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const unescapedValue = _.unescape(body);
        try {
          globalObj[process.name] = unescapedValue;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'string-escape',
      label: 'String Escape',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      required: ['from', 'body'],
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let body = '';
        body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const unescapedValue = _.escape(body);
        try {
          globalObj[process.name] = unescapedValue;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-get',
      label: 'Get Object Property',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          getValue: {
            title: 'Key To Get',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'getValue'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const getValue = retrieveBody(
          process.getValue?.from,
          process.getValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.get(body, getValue);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-set',
      label: 'Set Object Property',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          setValue: {
            title: 'Value To Set',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          setKey: {
            title: 'Key To Set',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'setValue', 'setKey'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const setValue = retrieveBody(
          process.setValue?.from,
          process.setValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        const setKey = retrieveBody(
          process.setKey?.from,
          process.setKey?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        try {
          _.set(body, setValue, _.get(body, setKey));
          globalObj[process.name] = body;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-unset',
      label: 'Unset Object Property',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          setValue: {
            title: 'Key To Unset',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'setValue'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const setValue = retrieveBody(
          process.setValue?.from,
          process.setValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          _.unset(body, setValue);
          globalObj[process.name] = body;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-update',
      label: 'Update Object Property',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          setValue: {
            title: 'Value To Update',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          key: {
            title: 'Key To Update',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'setValue', 'key'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const setValue = retrieveBody(
          process.setValue?.from,
          process.setValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        const key = retrieveBody(process.key?.from, process.key?.value, event, globalObj, paramState, sessionKey, process);
        try {
          _.set(body, key, setValue);
          globalObj[process.name] = body;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-merge',
      label: 'Merge Objects',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object To Merge',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          mergeWith: {
            title: 'Object To Merge With',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'mergeWith'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const mergeWith = retrieveBody(
          process.mergeWith?.from,
          process.mergeWith?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          _.merge(body, mergeWith);
          globalObj[process.name] = body;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-keys',
      label: 'Get Object Keys',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.keys(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-values',
      label: 'Get Object Values',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = _.values(body);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-has',
      label: 'Check Object Property',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          propertyToCheck: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'propertyToCheck'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const propertyToCheck = retrieveBody(
          process.propertyToCheck?.from,
          process.propertyToCheck?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.has(body, propertyToCheck);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-pick',
      label: 'Pick Object Properties',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          keys: {
            title: 'Keys To Pick(Array)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'keys'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const keys = retrieveBody(
          process.keys?.from,
          process.keys?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        try {
          globalObj[process.name] = _.pick(body, keys);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-omit',
      label: 'Omit Object Properties',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          keys: {
            title: 'Keys To Omit(Array)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'keys'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const keys = retrieveBody(
          process.keys?.from,
          process.keys?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        try {
          globalObj[process.name] = _.omit(body, keys);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'object-merge',
      label: 'Merge Two Objects',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          otherBody: {
            title: 'Another Object',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'otherBody'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const otherBody = retrieveBody(
          process.otherBody?.from,
          process.otherBody?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          globalObj[process.name] = _.merge(body, otherBody);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-now',
      label: 'Get Current Date and Time',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          format: {
            title: 'Format',
            type: 'string',
            default: 'iso',
            enum: ['iso', 'unix'],
          },
          customFormat: {
            title: 'Custom Format (Overrides Format)',
            type: 'string',
            description: 'eg YYYY-MM-DD HH:mm:ss, YYYYMMDD, hh:mm A',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'format'],
      },
      process: async (process, globalObj, globalErrors) => {
        const { format, customFormat } = process;
        try {
          let date;
          if (customFormat) {
            date = moment().format(customFormat);
          } else if (format === 'unix') {
            date = Date.now();
          } else {
            date = new Date().toISOString();
          }
          globalObj[process.name] = date;
        } catch (error) {
          globalErrors[process.name] = JSON.stringify(error);
        }
      },
    },
    {
      key: 'date-add',
      label: 'Add Time to Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          unit: {
            type: 'string',
            title: 'Time Unit',
            enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
            default: 'days',
          },
          setValue: {
            title: 'Value To Add By',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'unit', 'body', 'setValue'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const setValue = retrieveBody(
          process.setValue?.from,
          process.setValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        const { unit } = process;
        try {
          const date = moment(body);
          globalObj[process.name] = date.add(setValue, unit).toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-subtract',
      label: 'Subtract Time from Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          unit: {
            type: 'string',
            title: 'Time Unit',
            enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
            default: 'days',
          },
          setValue: {
            title: 'Value To Add By',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'unit', 'body', 'setValue'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const setValue = retrieveBody(
          process.setValue?.from,
          process.setValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        const { unit } = process;
        try {
          const date = moment(body);
          globalObj[process.name] = date.subtract(setValue, unit).toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-format',
      label: 'Format Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          setValue: {
            title: 'Format',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'setValue', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const setValue = retrieveBody(
          process.setValue?.from,
          process.setValue?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          const date = moment(body);
          globalObj[process.name] = date.format(setValue);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-is-after',
      label: 'Check if Date is After Another Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
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
            required: ['value'],
          },
          otherDate: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Compare To Date',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'otherDate', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const otherDate = retrieveBody(
          process.otherDate?.from,
          process.otherDate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          const date1 = moment(body);
          const date2 = moment(otherDate);
          globalObj[process.name] = date1.isAfter(date2);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-is-before',
      label: 'Check if Date is Before Another Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
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
            required: ['value'],
          },
          otherDate: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Compare To Date',
              },
            },
            required: ['value'],
          },
        },
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const otherDate = retrieveBody(
          process.otherDate?.from,
          process.otherDate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          const date1 = moment(body);
          const date2 = moment(otherDate);
          globalObj[process.name] = date1.isAfter(date2);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-difference',
      label: 'Calculate Date Difference',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          startDate: {
            title: 'Start Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          endDate: {
            title: 'End Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'startDate', 'endDate'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const startDate = retrieveBody(
          process.startDate?.from,
          process.startDate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        const endDate = retrieveBody(
          process.endDate?.from,
          process.endDate?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        const { unit } = process;
        try {
          const start = moment(startDate);
          const end = moment(endDate);
          globalObj[process.name] = end.diff(start, unit);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-start-of',
      label: 'Get Start of Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          unit: {
            type: 'string',
            title: 'Time Unit',
            enum: ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'],
            default: 'day',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const { unit } = process;
        try {
          const date = moment(dateValue).startOf(unit);
          globalObj[process.name] = date.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-end-of',
      label: 'Get End of Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          unit: {
            type: 'string',
            title: 'Time Unit',
            enum: ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'],
            default: 'day',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'unit'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const { unit } = process;
        try {
          const date = moment(dateValue).endOf(unit);
          globalObj[process.name] = date.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-is-valid',
      label: 'Check if Date is Valid',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          globalObj[process.name] = date.isValid();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-format-datetime',
      label: 'Format Date and Time',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          format: {
            type: 'string',
            title: 'Date Format',
            enum: ['iso', 'datetime', 'custom'],
            default: 'datetime',
          },
          customFormat: {
            type: 'string',
            title: 'Custom Date Format',
            description: 'Specify a custom format if "custom" is selected',
            default: 'YYYY-MM-DD HH:mm:ss',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'format'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const { format, customFormat } = process;
        try {
          const date = moment(dateValue);
          let formattedDate;
          if (customFormat) {
            formattedDate = date.format(customFormat);
          } else if (format === 'iso') {
            formattedDate = date.toISOString();
          } else {
            formattedDate = date.format('YYYY-MM-DD HH:mm:ss');
          }
          globalObj[process.name] = formattedDate;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-start-of-week',
      label: 'Get Start of Week',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue).startOf('week');
          globalObj[process.name] = date.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-add-business-days',
      label: 'Add Business Days to Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          daysToAdd: {
            title: 'Days To Add (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Number of Business Days to Add',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'daysToAdd'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const daysToAdd = retrieveBody(
          process.daysToAdd?.from,
          process.daysToAdd?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          const date = moment(dateValue);
          const resultDate = date.addBusinessDays(daysToAdd);
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-subtract-business-days',
      label: 'Subtract Business Days from Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          daysToSubtract: {
            title: 'Days To Subtract (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'daysToSubtract'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const daysToSubtract = retrieveBody(
          process.daysToSubtract?.from,
          process.daysToSubtract?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          const date = moment(dateValue);
          const resultDate = date.subtractBusinessDays(daysToSubtract);
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-add-months',
      label: 'Add Months to Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          monthsToAdd: {
            title: 'Months To Add (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'monthsToAdd'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const monthsToAdd = retrieveBody(
          process.monthsToAdd?.from,
          process.monthsToAdd?.value,
          event,
          globalObj,
          paramState,
          sessionKey
        );
        try {
          const date = moment(dateValue);
          const resultDate = date.add(monthsToAdd, 'months');
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-subtract-months',
      label: 'Subtract Months from Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          monthsToSubtract: {
            title: 'Months To Subtract (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Number of Months to Subtract',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'monthsToSubtract'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const monthsToSubtract = retrieveBody(
          process.monthsToSubtract?.from,
          process.monthsToSubtract?.value,
          req,
          globalObj
        );
        try {
          const date = moment(dateValue);
          const resultDate = date.subtract(monthsToSubtract, 'months');
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-add-years',
      label: 'Add Years to Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          yearsToAdd: {
            title: 'Years To Add (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'yearsToAdd'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const yearsToAdd = retrieveBody('', process.yearsToAdd?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const resultDate = date.add(yearsToAdd, 'years');
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-subtract-years',
      label: 'Subtract Years from Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          yearsToSubtract: {
            title: 'Years To Subtract (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'yearsToSubtract'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const { value: yearsToSubtract } = retrieveBody('', process.yearsToSubtract?.value, req, globalObj);
        try {
          const date = moment(dateValue);
          const resultDate = date.subtract(yearsToSubtract, 'years');
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-add-days',
      label: 'Add Days to Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          yearsToAdd: {
            title: 'Days To Add (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'daysToAdd'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const daysToAdd = retrieveBody('', process.daysToAdd?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const resultDate = date.add(daysToAdd, 'days');
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-is-weekend',
      label: 'Check if Date is Weekend',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const isWeekend = date.isoWeekday() === 6 || date.isoWeekday() === 7;
          globalObj[process.name] = isWeekend;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-is-leap-year',
      label: 'Check if Date is Leap Year',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const isLeapYear = date.isLeapYear();
          globalObj[process.name] = isLeapYear;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-add-quarters',
      label: 'Add Quarters to Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          quartersToAdd: {
            title: 'Quarters To Add (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'quartersToAdd'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const quartersToAdd = retrieveBody(
          '',
          process.quartersToAdd?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        try {
          const date = moment(dateValue);
          const resultDate = date.add(quartersToAdd, 'quarter');
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-start-of-month',
      label: 'Start of the Month Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const startOfMonth = date.startOf('month');
          globalObj[process.name] = startOfMonth.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-start-of-year',
      label: 'Start of the Year Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const startOfYear = date.startOf('year');
          globalObj[process.name] = startOfYear.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-subtract-weeks',
      label: 'Subtract Weeks from Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          weeksToSubtract: {
            title: 'Weeks To Subtract (Number)',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'weeksToSubtract'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        const weeksToSubtract = retrieveBody(
          '',
          process.weeksToSubtract?.value,
          event,
          globalObj,
          paramState,
          sessionKey,
          process
        );
        try {
          const date = moment(dateValue);
          const resultDate = date.subtract(weeksToSubtract, 'weeks');
          globalObj[process.name] = resultDate.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-get-week-of-year',
      label: 'Get Week of Year',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const weekOfYear = date.week();
          globalObj[process.name] = weekOfYear;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-set-start-of-week',
      label: 'Set Start of Week Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const startOfWeek = date.startOf('week');
          globalObj[process.name] = startOfWeek.toISOString();
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-get-month-name',
      label: 'Get Month Name from Date',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const monthName = date.format('MMMM');
          globalObj[process.name] = monthName;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'date-retrieve-all-components',
      label: 'Retrieve All Date Components',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Date',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
            required: ['value'],
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const dateValue = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const date = moment(dateValue);
          const result = {
            year: date.year(),
            month: date.month() + 1,
            day: date.date(),
            hour: date.hour(),
            minute: date.minute(),
            second: date.second(),
            weekday: date.day(),
          };
          globalObj[process.name] = result;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-addition',
      label: 'Addition',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.reduce((acc, val) => acc + val, 0);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-subtraction',
      label: 'Subtraction',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.reduce((acc, val) => acc - val);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-multiplication',
      label: 'Multiplication',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.reduce((acc, val) => acc * val, 1);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-extended-operations',
      label: 'Extended Math Operations with Groups',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps',
          },
          groups: {
            title: 'Groups',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  title: 'Group Operation',
                  enum: ['add', 'subtract', 'multiply', 'divide', 'mod', 'pow', 'avg', 'min', 'max'],
                  default: 'add',
                },
                values: {
                  title: 'Numbers',
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      from: {
                        type: 'string',
                        title: 'From',
                        enum: ['request', 'controller', 'manual'],
                        default: 'manual',
                      },
                      value: {
                        type: 'string',
                        title: 'Value',
                      },
                    },
                    required: ['value'],
                  },
                },
              },
              required: ['operation', 'values'],
            },
          },
          combine: {
            title: 'Combine Groups',
            type: 'object',
            properties: {
              operation: {
                type: 'string',
                title: 'Combine Operation',
                enum: ['add', 'subtract', 'multiply', 'divide', 'mod', 'pow', 'avg', 'min', 'max'],
                default: 'add',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'groups', 'combine'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const groupResults = [];
          for (const group of process.groups) {
            const values = group.values.map((item) => {
              const val = retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process);
              const num = parseFloat(val);
              if (isNaN(num)) {
                messageLogger.error(`Invalid number in group: ${val}`);
              }
              return num;
            });
            if (values.length === 0) {
              messageLogger.error('No values provided in group');
            }
            let groupResult;
            switch (group.operation) {
              case 'add':
                groupResult = values.reduce((acc, val) => acc + val, 0);
                break;
              case 'subtract':
                groupResult = values.reduce((acc, val) => acc - val);
                break;
              case 'multiply':
                groupResult = values.reduce((acc, val) => acc * val, 1);
                break;
              case 'divide':
                if (values.includes(0)) {
                  messageLogger.error('Cannot divide by zero within group');
                }
                groupResult = values.reduce((acc, val) => acc / val);
                break;
              case 'mod':
                groupResult = values.reduce((acc, val) => acc % val);
                break;
              case 'pow':
                groupResult = values.reduce((acc, val) => Math.pow(acc, val));
                break;
              case 'avg':
                groupResult = values.reduce((acc, val) => acc + val, 0) / values.length;
                break;
              case 'min':
                groupResult = Math.min(...values);
                break;
              case 'max':
                groupResult = Math.max(...values);
                break;
              default:
                messageLogger.error(`Unsupported group operation: ${group.operation}`);
            }
            groupResults.push(groupResult);
          }
          if (groupResults.length === 0) {
            return;
          }
          let finalResult;
          switch (process.combine.operation) {
            case 'add':
              finalResult = groupResults.reduce((acc, val) => acc + val, 0);
              break;
            case 'subtract':
              finalResult = groupResults.reduce((acc, val) => acc - val);
              break;
            case 'multiply':
              finalResult = groupResults.reduce((acc, val) => acc * val, 1);
              break;
            case 'divide':
              if (groupResults.includes(0)) {
                messageLogger.error('Cannot divide by zero between groups');
              }
              finalResult = groupResults.reduce((acc, val) => acc / val);
              break;
            case 'mod':
              finalResult = groupResults.reduce((acc, val) => acc % val);
              break;
            case 'pow':
              finalResult = groupResults.reduce((acc, val) => Math.pow(acc, val));
              break;
            case 'avg':
              finalResult = groupResults.reduce((acc, val) => acc + val, 0) / groupResults.length;
              break;
            case 'min':
              finalResult = Math.min(...groupResults);
              break;
            case 'max':
              finalResult = Math.max(...groupResults);
              break;
            default:
              messageLogger.error(`Unsupported combine operation: ${process.combine.operation}`);
          }
          globalObj[process.name] = finalResult;
        } catch (error) {
          globalErrors[process.name] = error.message;
          if (process.terminateOnError) {
            throw error;
          }
        }
      },
    },
    {
      key: 'math-modulus',
      label: 'Modulus',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.reduce((acc, val) => acc % val);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-sqrt',
      label: 'Square Root',
      schema: {
        type: 'object',
        properties: {
          values: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'request',
                },
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
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.map((value) => Math.sqrt(value));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-sqrt',
      label: 'Square Root',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.map((value) => Math.sqrt(value));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-exponentiation',
      label: 'Exponentiation',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.map((value, index) => {
            if (index === 0) return Math.pow(value, values[index + 1]);
          });
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-average',
      label: 'Average (Mean)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          const sum = values.reduce((acc, val) => acc + val, 0);
          globalObj[process.name] = sum / values.length;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-max',
      label: 'Max Value',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.max(...values);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-min',
      label: 'Min Value',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.min(...values);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-percentage',
      label: 'Percentage Calculation',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          const percentage = (values[0] / values[1]) * 100;
          globalObj[process.name] = percentage;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-random',
      label: 'Random Number (Within a Range)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          const [min, max] = values[0].split(',').map(Number);
          globalObj[process.name] = Math.floor(Math.random() * (max - min + 1)) + min;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-round',
      label: 'Round (To Nearest Integer)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = values.map((value) => Math.round(value));
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-cbrt',
      label: 'Cube Root',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.cbrt(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-log10',
      label: 'Logarithm (Base 10)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.log10(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-ln',
      label: 'Natural Logarithm (ln)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.log(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-factorial',
      label: 'Factorial',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
        try {
          globalObj[process.name] = factorial(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-abs',
      label: 'Absolute Value',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.abs(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-ceil',
      label: 'Ceiling (Round Up)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.ceil(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-floor',
      label: 'Floor (Round Down)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.floor(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-round',
      label: 'Rounding (Round to Nearest Integer)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          values: {
            title: 'Numbers',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  title: 'From',
                  enum: ['request', 'controller', 'manual'],
                  default: 'manual',
                },
                value: {
                  type: 'string',
                  title: 'Value',
                },
              },
              required: ['value'],
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'values'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const values = process.values.map((item) =>
          retrieveBody(item.from, item.value, event, globalObj, paramState, sessionKey, process)
        );
        try {
          globalObj[process.name] = Math.round(values[0]);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'wait',
      label: 'Wait for a Duration',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Duration',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          debug: {
            title: 'Debug',
            type: 'boolean',
            default: false,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        if (isNaN(body) || body < 0) {
          globalErrors[process.name] = `Invalid wait duration: ${body}`;
          return;
        }
        try {
          await new Promise((resolve) => setTimeout(resolve, body));
          globalObj[process.name] = `Waited for ${body} milliseconds`;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'math-randomInt',
      label: 'Generate Random Integer',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          min: {
            type: 'number',
            title: 'Minimum Value',
          },
          max: {
            type: 'number',
            title: 'Maximum Value',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'min', 'max'],
      },
      process: async (process, globalObj, globalErrors) => {
        try {
          const { min, max } = process;
          const result = Math.floor(Math.random() * (max - min + 1)) + min;
          return (globalObj[process.name] = result);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'randomFloat',
      label: 'Generate Random Float',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          min: {
            type: 'number',
            title: 'Minimum Value',
          },
          max: {
            type: 'number',
            title: 'Maximum Value',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'min', 'max'],
      },
      process: async (process, globalObj, globalErrors) => {
        try {
          const { min, max } = process.body;
          const result = Math.random() * (max - min) + min;
          globalObj[process.name] = result;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'randomColor',
      label: 'Generate Random Color',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors) => {
        try {
          const result = `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0')}`;
          globalObj[process.name] = result;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'generateShortId',
      label: 'Generate Short ID',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          capitalize: {
            type: 'boolean',
            title: 'Capitalize ID',
            default: false,
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors) => {
        try {
          const shortId = Math.random().toString(36).substr(2, 8);
          globalObj[process.name] = process?.capitalize ? shortId.toUpperCase() : shortId;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'formula-calculateInterest',
      label: 'Calculate Interest',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          principalAmount: {
            title: 'Principal Amount (Number)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          time: {
            title: 'Time Period (years)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          rate: {
            title: 'Interest Rate (%)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          compound: {
            type: 'boolean',
            title: 'Is Compound Interest?',
            default: false,
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'principalAmount', 'rate', 'time'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const { compound } = process;
          const principal = retrieveBody(
            process.principalAmount.from,
            process?.principalAmount.value,
            event,
            globalObj,
            paramState,
            sessionKey
          );
          const rate = retrieveBody(
            process?.rate.from,
            process?.rate.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const time = retrieveBody(
            process?.time.from,
            process?.time.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const result = compound ? principal * Math.pow(1 + rate / 100, time) : principal + (principal * rate * time) / 100;
          globalObj[process.name] = result;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'formatAsCurrency',
      label: 'Format as Currency',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Number To Format',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          currency: {
            title: 'Currency (eg ZAR)',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'principalAmount', 'rate', 'time'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const currency = retrieveBody(
            process?.currency.from,
            process?.currency.value,
            event,
            globalObj,
            paramState,
            sessionKey
          );
          const value = retrieveBody(
            process?.body.from,
            process?.body.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          globalObj[process.name] = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
          }).format(value);
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'toBase64',
      label: 'Convert String to Base64',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'String',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const body = retrieveBody(
            process?.body?.from,
            process?.body?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          globalObj[process.name] = Buffer.from(body).toString('base64');
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'fromBase64',
      label: 'Decode Base64 String',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            title: 'Base64 String',
            type: 'object',
            properties: {
              from: {
                type: 'string',
                title: 'From',
                enum: ['request', 'controller', 'manual'],
                default: 'manual',
              },
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const body = retrieveBody(
            process?.body?.from,
            process?.body?.value,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          globalObj[process.name] = Buffer.from(body, 'base64').toString('utf8');
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'hash',
      label: 'Hash String (SHA256)',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            type: 'object',
            title: 'Plain text',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const crypto = require('crypto');
        const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
        try {
          globalObj[process.name] = crypto.createHash('sha256').update(body).digest('hex');
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'compareHash',
      label: 'Compare String to Hash',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          plainText: {
            type: 'object',
            title: 'Plain text',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          hashedText: {
            title: 'Hashed Text',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'hashedText', 'plainText'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const crypto = require('crypto');
        const hashedText = retrieveBody('', process?.hashedText?.value, event, globalObj, paramState, sessionKey, process);
        const plainText = retrieveBody('', process?.plainText?.value, event, globalObj, paramState, sessionKey, process);
        try {
          const hash = crypto.createHash('sha256').update(plainText).digest('hex');
          globalObj[process.name] = hash === hashedText;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'encrypt',
      label: 'Encrypt String',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            type: 'object',
            title: 'Text To Encrypt',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          key: {
            type: 'object',
            title: 'key To Encrypt',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'key'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const crypto = require('crypto');
        try {
          const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
          const key = retrieveBody(process.key?.from, process.key?.value, event, globalObj, paramState, sessionKey, process);
          const cipher = crypto.createCipher('aes-256-cbc', key);
          let encrypted = cipher.update(body, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          globalObj[process.name] = encrypted;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'decrypt',
      label: 'Decrypt String',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          body: {
            type: 'object',
            title: 'Encrypted Text',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          key: {
            type: 'object',
            title: 'key To Encrypt',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'body', 'key'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const crypto = require('crypto');
        try {
          const key = retrieveBody(process.key?.from, process.key?.value, event, globalObj, paramState, sessionKey, process);
          const decipher = crypto.createDecipher('aes-256-cbc', key);
          const body = retrieveBody('', process?.body?.value, event, globalObj, paramState, sessionKey, process);
          let decrypted = decipher.update(body, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          globalObj[process.name] = decrypted;
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'if-statement',
      label: 'Switch Statement',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          conditions: {
            title: 'Conditions To Evaluate',
            type: 'array',
            default: [
              {
                key: 'true',
                value: {
                  value: 'defaultValue',
                },
              },
              {
                key: 'false',
                value: {
                  value: 'defaultValue',
                },
              },
            ],
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  pattern: '^[^.]+$',
                  title: 'Key',
                  description: '*NOTE: Changing the key name will delete branch items',
                },
                value: {
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
              required: ['key', 'value'],
            },
          },
          defaultCondition: {
            type: 'string',
            title: 'Default Condition',
            readOnly: true,
          },
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'conditions'],
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
        debug
      ) => {
        let condition = '';

        if (process?.conditions && !condition) {
          for (const item of process.conditions) {
            const checkIfTrue = retrieveBody('', item?.value?.value, event, globalObj, paramState, sessionKey, process);

            if (checkIfTrue) {
              condition = item.key;
              break; // Exit the loop
            }
          }
        }

        // const processes = process.branches?.[condition] || [];
        const processes = process.branches?.[condition] || [];
        // message.info()

        try {
          await executeProcess(
            0,
            processes.map((processItem) => ({
              ...processItem,
              name: `${process.name}.${processItem.name}`,
            })),
            appId,
            navigate,
            paramState,
            debug,
            process.compId,
            process.pageId,
            event,
            process?.renderElementUtil,
            process.editMode,
            // process?.editMode,
            process
          );
        } catch (error) {
          globalErrors[process.name] = error;
        }
      },
    },
    {
      key: 'appCompose-generator',
      label: 'Generator',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          maps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'object',
                  title: 'New Property Name',
                  properties: {
                    value: {
                      type: 'string',
                      title: 'Value',
                    },
                  },
                },
                value: {
                  title: 'New Value',
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
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        const localErrors = [];
        try {
          globalObj[process.name] = generateObject(process.maps, event, globalObj, paramState, sessionKey, process);
          if (localErrors?.length > 0) {
            globalErrors[process.name] = localErrors;
          }
        } catch (error) {
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
      key: 'appCompose-composer',
      label: 'Composer',
      schema: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps ',
          },
          maps: {
            title: 'New Object',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'object',
                  title: 'New Property',
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
          assignToKey: {
            title: 'Assign Key',
            type: 'string',
          },
          appendToGlobal: {
            title: 'Append To Global Return',
            type: 'boolean',
            default: true,
          },
          terminateOnError: {
            title: 'Short Circuit On Error',
            type: 'boolean',
            default: true,
          },
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors, req, {}, makeHitRequest) => {
        const localErrors = [];
        try {
          const data = generateObject(process.maps, event, globalObj, paramState, sessionKey, makeHitRequest);
          if (process?.modifyController) {
            Object.keys(data)?.map((item) => {
              globalObj[process?.modifyController[item]] = data[item];
            });
          }
          globalObj[process?.name] = data;
          if (localErrors?.length > 0) {
            globalErrors[process.name] = localErrors;
          }
        } catch (error) {
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...(error || {
              error: 'something went wrong',
            }),
          };
        }
      },
    },
  ],
};

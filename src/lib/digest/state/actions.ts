import { getUrlDetails, getValueByPath, retrieveBody } from './utils';
import { initJsonDebugStyles, logJsonDebug } from './debug';

import WebSocket from 'ws';
import axios from 'axios';
import { message } from 'antd';

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
          console.error(error);
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
          console.error(error);
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
        let key = '';
        const newState = {};
        // message.error('ff');
        renderElementUtil(process);
        try {
          // if (process.level === 'component') {
          //   if (process.pageId) key = process.pageId;
          //   if (process?.elementOverride) {
          //     key = `${key}.${process.elementOverride}`;
          //   } else {
          //     key = `${key}.${process.compId}`;
          //   }
          //   key = key
          //     ? `${key}.${retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey,process.compId)}`
          //     : retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey,process.compId);
          // }
          // if (process.level === 'page') {
          //   if (process.pageId) key = process.pageId;
          //   key = key
          //     ? `${key}.${retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey,process.compId)}`
          //     : retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey,process.compId);
          // }
          // if (process.level === 'global') {
          //   key = key
          //     ? `${key}.${retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey,process.compId)}`
          //     : retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey,process.compId);
          // }

          globalObj[process.name] = {
            data: '',
          };
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
      key: 'state-setState',
      label: 'Set State',
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
            enum: ['component', 'page', 'global'],
            default: 'component',
          },
          elementOverride: {
            title: 'Element',
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, fullstops ',
            config: {
              uiType: 'elementSelect',
            },
          },
          key: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
          payload: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
        },
        required: ['name', 'key', 'payload', 'elementOverride'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        let key = '';
        const newState = {};
        try {
          if (process.level === 'component') {
            if (process.pageId) key = process.pageId;
            if (process?.elementOverride) {
              key = `${key}.${process.elementOverride}`;
            } else {
              key = `${key}.${process.compId}`;
            }
            key = key
              ? `${key}.${retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process)}`
              : retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process);
          }
          if (process.level === 'page') {
            if (process.pageId) key = process.pageId;
            key = key
              ? `${key}.${retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process)}`
              : retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process);
          }
          if (process.level === 'global') {
            key = key
              ? `${key}.${retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process)}`
              : retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process);
          }
          const payload = retrieveBody('', process.payload.value, event, globalObj, paramState, sessionKey, process);
          newState[key] = payload;
          process?.store.dispatch(
            process?.setAppStatePartial({
              payload,
              key,
            })
          );
          globalObj[process.name] = {
            data: newState,
          };
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
                title: 'Value',
              },
            },
          },
          payload: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
          },
        },
        required: ['name', 'payload', 'key'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const key = retrieveBody('', process.key.value, event, globalObj, paramState, sessionKey, process);
          const payload = retrieveBody('', process.payload.value, event, globalObj, paramState, sessionKey, process);
          process?.store.dispatch(
            process.setSessionInfo({
              id: sessionKey,
              key: key,
              data: payload,
            })
          );
          process?.store.dispatch(process?.refreshAppAuth());

          // process?.store.dispatch(process?.refreshAppAuth());
          globalObj[process.name] = {
            data: {
              sessionInfo: {
                id: sessionKey,
                key: key,
                data: payload,
              },
            },
          };
        } catch (error) {
          message.error('j');
          console.error(error);
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
          process?.store.dispatch(
            process?.setDestroyInfo({
              id: sessionKey,
            })
          );
          process?.store.dispatch(process?.refreshAppAuth());
          globalObj[process.name] = {
            data: {},
          };
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
        },
        required: ['name'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          const body = retrieveBody('', process.body?.value, event, globalObj, paramState, sessionKey, process);
          const headers = retrieveBody('', process.headers?.value, event, globalObj, paramState, sessionKey, process);
          const res = await process?.storeInvocation(
            body,
            appId,
            process.controller,
            process?.componentId,
            process?.viewId,
            headers
          );
          if (Object.keys(res.data?.errors || {})?.length > 0) {
            message.error(JSON.stringify(res.data.errors, null, 2));
          }
          globalObj[process.name] = process?.returnKey
            ? getValueByPath(res.data.data, process?.returnKey)
            : {
                ...res.data.data,
              };
        } catch (error) {
          console.error(error);
          // message.error('err ');
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
      key: 'websocket-connection',
      label: 'WebSocket Connection',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'No spaces, caps',
          },
          action: {
            type: 'object',
            properties: {
              valuee: {
                type: 'string',
                title: 'Action',
                enum: ['connect', 'send', 'close'],
                default: 'connect',
              },
            },
          },
          url: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'WebSocket URL',
                description: 'URL for the WebSocket connection',
              },
            },
          },
          message: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Message',
                description: 'Message to send over the WebSocket connection',
              },
            },
          },
          protocols: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Protocols',
                description: 'WebSocket protocols (comma-separated)',
              },
            },
          },
          connectionId: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Connection ID',
                description: 'ID of an existing WebSocket connection (for send/close actions)',
              },
            },
          },
          onMessage: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'On Message Handler',
                description: 'Function body for handling incoming messages',
              },
            },
          },
          storeMessages: {
            type: 'object',
            properties: {
              valuee: {
                type: 'string',
                title: 'Store Messages',
                description: 'Whether to store received messages in the result',
                enum: ['true', 'false'],
                default: 'true',
              },
            },
          },
        },
        required: ['name', 'action'],
        dependencies: {
          action: {
            oneOf: [
              {
                properties: {
                  action: {
                    properties: {
                      value: {
                        enum: ['connect'],
                      },
                    },
                  },
                },
                required: ['url'],
              },
              {
                properties: {
                  action: {
                    properties: {
                      value: {
                        enum: ['send'],
                      },
                    },
                  },
                },
                required: ['connectionId', 'message'],
              },
              {
                properties: {
                  action: {
                    properties: {
                      value: {
                        enum: ['close'],
                      },
                    },
                  },
                },
                required: ['connectionId'],
              },
            ],
          },
        },
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // Extract parameters
          const action = retrieveBody('connect', process.action?.valuee, event, globalObj, paramState, sessionKey, process);

          // Global WebSocket store (if not exists already)
          if (!global._webSocketConnections) {
            global._webSocketConnections = {};
          }

          // Process based on action
          switch (action) {
            case 'connect': {
              const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
              const protocolsStr = retrieveBody(
                '',
                process.protocols?.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
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
                retrieveBody('true', process.storeMessages?.valuee, event, globalObj, paramState, sessionKey, process) ===
                'true';

              // Parse protocols if provided
              const protocols = protocolsStr ? protocolsStr.split(',').map((p) => p.trim()) : [];

              // Require WebSocket library
              // const WebSock/et = require('ws');

              // Create WebSocket connection
              // message.info(`Connecting to WebSocket: ${url}`);
              const ws = new WebSocket(url, protocols);

              // Generate connection ID
              const connectionId = `ws_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

              // Create message storage array if needed
              const messages = storeMessages ? [] : null;

              // Store connection
              global._webSocketConnections[connectionId] = {
                ws,
                url,
                messages,
                status: 'connecting',
              };

              // Return a promise that resolves when the connection is open
              await new Promise((resolve, reject) => {
                // Handle connection open
                ws.on('open', () => {
                  global._webSocketConnections[connectionId].status = 'connected';
                  // message.success(`WebSocket connected: ${url}`);
                  resolve();
                });

                // Handle connection error
                ws.on('error', (error) => {
                  global._webSocketConnections[connectionId].error = error.message;
                  global._webSocketConnections[connectionId].status = 'error';
                  message.error(`WebSocket error: ${error.message}`);
                  reject(error);
                });

                // Handle connection close
                ws.on('close', (code, reason) => {
                  global._webSocketConnections[connectionId].status = 'closed';
                  global._webSocketConnections[connectionId].closeCode = code;
                  global._webSocketConnections[connectionId].closeReason = reason.toString();
                  // message.info(`WebSocket closed: Code ${code}`);
                });

                // Handle incoming messages
                ws.on('message', (data) => {
                  let parsedData;
                  try {
                    parsedData = JSON.parse(data.toString());
                  } catch (e) {
                    parsedData = data.toString();
                  }

                  // Store message if configured to do so
                  if (storeMessages) {
                    global._webSocketConnections[connectionId].messages.push({
                      timestamp: new Date().toISOString(),
                      data: parsedData,
                    });
                  }

                  // Execute onMessage handler if provided
                  if (onMessageBody) {
                    try {
                      const onMessageFn = new Function('data', 'globalObj', onMessageBody);
                      onMessageFn(parsedData, globalObj);
                    } catch (handlerError) {
                      message.error(`Error in message handler: ${handlerError.message}`);
                    }
                  }
                });
              });

              // Store result
              globalObj[process.name] = {
                data: {
                  connectionId,
                  status: 'connected',
                  url,
                },
              };
              break;
            }

            case 'send': {
              const connectionId = retrieveBody(
                '',
                process.connectionId?.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
              const messageData = retrieveBody(
                '',
                process.message?.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );

              // Check if connection exists
              if (!global._webSocketConnections[connectionId]) {
                throw new Error(`WebSocket connection not found: ${connectionId}`);
              }

              const connection = global._webSocketConnections[connectionId];

              // Check connection status
              if (connection.status !== 'connected') {
                throw new Error(`WebSocket not connected. Status: ${connection.status}`);
              }

              // Prepare message
              let message;
              if (typeof messageData === 'string') {
                try {
                  // Try to parse as JSON first
                  const jsonObj = JSON.parse(messageData);
                  message = typeof jsonObj === 'object' ? JSON.stringify(jsonObj) : messageData;
                } catch (e) {
                  // Not JSON, send as string
                  message = messageData;
                }
              } else if (typeof messageData === 'object') {
                message = JSON.stringify(messageData);
              } else {
                message = String(messageData);
              }

              // Send message
              connection.ws.send(message);
              message.info(`Sent WebSocket message on connection: ${connectionId}`);

              // Store result
              globalObj[process.name] = {
                data: {
                  connectionId,
                  messageSent: true,
                  timestamp: new Date().toISOString(),
                },
              };
              break;
            }

            case 'close': {
              const connectionId = retrieveBody(
                '',
                process.connectionId?.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );

              // Check if connection exists
              if (!global._webSocketConnections[connectionId]) {
                throw new Error(`WebSocket connection not found: ${connectionId}`);
              }

              const connection = global._webSocketConnections[connectionId];

              // Close connection
              connection.ws.close(1000, 'Closed by application');
              message.info(`Closing WebSocket connection: ${connectionId}`);

              // Wait for close event
              await new Promise((resolve) => {
                if (connection.status === 'closed') {
                  resolve();
                } else {
                  connection.ws.on('close', () => resolve());
                }
              });

              // Store result
              globalObj[process.name] = {
                data: {
                  connectionId,
                  status: 'closed',
                  messages: connection.messages,
                },
              };
              break;
            }

            default:
              throw new Error(`Unknown WebSocket action: ${action}`);
          }
        } catch (error) {
          // Store error information
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'WebSocket operation failed',
          };

          message.error(`WebSocket operation failed: ${error.message}`);
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
            description: 'No spaces, caps',
          },
          endpoint: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'GraphQL Endpoint URL',
              },
            },
          },
          operationType: {
            type: 'object',
            properties: {
              valuee: {
                type: 'string',
                title: 'Operation Type',
                enum: ['query', 'mutation'],
                default: 'query',
              },
            },
          },
          operation: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'GraphQL Operation',
                description: 'The GraphQL query or mutation',
              },
            },
          },
          variables: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Variables (JSON)',
                description: 'Variables for the GraphQL operation',
              },
            },
          },
          headers: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Request Headers (JSON)',
              },
            },
          },
          timeout: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Timeout (ms)',
              },
            },
          },
        },
        required: ['name', 'endpoint', 'operation'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // Import axios
          // const axios = require('axios');

          // Extract and process parameters
          const endpoint = retrieveBody('', process.endpoint?.value, event, globalObj, paramState, sessionKey, process);
          const operationType = retrieveBody(
            'query',
            process.operationType?.valuee,
            event,
            globalObj,
            paramState,
            sessionKey,
            process
          );
          const operation = retrieveBody('', process.operation?.value, event, globalObj, paramState, sessionKey, process);
          let timeout = 30000; // Default timeout 30 seconds
          let variables = {};
          let headers = {
            'Content-Type': 'application/json',
          };
          console.log(operation);
          // Process variables if provided
          if (process.variables?.value) {
            try {
              const variablesStr = retrieveBody(
                '{}',
                process.variables?.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
              variables = typeof variablesStr === 'string' ? JSON.parse(variablesStr) : variablesStr;
            } catch (varError) {
              // message.warning('Invalid variables format, using empty variables object');
              variables = {};
            }
          }

          // Process headers if provided
          if (process.headers?.value) {
            try {
              const headersStr = retrieveBody(
                '{}',
                process.headers?.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
              const parsedHeaders = typeof headersStr === 'string' ? JSON.parse(headersStr) : headersStr;
              headers = { ...headers, ...parsedHeaders };
            } catch (headerError) {
              // message.warning('Invalid headers format, using default headers');
            }
          }

          // Process timeout if provided
          if (process.timeout?.value) {
            const timeoutStr = retrieveBody(
              '30000',
              process.timeout?.value,
              event,
              globalObj,
              paramState,
              sessionKey,
              process
            );
            timeout = parseInt(timeoutStr, 10) || 30000;
          }

          // Prepare GraphQL request payload
          const graphqlPayload = {
            query: operation,
            variables: variables,
          };

          // Build request config
          const requestConfig = {
            method: 'POST',
            url: endpoint,
            headers: headers,
            timeout: timeout,
            data: graphqlPayload,
          };

          // Make the request
          // message.info(`Making GraphQL ${operationType} request to ${endpoint}`);
          const response = await axios(requestConfig);

          // Check for GraphQL errors
          if (response.data.errors && response.data.errors.length > 0) {
            throw {
              message: 'GraphQL operation returned errors',
              graphqlErrors: response.data.errors,
            };
          }

          // Store the response in the global object
          globalObj[process.name] = {
            data: response.data.data,
            extensions: response.data.extensions,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };

          message.success(`GraphQL ${operationType} completed successfully`);
        } catch (error) {
          // Prepare error object
          let errorDetails = {
            error: error.message || 'GraphQL request failed',
            code: error.code,
          };

          // Handle GraphQL-specific errors
          if (error.graphqlErrors) {
            errorDetails.graphqlErrors = error.graphqlErrors;
          }

          // Handle HTTP response errors
          if (error.response) {
            errorDetails.response = {
              data: error.response.data,
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
            };
          }

          // Store error information
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            ...errorDetails,
          };

          // Determine error message to display
          let errorMessage = 'GraphQL request failed';
          if (error.graphqlErrors) {
            errorMessage = `GraphQL errors: ${error.graphqlErrors.map((e) => e.message).join(', ')}`;
          } else if (error.message) {
            errorMessage = error.message;
          }

          message.error(errorMessage);
        }
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
            description: 'No spaces, caps',
          },
          method: {
            type: 'object',
            properties: {
              valuee: {
                // Note: typo in original - keeping for compatibility
                type: 'string',
                title: 'HTTP Method',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
              },
            },
          },
          url: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Request URL',
              },
            },
          },
          queryParams: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Query Parameters (JSON)',
              },
            },
          },
          headers: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Request Headers (JSON)',
              },
            },
          },
          body: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Request Body',
              },
            },
          },
          timeout: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Timeout (ms)',
              },
            },
          },
          responseType: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Response Type',
                enum: ['json', 'text', 'blob', 'arraybuffer', 'document'],
                default: 'json',
              },
            },
          },
          retries: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Number of Retries',
                default: '0',
              },
            },
          },
        },
        required: ['name', 'method', 'url'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // Import axios
          // const axios = require('axios');

          // Extract and process parameters
          const method = retrieveBody('GET', process.method?.valuee, event, globalObj, paramState, sessionKey, process);
          let url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
          let headers = {};
          let timeout = 30000; // Default timeout 30 seconds
          let requestBody = null;
          let responseType = 'json'; // Default response type
          let retries = 0; // Default retries

          // Process query parameters if provided
          if (process.queryParams?.value) {
            try {
              const queryParamsStr = retrieveBody(
                '{}',
                process.queryParams?.value,
                event,
                globalObj,
                paramState,
                sessionKey,
                process
              );
              const queryParams = typeof queryParamsStr === 'string' ? JSON.parse(queryParamsStr) : queryParamsStr;

              // Append query parameters to URL
              const urlObj = new URL(url);
              Object.entries(queryParams).forEach(([key, value]) => {
                urlObj.searchParams.append(key, value);
              });
              url = urlObj.toString();
            } catch (queryError) {
              // message.warning('Invalid query parameters format, ignoring query parameters');
            }
          }

          // Process headers if provided
          try {
            const headersStr = retrieveBody('{}', process.headers?.value, event, globalObj, paramState, sessionKey, process);
            headers = typeof headersStr === 'string' ? JSON.parse(headersStr) : headersStr;
          } catch (headerError) {
            // message.warning('Invalid headers format, using default headers');
            headers = {};
          }

          // Process timeout if provided
          if (process.timeout?.value) {
            const timeoutStr = retrieveBody(
              '30000',
              process.timeout?.value,
              event,
              globalObj,
              paramState,
              sessionKey,
              process
            );
            timeout = parseInt(timeoutStr, 10) || 30000;
          }

          // Process response type if provided
          if (process.responseType?.value) {
            responseType = retrieveBody(
              'json',
              process.responseType?.value,
              event,
              globalObj,
              paramState,
              sessionKey,
              process
            );
          }

          // Process retries if provided
          if (process.retries?.value) {
            const retriesStr = retrieveBody('0', process.retries?.value, event, globalObj, paramState, sessionKey, process);
            retries = parseInt(retriesStr, 10) || 0;
          }

          // Process body if provided (for non-GET requests)
          if (['POST', 'PUT', 'PATCH'].includes(method) && process.body?.value) {
            requestBody = retrieveBody('', process.body?.value, event, globalObj, paramState, sessionKey, process);

            // Try to parse if string and not GET request
            if (typeof requestBody === 'string') {
              try {
                requestBody = JSON.parse(requestBody);
              } catch (e) {
                // Keep as string if not valid JSON
              }
            }
          }

          // Build request config
          const requestConfig = {
            method: method,
            url: url,
            headers: headers,
            timeout: timeout,
            responseType: responseType,
          };

          // Add data for non-GET requests
          if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
            requestConfig.data = requestBody;
          }

          // Function to make the request with retries
          const makeRequestWithRetries = async (config, retriesLeft) => {
            try {
              return await axios(config);
            } catch (error) {
              if (retriesLeft > 0 && (error.code === 'ECONNABORTED' || !error.response)) {
                // Network error or timeout, retry
                // message.info(`Retrying request (${retries - retriesLeft + 1}/${retries})...`);
                return makeRequestWithRetries(config, retriesLeft - 1);
              }
              throw error;
            }
          };

          // Make the request with retries
          const startTime = Date.now();
          const response = await makeRequestWithRetries(requestConfig, retries);
          const requestDuration = Date.now() - startTime;

          // Store the response in the global object
          globalObj[process.name] = {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            config: response.config,
            duration: requestDuration,
          };

          // message.success(`Request completed: ${response.status} ${response.statusText} (${requestDuration}ms)`);

          // Log the response to console for debugging
          // console.log(`REST Request "${process.name}" Response:`, response);

          return {
            success: true,
            data: response.data,
          };
        } catch (error) {
          // Handle axios errors
          const errorResponse = error.response
            ? {
                data: error.response.data,
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
              }
            : null;

          // Store error information
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error.message || 'Request failed',
            code: error.code,
            response: errorResponse,
          };

          // message.error(`Request failed: ${error.message}`);

          // Log the error to console for debugging
          console.error(`REST Request "${process.name}" Error:`, error);

          return {
            success: false,
            error: error.message,
            details: errorResponse,
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
            process?.headers
          );
          if (Object.keys(res.data.errors).length > 0) {
            // message.error(JSON.stringify(res.data.errors, null, 2));
          }
          console.log(res.data.data);
          globalObj[process.name] = process?.returnKey
            ? getValueByPath(res.data.data, process?.returnKey)
            : {
                ...res.data.data,
              };
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
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
              },
            },
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
          const type = retrieveBody('', process.messageType?.value, event, globalObj, paramState, sessionKey, process);
          const text = retrieveBody('', process.text?.value, event, globalObj, paramState, sessionKey, process);
          message[type || 'info'](text || 'message');
          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
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
          console.log(process);
          // message.info(process.compId);
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
          const baseUrl = `/applications/${appId}/views/${process?.pageToNavigate}`;
          const fullPath = newPath ? `${baseUrl}/${newPath}` : baseUrl;
          const fullUrl = `${fullPath}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
          if (process.isExternalPath) {
            window.location.href = process?.pageToNavigate;
          } else {
            // message.warning(fullUrl);
            console.log(process);
            !process.editMode && navigate(fullUrl);
          }
          globalObj[process.name] = {
            data: {
              status: 'success',
            },
          };
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
          console.error('Failed to copy URL to clipboard: ', error);
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
          console.log(globalObj);

          // Replace with this simple call:
          logJsonDebug(globalObj, paramState, event, sessionKey, getUrlDetails, process);
          // message.info('kkkk');
        } catch (error) {
          console.error('Failed to copy URL to clipboard: ', error);
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
          console.error('Failed to copy URL to clipboard: ', error);
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
                    from: {
                      type: 'string',
                      title: 'From',
                      default: 'manual',
                      enum: ['state', 'controller', 'manual', 'event', 'params', 'sessiom'],
                    },
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
                    from: {
                      type: 'string',
                      title: 'From',
                      default: 'request',
                      enum: ['state', 'controller', 'manual', 'event', 'params', 'sessiom'],
                    },
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
          console.error('Failed to copy URL to clipboard: ', error);
          globalErrors[process.name] = {
            ...globalErrors?.[process.name],
            error: error?.message || 'something went wrong',
          };
        }
      },
    },
  ],
};
export function generateObject(array, event, globalObj, paramState, sessionKey) {
  const result = {};
  array.forEach((item) => {
    const key = retrieveBody(item.key.from, item.key.value, event, globalObj, paramState, sessionKey) || {};
    const value = retrieveBody(item.value.from, item.value.value, event, globalObj, paramState, sessionKey) || {};
    result[key] = value;
  });
  return result;
}

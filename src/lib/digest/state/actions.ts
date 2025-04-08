import { getUrlDetails, getValueByPath, retrieveBody } from './utils';
import { initJsonDebugStyles, logJsonDebug } from './debug';

import WebSocket from 'ws';
import axios from 'axios';
import { isArray } from 'lodash';
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
        // const blueprint = process?.allElements?.find((el) => el.i === process?.propsMapper?.blueprint);
        // const targetElement = process?.propsMapper?.targetElement;
        // const propsMap = process?.propsMapper.mappings;
        // const defaults = process?.propsMapper.defaults;
        // const newElementId = `${targetElement}-${process?.propsMapper.blueprint}-virtual-${process?.currentIndex}`;
        // const findAndProcessChildren = (originalId, newParentId, isParent) => {
        //   if (!process.setAppStatePartial) {
        //     return [];
        //   }
        //   const childElements = process.allElements?.filter((el) => el.parent === originalId) || [];
        //   return childElements
        //     ?.map((childd) => {
        //       const child = { ...childd };
        //       const newChildId = `${newParentId}-child-${child.i}`;
        //       process?.store.dispatch(
        //         process?.setAppStatePartial({
        //           key: process?.tab + '.' + newChildId,
        //           payload: process.currentItem,
        //         })
        //       );
        //       Object.keys(process?.propsMapper?.defaults || {})?.map((key) => {
        //         // console.log(mapItem?.value);
        //         if (process?.propsMapper?.defaults[key]?.element === childd?.i) {
        //           process?.store.dispatch(
        //             process?.setAppStatePartial({
        //               key: process?.tab + '.' + newChildId + '.' + defaults?.[key]?.targetField,
        //               payload: retrieveBody(
        //                 null,
        //                 process?.propsMapper?.defaults[key]?.value,
        //                 process?.event,
        //                 process?.globalObj,
        //                 process?.paramState,
        //                 process?.sessionKey,
        //                 {
        //                   compId: newChildId,
        //                   store: process?.store,
        //                 }
        //               ),
        //             })
        //           );
        //         }
        //       });
        //       propsMap?.map((mapItem) => {
        //         if (mapItem?.element === childd?.i) {
        //           // message.info(newChildId);

        //           process?.store.dispatch(
        //             process?.setAppStatePartial({
        //               key: process?.tab + '.' + newChildId + '.' + mapItem?.field,
        //               payload: retrieveBody(
        //                 null,
        //                 mapItem?.value,
        //                 process?.event,
        //                 process?.globalObj,
        //                 process?.paramState,
        //                 process?.sessionKey,
        //                 {
        //                   compId: newChildId,
        //                   store: process?.store,
        //                 }
        //               ),
        //             })
        //           );
        //         }
        //       });

        //       const processedChild = {};

        //       // Recursively process this child's children
        //       const grandChildren = findAndProcessChildren(child.i, newChildId, false);
        //       return [processedChild, ...grandChildren];
        //     })
        //     .flat();
        // };

        // // Get all nested children with updated IDs and parents
        // findAndProcessChildren(process?.propsMapper?.blueprint, newElementId, true);

        renderElementUtil({ ...process, event, globalObj, sessionKey, paramState });
        try {
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
          // return;
          payload !== '' &&
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
              // message.info(`Sent WebSocket message on connection: ${connectionId}`);

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
              // message.info(`Closing WebSocket connection: ${connectionId}`);

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
      key: 'window-functions',
      label: 'Window Functions Action',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '^[^.]+$',
            description: 'Unique name for the window action',
          },
          actionType: {
            // type: 'object',
            type: 'string',
            title: 'Window Function Type',
            enum: [
              // Window Methods
              'open',
              'close',
              'print',
              'alert',
              'confirm',
              'prompt',

              // Window Properties Manipulation
              'resize',
              'resizeBy',
              'moveTo',
              'moveBy',

              // Scrolling
              'scroll',
              'scrollTo',
              'scrollBy',

              // Location Manipulation
              'reload',

              // Media Interaction
              'focus',
              'blur',

              // Browser History
              'back',
              'forward',
              'go',

              // Advanced Window Interactions
              'postMessage',
              'openDialog',

              // Performance and Timing
              'requestAnimationFrame',
              'setTimeout',
              'setInterval',

              // Device and Screen
              'matchMedia',

              // Security and Permissions
              'requestIdleCallback',
            ],
          },
          // Common parameters
          value: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Primary Value',
              },
            },
          },
          options: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Additional Options (JSON)',
              },
            },
          },
          // Specific additional parameters
          url: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'URL for Window Open',
              },
            },
          },
          target: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Target for Window Open',
              },
            },
          },
          features: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Window Features',
              },
            },
          },
        },
        required: ['name', 'type'],
      },
      process: async (process, globalObj, globalErrors, event, currentLog, appId, navigate, paramState, sessionKey) => {
        try {
          // Extract action type and parameters
          // console.log;
          const actionType = retrieveBody('', process.actionType, event, globalObj, paramState, sessionKey, process);
          const value = retrieveBody('', process.value?.value, event, globalObj, paramState, sessionKey, process);
          const optionsStr = retrieveBody('{}', process.options?.value, event, globalObj, paramState, sessionKey, process);
          const url = retrieveBody('', process.url?.value, event, globalObj, paramState, sessionKey, process);
          const target = retrieveBody('', process.target?.value, event, globalObj, paramState, sessionKey, process);
          const features = retrieveBody('', process.features?.value, event, globalObj, paramState, sessionKey, process);

          // Parse options
          let options;
          try {
            options = typeof optionsStr === 'string' ? JSON.parse(optionsStr) : optionsStr;
          } catch {
            options = {};
          }

          let result;

          switch (actionType) {
            // Window Creation and Management
            case 'open':
              const newWindow = window.open(url || 'about:blank', target || '_blank', features || 'width=800,height=600');
              result = {
                success: !!newWindow,
                message: newWindow ? 'Window opened' : 'Failed to open window',
                windowName: newWindow?.name,
              };
              break;

            case 'close':
              window.close();
              result = {
                success: true,
                message: 'Window closed',
              };
              break;

            case 'print':
              window.print();
              result = {
                success: true,
                message: 'Print dialog opened',
              };
              break;

            // Dialog Functions
            case 'alert':
              window.alert(value || 'Alert');
              result = {
                success: true,
                message: 'Alert displayed',
              };
              break;

            case 'confirm':
              const confirmed = window.confirm(value || 'Are you sure?');
              result = {
                success: true,
                confirmed: confirmed,
              };
              break;

            case 'prompt':
              const promptResponse = window.prompt(value || 'Enter value:', options?.defaultValue || '');
              result = {
                success: true,
                value: promptResponse,
              };
              break;

            // Window Resizing and Moving
            case 'resize':
              const width = parseInt(options?.width) || window.innerWidth;
              const height = parseInt(options?.height) || window.innerHeight;
              window.resizeTo(width, height);
              result = {
                success: true,
                message: 'Window resized',
                width: width,
                height: height,
              };
              break;

            case 'resizeBy':
              const widthDelta = parseInt(options?.widthDelta) || 0;
              const heightDelta = parseInt(options?.heightDelta) || 0;
              window.resizeBy(widthDelta, heightDelta);
              result = {
                success: true,
                message: 'Window resized by delta',
                widthDelta: widthDelta,
                heightDelta: heightDelta,
              };
              break;

            case 'moveTo':
              const x = parseInt(options?.x) || 0;
              const y = parseInt(options?.y) || 0;
              window.moveTo(x, y);
              result = {
                success: true,
                message: 'Window moved',
                x: x,
                y: y,
              };
              break;

            case 'moveBy':
              const xDelta = parseInt(options?.xDelta) || 0;
              const yDelta = parseInt(options?.yDelta) || 0;
              window.moveBy(xDelta, yDelta);
              result = {
                success: true,
                message: 'Window moved by delta',
                xDelta: xDelta,
                yDelta: yDelta,
              };
              break;

            // Scrolling
            case 'scroll':
            case 'scrollTo':
              const scrollX = parseInt(options?.x) || 0;
              const scrollY = parseInt(options?.y) || 0;
              window.scrollTo(scrollX, scrollY);
              result = {
                success: true,
                message: 'Window scrolled',
                x: scrollX,
                y: scrollY,
              };
              break;

            case 'scrollBy':
              const scrollXDelta = parseInt(options?.xDelta) || 0;
              const scrollYDelta = parseInt(options?.yDelta) || 0;
              window.scrollBy(scrollXDelta, scrollYDelta);
              result = {
                success: true,
                message: 'Window scrolled by delta',
                xDelta: scrollXDelta,
                yDelta: scrollYDelta,
              };
              break;

            // Location Manipulation
            case 'reload':
              window.location.reload(options?.forceGet || false);
              result = {
                success: true,
                message: 'Page reloaded',
                forceGet: options?.forceGet || false,
              };
              break;

            // Window Focus
            case 'focus':
              window.focus();
              result = {
                success: true,
                message: 'Window focused',
              };
              break;

            case 'blur':
              window.blur();
              result = {
                success: true,
                message: 'Window blurred',
              };
              break;

            // Browser History
            case 'back':
              window.history.back();
              result = {
                success: true,
                message: 'Navigated back',
              };
              break;

            case 'forward':
              window.history.forward();
              result = {
                success: true,
                message: 'Navigated forward',
              };
              break;

            case 'go':
              const steps = parseInt(value) || -1;
              window.history.go(steps);
              result = {
                success: true,
                message: 'Navigated through history',
                steps: steps,
              };
              break;

            // Advanced Interactions
            case 'postMessage':
              const targetOrigin = options?.targetOrigin || '*';
              const transferList = options?.transferList || [];
              window.postMessage(value, targetOrigin, transferList);
              result = {
                success: true,
                message: 'Message posted',
                targetOrigin: targetOrigin,
              };
              break;

            case 'openDialog':
              // This is a bit tricky as it depends on browser support
              const dialogElement = document.createElement('dialog');
              dialogElement.innerHTML = value || 'Dialog Content';
              document.body.appendChild(dialogElement);
              dialogElement.showModal();
              result = {
                success: true,
                message: 'Dialog opened',
              };
              break;

            // Performance and Timing
            case 'requestAnimationFrame':
              const animationFrameId = window.requestAnimationFrame(() => {
                // Placeholder for animation logic
                console.log('Animation frame executed');
              });
              result = {
                success: true,
                message: 'Animation frame requested',
                frameId: animationFrameId,
              };
              break;

            case 'setTimeout':
              const timeoutId = window.setTimeout(() => {
                console.log('Timeout executed');
              }, parseInt(value) || 1000);
              result = {
                success: true,
                message: 'Timeout set',
                timeoutId: timeoutId,
                delay: parseInt(value) || 1000,
              };
              break;

            case 'setInterval':
              const intervalId = window.setInterval(() => {
                console.log('Interval executed');
              }, parseInt(value) || 1000);
              result = {
                success: true,
                message: 'Interval set',
                intervalId: intervalId,
                interval: parseInt(value) || 1000,
              };
              break;

            // Device and Screen
            case 'matchMedia':
              const mediaQuery = value || '(max-width: 600px)';
              const mediaQueryList = window.matchMedia(mediaQuery);
              result = {
                success: true,
                message: 'Media query matched',
                matches: mediaQueryList.matches,
                query: mediaQuery,
              };
              break;

            // Security and Idle Callbacks
            case 'requestIdleCallback':
              const idleCallbackId = window.requestIdleCallback(
                () => {
                  console.log('Idle callback executed');
                },
                { timeout: parseInt(value) || 1000 }
              );
              result = {
                success: true,
                message: 'Idle callback requested',
                callbackId: idleCallbackId,
                timeout: parseInt(value) || 1000,
              };
              break;

            default:
              throw new Error(`Unsupported window action: ${actionType}`);
          }

          // Store the result in the global object
          globalObj[process.name] = result;

          return result;
        } catch (error) {
          // Handle errors
          globalErrors[process.name] = {
            error: error.message || 'Window action failed',
            details: error,
          };

          console.error(`Window Action "${process.name}" Error:`, error);

          return {
            success: false,
            error: error.message,
          };
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
          } else {
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

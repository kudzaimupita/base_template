import { getUrlDetails, getValueByPath, retrieveBody } from './utils';
import { initJsonDebugStyles, logJsonDebug } from './debug';

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

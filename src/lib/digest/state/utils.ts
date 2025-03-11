import _ from 'lodash';

export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
export function getValueByPath(obj, path) {
  const keys = path?.split('.') || [];
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object') {
      if (/\[\d+\]/.test(key)) {
        const [propertyName, index] = key.split(/\[|\]/).filter(Boolean);
        if (Array.isArray(result[propertyName])) {
          result = result[propertyName][parseInt(index, 10)];
        } else {
          return undefined;
        }
      } else {
        result = result[key];
      }
    } else {
      return undefined;
    }
  }
  return result;
}
function isStringifiedFunction(str) {
  try {
    const func = new Function(`return ${str}`);
    return typeof func() === 'function';
  } catch (e) {
    return false;
  }
}
function containsHarmfulCode(code) {
  const harmfulKeywords = [
    'eval',
    'Function',
    'setTimeout',
    'setInterval',
    'window',
    'document',
    'alert',
    'confirm',
    'prompt',
    'XMLHttpRequest',
    'fetch',
    'localStorage',
    'sessionStorage',
    'cookie',
    'exec',
    'spawn',
    'child_process',
    'require',
    'import',
    'open',
    'execFile',
    'writeFile',
    'readFile',
    'unlink',
    'rename',
    'mkdir',
    'rmdir',
    'chmod',
    'chown',
    'process',
    'global',
    'postMessage',
    'onmessage',
    'navigator',
    'userAgent',
    'innerHTML',
    'outerHTML',
    'createElement',
    'appendChild',
    'insertBefore',
    'replaceChild',
    'removeChild',
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
    'WebSocket',
    'EventSource',
    'crypto',
    'serviceWorker',
    'Worker',
    'SharedWorker',
    'indexedDB',
    'openDatabase',
    'importScripts',
    'navigator',
    'Notification',
    'Audio',
    'MediaRecorder',
    'MediaStream',
    'RTCPeerConnection',
    'RTCDataChannel',
    'getUserMedia',
    'matchMedia',
    'screen',
    'history',
    'location',
    'frames',
    'frameElement',
    'frame',
    'parent',
    'opener',
    'top',
    'self',
    'performance',
    'MutationObserver',
    'IntersectionObserver',
    'ResizeObserver',
    'FileReader',
    'Blob',
    'URL',
    'URLSearchParams',
    'Clipboard',
    'ClipboardEvent',
    'BroadcastChannel',
    'ReadableStream',
    'WritableStream',
    'TransformStream',
    'File',
    'FileList',
    'FormData',
    'HTMLCanvasElement',
    'OffscreenCanvas',
    'CanvasRenderingContext2D',
    'WebGLRenderingContext',
    'WebGL2RenderingContext',
    'WorkerGlobalScope',
    'IDBFactory',
    'IDBDatabase',
    'IDBObjectStore',
    'IDBTransaction',
    'IDBCursor',
    'IDBRequest',
    'IDBIndex',
    'IDBKeyRange',
    'MediaSource',
    'SourceBuffer',
    'MediaElementSourceNode',
    'AudioContext',
    'AnalyserNode',
    'GainNode',
    'OscillatorNode',
    'BiquadFilterNode',
    'AudioBuffer',
    'AudioBufferSourceNode',
    'AudioWorklet',
    'AudioWorkletNode',
    'Cache',
    'CacheStorage',
    'PushManager',
    'PushSubscription',
    'NotificationEvent',
    'PaymentRequest',
    'PaymentResponse',
    'ServiceWorkerRegistration',
    'ServiceWorkerContainer',
    'ServiceWorkerGlobalScope',
    'CacheQueryOptions',
    'WebAuthn',
    'AuthenticatorAttestationResponse',
    'AuthenticatorAssertionResponse',
    'CredentialsContainer',
    'PublicKeyCredential',
    'AuthenticatorResponse',
    'AuthenticatorData',
    'Bluetooth',
    'BluetoothDevice',
    'BluetoothRemoteGATTServer',
    'BluetoothRemoteGATTService',
    'BluetoothRemoteGATTCharacteristic',
    'BluetoothRemoteGATTDescriptor',
    'NDEFReader',
    'NDEFWriter',
    'NDEFMessage',
    'NDEFRecord',
    'BackgroundFetchManager',
    'BackgroundFetchRecord',
    'BackgroundFetchSettledFetch',
    'BackgroundFetchUpdateUIEvent',
    'StorageManager',
    'MediaDevices',
    'MediaDeviceInfo',
    'MediaStreamTrack',
    'MediaStreamTrackEvent',
    'MediaRecorderErrorEvent',
    'MediaKeySystemAccess',
    'MediaKeySession',
    'MediaKeys',
    'MediaKeyMessageEvent',
    'MediaKeyStatusMap',
    'MediaEncryptedEvent',
    'SpeechRecognition',
    'SpeechGrammar',
    'SpeechGrammarList',
    'SpeechRecognitionError',
    'SpeechRecognitionEvent',
    'SpeechSynthesis',
    'SpeechSynthesisVoice',
    'SpeechSynthesisUtterance',
    'SpeechSynthesisEvent',
    'Gyroscope',
    'Accelerometer',
    'AbsoluteOrientationSensor',
    'RelativeOrientationSensor',
    'Magnetometer',
    'AmbientLightSensor',
    'Barometer',
    'Geolocation',
    'GeolocationPosition',
    'GeolocationCoordinates',
    'GeolocationPositionError',
    'Gamepad',
    'GamepadButton',
    'GamepadEvent',
    'GamepadHapticActuator',
    'GamepadPose',
    'GamepadHapticActuatorType',
    'WebGLShader',
    'WebGLProgram',
    'WebGLFramebuffer',
    'WebGLRenderbuffer',
    'WebGLBuffer',
    'WebGLVertexArrayObject',
    'WebGLSampler',
    'WebGLSync',
    'WebGLTimerQueryEXT',
    'WebGLTransformFeedback',
    'WebGLUniformLocation',
  ];
  for (const keyword of harmfulKeywords) {
    if (code.includes(keyword)) {
      return true;
    }
  }
  return false;
}
function deepParse(input, req = {}, controllers = {}, sessionInfo) {
  if (isStringifiedFunction(input)) {
    if (containsHarmfulCode(input)) {
      return input;
    } else {
      let parsedFunction;
      const invokeController = async (body) => {
        const callInternalRoute = async () => {
          try {
            const newReq = req;
            newReq.body = body;
            const id = (req.requestId = uuidv4());
          } catch (error) {
            return {
              error,
            };
          }
        };
        return await callInternalRoute();
      };
      const result = parsedFunction(sessionInfo, state);
      return result;
    }
  }
  try {
    const jsonObject = JSON.parse(input);
    if (typeof jsonObject === 'object' && jsonObject !== null) {
      for (const key in jsonObject) {
        if (typeof jsonObject[key] === 'string') {
          jsonObject[key] = deepParse(jsonObject[key], controllers);
        }
      }
      return jsonObject;
    }
  } catch (error) {}
  if (input === 'true' || input === 'false') {
    return input === 'true';
  }
  if (!isNaN(input)) {
    return parseFloat(input);
  }
  if (input?.startsWith('[') && input?.endsWith(']')) {
    try {
      const array = JSON.parse(input);
      if (Array.isArray(array)) {
        return array.map((item) => deepParse(item), controllers);
      }
    } catch (error) {}
  }
  return input;
}
function secureInterpolate(template, sources) {
  const predefinedSources = {
    date: {
      now: () => new Date().toISOString(),
      timestamp: () => Date.now(),
      ...Object.getOwnPropertyNames(Date.prototype)
        .filter((key) => typeof Date.prototype[key] === 'function')
        .reduce((acc, method) => {
          acc[method] = () => new Date()[method]();
          return acc;
        }, {}),
    },
    math: {
      random: Math.random,
      ...Math,
    },
    string: {
      ...Object.getOwnPropertyNames(String.prototype)
        .filter((key) => typeof String.prototype[key] === 'function')
        .reduce((acc, method) => {
          acc[method] = (str, ...args) => String.prototype[method].apply(str, args);
          return acc;
        }, {}),
    },
    object: {
      ...Object.getOwnPropertyNames(Object.prototype)
        .filter((key) => typeof Object.prototype[key] === 'function')
        .reduce((acc, method) => {
          acc[method] = (obj, ...args) => Object.prototype[method].apply(obj, args);
          return acc;
        }, {}),
    },
    array: {
      ...Object.getOwnPropertyNames(Array.prototype)
        .filter((key) => typeof Array.prototype[key] === 'function')
        .reduce((acc, method) => {
          acc[method] = (arr, ...args) => Array.prototype[method].apply(arr, args);
          return acc;
        }, {}),
    },
    json: {
      stringify: (value) => JSON.stringify(value),
      parse: (value) => JSON.parse(value),
    },
    lodash: {
      capitalize: _.capitalize,
      // ... (other lodash functions)
    },
    ...sources,
  };

  // Helper function to safely get nested properties
  function safeGet(obj, path) {
    if (!obj) return undefined;
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  function resolveString(str) {
    let resolved = str;
    let hasPlaceholders;
    do {
      hasPlaceholders = false;
      resolved = resolved.replace(/{{(.*?)}}/g, (_, key) => {
        const trimmedKey = key.trim();
        const parsedValue = parseLiteral(trimmedKey);
        if (parsedValue !== undefined) {
          return parsedValue;
        }

        if (
          trimmedKey.includes('===') ||
          trimmedKey.includes('!==') ||
          trimmedKey.includes('>=') ||
          trimmedKey.includes('<=') ||
          trimmedKey.includes('>') ||
          trimmedKey.includes('<') ||
          trimmedKey.includes('&&') ||
          trimmedKey.includes('||') ||
          trimmedKey.includes('!')
        ) {
          try {
            // Create a wrapper function that handles property access safely
            const safeEval = (expr) => {
              // Handle common property access patterns by pre-replacing them with safe access
              const safeExpr = expr.replace(/(\w+(?:\.\w+)+)/g, (match) => {
                return `safeGet(sources, '${match}')`;
              });

              // Create a sandbox for evaluation with the safe get function
              return new Function(
                'sources',
                'safeGet',
                `
                try {
                  return (${safeExpr});
                } catch (e) {
                  return false;
                }
              `
              )(predefinedSources, safeGet);
            };

            const result = safeEval(trimmedKey);
            return result ? 'true' : 'false';
          } catch (err) {
            return 'false';
          }
        }

        // Handle regular property access
        const parts = trimmedKey.split('.');
        let value = predefinedSources;
        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            return '';
          }
        }

        hasPlaceholders = true;
        if (typeof value === 'object') {
          return JSON.stringify(value, null, 2);
        }
        return typeof value === 'function' ? value() : value;
      });
    } while (hasPlaceholders);
    return resolved;
  }

  function parseLiteral(str) {
    try {
      if (str.startsWith('{') && str.endsWith('}')) {
        const formattedStr = str.replace(/(\w+):/g, '"$1":');
        return JSON.parse(formattedStr);
      }
      if (str.startsWith('[') && str.endsWith(']')) {
        return JSON.parse(str);
      }
      if (str === 'true') return true;
      if (str === 'false') return false;
      if (!isNaN(str)) return Number(str);
    } catch (err) {
      return undefined;
    }
    return undefined;
  }

  function parseValue(value) {
    if (typeof value === 'string') {
      const resolved = resolveString(value);
      try {
        return JSON.parse(resolved);
      } catch {
        return resolved;
      }
    } else if (Array.isArray(value)) {
      return value.map((item) => parseValue(item));
    } else if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, parseValue(val)]));
    }
    return value;
  }

  return parseValue(template);
}
export function dotNotationKeysToObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    let current = result;
    keys.forEach((part, index) => {
      if (index === keys.length - 1) {
        current[part] = value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  }
  return result;
}
export const getUrlDetails = (paramss = {}) => {
  const params = { ...paramss };
  const fullUrl = window.location.href;
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const searchParamsObject = Object.fromEntries(searchParams.entries());
  const hash = window.location.hash;
  // const currentView = {
  //   ...store.getState()?.currentAppState?.currentApplication?.views?.find((view) => view.id === pathname.split('/')[4]),
  // };
  // delete currentView.layout;
  delete params?.id;
  delete params?.tab;
  delete params?.setting;
  return {
    fullUrl,
    pathname,
    // currentView,
    searchParams: searchParamsObject,
    params,
    hash,
  };
};
export const retrieveBody = (type, value, event, globalObj, paramState, key, process) => {
  const newValue = deepParse(value, event, globalObj || {}, JSON.parse(localStorage.getItem(key || '') || '{}'));
  const state = process?.store?.getState();
  let newBody = {};
  let localStore;
  try {
    const storedValue = localStorage.getItem(key || '');
    localStore = storedValue ? JSON.parse(storedValue) : {};
  } catch (error) {
    console.error('Error parsing localStorage item:', error);
    localStore = {};
  }
  const fullUrl = window.location.href;
  const pathname = window.location.pathname?.split('/');
  const searchParams = new URLSearchParams(window.location.search);
  const searchParamsObject = Object.fromEntries(searchParams.entries());
  console.log(typeof newValue, newValue, value, searchParamsObject);
  if (typeof newValue === 'string' && newValue?.startsWith('{{self.')) {
    // message.warning('done');
    const cleanPath = newValue
      ?.replace(/{{self\./g, '')
      .replace(/}}/g, '')
      .trim();

    // Split the path into parts in case of nested properties
    const parts = cleanPath.split('.');

    // Get the base object - if compId is missing, just use state.appState[pathname[4]]
    let result = process?.compId ? state?.appState?.[pathname[4]]?.[process.compId] : state?.appState?.[pathname[4]];

    // console.log(state.appState[pathname[4]], process.compId, newValue, parts, result);

    // Handle multi-level property access by traversing the object
    if (result && parts.length) {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Check if this part contains an array index notation
        const arrayMatch = part.match(/(\w+)\[(\d+)\]/);

        if (arrayMatch) {
          // Extract the property name and array index
          const [, propName, indexStr] = arrayMatch;
          const index = parseInt(indexStr, 10);

          // First access the property, then the array index
          result = result?.[propName]?.[index];
        } else {
          // Normal property access
          result = result?.[part];
        }

        // If we hit undefined/null at any point in the traversal, return it immediately
        if (result === undefined || result === null) {
          return result;
        }
      }
    }

    return result;
  }
  // console.lo
  newBody = secureInterpolate(newValue, {
    event: event,
    history: getUrlDetails(paramState),
    localStore: localStore,
    state: dotNotationKeysToObject(state?.appState || {}),
    controller: dotNotationKeysToObject(globalObj || {}),
  });
  // console.log(newBody, newValue, {
  //   event: event,
  //   // history: getUrlDetails(paramState),
  //   localStore: localStore,
  //   state: dotNotationKeysToObject(state.appState || {}),
  //   controller: dotNotationKeysToObject(globalObj || {}),
  // });
  return newBody;
};

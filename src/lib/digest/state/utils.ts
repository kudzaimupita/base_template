import _ from 'lodash';
import { message } from 'antd';

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
  // let publicIP = null;
  const getPublicIP = () => {
    return new Promise((resolve) => {
      fetch('https://api.ipify.org?format=json')
        .then((response) => response.json())
        .then((data) => resolve(data.ip))
        .catch((error) => {
          console.warn('Could not retrieve public IP:', error);
          resolve(null);
        });
    });
  };
  // Breakpoint Calculations
  const breakpoints = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  const getCurrentBreakpoint = () => {
    const width = window.innerWidth;
    if (width < breakpoints.xs) return 'xs';
    if (width < breakpoints.sm) return 'sm';
    if (width < breakpoints.md) return 'md';
    if (width < breakpoints.lg) return 'lg';
    if (width < breakpoints.xl) return 'xl';
    return '2xl';
  };

  // Comprehensive data collection
  return {
    // URL Information
    url: {
      fullUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin,
      protocol: window.location.protocol,
      host: window.location.host,
      hostname: window.location.hostname,
      port: window.location.port,
      searchParams: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
      params: (() => {
        const paramsCopy = { ...paramss };
        delete paramsCopy?.id;
        delete paramsCopy?.tab;
        delete paramsCopy?.setting;
        return paramsCopy;
      })(),
    },

    // Responsive Design Information
    responsive: {
      breakpoints,
      currentBreakpoint: getCurrentBreakpoint(),
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      },
      orientation: window.screen.orientation ? window.screen.orientation.type : null,
      aspectRatio: window.innerWidth / window.innerHeight,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTablet: /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(navigator.userAgent),
    },

    // Device Capabilities
    device: {
      pixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,

      // Input Capabilities
      pointerType: {
        hasTouch: navigator.maxTouchPoints > 0,
        hasMouse: window.matchMedia('(pointer: fine)').matches,
        hasStylus: navigator.maxTouchPoints > 1,
      },
    },

    // Browser Information
    browser: {
      userAgent: navigator.userAgent,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      product: navigator.product,
      productSub: navigator.productSub,
      vendor: navigator.vendor,

      // Capabilities
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      onLine: navigator.onLine,

      // Rendering and Compatibility
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
    },

    // Performance and Timing
    performance: {
      timeOrigin: window.performance.timeOrigin,
      timing: window.performance.timing,
      navigation: window.performance.navigation,
      memory: window.performance.memory || null,
    },

    // Network Information
    network: {
      // ipAddress: getPublicIP(),
      connection: navigator.connection
        ? {
            type: navigator.connection.type,
            effectiveType: navigator.connection.effectiveType,
            downlinkMax: navigator.connection.downlinkMax,
            saveData: navigator.connection.saveData,
          }
        : null,

      // Additional Network Details
      protocols: {
        http: window.location.protocol === 'http:',
        https: window.location.protocol === 'https:',
        webSocket: 'WebSocket' in window,
      },
    },

    // Metadata Collection
    metadata: {
      // Collect all meta tags
      metaTags: Array.from(document.getElementsByTagName('meta')).reduce((acc, meta) => {
        const name = meta.getAttribute('name');
        const property = meta.getAttribute('property');
        const content = meta.getAttribute('content');

        if (name) acc[`name_${name}`] = content;
        if (property) acc[`property_${property}`] = content;

        return acc;
      }, {}),

      // Document Information
      document: {
        title: document.title,
        domain: document.domain,
        URL: document.URL,
        characterSet: document.characterSet,
        contentType: document.contentType,
        readyState: document.readyState,
        referrer: document.referrer,
        lastModified: document.lastModified,
      },
    },

    // Environment and Context
    environment: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locales: navigator.languages,

      // Storage Capabilities
      storage: {
        localStorageAvailable: (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        sessionStorageAvailable: (() => {
          try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return true;
          } catch (e) {
            return false;
          }
        })(),
      },
    },
  };
};

// Utility function to get IP (requires external service)
export const getPublicIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
};
export const retrieveBody = (type, value, event, globalObj, paramState, key, process) => {
  // Helper function to recursively resolve values
  const resolveValue = (val) => {
    if (typeof val !== 'object' || val === null) {
      // Base case: If it's a primitive value or string pattern, process it
      if (typeof val === 'string') {
        return processSingleValue(val, event, globalObj, process, paramState);
      }
      return val;
    }

    // Handle arrays
    if (Array.isArray(val)) {
      return val.map((item) => resolveValue(item));
    }

    // Handle objects - recursively process each property
    const result = {};
    for (const prop in val) {
      if (Object.prototype.hasOwnProperty.call(val, prop)) {
        result[prop] = resolveValue(val[prop]);
      }
    }
    return result;
  };

  // Function to process a single string value
  const processSingleValue = (newValue, event, globalObj, process, paramState) => {
    if (typeof newValue !== 'string') return newValue;

    const state = process?.store?.getState();
    let localStore;

    try {
      const storedValue = localStorage.getItem(key || '');
      localStore = storedValue ? JSON.parse(storedValue) : {};
    } catch (error) {
      console.error('Error parsing localStorage item:', error);
      localStore = {};
    }

    // Handle different path patterns
    if (
      newValue?.startsWith('{{self.') ||
      newValue?.startsWith('{{element.') ||
      newValue?.startsWith('{{styleKeys.') ||
      newValue?.startsWith('{{antComponentKeys.') ||
      newValue?.startsWith('{{tagKeys.')
    ) {
      // Determine the prefix type
      let prefix = '';
      if (newValue?.startsWith('{{self.')) prefix = 'self';
      else if (newValue?.startsWith('{{element.')) prefix = 'element';
      else if (newValue?.startsWith('{{styleKeys.')) prefix = 'styleKeys';
      else if (newValue?.startsWith('{{antComponentKeys.')) prefix = 'antComponentKeys';
      else if (newValue?.startsWith('{{tagKeys.')) prefix = 'tagKeys';

      // Extract the path without the prefix
      const cleanPath = newValue
        ?.replace(new RegExp(`{{${prefix}\\.`, 'g'), '')
        .replace(/}}/g, '')
        .trim();

      // Special handling for tagKeys - extract only the third part
      if (prefix === 'tagKeys' || prefix === 'antComponentKeys') {
        const parts = cleanPath.split('.');
        if (parts.length >= 3) {
          return parts[2]; // Return the third part (index 2)
        } else if (parts.length === 2) {
          return parts[1]; // Return the second part if only two exist
        } else {
          return cleanPath; // Return as is if not enough parts
        }
      }

      // For element and styleKeys, return just the path as is
      if (prefix === 'element' || prefix === 'styleKeys') {
        return cleanPath;
      }

      // For self, use the existing object traversal logic
      if (prefix === 'self') {
        // Split the path into parts in case of nested properties
        const parts = cleanPath.split('.');

        // Get the base object - if compId is missing, just use state.appState[process?.pageId]
        let result = process?.compId
          ? state?.appState?.[process?.pageId]?.[process.compId]
          : state?.appState?.[process?.pageId];

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
    }

    // Handle non-pattern string values with secureInterpolate
    return secureInterpolate(newValue, {
      event: event,
      window: getUrlDetails(paramState),
      localStore: localStore,
      state: dotNotationKeysToObject(state?.appState || {}),
      controller: dotNotationKeysToObject(globalObj || {}),
    });
  };

  // Start the recursive resolution process
  const parsedValue = deepParse(value, event, globalObj || {}, JSON.parse(localStorage.getItem(key || '') || '{}'));
  return resolveValue(parsedValue);
};

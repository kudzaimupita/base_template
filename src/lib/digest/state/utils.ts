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
  // Handle non-string inputs early
  if (typeof input !== 'string') {
    return input;
  }

  if (isStringifiedFunction(input)) {
    if (containsHarmfulCode(input)) {
      return input;
    } else {
      let parsedFunction;
      const result = parsedFunction(sessionInfo, req);
      return result;
    }
  }
  try {
    const jsonObject = JSON.parse(input);
    if (typeof jsonObject === 'object' && jsonObject !== null) {
      for (const key in jsonObject) {
        if (typeof jsonObject[key] === 'string') {
          jsonObject[key] = deepParse(jsonObject[key], req, controllers, sessionInfo);
        }
      }
      return jsonObject;
    }
  } catch (error) {
    // Ignore JSON parse errors
  }
  if (input === 'true' || input === 'false') {
    return input === 'true';
  }
  if (!isNaN(Number(input)) && input.trim() !== '') {
    return parseFloat(input);
  }
  if (input.startsWith('[') && input.endsWith(']')) {
    try {
      const array = JSON.parse(input);
      if (Array.isArray(array)) {
        return array.map((item) => deepParse(item, req, controllers, sessionInfo));
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }
  return input;
}
function secureInterpolate(template, sources) {
  // Handle case where template is an object - stringify it first if it's a plain object
  if (template && typeof template === 'object' && !Array.isArray(template)) {
    // If it's a plain object with string values that contain template patterns, process it directly
    // Otherwise, stringify it first
    const hasTemplatePatterns = Object.values(template).some(
      (value) => typeof value === 'string' && value.includes('{{') && value.includes('}}')
    );

    if (!hasTemplatePatterns) {
      template = JSON.stringify(template);
    }
  }

  // Debug logging for state access
  const isStateTemplate = typeof template === 'string' && template.includes('{{state.');
  if (isStateTemplate) {
    if (sources.state) {
    }
  }

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
      // Core methods (assuming lodash is available)
      capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
      cloneDeep: (obj) => JSON.parse(JSON.stringify(obj)),
      flatten: (arr) => arr.flat(),
      flattenDeep: (arr) => arr.flat(Infinity),
      uniq: (arr) => [...new Set(arr)],
      merge: (target, ...sources) => Object.assign({}, target, ...sources),
      sortBy: (arr, iteratee) =>
        arr.sort((a, b) => {
          const aVal = typeof iteratee === 'function' ? iteratee(a) : a[iteratee];
          const bVal = typeof iteratee === 'function' ? iteratee(b) : b[iteratee];
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }),
      get: (obj, path, defaultValue) => {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
          if (result == null) return defaultValue;
          result = result[key];
        }
        return result !== undefined ? result : defaultValue;
      },
      isEmpty: (value) => {
        if (value == null) return true;
        if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
      },
      isArray: Array.isArray,
      isObject: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
      isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      isNil: (value) => value == null,
      isNumber: (value) => typeof value === 'number' && !isNaN(value),
      isString: (value) => typeof value === 'string',
      isBoolean: (value) => typeof value === 'boolean',
      isDate: (value) => value instanceof Date,
      isFunction: (value) => typeof value === 'function',
    },
    // Merge provided sources
    ...sources,
  };

  // Helper function to safely get nested values
  function getValue(path, context = predefinedSources) {
    const keys = path.split('.');
    let result = context;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Debug logging for failed lookups
        if (isStateTemplate && path.startsWith('state.')) {
        }
        return undefined;
      }
    }

    // Debug logging for successful lookups
    if (isStateTemplate && path.startsWith('state.')) {
    }

    return result;
  }

  function evaluateComparison(left, operator, right, context = predefinedSources) {
    const leftVal = getValue(left.trim(), context);
    const rightVal = getValue(right.trim(), context);

    switch (operator) {
      case '===':
        return leftVal === rightVal;
      case '!==':
        return leftVal !== rightVal;
      case '==':
        return leftVal == rightVal;
      case '!=':
        return leftVal != rightVal;
      case '>':
        return leftVal > rightVal;
      case '<':
        return leftVal < rightVal;
      case '>=':
        return leftVal >= rightVal;
      case '<=':
        return leftVal <= rightVal;
      default:
        return false;
    }
  }

  function evaluateLogical(expression, context = predefinedSources) {
    // Handle logical operators (&&, ||)
    if (expression.includes('&&')) {
      const parts = expression.split('&&').map((p) => p.trim());
      return parts.every((part) => evaluateExpression(part, context));
    }

    if (expression.includes('||')) {
      const parts = expression.split('||').map((p) => p.trim());
      return parts.some((part) => evaluateExpression(part, context));
    }

    return evaluateExpression(expression, context);
  }

  function evaluateExpression(expression, context = predefinedSources) {
    expression = expression.trim();

    // Handle negation
    if (expression.startsWith('!')) {
      const innerExpression = expression.slice(1).trim();
      return !evaluateExpression(innerExpression, context);
    }

    // Handle comparison operators
    const comparisonOperators = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];

    for (const op of comparisonOperators) {
      if (expression.includes(op)) {
        const [left, right] = expression.split(op, 2);
        return evaluateComparison(left, op, right, context);
      }
    }

    // If no comparison operator, just get the value and check truthiness
    const value = getValue(expression, context);
    return Boolean(value);
  }

  function parseTernary(expression, context = predefinedSources) {
    // Enhanced ternary parsing to handle nested objects and complex conditions
    const ternaryMatch = expression.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);

    if (!ternaryMatch) {
      return null;
    }

    const [, condition, trueValue, falseValue] = ternaryMatch;

    try {
      const conditionResult = evaluateLogical(condition.trim(), context);
      const selectedValue = conditionResult ? trueValue.trim() : falseValue.trim();

      // Parse the selected value
      return parseLiteral(selectedValue) || selectedValue;
    } catch (error) {
      return '';
    }
  }

  function resolveString(str) {
    // Check if this is a simple value (not a string with embedded placeholders)
    if (typeof str !== 'string') {
      return str;
    }

    // If the entire string is just a placeholder, handle it specially
    const fullPlaceholderMatch = str.match(/^{{\s*(.*?)\s*}}$/);
    if (fullPlaceholderMatch) {
      const trimmedKey = fullPlaceholderMatch[1].trim();

      // First, try to parse as a literal
      const parsedValue = parseLiteral(trimmedKey);
      if (parsedValue !== undefined) {
        return parsedValue;
      }

      // Check for ternary operator
      const ternaryResult = parseTernary(trimmedKey, predefinedSources);
      if (ternaryResult !== null) {
        return ternaryResult;
      }

      // Handle complex logical expressions
      if (
        trimmedKey.includes('===') ||
        trimmedKey.includes('!==') ||
        trimmedKey.includes('==') ||
        trimmedKey.includes('!=') ||
        trimmedKey.includes('>=') ||
        trimmedKey.includes('<=') ||
        trimmedKey.includes('>') ||
        trimmedKey.includes('<') ||
        trimmedKey.includes('&&') ||
        trimmedKey.includes('||') ||
        trimmedKey.startsWith('!')
      ) {
        try {
          return evaluateLogical(trimmedKey, predefinedSources);
        } catch (err) {
          return '';
        }
      }

      // Handle standard property references
      const value = getValue(trimmedKey, predefinedSources);
      return value !== undefined ? value : '';
    }

    // Handle strings with embedded placeholders
    let resolved = str;
    let hasPlaceholders;
    let iterations = 0;
    const maxIterations = 10;

    do {
      hasPlaceholders = false;
      iterations++;

      if (iterations > maxIterations) {
        break;
      }

      resolved = resolved.replace(/{{(.*?)}}/g, (match, key) => {
        const trimmedKey = key.trim();

        // First, try to parse as a literal
        const parsedValue = parseLiteral(trimmedKey);
        if (parsedValue !== undefined) {
          hasPlaceholders = true;
          return typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : String(parsedValue);
        }

        // Check for ternary operator
        const ternaryResult = parseTernary(trimmedKey, predefinedSources);
        if (ternaryResult !== null) {
          hasPlaceholders = true;
          return typeof ternaryResult === 'object' ? JSON.stringify(ternaryResult) : String(ternaryResult);
        }

        // Handle complex logical expressions
        if (
          trimmedKey.includes('===') ||
          trimmedKey.includes('!==') ||
          trimmedKey.includes('==') ||
          trimmedKey.includes('!=') ||
          trimmedKey.includes('>=') ||
          trimmedKey.includes('<=') ||
          trimmedKey.includes('>') ||
          trimmedKey.includes('<') ||
          trimmedKey.includes('&&') ||
          trimmedKey.includes('||') ||
          trimmedKey.startsWith('!')
        ) {
          try {
            const result = evaluateLogical(trimmedKey, predefinedSources);
            hasPlaceholders = true;
            return String(result);
          } catch (err) {
            return '';
          }
        }

        // Handle standard property references
        const value = getValue(trimmedKey, predefinedSources);

        if (value === undefined) {
          return '';
        }

        hasPlaceholders = true;

        // Handle different value types
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }

        return String(value);
      });
    } while (hasPlaceholders && iterations < maxIterations);

    return resolved;
  }

  function parseLiteral(str) {
    str = str.trim();

    try {
      // Handle object literals
      if (str.startsWith('{') && str.endsWith('}')) {
        // Fix unquoted keys
        const formattedStr = str.replace(/(\w+)(?=\s*:)/g, '"$1"');
        return JSON.parse(formattedStr);
      }

      // Handle array literals
      if (str.startsWith('[') && str.endsWith(']')) {
        return JSON.parse(str);
      }

      // Handle boolean literals
      if (str === 'true') return true;
      if (str === 'false') return false;

      // Handle null and undefined
      if (str === 'null') return null;
      if (str === 'undefined') return undefined;

      // Handle numeric literals
      if (!isNaN(str) && str !== '') return Number(str);

      // Handle string literals
      if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
      }
    } catch (err) {
      // If parsing fails, return undefined to indicate it's not a literal
      return undefined;
    }

    return undefined;
  }

  function parseValue(value) {
    if (typeof value === 'string') {
      return resolveString(value);
    } else if (Array.isArray(value)) {
      // Recursively process arrays
      return value.map((item) => parseValue(item));
    } else if (value && typeof value === 'object') {
      // Recursively process objects
      return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, parseValue(val)]));
    }
    // Return primitives as-is
    return value;
  }

  return parseValue(template);
}

const template = 'likes({{state.numberoflikes}})';
const sources = {
  state: {
    numberoflikes: 3,
  },
};

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
        const paramsCopy = { ...paramss } as any;
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
      memory: (window.performance as any).memory || null,
    },

    // Network Information
    network: {
      // ipAddress: getPublicIP(),
      connection: (navigator as any).connection
        ? {
            type: (navigator as any).connection.type,
            effectiveType: (navigator as any).connection.effectiveType,
            downlinkMax: (navigator as any).connection.downlinkMax,
            saveData: (navigator as any).connection.saveData,
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

export const getPublicIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
};

/**
 * Creates an enhanced state object that supports both global state and element-specific state
 * @param {Object} appState - The raw app state from Redux store
 * @param {string} compId - Current component ID for element-specific state access
 * @returns {Object} Enhanced state object with global and element access
 */
function createEnhancedStateObject(appState = {}, compId) {
  // Debug what's being passed to this function
  
  // Convert dot-notation keys to nested objects for element-specific state
  const elementState = dotNotationKeysToObject(appState);
  
  // Separate global state from element-specific state
  const globalState = {};
  const elementSpecificState = {};
  
  // Process all state keys
  Object.entries(appState).forEach(([key, value]) => {
    if (key.includes('.')) {
      // This is element-specific state (e.g., "element-id.property")
      const parts = key.split('.');
      if (parts.length >= 2) {
        if (!elementSpecificState[parts[0]]) {
          elementSpecificState[parts[0]] = {};
        }
        const remainingPath = parts.slice(1).join('.');
        _.set(elementSpecificState[parts[0]], remainingPath, value);
      }
    } else {
      // This is global state (e.g., "counter", "userName", etc.)
      globalState[key] = value;
    }
  });
  
  // Create enhanced state structure
  const enhancedState = {
    // Global state properties (accessible as state.counter, state.userName, etc.)
    ...globalState,
    
    // Element-specific state under 'elements' namespace
    elements: elementSpecificState,
    
    // Current element shorthand (for convenience)
    ...(compId && elementSpecificState[compId] ? { current: elementSpecificState[compId] } : {}),
    
    // Backward compatibility - keep the original dot-notation structure
    ...elementState,
    
    // Add a debug helper to see what's available
    _debug: {
      globalKeys: Object.keys(globalState),
      elementKeys: Object.keys(elementSpecificState),
      allKeys: Object.keys(appState),
      compId: compId
    }
  };
  
  return enhancedState;
}

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
    
    // Debug logging for state access issues
    if (newValue.includes('{{state.')) {
    }
    
    let localStore = {};

    // Build localStore from all localStorage items for template access
    try {
      // Get all localStorage keys for comprehensive access
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            localStore[key] = value ? JSON.parse(value) : value;
          } catch (parseError) {
            // If not JSON, store as string
            localStore[key] = localStorage.getItem(key);
          }
        }
      }
    } catch (error) {
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
          // Return the third part (index 2)
          return parts[2];
        } else if (parts.length === 2) {
          // Return the second part if only two exist
          return parts[1];
        } else {
          // Return as is if not enough parts
          return cleanPath;
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
        let result = process?.compId ? state?.appState?.[process.compId] : state?.appState;

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
    // Add comprehensive debugging to see the full state structure
    
    // Look for counter in the right state slice
    let stateToUse = state?.appState || {};
    
    // If appState is empty, try to find the counter in other slices
    if (Object.keys(stateToUse).length === 0) {
      
      // Check if counter exists in the root state
      if (state && 'counter' in state) {
        stateToUse = { counter: state['counter'] };
      }
      // Check if counter exists in currentAppState
      else if (state?.currentAppState && 'counter' in state.currentAppState) {
        stateToUse = { counter: state.currentAppState['counter'] };
      }
      // Check if counter exists in any other slice
      else {
        // Look through all state slices for counter
        for (const [sliceName, sliceData] of Object.entries(state || {})) {
          if (sliceData && typeof sliceData === 'object' && 'counter' in sliceData) {
            stateToUse = { counter: sliceData['counter'] };
            break;
          }
        }
      }
    }
    
    const finalEnhancedState = createEnhancedStateObject(stateToUse, process?.compId);
    
    // Debug the enhanced state object
    if (newValue.includes('{{state.')) {
    }
    
    
    const result = secureInterpolate(newValue, {
      event: event,
      window: getUrlDetails(paramState),
      localStore: localStore,
      state: finalEnhancedState,
      controller: dotNotationKeysToObject(globalObj || {}),
    });
    
    return result;
  };

  // Start the recursive resolution process
  const parsedValue = deepParse(value, event, globalObj || {}, JSON.parse(localStorage.getItem(key || '') || '{}'));
  return resolveValue(parsedValue);
};

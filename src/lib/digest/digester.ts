import _ from 'lodash';
import { nativePlugins } from './state/nativeSteps';
import { statePlugin } from './state/actions';
import { tempStore } from './tempStore';
import { message } from 'antd';

const BATCH_SIZE = 10; // Configurable batch size for concurrent processing
const MAX_CONCURRENT_OPERATIONS = 5; // Limit concurrent operations to prevent overwhelming

export const generatePluginKey = (plugins) => {
  if (!plugins || plugins.length === 0) {
    return 'no-plugins';
  }

  return plugins
    ?.map((plugin) => {
      const pluginId = plugin?.id || '';
      const pluginType = plugin?.type || '';
      return `${pluginType}-${pluginId}`;
    })
    .join('_');
};

const operationsCache = new Map();
let allOperations = null;

const getOperations = () => {
  if (!allOperations) {
    allOperations = [...(statePlugin?.operations || []), ...(nativePlugins?.operations?.filter((item) => item.key) || [])];
  }
  return allOperations;
};

const memoizedDotNotation = _.memoize(
  (obj) => {
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
      _.set(result, key, value);
    });
    return result;
  },
  (obj) => JSON.stringify(obj)
);

let memoizationClearCounter = 0;
export const clearMemoizationCache = () => {
  if (++memoizationClearCounter > 100) {
    memoizedDotNotation.cache.clear();
    memoizationClearCounter = 0;
  }
};

class MessageLogger {
  constructor() {
    this.messages = [];
    this.maxMessages = 1000; // Prevent memory leaks
    this.subscribers = new Set();
  }

  log(level, message, context = {}) {
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      stack: level === 'error' ? new Error().stack : null
    };

    this.messages.push(logEntry);
    
    // Maintain max messages limit
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    // Notify subscribers
    this.notifySubscribers(logEntry);

    // Console output for development
    // if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    //   this.consoleOutput(logEntry);
    // }

    return logEntry;
  }

  info(message, context = {}) {
    return this.log('info', message, context);
  }

  warn(message, context = {}) {
    return this.log('warn', message, context);
  }

  error(message, context = {}) {
    return this.log('error', message, context);
  }

  debug(message, context = {}) {
    return this.log('debug', message, context);
  }

  success(message, context = {}) {
    return this.log('success', message, context);
  }

  // Log operation execution
  logOperation(operation, phase, context = {}) {
    const message = `Operation ${operation.type || 'unknown'} - ${phase}`;
    return this.info(message, {
      ...context,
      operationType: operation.type,
      operationId: operation.id,
      phase
    });
  }

  // Log controller execution
  logController(controller, phase, context = {}) {
    const message = `Controller execution - ${phase}`;
    return this.info(message, {
      ...context,
      controllerPlugins: controller?.plugins?.length || 0,
      phase
    });
  }

  // Log state changes
  logStateChange(path, oldValue, newValue, context = {}) {
    const message = `State changed: ${path}`;
    return this.debug(message, {
      ...context,
      path,
      oldValue: this.sanitizeValue(oldValue),
      newValue: this.sanitizeValue(newValue),
      type: 'state_change'
    });
  }

  // Get all messages - now returns latest first by default
  getMessages(filters = {}) {
    let filtered = this.messages;

    if (filters.level) {
      filtered = filtered.filter(msg => msg.level === filters.level);
    }

    if (filters.since) {
      const since = new Date(filters.since);
      filtered = filtered.filter(msg => new Date(msg.timestamp) >= since);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.message.toLowerCase().includes(search) ||
        JSON.stringify(msg.context).toLowerCase().includes(search)
      );
    }

    // Sort by timestamp descending (latest first)
    filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit); // Changed from slice(-filters.limit) to slice(0, filters.limit)
    }

    return filtered;
  }

  // Get messages by level
  getErrors() {
    return this.getMessages({ level: 'error' });
  }

  getWarnings() {
    return this.getMessages({ level: 'warn' });
  }

  getDebugMessages() {
    return this.getMessages({ level: 'debug' });
  }

  // Subscribe to real-time messages
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Clear messages
  clear() {
    this.messages = [];
    this.notifySubscribers({ type: 'cleared' });
  }

  // Export messages (for debugging)
  export() {
    return {
      messages: this.messages,
      timestamp: new Date().toISOString(),
      count: this.messages.length
    };
  }

  // Private methods
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  notifySubscribers(logEntry) {
    this.subscribers.forEach(callback => {
      try {
        callback(logEntry);
      } catch (error) {
        // console.error('Error in message logger subscriber:', error);
      }
    });
  }

  consoleOutput(logEntry) {
    const style = this.getConsoleStyle(logEntry.level);
    const contextStr = Object.keys(logEntry.context).length > 0 
      ? `\nContext: ${JSON.stringify(logEntry.context, null, 2)}` 
      : '';
    

  }

  getConsoleStyle(level) {
    const styles = {
      error: 'color: #ff4444; font-weight: bold;',
      warn: 'color: #ffaa00; font-weight: bold;',
      info: 'color: #4488ff;',
      debug: 'color: #888888;',
      success: 'color: #44ff44; font-weight: bold;'
    };
    return styles[level] || 'color: #000000;';
  }

  sanitizeContext(context) {
    try {
      // Remove circular references and large objects
      return JSON.parse(JSON.stringify(context, this.getCircularReplacer()));
    } catch (error) {
      return { error: 'Failed to sanitize context', original: String(context) };
    }
  }

  sanitizeValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'object') {
      try {
        return JSON.parse(JSON.stringify(value, this.getCircularReplacer()));
      } catch {
        return '[Complex Object]';
      }
    }
    return value;
  }

  getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    };
  }
}


const messageLogger = new MessageLogger();

class StateManager {
  constructor() {
    this.obj = {};
    this.errors = {};
    this.log = {};
    this.stateCache = new Map();
    this.cacheVersion = 0;
  }

  reset() {
    this.obj = {};
    this.errors = {};
    this.log = {};
    this.stateCache.clear();
    this.cacheVersion++;
    
    messageLogger.info('StateManager reset');
  }

  getState() {
    const cacheKey = `${this.cacheVersion}-${Object.keys(this.obj).length}-${Object.keys(this.errors).length}`;
    
    if (this.stateCache.has(cacheKey)) {
      return this.stateCache.get(cacheKey);
    }

    const state = {
      data: memoizedDotNotation(this.obj),
      errors: memoizedDotNotation(this.errors),
    };
    
    this.stateCache.set(cacheKey, state);
    
    // Clear cache periodically
    if (this.stateCache.size > 50) {
      const keys = Array.from(this.stateCache.keys());
      keys.slice(0, 25).forEach(key => this.stateCache.delete(key));
    }
    
    return state;
  }

  setState(path, value) {
    const oldValue = _.get(this.obj, path);
    _.set(this.obj, path, value);
    this.stateCache.clear(); // Invalidate cache
    this.cacheVersion++;
    
    messageLogger.debug(`State changed: ${path}`, {
      path,
      type: 'state_change'
    });
  }

  setError(path, error) {
    _.set(this.errors, path, error);
    this.stateCache.clear(); // Invalidate cache
    this.cacheVersion++;
    
    messageLogger.error(`State error at ${path}`, {
      path,
      error: error.message || error,
      type: 'state_error'
    });
  }
}

const stateManager = new StateManager();

export const findOperation = (type) => {
  if (operationsCache.has(type)) {
    return operationsCache.get(type);
  }
  
  const operations = getOperations();
  const op = operations.find((item) => item?.key === type);
  
  if (op) {
    operationsCache.set(type, op);
  }
  
  return op;
};

export async function processBatch(items, batchSize, processor) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, index) => processor(item, i + index))
    );
    results.push(...batchResults);
  }
  
  return results;
}

export class Semaphore {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.current = 0;
    this.queue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.current < this.maxConcurrent) {
        this.current++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    this.current--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.current++;
      next();
    }
  }
}



export const getPerformanceMetrics = () => ({
  operationsCacheSize: operationsCache.size,
  stateManagerCacheSize: stateManager.stateCache?.size || 0,
  messageLoggerQueueSize: messageLogger.batchedLogs?.length || 0,
});

export const clearAllCaches = () => {
  operationsCache.clear();
  stateManager.stateCache?.clear();
  memoizedDotNotation.cache.clear();
  messageLogger.messages = [];
  messageLogger.batchedLogs = [];
};

export { messageLogger };
export const logMessage = (level, message, context) => messageLogger.log(level, message, context);
export const logInfo = (message, context) => messageLogger.info(message, context);
export const logWarn = (message, context) => messageLogger.warn(message, context);
export const logError = (message, context) => messageLogger.error(message, context);
export const logDebug = (message, context) => messageLogger.debug(message, context);
export const logSuccess = (message, context) => messageLogger.success(message, context);

export const processHit = async (
  process,
  operations,
  applicationId,
  navigate,
  params,
  debug,
  compId,
  pageId,
  event,
  renderElementUtil,
  editMode,
  config
) => {
  const startTime = performance.now();
  
  try {
    const op = findOperation(process.type);
    if (!op) {
      const error = new Error(`Operation '${process?.type}' is not supported`);
      throw error;
    }

    const sessionKey = `${applicationId}-sessionInfo`;

    const result = await op.process(
      {
        ...process,
        compId,
        pageId,
        renderElementUtil,
        component: compId,
        editMode: editMode,
        store: config?.store,
        refreshAppAuth: config?.refreshAppAuth,
        setDestroyInfo: config?.setDestroyInfo,
        setSessionInfo: config?.setSessionInfo,
        setAppStatePartial: config?.setAppStatePartial,
        storeInvocation: config?.storeInvocation,
      },
      stateManager.obj,
      stateManager.errors,
      event,
      stateManager.log,
      applicationId,
      navigate,
      params,
      sessionKey,
      debug,
      renderElementUtil
    );

    const duration = performance.now() - startTime;
    
    if (duration > 100) { // Only log slow operations
      messageLogger.warn(`Slow operation detected`, {
        operationType: process.type,
        duration: `${duration.toFixed(2)}ms`,
        compId,
        pageId
      });
    }

    return result;
  } catch (error) {
    messageLogger.error(`Process hit failed`, {
      operationType: process.type,
      error: error.message,
      compId,
      pageId
    });
    throw error;
  }
};

export const executeProcess = async (
  index,
  operations,
  applicationId,
  navigate,
  params,
  debug,
  compId,
  pageId,
  event,
  renderElementUtil,
  editMode,
  config
) => {
  if (!operations?.[index]) {
    return stateManager.getState();
  }

  const item = operations[index];

  try {
    await processHit(
      { ...item },
      operations,
      applicationId,
      navigate,
      params,
      debug,
      compId,
      pageId,
      event,
      renderElementUtil,
      editMode,
      config
    );

    // Tail call optimization for recursion
    return await executeProcess(
      index + 1,
      operations,
      applicationId,
      navigate,
      params,
      debug,
      compId,
      pageId,
      event,
      renderElementUtil,
      editMode,
      config
    );
    message.info(`Process executed successfully at step ${index}`)
  } catch (error) {

    messageLogger.error(`Process execution failed at step ${index}`, {
      index,
      operation: item?.type,
      operationId: item?.id,
      error: error.message
    });
    throw error;
  }
};

export const processController = async (
  controllerToExecute,
  event,
  applicationId,
  navigate,
  params,
  type,
  compId,
  debug,
  pageId,
  renderElementUtil,
  editMode,
  config
) => {
  const startTime = performance.now();
  
  stateManager.reset();
  const plugins = controllerToExecute?.plugins || [];

  const pluginKey = generatePluginKey(plugins);
  const controllerKey = `${pluginKey}`;

  // Optimized circular replacer
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    };
  };

  const stringified = JSON.stringify(event, getCircularReplacer());
  tempStore.storeEvent(controllerKey, stringified);

  try {
    const result = await executeProcess(
      0,
      plugins,
      applicationId,
      navigate,
      params,
      debug,
      compId,
      pageId,
      event,
      renderElementUtil,
      editMode,
      config
    );

    tempStore.storeResult(controllerKey, result);
    
    const duration = performance.now() - startTime;
    
    if (duration > 500) { // Log slow controllers
      messageLogger.warn(`Slow controller execution`, {
        controllerKey,
        duration: `${duration.toFixed(2)}ms`,
        pluginCount: plugins.length
      });
    }

    return result;
  } catch (error) {
    messageLogger.error('Process controller error', {
      controllerKey,
      error: error.message
    });

    tempStore.storeResult(controllerKey, { error: error.message });
    throw error;
  }
};
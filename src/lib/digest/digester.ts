import _ from 'lodash';
import { nativePlugins } from './state/nativeSteps';
import { statePlugin } from './state/actions';
import { tempStore } from './tempStore';

export const generatePluginKey = (plugins) => {
  if (!plugins || plugins.length === 0) {
    return 'no-plugins';
  }

  // Create a string representing the plugin configuration
  // For each plugin, use its type and id (if available) to create a unique identifier
  return plugins
    ?.map((plugin) => {
      const pluginId = plugin.id || '';
      const pluginType = plugin.type || '';
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
class StateManager {
  constructor() {
    this.obj = {};
    this.errors = {};
    this.log = {};
  }
  reset() {
    this.obj = {};
    this.errors = {};
    this.log = {};
  }
  getState() {
    return {
      data: memoizedDotNotation(this.obj),
      errors: memoizedDotNotation(this.errors),
    };
  }
}
const stateManager = new StateManager();
const findOperation = (type) => {
  if (operationsCache.has(type)) {
    return operationsCache.get(type);
  }
  const operations = getOperations();
  const op = operations.find((item) => item.key === type);
  if (op) {
    operationsCache.set(type, op);
  }
  return op;
};
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
  const op = findOperation(process.type);
  if (!op) {
    throw new Error(`Operation '${process?.type}' is not supported`);
  }
  //
  const sessionKey = `${applicationId}-sessionInfo`;

  return await op.process(
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
  // console.log(compos, operations, compId);
  const item = operations[index];

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
  // return;
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
  // return;
  stateManager.reset();
  const plugins = controllerToExecute?.plugins || [];

  // Create a unique key for this controller execution
  const pluginKey = generatePluginKey(plugins);
  const controllerKey = `${pluginKey}`;

  function getCircularReplacer() {
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

  const stringified = JSON.stringify(event, getCircularReplacer());

  // Store the event
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

    // Store the result
    tempStore.storeResult(controllerKey, result);
    const allResults = tempStore.getAllResults();
    const allEvents = tempStore.getAllEvents();

    return result;
  } catch (error) {
    console.error('Process controller error:', error);
    // Optionally store errors as well
    tempStore.storeResult(controllerKey, { error: error.message });
    throw error;
  }
};

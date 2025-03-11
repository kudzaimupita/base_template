import _ from 'lodash';
import { nativePlugins } from './state/nativeSteps';
import { statePlugin } from './state/actions';

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

    return result;
  } catch (error) {
    console.error('Process controller error:', error);
    throw error;
  }
};

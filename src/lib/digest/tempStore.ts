const tempStore = {
  controllerResults: new Map(),
  events: new Map(),

  // Store controller result
  storeResult(controllerKey, result) {
    this.controllerResults.set(controllerKey, result);
    return result;
  },

  // Store event
  storeEvent(controllerKey, event) {
    this.events.set(controllerKey, event);
    return event;
  },

  // Get stored result
  getResult(controllerKey) {
    return this.controllerResults.get(controllerKey);
  },

  // Get stored event
  getEvent(controllerKey) {
    return this.events.get(controllerKey);
  },

  // Get all stored results
  getAllResults() {
    return Object.fromEntries(this.controllerResults);
  },

  // Get all stored events
  getAllEvents() {
    return Object.fromEntries(this.events);
  },

  // Clear specific controller data
  clear(controllerKey) {
    this.controllerResults.delete(controllerKey);
    this.events.delete(controllerKey);
  },

  // Clear all stored data
  clearAll() {
    this.controllerResults.clear();
    this.events.clear();
  },
};

export { tempStore };

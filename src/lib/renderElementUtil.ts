import { message } from 'antd';
import { retrieveBody } from './digest/state/utils';
import { convertParentViewToLayoutItem, syncParentChildRelationships } from './utils';

/**
 * Process simple className patterns like +class, -class, ~class
 */
const processClassNamePattern = (pattern, effectiveElementId, originalId, appState, elements, process) => {
  // Get current className
  const getCurrentClassName = () => {
    const currentClassName = appState?.[effectiveElementId]?.className || '';
    
    if (!currentClassName && process?.propsMapper?.renderType !== 'inject') {
      const originalElement = elements.find(el => el.i === originalId);
      return originalElement?.configuration?.className || originalElement?.className || '';
    }
    
    return currentClassName;
  };

  let currentClasses = getCurrentClassName();
  
  // Split pattern by spaces to handle multiple operations
  const operations = pattern.split(/\s+/).filter(Boolean);
  
  operations.forEach(operation => {
    const match = operation.match(/^([+\-~])([^?]+)(\?(.+))?$/);
    if (!match) return;
    
    const [, operator, className, , condition] = match;
    
    // Evaluate condition if present
    let shouldApply = true;
    if (condition) {
      // Simple template evaluation for conditions
      const processedCondition = retrieveBody(
        null,
        `{{${condition}}}`,
        process?.event,
        process?.globalObj,
        process?.paramState,
        process?.sessionKey,
        {
          compId: effectiveElementId,
          store: process?.store,
          pageId: process?.pageId,
        }
      );
      shouldApply = !!processedCondition;
    }
    
    if (!shouldApply) return;
    
    // Process template variables in className
    const processedClassName = retrieveBody(
      null,
      className.includes('{{') ? className : `{{${className}}}`,
      process?.event,
      process?.globalObj,
      process?.paramState,
      process?.sessionKey,
      {
        compId: effectiveElementId,
        store: process?.store,
        pageId: process?.pageId,
      }
    ) || className;
    
    // Apply class operation
    const classes = currentClasses.split(' ').filter(Boolean);
    
    switch (operator) {
      case '+': // Add class
        if (!classes.includes(processedClassName)) {
          classes.push(processedClassName);
        }
        break;
      case '-': // Remove class
        const index = classes.indexOf(processedClassName);
        if (index > -1) {
          classes.splice(index, 1);
        }
        break;
      case '~': // Toggle class
        const toggleIndex = classes.indexOf(processedClassName);
        if (toggleIndex > -1) {
          classes.splice(toggleIndex, 1);
        } else {
          classes.push(processedClassName);
        }
        break;
    }
    
    currentClasses = classes.join(' ');
  });
  
  return currentClasses;
};

/**
 * Utility function for rendering dynamic elements
 */
const renderElementUtil = (
  process,
  elements,
  setElementsToRender,
  appState,
  dispatch,
  tab,
  createEventHandlers,
  editMode,
  extractValue,
  setAppStatePartial,
  currentApplication,
  // Additional context needed for proper event handler creation (optional for backward compatibility)
  navigate = null,
  params = null,
  store = null,
  refreshAppAuth = null,
  setDestroyInfo = null,
  setSessionInfo = null,
  storeInvocation = null
) => {
  // Early validation
  if (!process?.propsMapper?.blueprint) {
    console.warn('No blueprint specified in process.propsMapper.blueprint');
    return;
  }


  
  let blueprint = elements.find((el) => el.i === process?.propsMapper?.blueprint);
  let viewElements = [];
  let isViewBlueprint = false;
  let targetView = null;

  // Check if blueprint is a view instead of an element
  if (!blueprint) {
    targetView = currentApplication?.views?.find((view) => view.id === process?.propsMapper?.blueprint);

    if (targetView) {
      isViewBlueprint = true;
      viewElements = syncParentChildRelationships([
        ...convertParentViewToLayoutItem(targetView, process?.propsMapper?.blueprint)
      ]) || [];

      // Use the first element as the main blueprint or create a container
      blueprint = viewElements[0] || {
        i: process?.propsMapper?.blueprint,
        name: targetView.name || 'View Container',
        type: 'container',
        configuration: {},
      };
    } else {
      console.warn(`Blueprint not found: ${process?.propsMapper?.blueprint}`);
      return;
    }
  }

  const targetElement = process?.propsMapper?.targetElement;
  const propsMap = process?.propsMapper?.mappings || [];
  const defaults = process?.propsMapper?.defaults || {};

  /**
   * Helper function to process property mappings for an element
   */
  const processPropertyMappings = (elementId, newElementId = null, originalId) => {
    const effectiveElementId = newElementId || elementId;
    
    propsMap.forEach((mapItem) => {
      if (mapItem?.element === originalId) {
        // Handle dedicated class manipulation properties
        if (mapItem?.addClass || mapItem?.removeClass || mapItem?.toggleClass) {
          const getCurrentClassName = () => {
            const currentClassName = appState?.[effectiveElementId]?.className || '';
            
            if (!currentClassName && process?.propsMapper?.renderType !== 'inject') {
              const originalElement = elements.find(el => el.i === originalId);
              return originalElement?.configuration?.className || originalElement?.className || '';
            }
            
            return currentClassName;
          };

          let currentClasses = getCurrentClassName();
          const classes = currentClasses.split(' ').filter(Boolean);

          // Process addClass
          if (mapItem.addClass) {
            const classesToAdd = Array.isArray(mapItem.addClass) ? mapItem.addClass : [mapItem.addClass];
            classesToAdd.forEach(className => {
              // Process template variables
              const processedClassName = retrieveBody(
                null,
                className.includes('{{') ? className : `{{${className}}}`,
                process?.event,
                process?.globalObj,
                process?.paramState,
                process?.sessionKey,
                {
                  compId: effectiveElementId,
                  store: process?.store,
                  pageId: tab,
                }
              ) || className;
              
              if (processedClassName && !classes.includes(processedClassName)) {
                classes.push(processedClassName);
              }
            });
          }

          // Process removeClass
          if (mapItem.removeClass) {
            const classesToRemove = Array.isArray(mapItem.removeClass) ? mapItem.removeClass : [mapItem.removeClass];
            classesToRemove.forEach(className => {
              // Process template variables
              const processedClassName = retrieveBody(
                null,
                className.includes('{{') ? className : `{{${className}}}`,
                process?.event,
                process?.globalObj,
                process?.paramState,
                process?.sessionKey,
                {
                  compId: effectiveElementId,
                  store: process?.store,
                  pageId: tab,
                }
              ) || className;
              
              const index = classes.indexOf(processedClassName);
              if (index > -1) {
                classes.splice(index, 1);
              }
            });
          }

          // Process toggleClass
          if (mapItem.toggleClass) {
            const classesToToggle = Array.isArray(mapItem.toggleClass) ? mapItem.toggleClass : [mapItem.toggleClass];
            classesToToggle.forEach(className => {
              // Process template variables
              const processedClassName = retrieveBody(
                null,
                className.includes('{{') ? className : `{{${className}}}`,
                process?.event,
                process?.globalObj,
                process?.paramState,
                process?.sessionKey,
                {
                  compId: effectiveElementId,
                  store: process?.store,
                  pageId: tab,
                }
              ) || className;
              
              const index = classes.indexOf(processedClassName);
              if (index > -1) {
                classes.splice(index, 1);
              } else if (processedClassName) {
                classes.push(processedClassName);
              }
            });
          }

          // Apply the final className
          dispatch(
            setAppStatePartial({
              key: effectiveElementId + '.className',
              payload: classes.join(' '),
            })
          );
          
          return; // Skip regular value processing for class operations
        }

        let processedValue;

        // Check if the value is executable code (starts with 'code:' or wrapped in '{{code:}}')
        if (typeof mapItem?.value === 'string') {
          // Check for simple className patterns first (for className field only)
          if (mapItem?.field === 'className' && /^[+\-~]/.test(mapItem.value)) {
            try {
              processedValue = processClassNamePattern(
                mapItem.value, 
                effectiveElementId, 
                originalId, 
                appState, 
                elements, 
                process
              );
            } catch (error) {
              console.error('Error processing className pattern:', error);
              processedValue = mapItem?.value; // Fallback to original value
            }
          } else {
            // Check for executable code patterns
            const codePattern = /^\{\{code:(.*)\}\}$/s;
            const directCodePattern = /^code:(.*)$/s;
            
            let codeMatch = mapItem.value.match(codePattern);
            if (!codeMatch) {
              codeMatch = mapItem.value.match(directCodePattern);
            }
            
            if (codeMatch) {
              try {
                // Extract the code
                const code = codeMatch[1].trim();
                
                // Create execution context with full access
                const executionContext = {
                  // Current item and index
                  currentItem: process?.currentItem,
                  currentIndex: process?.currentIndex,
                  
                  // State access
                  state: appState,
                  
                  // Element context
                  elementId: effectiveElementId,
                  originalElementId: originalId,
                  
                  // Global context
                  globalObj: process?.globalObj || {},
                  event: process?.event || {},
                  paramState: process?.paramState || {},
                  
                  // Application context
                  currentApplication,
                  elements,
                  tab,
                  
                  // Utility functions
                  utils: {
                    // Get current element's className
                    getCurrentClassName: () => {
                      // Try to get from app state first
                      const currentClassName = appState?.[effectiveElementId]?.className || '';
                      
                      // If not in state and we're in renderInto mode, try to get from the original element
                      if (!currentClassName && process?.propsMapper?.renderType !== 'inject') {
                        const originalElement = elements.find(el => el.i === originalId);
                        return originalElement?.configuration?.className || originalElement?.className || '';
                      }
                      
                      return currentClassName;
                    },
                    
                    // Add/remove CSS classes (auto-fetches current className if not provided)
                    addClass: (classToAdd, existingClasses = null) => {
                      const currentClasses = existingClasses !== null ? existingClasses : executionContext.utils.getCurrentClassName();
                      if (!currentClasses) return classToAdd;
                      const classes = currentClasses.split(' ').filter(Boolean);
                      if (!classes.includes(classToAdd)) {
                        classes.push(classToAdd);
                      }
                      return classes.join(' ');
                    },
                    
                    removeClass: (classToRemove, existingClasses = null) => {
                      const currentClasses = existingClasses !== null ? existingClasses : executionContext.utils.getCurrentClassName();
                      if (!currentClasses) return '';
                      return currentClasses
                        .split(' ')
                        .filter(cls => cls && cls !== classToRemove)
                        .join(' ');
                    },
                    
                    toggleClass: (classToToggle, existingClasses = null) => {
                      const currentClasses = existingClasses !== null ? existingClasses : executionContext.utils.getCurrentClassName();
                      if (!currentClasses) return classToToggle;
                      const classes = currentClasses.split(' ').filter(Boolean);
                      const index = classes.indexOf(classToToggle);
                      if (index > -1) {
                        classes.splice(index, 1);
                      } else {
                        classes.push(classToToggle);
                      }
                      return classes.join(' ');
                    },
                    
                    // Convenience methods for className field specifically
                    addClassName: (classToAdd) => executionContext.utils.addClass(classToAdd),
                    removeClassName: (classToRemove) => executionContext.utils.removeClass(classToRemove),
                    toggleClassName: (classToToggle) => executionContext.utils.toggleClass(classToToggle),
                    
                    // Conditional helpers
                    when: (condition, trueValue, falseValue = '') => condition ? trueValue : falseValue,
                    
                    // Text transformations
                    capitalize: (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
                    uppercase: (str) => str ? str.toUpperCase() : '',
                    lowercase: (str) => str ? str.toLowerCase() : '',
                    
                    // Safe property access
                    get: (obj, path, defaultValue = '') => {
                      if (!obj || typeof path !== 'string') return defaultValue;
                      const keys = path.split('.');
                      let result = obj;
                      for (const key of keys) {
                        if (result && typeof result === 'object' && key in result) {
                          result = result[key];
                        } else {
                          return defaultValue;
                        }
                      }
                      return result;
                    }
                  }
                };
                
                // Create the function and execute it
                const func = new Function(...Object.keys(executionContext), `
                  try {
                    ${code}
                  } catch (error) {
                    console.error('Error executing mapping code:', error);
                    return '';
                  }
                `);
                
                processedValue = func(...Object.values(executionContext));
                
              } catch (error) {
                console.error('Error in mapping code execution:', error);
                processedValue = mapItem?.value; // Fallback to original value
              }
            } else {
              // Regular template string processing
              processedValue = retrieveBody(
                null,
                mapItem?.value,
                process?.event,
                process?.globalObj,
                process?.paramState,
                process?.sessionKey,
                {
                  compId: effectiveElementId,
                  store: process?.store,
                  pageId: tab,
                }
              );
            }
          }
        } else {
          // Non-string values
          processedValue = mapItem?.value;
        }

        // Dispatch the processed value
        dispatch(
          setAppStatePartial({
            key: effectiveElementId + '.' + mapItem?.field,
            payload: processedValue,
          })
        );
      }
    });
  };

  /**
   * Helper function to process default values for an element
   */
  const processDefaultValues = (elementId, newElementId = null) => {
    const effectiveElementId = newElementId || elementId;

    Object.keys(defaults).forEach((key) => {
      const defaultItem = defaults[key];
      if (defaultItem?.element === elementId) {
        let processedValue;

        // Check if the value is executable code (same pattern as mappings)
        if (typeof defaultItem?.value === 'string') {
          const codePattern = /^\{\{code:(.*)\}\}$/s;
          const directCodePattern = /^code:(.*)$/s;
          
          let codeMatch = defaultItem.value.match(codePattern);
          if (!codeMatch) {
            codeMatch = defaultItem.value.match(directCodePattern);
          }
          
          if (codeMatch) {
            try {
              // Extract the code
              const code = codeMatch[1].trim();
              
              // Create execution context (same as mappings)
              const executionContext = {
                currentItem: process?.currentItem,
                currentIndex: process?.currentIndex,
                state: appState,
                elementId: effectiveElementId,
                originalElementId: elementId,
                globalObj: process?.globalObj || {},
                event: process?.event || {},
                paramState: process?.paramState || {},
                currentApplication,
                elements,
                tab,
                utils: {
                  // Get current element's className
                  getCurrentClassName: () => {
                    // Try to get from app state first
                    const currentClassName = appState?.[effectiveElementId]?.className || '';
                    
                    // If not in state and we're in renderInto mode, try to get from the original element
                    if (!currentClassName && process?.propsMapper?.renderType !== 'inject') {
                      const originalElement = elements.find(el => el.i === elementId);
                      return originalElement?.configuration?.className || originalElement?.className || '';
                    }
                    
                    return currentClassName;
                  },
                  
                  // Add/remove CSS classes (auto-fetches current className if not provided)
                  addClass: (classToAdd, existingClasses = null) => {
                    const currentClasses = existingClasses !== null ? existingClasses : executionContext.utils.getCurrentClassName();
                    if (!currentClasses) return classToAdd;
                    const classes = currentClasses.split(' ').filter(Boolean);
                    if (!classes.includes(classToAdd)) {
                      classes.push(classToAdd);
                    }
                    return classes.join(' ');
                  },
                  
                  removeClass: (classToRemove, existingClasses = null) => {
                    const currentClasses = existingClasses !== null ? existingClasses : executionContext.utils.getCurrentClassName();
                    if (!currentClasses) return '';
                    return currentClasses
                      .split(' ')
                      .filter(cls => cls && cls !== classToRemove)
                      .join(' ');
                  },
                  
                  toggleClass: (classToToggle, existingClasses = null) => {
                    const currentClasses = existingClasses !== null ? existingClasses : executionContext.utils.getCurrentClassName();
                    if (!currentClasses) return classToToggle;
                    const classes = currentClasses.split(' ').filter(Boolean);
                    const index = classes.indexOf(classToToggle);
                    if (index > -1) {
                      classes.splice(index, 1);
                    } else {
                      classes.push(classToToggle);
                    }
                    return classes.join(' ');
                  },
                  
                  // Convenience methods for className field specifically
                  addClassName: (classToAdd) => executionContext.utils.addClass(classToAdd),
                  removeClassName: (classToRemove) => executionContext.utils.removeClass(classToRemove),
                  toggleClassName: (classToToggle) => executionContext.utils.toggleClass(classToToggle),
                  
                  when: (condition, trueValue, falseValue = '') => condition ? trueValue : falseValue,
                  capitalize: (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
                  uppercase: (str) => str ? str.toUpperCase() : '',
                  lowercase: (str) => str ? str.toLowerCase() : '',
                  get: (obj, path, defaultValue = '') => {
                    if (!obj || typeof path !== 'string') return defaultValue;
                    const keys = path.split('.');
                    let result = obj;
                    for (const key of keys) {
                      if (result && typeof result === 'object' && key in result) {
                        result = result[key];
                      } else {
                        return defaultValue;
                      }
                    }
                    return result;
                  }
                }
              };
              
              // Create the function and execute it
              const func = new Function(...Object.keys(executionContext), `
                try {
                  ${code}
                } catch (error) {
                  console.error('Error executing default value code:', error);
                  return '';
                }
              `);
              
              processedValue = func(...Object.values(executionContext));
              
            } catch (error) {
              console.error('Error in default value code execution:', error);
              processedValue = defaultItem?.value; // Fallback to original value
            }
          } else {
            // Regular template string processing
            processedValue = retrieveBody(
              null,
              defaultItem?.value,
              process?.event,
              process?.globalObj,
              process?.paramState,
              process?.sessionKey,
              {
                compId: effectiveElementId,
                store: process?.store,
                pageId: tab,
              }
            );
          }
        } else {
          // Non-string values
          processedValue = defaultItem?.value;
        }

        dispatch(
          setAppStatePartial({
            key: effectiveElementId + '.' + defaultItem?.targetField,
            payload: processedValue,
          })
        );
      }
    });
  };

  /**
   * Helper function to set current item for an element
   */
  const setCurrentItemForElement = (elementId) => {
    if (process?.currentItem && setAppStatePartial) {
      // Instead of storing the actual data item, store a dynamic reference
      const dynamicReference = {
        ...process.currentItem,
        // Add metadata for dynamic resolution
        __dynamicIndex: process?.currentIndex,
        __dynamicDataKey: process?.propsMapper?.dynamicDataKey,
        __isVirtualElement: true,
        __lastUpdated: Date.now(), // Add timestamp for change detection
      }; 
      console.log(elementId,'dynamicReference', dynamicReference)
      dispatch(
        setAppStatePartial({
          key: elementId,
          payload: dynamicReference,
        })
      );
    }
  };

  // Add a function to refresh virtual element data
  const refreshVirtualElementData = (elementId, currentData) => {
    if (setAppStatePartial && currentData) {
      const existingState = appState?.[elementId];
      if (existingState?.__isVirtualElement) {
        const refreshedReference = {
          ...currentData,
          // Preserve metadata
          __dynamicIndex: existingState.__dynamicIndex,
          __dynamicDataKey: existingState.__dynamicDataKey,
          __isVirtualElement: true,
          __lastUpdated: Date.now(),
        };
        console.log(`🔄 Refreshing virtual element [${elementId}]:`, refreshedReference);
        dispatch(
          setAppStatePartial({
            key: elementId,
            payload: refreshedReference,
          })
        );
      }
    }
  };

  // Handle renderInto type
  if (process?.propsMapper?.renderType === 'renderInto') {
    const newElementId = `virtual-${process?.currentIndex}`;

    // Skip if element already exists
    if (elements?.find((el) => el.i === newElementId)) {
      return;
    }

    setElementsToRender((prevElements) => {
      // Find the parent element that we're rendering into
      const parentElementIndex = prevElements.findIndex((el) => el.i === targetElement);

      if (parentElementIndex === -1) {
        console.warn(`Parent element not found: ${targetElement}`);
        return prevElements;
      }

      // Create a copy of the previous elements array
      const updatedElements = [...prevElements];

      // Update parent's children array
      const parentElement = updatedElements[parentElementIndex];
      const updatedParent = {
        ...parentElement,
        children: parentElement.children ? [...parentElement.children, newElementId] : [newElementId],
      };
      updatedElements[parentElementIndex] = updatedParent;

      // Find all children of blueprint and create new IDs for them
      const findAndProcessChildren = (originalId, newParentId, isParent) => {
        if (!setAppStatePartial) {
          return [];
        }

        let childElements = [];

        if (isViewBlueprint && isParent) {
          // For view blueprints, find direct children of the blueprint maintaining hierarchy
          childElements = viewElements.filter((el) => el.parent === blueprint.i);
        } else if (isViewBlueprint) {
          // For nested view elements, find children within the view elements
          childElements = viewElements.filter((el) => el.parent === originalId);
        } else {
          // Normal case - find children by parent relationship
          childElements = prevElements.filter((el) => el.parent === originalId);

          if (!childElements.length && isParent) {
            // Fallback: look for component view children
            const children = elements
              .filter((it) => it.isComponentView)
              ?.map((v) => {
                const view = currentApplication?.views?.find((vi) => vi.id === originalId);
                return view?.layout;
              })
              .flat()
              .filter(Boolean);

            childElements = children || [];
          }
        }

        return childElements
          .map((childd) => {
            const child = { ...childd };
            const newChildId = `${newParentId}-child-${child.i}`;

            // Set app state for the child
            setCurrentItemForElement(newChildId);

            // Process default values for this child
            processDefaultValues(child.i, newChildId);

            processPropertyMappings(child.i, newChildId, child.originId || child.i);

            const processedChild = {
              ...child,
              configuration: {
                ...child.configuration,
                ...appState?.[newChildId],
                ...(editMode || !navigate || typeof createEventHandlers !== 'function' ? {} : createEventHandlers(
                  { ...child, i: newChildId },
                  currentApplication,
                  navigate,
                  params,
                  tab,
                  editMode,
                  store,
                  refreshAppAuth,
                  setDestroyInfo,
                  setSessionInfo,
                  setAppStatePartial,
                  storeInvocation,
                  dispatch,
                  elements,
                  setElementsToRender,
                  appState,
                  createEventHandlers
                )),
              },
              parent: newParentId,
              i: newChildId,
              ...appState?.[newChildId],
            };

            // Recursively process this child's children
            const grandChildren = findAndProcessChildren(child.i, newChildId, false);

            // Update the processed child's children array to include the new IDs
            if (grandChildren.length > 0) {
              processedChild.children = grandChildren
                .filter((grandChild) => grandChild.parent === newChildId)
                .map((grandChild) => grandChild.i);
            }

            return [processedChild, ...grandChildren];
          })
          .flat();
      };

      // Get all nested children with updated IDs and parents
      const allChildren = findAndProcessChildren(
        isViewBlueprint ? blueprint.i : process?.propsMapper?.blueprint,
        newElementId,
        true
      );

      // Add the new element with its children array
      const newElement = {
        ...blueprint,
        parent: targetElement,
        i: newElementId,
        isVirtual: true,
        isViewBlueprint: isViewBlueprint,
        originalBlueprintId: process?.propsMapper?.blueprint,
        children: allChildren.filter((child) => child.parent === newElementId).map((child) => child.i),
      };

      // Set app state for the new element
      setCurrentItemForElement(newElementId);

      // Process default values for the parent
      processDefaultValues(isViewBlueprint ? blueprint.i : process?.propsMapper?.blueprint, newElementId);

      // Process property mappings for the parent element
      processPropertyMappings(
        isViewBlueprint ? blueprint.i : process?.propsMapper?.blueprint,
        newElementId,
        isViewBlueprint ? blueprint.i : process?.propsMapper?.blueprint
      );

      // Add the new element and all its children to the updated elements array
      updatedElements.push(newElement, ...allChildren);
      return updatedElements;
    });
  }

  // Handle inject type
  if (process?.propsMapper?.renderType === 'inject') {
    if (isViewBlueprint) {
      // Handle view blueprint injection

      // Process mappings and defaults for the main blueprint element
      processPropertyMappings(blueprint.i, blueprint.i, blueprint.i);
      processDefaultValues(blueprint.i);
      setCurrentItemForElement(blueprint.i);

      // Process mappings and defaults for all view elements
      viewElements.forEach((viewElement) => {
        if (viewElement.i !== blueprint.i) {
          processPropertyMappings(viewElement.i, viewElement.i, viewElement.i);
          processDefaultValues(viewElement.i);
          setCurrentItemForElement(viewElement.i);
        }
      });

      // Process any direct mappings that reference the original blueprint ID
      propsMap.forEach((mapItem) => {
        if (mapItem?.element === process?.propsMapper?.blueprint) {
          let processedValue;
          
          try {
            processedValue = retrieveBody(
              null,
              mapItem?.value,
              process?.event,
              process?.globalObj,
              process?.paramState,
              process?.sessionKey,
              {
                compId: blueprint.i,
                store: process?.store,
                pageId: tab,
              }
            );
          } catch (error) {
            console.error('Error processing direct mapping value:', error);
            processedValue = mapItem?.value;
          }

          // If mapping references the view ID directly, apply to the main blueprint element
          dispatch(
            setAppStatePartial({
              key: blueprint.i + '.' + mapItem?.field,
              payload: processedValue,
            })
          );
        }
      });

      // Process any direct defaults that reference the original blueprint ID
      Object.keys(defaults).forEach((key) => {
        const defaultItem = defaults[key];
        if (defaultItem?.element === process?.propsMapper?.blueprint) {
          let processedValue;
          
          try {
            processedValue = retrieveBody(
              null,
              defaultItem?.value,
              process?.event,
              process?.globalObj,
              process?.paramState,
              process?.sessionKey,
              {
                compId: blueprint.i,
                store: process?.store,
                pageId: tab,
              }
            );
          } catch (error) {
            console.error('Error processing direct default value:', error);
            processedValue = defaultItem?.value;
          }

          dispatch(
            setAppStatePartial({
              key: blueprint.i + '.' + defaultItem?.targetField,
              payload: processedValue,
            })
          );
        }
      });
    } else {
      // Process property mappings for all mapped elements
      const processedElements = new Set();
      
      propsMap.forEach((mapItem) => {
        if (mapItem?.element && !processedElements.has(mapItem.element)) {
          processPropertyMappings(mapItem?.element, mapItem?.element, mapItem?.element);
          setCurrentItemForElement(mapItem?.element);
          processedElements.add(mapItem.element);
        }
      });

      // Process default values for all elements with defaults
      Object.keys(defaults).forEach((key) => {
        const defaultItem = defaults[key];
        if (defaultItem?.element) {
          processDefaultValues(defaultItem.element);
        }
      });
    }
  }
};

export default renderElementUtil;
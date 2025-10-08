import React from 'react';
import { processController } from './digest/digester';
import { EVENT_HANDLERS } from './eventHandlersTypes';
import InlineEditText from './InLineTextEditor';
import { IconRenderer } from './IconRenderer';
import { retrieveBody } from './digest/state/utils';
import { message } from 'antd';
import renderElementUtil from './renderElementUtil';
import { isEmpty } from 'lodash';

export function createEventHandler(
  e,
  processToRun,
  elementId,
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
  storeInvocation
) {
  // Defensive check for required dependencies
  if (!store?.dispatch) {
    console.error('createEventHandler: Redux store dispatch not available');
    return Promise.resolve();
  }
  
  if (typeof setAppStatePartial !== 'function') {
    console.error('createEventHandler: setAppStatePartial function not available');
    return Promise.resolve();
  }

  return processController(
    processToRun || [],
    e || {},
    currentApplication?._id,
    navigate,
    params,
    'eventHandler',
    elementId,
    (process) => ',',
    tab,
    () => '',
    editMode,
    {
      store: store,
      refreshAppAuth: refreshAppAuth,
      setDestroyInfo: setDestroyInfo,
      setSessionInfo: setSessionInfo,
      setAppStatePartial: setAppStatePartial,
      storeInvocation: storeInvocation,
    }
  );
}

export function createEventHandlers(
  item,
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
  allElements,
  setElements,
  appState,
  createEventHandlerss
) {
  const handlers = {};

  Object.keys(EVENT_HANDLERS).forEach((eventName) => {
    if (isEmpty(item?.configuration?.[eventName])) return;

    const configHandler = item?.configuration?.[eventName];
    // message.error(eventName)

    if (configHandler?.plugins?.length > 0) {
      handlers[eventName] = (e) => {
        if (item?.configuration?.[eventName]?.preventDefaultprocess?.stopPropagation !== false) {
          e.preventDefault();
        }
        if (item?.configuration?.[eventName]?.stopPropagationprocess?.stopPropagation !== false) {
          e.stopPropagation();
        }

        //  return processController(
        //       configHandler,
        //       e     ,
        //       currentApplication?._id,
        //       navigate,
        //       params,
        //       'eventHandler',
        //       item?.i,
        //       (process) => '',
        //       tab,
        //       (process) =>
        //         renderElementUtil(
        //           { ...process, store, allElements },
        //           allElements,
        //           setElements,
        //           appState,
        //           dispatch,
        //           tab,
        //           createEventHandlerss,
        //           editMode,
        //           extractValue,
        //           setAppStatePartial,
        //           currentApplication
        //         ),
        //       editMode,
        //       {
        //         store: store,
        //         refreshAppAuth: refreshAppAuth,
        //         setDestroyInfo: setDestroyInfo,
        //         setSessionInfo: setSessionInfo,
        //         setAppStatePartial: setAppStatePartial,
        //         storeInvocation: storeInvocation,
        //       }
        //     );
        return createEventHandler(
          e,
          configHandler,
          item.i,
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
          storeInvocation
        );
      };
    }
  });
  return handlers;
}
export function renderComponent(id, props, componentsMap, editMode, elements, setElementsToRender, setItemToEdit) {
  if (props.componentId === 'text') {
    // Extract CSS variables for inline styles
    const cssVariables = props?.configuration?.cssVariables || {};
    const classNames = props?.configuration?.classNames || '';

    // Build inline styles from CSS variables
    const inlineStyles = {};
    Object.entries(cssVariables).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        inlineStyles[key] = value;
      }
    });

    // Add font-family as direct style if CSS variable exists
    if (cssVariables['--font-family']) {
      inlineStyles.fontFamily = cssVariables['--font-family'];
    }

    return (
      <div className={classNames} style={inlineStyles}>
        <InlineEditText
          id={props.i}
          isEditable={false}
          overflowEffect="ellipsis"
          targeted={true}
          overRideStyles={{
            ...props?.configuration,
          }}
          initialText={props?.configuration?.text}
          onType={(e) => {
            setElementsToRender((prev) => {
              return prev.map((el) => {
                if (el.i === props.i) {
                  const updatedConfig = {
                    ...el.configuration,
                  };
                  updatedConfig.text = e.target?.value;
                  return {
                    ...el,
                    configuration: updatedConfig,
                  };
                }
                return el;
              });
            });
            setItemToEdit((prev) => {
              return prev.map((el) => {
                if (el.i === props.i) {
                  const updatedConfig = {
                    ...el.configuration,
                  };
                  updatedConfig.text = e.target?.value;
                  return {
                    ...el,
                    configuration: updatedConfig,
                  };
                }
                return el;
              });
            });
          }}
        />
      </div>
    );
  }

  if (props.componentId === 'icon') {
    return (
      <div className="pointer-events-none">
        <IconRenderer
          icon={
            props?.configuration?.icon || {
              name: 'FaHouse',
              set: 'Fa6',
              setName: 'Font Awesome 6',
            }
          }
          color={props?.configuration?.iconColor || 'red'}
          size={props?.configuration?.iconSize}
        />
      </div>
    );
  }

  const Component = componentsMap?.[id];

  if (props.componentId === 'canvas') {
    return <></>;
  }

  if (!Component) {
    return '';
  }

  const RenderedComponent = Component({
    title: props.title,
    editMode: editMode,
    item: {
      meta: props,
      config: {
        allComponents: props.allComponents,
        allComponentsRaw: props.allComponentsRaw,
        tab: props.tab,
        store: props.store,
        createEventHandler: props.createEventHandler,
        createEventHandlers: props.createEventHandlers,
        id,
        allElements: elements,
        style: props?.processedStyle,
        renderChildren: props?.renderChildren,
      },
    },
    configuration: props.configuration,
    ...props,
  });

  return RenderedComponent?.type
    ? React.createElement(RenderedComponent.type, {
        ...RenderedComponent.props,
      })
    : '';
}

export function flattenStyleObject(config, transform, editMode) {
  // Implementation for flattening style objects
  // This would contain your existing flattenStyleObject logic
  return config || {};
}

export function formatBorderRadius(input) {
  return input
    .split(',')
    .map((value) => {
      const trimmed = value.trim();
      return trimmed.endsWith('px') ? trimmed : `${trimmed}px`;
    })
    .join(' ');
}

export function processStyle(item, appState, tab, isHovered, readOnly, isDragging, editMode, targets) {
  const processedStyle = {
    ...item?.style,
    ...(item.configuration?.backgroundImage && {
      backgroundImage:
        item.configuration.backgroundImage.startsWith('http') || item.configuration.backgroundImage.startsWith('data:')
          ? `url(${item.configuration.backgroundImage})`
          : item.configuration.backgroundImage,
    }),
    transform: item?.configuration?.transform,
    ...(isHovered &&
      !readOnly &&
      !isDragging &&
      editMode &&
      !targets?.find((target) => target.id === item.i) && {
        outline: '2px solid #4a90e2',
        outlineOffset: '2px',
      }),
  };

  if (processedStyle.background) {
    delete processedStyle.backgroundImage;
  }

  if (processedStyle?.borderRadius) {
    processedStyle.borderRadius = formatBorderRadius(processedStyle?.borderRadius);
  }

  return processedStyle;
}

export const SELF_CLOSING_TAGS = new Set([
  'input',
  'img',
  'br',
  'hr',
  'area',
  'base',
  'col',
  'embed',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export function cleanItemProperties(item) {
  const cleanedItem = { ...item };
  const keysToDelete = [
    'alignItems',
    'columnsList',
    'gridTemplateColumns',
    'gridTemplateRows',
    'justifyContent',
    'rowsList',
  ];

  for (const key of keysToDelete) {
    delete cleanedItem[key];
  }
  delete cleanedItem.style;

  return cleanedItem;
}

const memoCache = new Map();

export function syncParentChildRelationships(components) {
  if (!components?.length) return [];

  
  // Temporarily disable memoization to ensure fresh data during development
  // TODO: Re-enable with proper cache invalidation in production
  // const cacheKey = JSON.stringify(components.map((c) => ({ i: c.i, parent: c.parent })));
  // if (memoCache.has(cacheKey)) {
  //   return memoCache.get(cacheKey);
  // }

  // Use Map for O(1) lookups instead of array.find()
  const componentMap = new Map();
  const parentToChildrenMap = new Map();
  const slotNameMap = new Map(); // Map slot names to their actual IDs
  const updatedComponents = []; // Store components with updated parent properties


  // First pass: Build component map and identify slots
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    componentMap.set(component.i, component);

    // If this is a slot, map its name variations to its ID
    if (component.componentId === 'slot') {
      // Map slotName to ID (e.g., "Content Slot" -> "slot-1754999160952")
      if (component.slotName) {
        const normalizedSlotName = component.slotName.toLowerCase().replace(/\s+/g, '-');
        slotNameMap.set(normalizedSlotName, component.i);
      }
      
      // Also map from element name (e.g., "Content Slot" -> "content-slot" -> "slot-1754999160952")
      if (component.name) {
        const normalizedName = component.name.toLowerCase().replace(/\s+/g, '-');
        slotNameMap.set(normalizedName, component.i);
      }
      
      // Add common slot name patterns for flexible matching
      const slotNameToMap = component.slotName || component.name || '';
      if (slotNameToMap) {
        const normalized = slotNameToMap.toLowerCase().replace(/\s+/g, '-');
        
        // Map generic slot patterns (e.g. "auth-slot" can match "admin-slot", "content-slot", etc.)
        if (normalized.includes('slot')) {
          const baseSlotType = normalized.replace(/-slot$/, '');
          // For auth/admin similarity, map both ways
          if (baseSlotType === 'auth') {
            slotNameMap.set('admin-slot', component.i);
          }
          if (baseSlotType === 'admin') {
            slotNameMap.set('auth-slot', component.i);
          }
          // Map "content" as a generic fallback
          if (baseSlotType === 'content' || baseSlotType === 'main') {
            slotNameMap.set('default-slot', component.i);
            slotNameMap.set('content-slot', component.i);
            slotNameMap.set('main-slot', component.i);
          }
        }
      }
    }
  }
  

  // Second pass: Create new components with resolved parent IDs and build parent-children relationships
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    let parentId = component.parent;
    let updatedComponent = component;
    
    // Resolve slot names to actual slot IDs
    if (parentId && !componentMap.has(parentId) && slotNameMap.has(parentId)) {
      const actualSlotId = slotNameMap.get(parentId);
      parentId = actualSlotId;
      // Create new component with updated parent
      updatedComponent = { ...component, parent: actualSlotId };
    } else if (parentId && !componentMap.has(parentId)) {
      // Try to resolve timestamp-based slot IDs (e.g., "admin-slot-1754999161018")
      const potentialSlotName = parentId.replace(/-\d+$/, ''); // Remove timestamp
      if (slotNameMap.has(potentialSlotName)) {
        const actualSlotId = slotNameMap.get(potentialSlotName);
        parentId = actualSlotId;
        updatedComponent = { ...component, parent: actualSlotId };
      } else {
        // Log unresolved parents for debugging
        console.warn(`[Slot Mapping] Could not resolve parent "${parentId}" for element "${component.i}"`);
      }
    }

    updatedComponents.push(updatedComponent);

    if (parentId && parentId !== null) {
      if (!parentToChildrenMap.has(parentId)) {
        parentToChildrenMap.set(parentId, new Set());
      }
      parentToChildrenMap.get(parentId).add(component.i);
    }
  }


  // Create result array with updated children arrays
  const result = updatedComponents.map((component) => {
    const children = parentToChildrenMap.get(component.i);
    return {
      ...component,
      children: children ? Array.from(children) : component.children || [],
    };
  });

  
  // Debug: show a few key components and their children
  result.forEach(component => {
    if (component.children && component.children.length > 0) {
    }
  });

  // memoCache.set(cacheKey, result); // Temporarily disable memoization
  return result;
}

export const flattenComponentViews = (els = [], currentApplication) => {
  if (!els?.length) return [];

  els.forEach(el => {
    if (el.parent) {
    }
  });

  const flat = [];
  const viewsMap = new Map();

  // Pre-build views map for O(1) lookup
  if (currentApplication?.views) {
    for (const view of currentApplication.views) {
      viewsMap.set(view.id, view);
    }
  }

  // Use iterative approach with stack to avoid recursion overhead
  const stack = els.map((el) => ({ el, parent: null }));

  while (stack.length > 0) {
    const { el, parent } = stack.pop();

    if (!el?.i) continue;

    const element = {
      ...el,
      parent,
      isComponentView: false,
    };

    flat.push(element);

    // Handle component views
    if (el.isComponentView) {
      const view = viewsMap.get(el.componentId);
      if (view) {
        let nestedElements;

        // Enhanced caching using content hash
        const viewContentHash = generateViewContentHash(view);
        const cacheKey = `${el.componentId}-${el.i}-${viewContentHash}`;

        // Temporarily disable view caching to ensure fresh data during development
        // TODO: Re-enable with proper cache invalidation in production
        // if (processedViewsCache.has(cacheKey)) {
        //   nestedElements = processedViewsCache.get(cacheKey);
        //   console.log(`🎯 Using cached view for ${el.componentId}:${el.i}`);
        // } else {
          nestedElements = syncParentChildRelationships([...convertParentViewToLayoutItem(view, el.i)]);
          // processedViewsCache.set(cacheKey, nestedElements); // Temporarily disable caching
        // }

        if (nestedElements?.length) {
          nestedElements.forEach(virtEl => {
            if (virtEl.componentId === 'slot') {
            }
          });
          flat.push(...nestedElements);
        }
      }
    }
  }

  
  // Apply slot name mapping to ALL elements (this is the key fix)
  const finalElements = syncParentChildRelationships(flat);
  
  finalElements.forEach(el => {
    if (el.parent && el.parent.includes('slot')) {
    }
    if (el.componentId === 'slot' && el.children?.length > 0) {
    }
  });

  return finalElements;
};

export function flattenElementTree(rootElements = [], parentId = null) {
  if (!rootElements?.length) return [];

  const flat = [];
  // Use iterative approach with stack
  const stack = rootElements.map((root) => ({ element: root, parent: parentId }));

  while (stack.length > 0) {
    const { element, parent } = stack.pop();

    const el = {
      ...element,
      parent,
      children: Array.isArray(element.children) ? element.children.map((child) => child.i || child.id || child) : [],
    };

    flat.push(el);

    // Add children to stack (in reverse order to maintain order)
    if (Array.isArray(element.children)) {
      for (let i = element.children.length - 1; i >= 0; i--) {
        const child = element.children[i];
        if (typeof child === 'object' && child !== null) {
          stack.push({ element: child, parent: el.i });
        }
      }
    }
  }

  return flat;
}

// Global slot registry to prevent ID conflicts across component instances
const globalSlotRegistry = new Map(); // slotId -> componentInstanceId

// Utility function to clear slot registry (useful when reloading app)
export function clearSlotRegistry() {
  globalSlotRegistry.clear();
}

/**
 * Helper function to get predictable slot ID for AI/external reference
 * 
 * USAGE FOR AI SYSTEMS:
 * When creating elements to place in component view slots, use the original slot ID:
 * 
 * Example:
 * Component view "header-layout" has slot "logo-slot"
 * Element targeting this slot should use parent: "logo-slot" (NOT "header-component-123-logo-slot")
 * 
 * @param componentViewId - The instance ID of the component view (e.g. "header-component-123")
 * @param originalSlotId - The original slot ID from the component view (e.g. "logo-slot") 
 * @returns The actual slot ID to use for parent references
 */
export function getSlotId(componentViewId: string, originalSlotId: string): string {
  const existingComponent = globalSlotRegistry.get(originalSlotId);
  if (existingComponent && existingComponent !== componentViewId) {
    // Slot ID conflict - return prefixed version
    return `${componentViewId}-${originalSlotId}`;
  }
  // Return original slot ID (most common case)
  return originalSlotId;
}

export function convertParentViewToLayoutItem(view, id) {
  if (!view?.layout) return [];

  const convertedView = JSON.parse(JSON.stringify(view));
  const idMap = new Map();
  const allProcessedElements = [];
  const rootItemIds = [];

  // Build parent-child relationships map for O(1) lookup
  const childrenMap = new Map();
  for (const element of convertedView.layout) {
    if (element.parent) {
      if (!childrenMap.has(element.parent)) {
        childrenMap.set(element.parent, []);
      }
      childrenMap.get(element.parent).push(element);
    }
  }

  // Find root elements
  const rootElements = convertedView.layout.filter((item) => !item.parent || item.parent === null);

  // Use iterative approach with stack
  const stack = rootElements.map((root) => ({
    element: root,
    parentId: id,
    level: 0,
    isRoot: true,
  }));

  while (stack.length > 0) {
    const { element, parentId, level, isRoot } = stack.pop();

    // IMPROVED: For slots, keep original ID to make them predictable and referenceable
    let newId;
    if (element.componentId === 'slot') {
      // Check if this slot ID is already used by another component instance
      const existingComponent = globalSlotRegistry.get(element.i);
      if (existingComponent && existingComponent !== id) {
        // Slot ID conflict - use prefixed version for this instance
        newId = `${id}-${element.i}`;
        console.warn(`[Virtual Slot] Slot ID conflict: ${element.i} already used by ${existingComponent}, using ${newId} for ${id}`);
      } else {
        // Register this slot with the current component instance
        globalSlotRegistry.set(element.i, id);
        newId = element.i;
      }
    } else {
      // Non-slots get prefixed with parent for uniqueness
      newId = `${parentId}-${element.i}`;
    }
    
    idMap.set(element.i, newId);

    if (isRoot) {
      rootItemIds.push(newId);
    }

    // Get children for this element
    const childElements = childrenMap.get(element.i) || [];

    // Create the updated element
    const updatedElement = {
      ...element,
      i: newId,
      parent: element.parent ? idMap.get(element.parent) || parentId : parentId,
      children: childElements.map((child) => {
        // For child mapping, slots also keep their original IDs
        return child.componentId === 'slot' ? child.i : `${newId}-${child.i}`;
      }),
      isVirtual: true,
      isChild: true,
      originId: element.i,
      viewId: parentId,
      // Add slot metadata for easier identification
      ...(element.componentId === 'slot' && {
        isSlot: true,
        slotName: element.name || element.i,
        componentViewId: id
      })
    };

    // Update zIndex if it exists
    if (updatedElement.configuration?.zIndex !== undefined) {
      updatedElement.configuration.zIndex += 1;
    }

    allProcessedElements.push(updatedElement);

    // Add children to stack (in reverse order)
    for (let i = childElements.length - 1; i >= 0; i--) {
      stack.push({
        element: childElements[i],
        parentId: newId,
        level: level + 1,
        isRoot: false,
      });
    }
  }

  // Create the page container
  const pageContainer = {
    isGroup: true,
    componentId: 'container',
    i: id,
    name: convertedView.name,
    children: rootItemIds,
    parent: null,
    readOnly: true,
    isChild: false,
    isVirtual: true,
    configuration: {
      zIndex: 0,
      ...convertedView.configuration,
      classNames: 'content',
      tag: convertedView.configuration?.tag || 'div',
    },
  };

  // Update parent references for root elements
  for (const element of allProcessedElements) {
    if (rootItemIds.includes(element.i)) {
      element.parent = pageContainer.i;
    }
  }

  return [pageContainer, ...allProcessedElements];
}

const templateCache = new Map();

export function processObjectTemplatesAndReplace(obj, process, mapItem, tab) {
  if (!obj) return obj;

  const cacheKey = JSON.stringify({ obj, processId: process?.id, tabId: tab });
  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey);
  }

  function hasTemplate(value) {
    return typeof value === 'string' && value.includes('{{') && value.includes('}}');
  }

  function isFullTemplate(value) {
    return typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}') && value.indexOf('{{', 2) === -1;
  }

  function traverse(current, propertyName = '') {
    if (current === null || current === undefined) {
      return current;
    }

    if (Array.isArray(current)) {
      const result = new Array(current.length);
      for (let i = 0; i < current.length; i++) {
        result[i] = traverse(current[i], `${propertyName}[${i}]`);
      }
      return result;
    }

    if (typeof current === 'object') {
      const result = {};
      const keys = Object.keys(current);
      
      // Handle dynamic field prioritization for ANY property type
      const getDynamicFieldName = (key) => `dynamic${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      
      // Check if current object has dynamic variant and prioritize it
      const dynamicFieldMap = {};
      for (const key in current) {
        const dynamicKey = getDynamicFieldName(key);
        if (current[dynamicKey] && typeof current[dynamicKey] === 'string' && current[dynamicKey].trim() !== '') {
          dynamicFieldMap[key] = dynamicKey;
        }
      }
      
               for (let i = 0; i < keys.length; i++) {
           const key = keys[i];
           const newPropertyName = propertyName ? `${propertyName}.${key}` : key;
           
           // Skip dynamic fields from being processed separately
           if (key.startsWith('dynamic')) {
             continue;
           }
           
                     // Check if this property has a dynamic variant
          const dynamicKey = dynamicFieldMap[key];
          if (dynamicKey) {
            // Use the dynamic field for template interpolation
            const dynamicResult = traverse(current[dynamicKey], newPropertyName);
            
            // If dynamic result is empty/failed and we have a static fallback, use it
            if (
              (dynamicResult === null ||
               dynamicResult === undefined ||
               dynamicResult === '' ||
               (typeof dynamicResult === 'string' && dynamicResult.trim() === '')) &&
              current[key] !== undefined &&
              current[key] !== null &&
              current[key] !== ''
            ) {
              result[key] = current[key]; // Use static value as fallback
            } else {
              result[key] = dynamicResult;
            }
          } else {
            // Use the regular field
            result[key] = traverse(current[key], newPropertyName);
          }
         }
      return result;
    }

    // Handle any string that contains template variables
    if (hasTemplate(current)) {
      try {
        // For full templates like "{{state.userName}}", use direct retrieval
        if (isFullTemplate(current)) {
          
          const result = retrieveBody(
            null,
            current,
            process?.event,
            process?.globalObj,
            process?.paramState,
            process?.sessionKey,
            {
              compId: mapItem?.element,
              store: process?.store,
              pageId: tab,
            }
          );


          if (
            result === null ||
            result === undefined ||
            result === '' ||
            (typeof result === 'string' && result.trim() === '')
          ) {
            return '';
          }

          return result;
        } else {
          // For partial templates like "Hello {{state.userName}}!", process each template individually
          let processedString = current;
          const templateMatches = current.match(/\{\{[^}]+\}\}/g);
          
          if (templateMatches) {
            for (const template of templateMatches) {
              try {
                const result = retrieveBody(
                  null,
                  template,
                  process?.event,
                  process?.globalObj,
                  process?.paramState,
                  process?.sessionKey,
                  {
                    compId: mapItem?.element,
                    store: process?.store,
                    pageId: tab,
                  }
                );

                // Replace the template with the resolved value
                if (result !== null && result !== undefined) {
                  processedString = processedString.replace(template, String(result));
                } else {
                  // If resolution fails, we need to find the static value to fall back to
                  // This is tricky because we're in a string context, not an object context
                  // For now, let's keep the template as-is so it can be processed later
                  // Don't replace the template - let it be processed by the main system
                }
              } catch (error) {
                // If error occurs, replace with the variable name
                processedString = processedString.replace(template, template.slice(2, -2).trim());
              }
            }
          }
          
          return processedString;
        }
      } catch (error) {
        return current;
      }
    }

    return current;
  }

  const result = traverse(obj);
  templateCache.set(cacheKey, result);
  return result;
}

const pathCache = new Map();

export function extractValue(obj, template = '') {
  if (!obj || !template) return undefined;

  let cleanPath;
  if (pathCache.has(template)) {
    cleanPath = pathCache.get(template);
  } else {
    cleanPath = template
      .replace(/{{self\./g, '')
      .replace(/}}/g, '')
      .trim();
    pathCache.set(template, cleanPath);
  }

  const parts = cleanPath.split('.');
  let result = obj;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      return undefined;
    }
  }

  return result;
}

export function clearOptimizationCaches() {
  memoCache.clear();
  templateCache.clear();
  pathCache.clear();
}

// New function to clear view-related caches
export function clearViewCaches(viewId = null) {
  // Clear all caches if no specific view ID
  if (!viewId) {
    memoCache.clear();
    processedViewsCache.clear();
    viewContentHashes.clear();
    clearSlotRegistry(); // Clear slot registry when clearing all caches
    return;
  }
  
  // Clear specific view caches
  const keysToDelete = [];
  for (const [key] of memoCache) {
    if (key.includes(viewId)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => memoCache.delete(key));
  
  // Clear processed views cache for this view
  const processedKeysToDelete = [];
  for (const [key] of processedViewsCache) {
    if (key.includes(viewId)) {
      processedKeysToDelete.push(key);
    }
  }
  processedKeysToDelete.forEach(key => processedViewsCache.delete(key));
  
  // Clear view content hash
  viewContentHashes.delete(viewId);
  
}

// Enhanced cache management for view processing
const processedViewsCache = new Map();
const viewContentHashes = new Map();

// Function to generate content hash for view to detect changes
function generateViewContentHash(view) {
  if (!view) return '';
  const contentString = JSON.stringify({
    layout: view.layout,
    configuration: view.configuration,
    name: view.name,
    // Simple hash using content
    lastModified: view.lastModified || view.updatedAt
  });
  return btoa(contentString).slice(0, 16);
}

// Expose cache clearing functions globally for easy access
if (typeof window !== 'undefined') {
  (window as any).clearViewCaches = clearViewCaches;
  (window as any).clearSlotRegistry = clearSlotRegistry;
  (window as any).getSlotId = getSlotId;
  (window as any).clearOptimizationCaches = clearOptimizationCaches;
}
export function createBaseProps(
  item,
  index,
  isHovered,
  readOnly,
  editMode,
  setisHovered,
  setCommentPos,
  setActiveDrawingPathId,
  setIsDrawingPathActive,
  isDrawingPathActive,
  setTargets,
  processedStyle,
  builderCursorMode,
  isLayout,
  createEventHandlers
) {
  return {
    key: item.i || index,
    id: item.i || index,
    onMouseEnter: () => !readOnly && editMode && setisHovered(true),
    onMouseLeave: () => !readOnly && editMode && setisHovered(false),
    onClick: (e) => {
      e.stopPropagation();
      if (item.componentId === 'drawpath' && isDrawingPathActive) {
        setIsDrawingPathActive(false);
      }
      if (builderCursorMode === 'comment') {
        setCommentPos?.(e);
      } else if (builderCursorMode === 'xray') {
        // Handle xray mode click - select the clicked element

        if (setTargets) {
          const domElement = document.getElementById(item.i);

          if (domElement) {
            setTargets([domElement]);
          }
        } else {
        }
      }
    },
    onDoubleClick: (e) => {
      e.stopPropagation();
      if (item.componentId === 'drawpath') {
        setActiveDrawingPathId(item.i);
        setIsDrawingPathActive(!isDrawingPathActive);
        setTargets([]);
      }
    },
    style: processedStyle,
    className: `${item?.isGroup ? 'group-container ' : ''}${item?.configuration?.classNames || ''} ${
      builderCursorMode === 'hand'
        ? 'cursor-grab active:cursor-grabbing !pointer-events-none'
        : builderCursorMode === 'draw'
        ? '!cursor-draw !pointer-events-none !disabled'
        : builderCursorMode === 'path'
        ? 'cursor-path'
        : builderCursorMode === 'comment'
        ? '!cursor-comment !pointer-events-none'
        : builderCursorMode === 'voetsek'
        ? '!cursor-xray'
        : editMode && !isDrawingPathActive && builderCursorMode === 'default'
        ? `${!isLayout && 'cube'} active:cursor-grabbing`
        : `${!isLayout && 'cube'}  active:cursor-grabbing`
    }`,
    ...(editMode ? {} : { events: createEventHandlers(item) }),
    ...(editMode ? {} : createEventHandlers(item)),
  };
}

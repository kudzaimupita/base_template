import React from 'react';
import { processController } from './digest/digester';
import { EVENT_HANDLERS } from './eventHandlersTypes';
import { isEmpty } from 'lodash';
import InlineEditText from './InLineTextEditor';
import { IconRenderer } from './IconRenderer';
import { retrieveBody } from './digest/state/utils';
import { message } from 'antd';
import renderElementUtil from './renderElementUtil';

export function createEventHandler(e, processToRun, elementId, currentApplication, navigate, params, tab, editMode, store, refreshAppAuth, setDestroyInfo, setSessionInfo, setAppStatePartial, storeInvocation) {
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

export function createEventHandlers(item, currentApplication, navigate, params, tab, editMode, store, refreshAppAuth, setDestroyInfo, setSessionInfo, setAppStatePartial, storeInvocation,dispatch,allElements, setElements, appState, createEventHandlerss) {
  const handlers = {};

  Object.keys(EVENT_HANDLERS).forEach((eventName) => {
      
       if (isEmpty(item?.configuration?.[eventName])) return;

    const configHandler = item?.configuration?.[eventName];
    // message.error(eventName)
 
    if (configHandler?.plugins?.length> 0) {
     
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
        return createEventHandler(e, configHandler, item.i, currentApplication, navigate, params, tab, editMode, store, refreshAppAuth, setDestroyInfo, setSessionInfo, setAppStatePartial, storeInvocation);
      };
    }
  });
  return handlers;
}
export function renderComponent(id, props, componentsMap, editMode, elements, setElementsToRender, setItemToEdit) {
  if (props.componentId === 'text') {

    return (
      <InlineEditText
      id={props.i}
        isEditable={false}
        overflowEffect="elipsis"
        targeted={true}
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
        overRideStyles={{
          ...props?.configuration,
        }}
        initialText={props?.configuration?.text}
      />
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
    return 'Nothing set yet';
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
    .map(value => {
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
      outlineOffset: '2px'
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
    "alignItems",
    "columnsList",
    "gridTemplateColumns",
    "gridTemplateRows",
    "justifyContent",
    "rowsList"
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
  
  const cacheKey = JSON.stringify(components.map(c => ({ i: c.i, parent: c.parent })));
  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey);
  }

  // Use Map for O(1) lookups instead of array.find()
  const componentMap = new Map();
  const parentToChildrenMap = new Map();
  
  // Single pass to build maps
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    componentMap.set(component.i, component);
    
    if (component.parent && component.parent !== null) {
      if (!parentToChildrenMap.has(component.parent)) {
        parentToChildrenMap.set(component.parent, new Set());
      }
      parentToChildrenMap.get(component.parent).add(component.i);
    }
  }

  // Create result array with minimal object creation
  const result = new Array(components.length);
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    const children = parentToChildrenMap.get(component.i);
    
    result[i] = {
      ...component,
      children: children ? Array.from(children) : (component.children || [])
    };
  }

  memoCache.set(cacheKey, result);
  return result;
}

export const flattenComponentViews = (els = [], currentApplication) => {
  if (!els?.length) return [];
  
  const flat = [];
  const viewsMap = new Map();
  const processedViews = new Map();
  
  // Pre-build views map for O(1) lookup
  if (currentApplication?.views) {
    for (const view of currentApplication.views) {
      viewsMap.set(view.id, view);
    }
  }
  
  // Use iterative approach with stack to avoid recursion overhead
  const stack = els.map(el => ({ el, parent: null }));
  
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
        
        // Check cache first
        const cacheKey = `${el.componentId}_${el.i}`;
        if (processedViews.has(cacheKey)) {
          nestedElements = processedViews.get(cacheKey);
        } else {
          nestedElements = convertParentViewToLayoutItem(view, el.i);
          const synced = syncParentChildRelationships(nestedElements || []);
          processedViews.set(cacheKey, synced);
          nestedElements = synced;
        }
        
        // Add to stack for processing
        for (const child of nestedElements) {
          stack.push({ el: child, parent: el.i });
        }
      }
    }

    // Handle regular children
    if (Array.isArray(el.children) && el.children.length > 0) {
      // Use reverse order to maintain original order when using stack
      for (let i = el.children.length - 1; i >= 0; i--) {
        const childId = el.children[i];
        const child = els.find(c => c.i === childId);
        if (child) {
          stack.push({ el: child, parent: el.i });
        }
      }
    }
  }

  return flat;
};

export function flattenElementTree(rootElements = [], parentId = null) {
  if (!rootElements?.length) return [];
  
  const flat = [];
  // Use iterative approach with stack
  const stack = rootElements.map(root => ({ element: root, parent: parentId }));
  
  while (stack.length > 0) {
    const { element, parent } = stack.pop();
    
    const el = {
      ...element,
      parent,
      children: Array.isArray(element.children) 
        ? element.children.map(child => child.i || child.id || child) 
        : []
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
  const rootElements = convertedView.layout.filter(item => !item.parent || item.parent === null);
  
  // Use iterative approach with stack
  const stack = rootElements.map(root => ({ 
    element: root, 
    parentId: id, 
    level: 0,
    isRoot: true 
  }));
  
  while (stack.length > 0) {
    const { element, parentId, level, isRoot } = stack.pop();
    
    const newId = `${parentId}-${element.i}`;
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
      children: childElements.map(child => `${newId}-${child.i}`),
      isVirtual: true,
      isChild: true,
      originId: element.i,
      viewId: parentId
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
        isRoot: false 
      });
    }
  }
  
  // Create the page container
  const pageContainer = {
    isGroup: true,
    componentId: "container",
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
      classNames: "content",
      tag: convertedView.configuration?.tag || "div"
    }
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
  
  function isTemplate(value) {
    return typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}');
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
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const newPropertyName = propertyName ? `${propertyName}.${key}` : key;
        result[key] = traverse(current[key], newPropertyName);
      }
      return result;
    }

    if (isTemplate(current)) {
      try {
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

        if (result === null || result === undefined || result === '' ||
          (typeof result === 'string' && result.trim() === '')) {
          return current.slice(2, -2).trim();
        }

        return result;
      } catch (error) {
        
        return current.slice(2, -2).trim();
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
export function createBaseProps(item, index, isHovered, readOnly, editMode, setisHovered, setCommentPos, setActiveDrawingPathId, setIsDrawingPathActive, isDrawingPathActive, setTargets, processedStyle, builderCursorMode, isLayout, createEventHandlers) {
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
              : builderCursorMode === 'xray'
                ? '!cursor-xray'
                : editMode && !isDrawingPathActive && builderCursorMode === 'default' 
                  ? `${!isLayout && 'cube'} active:cursor-grabbing` 
                  : `${!isLayout && 'cube'}  active:cursor-grabbing`
    }`,
    ...(editMode ? {} : { events: createEventHandlers(item) }),
    ...(editMode ? {} : createEventHandlers(item)),
  };
}
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useRef, useState, createContext, useContext, useCallback } from 'react';

import ErrorBoundary from './ErrorBoundary';
import VirtualElementWrapper from './VitualElementWrapper';
import { flattenStyleObject } from './flattenStyleObject';
import { generateComponentGroups } from './list';
import { debounce, isEmpty } from 'lodash';
import { processController } from './digest/digester';
import renderElementUtil from './renderElementUtil';
import DebugWrapper from './effectWrapper';
import { twMerge } from 'tailwind-merge';
import { useParams } from 'react-router-dom';
import { convertParentViewToLayoutItem, createEventHandlers, extractValue, processObjectTemplatesAndReplace, renderComponent, SELF_CLOSING_TAGS, syncParentChildRelationships } from './utils';
import { message } from 'antd';
import { SortableContainerSetup } from './Setup';

// Global state to track sortable operations and prevent conflicts
let isSortableOperationActive = false;
let sortableOperationTimeouts = new Set<NodeJS.Timeout>();

const setSortableOperationState = (active: boolean) => {
  isSortableOperationActive = active;
  if (!active) {
    // Clear any pending timeouts when operation completes
    sortableOperationTimeouts.forEach(timeout => clearTimeout(timeout));
    sortableOperationTimeouts.clear();
  }
};

// Helper function to check if sortable is active using DOM state as fallback
const isSortableCurrentlyActive = () => {
  return isSortableOperationActive || 
         document.body.classList.contains('sortable-dragging') || 
         document.querySelector('.sortable-ghost') !== null;
};

const ElementRendererContext = createContext(null);

const useElementRenderer = () => {
  const context = useContext(ElementRendererContext);
  if (!context) {
    throw new Error('useElementRenderer must be used within ElementRendererProvider');
  }
  return context;
};

const processElement = (oldItem) => {
  const processedItem = { ...oldItem };
  const keysToDelete = [
    "alignItems",
    "columnsList", 
    "gridTemplateColumns",
    "gridTemplateRows",
    "justifyContent",
    "rowsList"
  ];
  
  for (const key of keysToDelete) {
    delete processedItem[key];
  }
  delete processedItem.style;
  
  return processedItem;
};

const elementCache = new WeakMap();

interface ElementItemProps {
  item: any;
  index: number;
  allElements: any[];
  renderingStack?: Set<any>;
}
const ElementItem = React.memo(({
  item: oldItem,
  index,
  allElements,
  renderingStack = new Set(),
}: ElementItemProps) => {
  const context = useElementRenderer();
  const {
    isLayout,
    allComponentsRaw,
    setAppStatePartial,
    setCommentPos,
    targets,
    readOnly,
    params,
    editMode,
    isDrawingPathActive,
    setIsDrawingPathActive,
    setActiveDrawingPathId,
    activeDrawingPathId,
    setSelectedElements,
    isDragging,
    builderCursorMode,
    currentApplication,
    tab,
    navigate,
    appState,
    dispatch,
    setElementsToRender,
    store,
    setElements,
    refreshAppAuth,
    setDestroyInfo,
    setSessionInfo,
    storeInvocation,
    setItemToEdit,
  } = context;

  // State for tracking overrides refresh
  const [overridesRefreshKey, setOverridesRefreshKey] = useState(0);

  // Listen for element overrides updates
  useEffect(() => {
    const handleOverridesUpdate = (event) => {
      const { elementId, viewId } = event.detail;
      if (elementId === oldItem?.i && viewId === tab) {
        setOverridesRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('elementOverridesUpdated', handleOverridesUpdate);
    return () => window.removeEventListener('elementOverridesUpdated', handleOverridesUpdate);
  }, [oldItem?.i, tab]);

  // Use cached processed item or create new one
  const item = useMemo(() => {
    if (elementCache.has(oldItem)) {
      return elementCache.get(oldItem);
    }
    const processed = processElement(oldItem);
    elementCache.set(oldItem, processed);
    return processed;
  }, [oldItem]);

  const [isHovered, setisHovered] = useState(false);
  const hasInitialized = useRef(false);
  const initializationKey = useRef(null);

  // Optimize children management with batching - avoid conflicts with SortableJS
  const ensureChildrenInGlobalElements = useCallback((childElements) => {
    if (!childElements || childElements.length === 0) return;
    
    // Check if we're in the middle of a sortable operation to avoid conflicts
    if (isSortableCurrentlyActive()) {
      // Defer until sortable operation is complete
      const timeout = setTimeout(() => ensureChildrenInGlobalElements(childElements), 200);
      sortableOperationTimeouts.add(timeout);
      return;
    }
    
    // Use a more conservative approach without requestAnimationFrame to avoid timing conflicts
    setElements(currentElements => {
      const elementsMap = new Map(currentElements.map(el => [el.i, el]));
      let hasChanges = false;

      const newElements = childElements.filter(childEl => {
        if (childEl && childEl.i && !elementsMap.has(childEl.i)) {
          elementsMap.set(childEl.i, childEl);
          hasChanges = true;
          return true;
        }
        return false;
      });

      return hasChanges ? Array.from(elementsMap.values()) : currentElements;
    });
  }, [setElements]);

  // Optimize overrides processing with better error handling and caching
  const processOverrides = useCallback(async (overrides, eventType) => {
    if (!overrides || overrides.length === 0) return;

    const validOverrides = overrides.filter(key => !isEmpty(key));
    if (validOverrides.length === 0) return;

    // Process overrides in parallel with error isolation
    const results = await Promise.allSettled(
      validOverrides.map(async (key) => {
        return processController(
          key,
          {},
          currentApplication?._id,
          navigate,
          params,
          eventType,
          item?.i,
          (process) => '',
          tab,
          (process) =>
            renderElementUtil(
              { ...process, store, allElements },
              allElements,
              setElements,
              appState,
              dispatch,
              tab,
              createEventHandlers,
              editMode,
              extractValue,
              setAppStatePartial,
              currentApplication
            ),
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
      })
    );

    // Handle rejected promises silently
  }, [
    currentApplication?._id,
    navigate,
    params,
    item?.i,
    tab,
    store,
    allElements,
    setElements,
    appState,
    dispatch,
    editMode,
    setAppStatePartial,
    refreshAppAuth,
    setDestroyInfo,
    setSessionInfo,
    storeInvocation
  ]);

  // Optimize initialization with better dependency tracking
  useEffect(() => {
    const currentKey = `${item?.i}-${currentApplication?._id}`;
    
    if (!item?.i || !currentApplication?._id || readOnly || !allElements?.length) {
      return;
    }

    if (hasInitialized.current && initializationKey.current === currentKey) {
      return;
    }

    const initializeComponent = async () => {
      hasInitialized.current = true;
      initializationKey.current = currentKey;

      const overrides = item?.configuration?._overrides_ || [];
      const mountOverrides = overrides.filter(key => !key?.isCleanUp);
      
      if (mountOverrides.length > 0) {
        await processOverrides(mountOverrides, 'onMount');
      }
    };

    // Debounce initialization to prevent rapid fire
    const timer = setTimeout(initializeComponent, 0);

    return () => {
      clearTimeout(timer);
      
      const processCleanup = async () => {
        const overrides = item?.configuration?._overrides_ || [];
        const cleanupOverrides = overrides.filter(key => key?.isCleanUp);
        
        if (cleanupOverrides.length > 0) {
          await processOverrides(cleanupOverrides, 'onUnmount');
        }
      };

      if (!readOnly && allElements?.length > 0) {
        processCleanup();
      }
    };
  }, [
    item?.i,
    currentApplication?._id,
    readOnly,
    processOverrides,
    item?.configuration?._overrides_,
    JSON.stringify(item?.configuration?._overrides_),
    overridesRefreshKey,

  ]);

  // Cache processed components globally
  const processedComponents = useMemo(
    () => allComponentsRaw?.map((item) => generateComponentGroups(item)) || [],
    [allComponentsRaw]
  );

  const componentsMap = useMemo(() => {
    const map = new Map();
    processedComponents?.forEach(component => {
      if (component?.value) {
        map.set(component.value, component.config?.component);
      }
    });
    return Object.fromEntries(map);
  }, [processedComponents]);

  // Optimize hover state with target checking
  const isTargeted = useMemo(() => 
    targets?.some(target => target.id === item.i), 
    [targets, item.i]
  );

  // Optimize style processing with better memoization
  const processedStyle = useMemo(() => {
    const baseStyle = { ...item?.style };

    // Handle background image
    if (item.configuration?.backgroundImage) {
      const bgImg = item.configuration.backgroundImage;
      if (bgImg.startsWith('http') || bgImg.startsWith('data:')) {
        baseStyle.backgroundImage = `url(${bgImg})`;
      } else {
        baseStyle.backgroundImage = bgImg;
      }
    }

    // Handle transform
    if (item?.configuration?.transform) {
      baseStyle.transform = item.configuration.transform;
    }

    // Handle hover outline
    if (isHovered && !readOnly && !isDragging && editMode && !isTargeted) {
      baseStyle.outline = '2px solid #4a90e2';
      baseStyle.outlineOffset = '2px';
    }

    // Clean up conflicting styles
    if (baseStyle.background) {
      delete baseStyle.backgroundImage;
    }

    // Optimize border radius
    if (baseStyle?.borderRadius) {
      baseStyle.borderRadius = baseStyle.borderRadius
        .split(',')
        .map(value => {
          const trimmed = value.trim();
          return trimmed.endsWith('px') ? trimmed : `${trimmed}px`;
        })
        .join(' ');
    }

    return baseStyle;
  }, [
    item?.style,
    item.configuration?.backgroundImage,
    item.configuration?.transform,
    isHovered,
    readOnly,
    isDragging,
    editMode,
    isTargeted
  ]);

  // Optimize configuration with shallow comparison
  const itemConfiguration = useMemo(() => {
    const config = { ...item.configuration };
    
    if (item.componentId === 'text') {
      config.backgroundImage = '';
      config.background = '';
    }

    const stateConfig = appState?.[item.i] || {};

    return {
      ...config,
      ...stateConfig,
      classNames: `${config.classNames || ''} ${stateConfig.classNames || ''}`.trim()
    };
  }, [item.configuration, item.componentId, appState?.[item.i]]);

  // Optimize event handlers with better memoization
  const eventHandlers = useMemo(() => {
    if (editMode) return {};
    
    return createEventHandlers(
      item,
      currentApplication,
      navigate,
      params,
      tab,
      editMode,
      store,
      refreshAppAuth,
      setDestroyInfo,
      setAppStatePartial,
      setAppStatePartial,
      storeInvocation,
      dispatch,
      allElements,
      setElements,
      appState,
      createEventHandlers
    );
  }, [
    editMode,
    item,
    currentApplication,
    navigate,
    params,
    tab,
    store,
    refreshAppAuth,
    setDestroyInfo,
    setAppStatePartial,
    storeInvocation,
    item?.configuration?._overrides_,
    JSON.stringify(item?.configuration?._overrides_),
    overridesRefreshKey
  ]);

  // Optimize cursor class generation
  const cursorClass = useMemo(() => {
    if (builderCursorMode === 'hand') return 'cursor-grab active:cursor-grabbing !pointer-events-none';
    if (builderCursorMode === 'draw') return '!cursor-draw !pointer-events-none !disabled';
    if (builderCursorMode === 'path') return 'cursor-path';
    if (builderCursorMode === 'comment') return '!cursor-comment !pointer-events-none';
    if (editMode && !isDrawingPathActive && builderCursorMode === 'default') {
      return `${!isLayout ? 'cube' : ''} active:cursor-grabbing`;
    }
    return !isLayout ? 'cube' : '';
  }, [builderCursorMode, editMode, isDrawingPathActive, isLayout]);

  const renderItemWithData = useCallback(() => {
    const viewTag = item.componentId === 'text' ? 'p' : (item?.configuration?.tag || 'div');
    
    const baseProps = {
      key: item.i || index,
      id: item.i || index,
      'data-id': item.i || index, // For sortable detection
      ...(item.componentId === 'text' || item.componentId === 'container' || item.componentId === 'icon' 
        ? { id: item.i || index } 
        : {}),   // onMouseEnter: editMode && !readOnly ? () => setisHovered(true) : undefined,
      // onMouseLeave: editMode && !readOnly ? () => setisHovered(false) : undefined,
      onClick: (e) => {
        e.stopPropagation();
        if (item.componentId === 'drawpath' && isDrawingPathActive) {
          setIsDrawingPathActive(false);
        }
        setCommentPos?.(e);
      },
      onDoubleClick: (e) => {
        e.stopPropagation();
        if (item.componentId === 'drawpath') {
          setActiveDrawingPathId(item.i);
          setIsDrawingPathActive(!isDrawingPathActive);
          setSelectedElements([]);
        }
      },
      style: processedStyle,
      className: `${item?.isGroup ? 'group-container ' : ''}${twMerge(itemConfiguration?.classNames)} ${cursorClass}`,
      ...eventHandlers,
    };
   const stateConfig = appState?.[item.i] || {};
    const props = processObjectTemplatesAndReplace({
      id:item.i,
      ...flattenStyleObject(
        {
          ...baseProps,
          ...itemConfiguration,
          ...flattenStyleObject(item?.configuration, item?.style?.transform, editMode),
          ...eventHandlers,
          ...stateConfig
        },
        item?.configuration?.transform,
        editMode,
  
      ),
      ...eventHandlers,
    }, {
      event: {},
      globalObj: {},
      paramState: params,
      sessionKey: currentApplication?._id + '-sessionInfo',
      store: store
    }, { element: item.i }, tab);
    if (editMode) {
      delete props.disabled;
      if (viewTag.toLowerCase() === 'button') {
        props.type = 'button';
      }
    }
    delete props.style.position;
    delete props.style.transform;
    // Optimize children rendering
    const children = useMemo(() => {
      // Built-in containers (container, slot) - just render children directly
      if ((item?.isGroup && item.componentId === 'container') || item.componentId === 'slot') {
        return (
          <ElementRenderer
            allElements={allElements}
            parentId={item.i}
            isWrapper={false}
            renderingStack={renderingStack}
          />
        );
      }
      
      if (item.componentId === 'text') {
        return  props.text || '';
      }
      
      // Check if any element has text content in configuration (for anchor tags, buttons, etc.)
      if (item.configuration?.text && 
          (item.componentId === 'container' || item.configuration?.tag)) {
        return item.configuration.text;
      }
      
      // For all other components (including 3rd party containers), use renderComponent
      return renderComponent(item.componentId, {
        ...processObjectTemplatesAndReplace({ ...item }, {
          event: {},
          globalObj: {},
          paramState: params,
          sessionKey: currentApplication?._id + '-sessionInfo',
          // ...(appState?.[item.i] || {}),
          props:appState?.[item.i] || {},
         
          store: store
        }, componentsMap, tab),
        isDrawingPathActive: item.i === activeDrawingPathId && isDrawingPathActive,
        setIsDrawingPathActive,
        activeDrawingPathId,
        setActiveDrawingPathId,
        allComponentsRaw,
        processedStyle,
        renderChildren: (el) => {
          let childEls = [];
          if(el){
            // el is a string array of IDs, find the actual elements
            childEls = el.map((str) => {
              
              if (typeof str === 'string') {
                return allElements?.find((ele) => ele.i === str) 
              }
              return str;
            }).filter(Boolean);
          }else{
            // Check if this component has componentRef properties in its schema
            const componentId = item?.meta?.componentId;
            if (componentId && allComponentsRaw) {
              const component = allComponentsRaw.find(comp => comp._id === componentId || comp.id === componentId);
              
              if (component && component.props) {
                try {
                  const schema = JSON.parse(component.props);
                  const properties = schema?.schema?.properties || {};
                  
                  // Find properties with config.uiType === "componentRef" and collect their values
                  const componentRefIds = [];
                  Object.keys(properties).forEach(key => {
                    const property = properties[key];
                    if (property?.config?.uiType === "componentRef") {
                      const value = item?.props?.[key];
                      if (value !== undefined) {
                        if (Array.isArray(value)) {
                          componentRefIds.push(...value);
                        } else {
                          componentRefIds.push(value);
                        }
                      }
                    }
                  });
                  
                  // Find the actual elements from the collected IDs
                  if (componentRefIds.length > 0) {
                    childEls = componentRefIds.map((str) => {
                      if (typeof str === 'string') {
                        return allElements?.find((ele) => ele.i === str);
                      }
                      return str;
                    }).filter(Boolean);
                  }
                } catch (error) {
                  
                }
              }
            }
            
            // Fallback to original children logic if no componentRef found
            if (childEls.length === 0) {
              childEls = item?.children?.map((str) => {
                return allElements?.find((ele) => ele.i === str);
              }).filter(Boolean) || [];
            }
          }
    
          if (childEls.length > 0) {
            ensureChildrenInGlobalElements(childEls);
          }

          return (
            <ElementRenderer
              allElements={allElements}
              parentId={item.i}
              isWrapper={false}
              renderingStack={renderingStack}
            />
          );
        },
         configuration:{...item.configuration, ...appState?.[item.i] || {}},
      }, componentsMap, editMode, allElements, setElements, setItemToEdit);
    }, [
      item?.isGroup,
      item.componentId,
      item.i,
      item?.children,
      item.configuration?.text,
      allElements,
      renderingStack,
      activeDrawingPathId,
      isDrawingPathActive,
      setIsDrawingPathActive,
      setActiveDrawingPathId,
      allComponentsRaw,
      processedStyle,
      componentsMap,
      editMode,
      setElements,
      ensureChildrenInGlobalElements,
      params,
      currentApplication?._id,
      store,
      tab
    ]);

    // Handle component view with better recursion detection
    if (item.isComponentView) {
      const componentViewId = `${item.componentId}-${item.i}`;

      if (renderingStack.has(componentViewId)) {
        return (
          <div
            className="border-2 border-red-500 border-dashed p-4 bg-red-50"
            style={processedStyle}
          >
            <p className="text-red-600 text-sm">
              ⚠️ Recursive component: {item.componentId}
            </p>
          </div>
        );
      }

      const elementss = currentApplication?.views?.find((it) => it.id === item.componentId);

      // if (!elementss) {
      //   return (
      //     <div
      //       className="border-2 border-yellow-500 border-dashed p-4 bg-yellow-50"
      //       style={processedStyle}
      //     >
      //       <p className="text-yellow-600 text-sm">
      //         ⚠️ Component not found: {item.componentId}
      //       </p>
      //     </div>
      //   );
      // }

   
      const viewElements = syncParentChildRelationships([...convertParentViewToLayoutItem(elementss, item.i)]) || [];
      if (viewElements.length > 0) {
        ensureChildrenInGlobalElements(viewElements?.filter((it)=>it.parent));
      }

      const newRenderingStack = new Set(renderingStack);
      newRenderingStack.add(componentViewId);

      return (
        <div id={item.i}>
          <ElementRenderer
            allElements={allElements}
            parentId={item.i}
            isWrapper={false}
            renderingStack={newRenderingStack}
          />
        </div>
      );
    }

    // Handle self-closing tags
    if (SELF_CLOSING_TAGS.has(viewTag.toLowerCase())) {
      const content = React.createElement(viewTag, props);
      return item?.isVirtual ? (
        <VirtualElementWrapper editMode={editMode} style={processedStyle}>
          {content}
        </VirtualElementWrapper>
      ) : (
        content
      );
    }

    // Handle children component in layout
    if (item.componentId === 'children' && isLayout) {
      return <div className={itemConfiguration?.classNames || ''} />;
    }

    const content = React.createElement(viewTag, props, children);

    return item?.isVirtual ? (
      <VirtualElementWrapper editMode={editMode} style={processedStyle}>
        {content}
      </VirtualElementWrapper>
    ) : (
      content
    );
  }, [
    item,
    index,
    editMode,
    readOnly,
    isDrawingPathActive,
    setIsDrawingPathActive,
    setActiveDrawingPathId,
    setSelectedElements,
    setCommentPos,
    processedStyle,
    itemConfiguration,
    cursorClass,
    isLayout,
    eventHandlers,
    allElements,
    renderingStack,
    activeDrawingPathId,
    allComponentsRaw,
    componentsMap,
    setElements,
    ensureChildrenInGlobalElements,
    currentApplication,
    params,
    store,
    tab
  ]);

  return renderItemWithData();
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.allElements === nextProps.allElements &&
    prevProps.renderingStack === nextProps.renderingStack
  );
});

interface ElementRendererProps {
  allElements: any[];
  parentId?: string | null;
  isWrapper?: boolean;
  renderingStack?: Set<any>;
}
const ElementRenderer = React.memo(({
  allElements,
  parentId = null,
  isWrapper = false,
  renderingStack = new Set(),
}: ElementRendererProps) => {
  const {
    editMode,
    currentApplication,
    tab,
    readOnly,
    setElements,
  } = useElementRenderer();

  const [currentTab, setCurrentTab] = useState(tab);
  const [isClearing, setIsClearing] = useState(false);

  // Optimize tab change with better batching - avoid conflicts with SortableJS
  useEffect(() => {
    if (currentTab !== tab && isWrapper) {
      setIsClearing(true);
      
      const performTabChange = () => {
        setElements(currentElements => {
          const filteredElements = currentElements.filter(el => {
            if (el.tab && el.tab !== tab) return false;
            if (el.isVirtual && el.sourceTab && el.sourceTab !== tab) return false;
            if (el.isComponentView && el.previousTab && el.previousTab !== tab) return false;
            return true;
          });
          
          return filteredElements;
        });

        setCurrentTab(tab);
        setIsClearing(false);
      };

      if (isSortableCurrentlyActive()) {
        // Defer until sortable operation is complete
        const timeout = setTimeout(performTabChange, 300);
        sortableOperationTimeouts.add(timeout);
      } else {
        // Small delay to ensure DOM stability
        setTimeout(performTabChange, 50);
      }
    }
  }, [tab, currentTab, isWrapper, setElements]);

  // Optimize element filtering with Map-based approach
  const filteredElements = useMemo(() => {
    if (isClearing || !allElements || allElements.length === 0) {
      return [];
    }

    // Use Map for O(1) lookups
    const elementMap = new Map();
    allElements.forEach(item => {
      if (item && item.i) {
        elementMap.set(item.i, item);
      }
    });

    const filtered = [];
    for (const [id, item] of elementMap) {
      if (item.parent === parentId && item.i) {
        if (item.isVirtual && item.sourceTab && item.sourceTab !== tab) {
          continue;
        }
        filtered.push(item);
      }
    }
    const handleDOMError = () => {
     
      
      // Reset to original state
      // setElements([...allElements]);
      
      // Or reload from server/localStorage/etc.
      // loadElementsFromSource().then(setElements);
      
    };
  
    return filtered.map((item, index) => (
      <ErrorBoundary onDOMError={handleDOMError} key={`${item.i}-${tab}-${item.isVirtual ? 'v' : 'n'}`} fallback={<p>Error</p>}>
        <DebugWrapper
          configuration={item?.configuration}
          enabled={editMode && currentApplication?.builderSettings?.anatomy}
          eventHandlers={Object.keys(item?.configuration || {}).filter(key =>
            key.toLowerCase().startsWith('on'))}
          effectCount={item.configuration?._overrides_?.length || 0}
          showDetails={true}
          label={item.name}
        >
          <ElementItem
            item={item}
            index={index}
            allElements={allElements}
            renderingStack={renderingStack}
          />
        </DebugWrapper>
      </ErrorBoundary>
    ));
  }, [
    allElements,
    parentId,
    tab,
    isClearing,
    renderingStack,
    editMode,
    currentApplication?.builderSettings?.anatomy
  ]);

  return <>{filteredElements}</>;
});

interface ElementRendererWithContextProps {
  elements: any[];
  setElements?: (elements: any[]) => void;
  parentId?: string | null;
  isWrapper?: boolean;
  tab?: string;
  editMode?: boolean;
}

const ElementRendererWithContext = React.memo((props: ElementRendererWithContextProps) => {
  // Use Map for better performance with large element lists and sort by hierarchy
  const cleanedElements = useMemo(() => {
    if (!props.elements || !Array.isArray(props.elements)) {
      return [];
    }
    
    const cleanedMap = new Map();
    
    for (const el of props.elements) {
      if (el && el.i) {
        let element = el;
        
        if (el.isVirtual && Object.isExtensible(el)) {
          try {
            el.sourceTab = props.tab;
          } catch (e) {
            element = { ...el, sourceTab: props.tab };
          }
        }
        
        cleanedMap.set(el.i, element);
      }
    }

    const elementsArray = Array.from(cleanedMap.values());
    
    // Sort elements hierarchically based on children arrays
    const sortElementsHierarchically = (elements) => {
      const elementMap = new Map(elements.map(el => [el.i, el]));
      const sortedElements = [];
      const processed = new Set();

      // Helper function to traverse depth-first
      const traverseDepthFirst = (elementId) => {
        if (processed.has(elementId) || !elementMap.has(elementId)) {
          return;
        }

        processed.add(elementId);
        const element = elementMap.get(elementId);
        sortedElements.push(element);

        // Process children in the order specified by the children array
        if ((element as any).children && Array.isArray((element as any).children)) {
          (element as any).children.forEach((childId: string) => {
            if (elementMap.has(childId)) {
              traverseDepthFirst(childId);
            }
          });
        }
      };

      // Start with root elements (those with no parent or parent is null)
      const rootElements = elements.filter(el => !el.parent || el.parent === null);
      
      // Process each root element and its descendants
      rootElements.forEach(rootElement => {
        traverseDepthFirst(rootElement.i);
      });

      // Add any remaining unprocessed elements (orphaned elements)
      elements.forEach(element => {
        if (!processed.has(element.i)) {
          sortedElements.push(element);
        }
      });

      return sortedElements;
    };

    return sortElementsHierarchically(elementsArray);
  }, [props.elements, props.tab]);

  // Deep memo for context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...props,
    elements: cleanedElements,
    setElements: props.setElements,
  }), [props, cleanedElements]);

  return (
    <ElementRendererContext.Provider value={contextValue}>
    {props.editMode && (
      <SortableContainerSetup
        elementss={cleanedElements} 
        setElements={props.setElements}
        setSortableOperationState={setSortableOperationState}
        isSortableCurrentlyActive={isSortableCurrentlyActive}
      />
    )}  
      <ElementRenderer
        allElements={cleanedElements}
        parentId={props.parentId}
        isWrapper={props.isWrapper !== false}
        renderingStack={new Set()}
      />
    </ElementRendererContext.Provider>
  );
});

export default ElementRendererWithContext;
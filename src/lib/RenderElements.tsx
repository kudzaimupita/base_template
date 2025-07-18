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

const ElementRendererContext = createContext(null);

const useElementRenderer = () => {
  const context = useContext(ElementRendererContext);
  if (!context) {
    throw new Error('useElementRenderer must be used within ElementRendererProvider');
  }
  return context;
};

// Optimize element processing with better memoization
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

// Cache for processed elements
const elementCache = new WeakMap();

// Memoized component with aggressive optimization
const ElementItem = React.memo(({
  item: oldItem,
  index,
  allElements,
  renderingStack = new Set(),
}) => {
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

  // Optimize children management with batching
  const ensureChildrenInGlobalElements = useCallback((childElements) => {
    if (!childElements || childElements.length === 0) return;
    
    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(() => {
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

    // Log only rejected promises
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error processing ${eventType} override:`, {
          key: validOverrides[index],
          error: result.reason,
          item: item?.i
        });
      }
    });
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
      storeInvocation
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
    storeInvocation
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
    const viewTag = item?.configuration?.tag || 'div';
    
    const baseProps = {
      key: item.i || index,
      id: item.i || index,
      onMouseEnter: editMode && !readOnly ? () => setisHovered(true) : undefined,
      onMouseLeave: editMode && !readOnly ? () => setisHovered(false) : undefined,
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
      className: `opacdity-25 ${item?.isGroup ? 'group-container ' : ''}${twMerge(itemConfiguration?.classNames)} ${cursorClass}`,
      ...eventHandlers,
    };
   const stateConfig = appState?.[item.i] || {};
    const props = processObjectTemplatesAndReplace({
      ...flattenStyleObject(
        {
          ...baseProps,
          ...itemConfiguration,
          ...flattenStyleObject(item?.configuration, item?.style?.transform, editMode),
          ...baseProps.events,
          ...stateConfig
        },
        item?.configuration?.transform,
        editMode
      ),
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
      if (item?.isGroup || item.componentId === 'container') {
        return (
          <ElementRenderer
            allElements={allElements}
            parentId={item.i}
            isWrapper={false}
            renderingStack={renderingStack}
          />
        );
      }
      
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
          const childEls = item?.children?.map((str) => {
            return allElements?.find((ele) => ele.i === str);
          }).filter(Boolean);

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
      }, componentsMap, editMode, allElements, setElements);
    }, [
      item?.isGroup,
      item.componentId,
      item.i,
      item?.children,
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

      if (!elementss) {
        return (
          <div
            className="border-2 border-yellow-500 border-dashed p-4 bg-yellow-50"
            style={processedStyle}
          >
            <p className="text-yellow-600 text-sm">
              ⚠️ Component not found: {item.componentId}
            </p>
          </div>
        );
      }

      const viewElements = syncParentChildRelationships([...convertParentViewToLayoutItem(elementss, item.i)]) || [];
      
      if (viewElements.length > 0) {
        ensureChildrenInGlobalElements(viewElements);
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

// Optimize ElementRenderer with better filtering
const ElementRenderer = React.memo(({
  allElements,
  parentId = null,
  isWrapper = false,
  renderingStack = new Set(),
}) => {
  const {
    editMode,
    currentApplication,
    tab,
    readOnly,
    setElements,
  } = useElementRenderer();

  const [currentTab, setCurrentTab] = useState(tab);
  const [isClearing, setIsClearing] = useState(false);

  // Optimize tab change with better batching
  useEffect(() => {
    if (currentTab !== tab && isWrapper) {
      setIsClearing(true);

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
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
      });
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

    return filtered.map((item, index) => (
      <ErrorBoundary key={`${item.i}-${tab}-${item.isVirtual ? 'v' : 'n'}`} fallback={<p>Error</p>}>
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

// Optimize context provider with better element processing
const ElementRendererWithContext = React.memo((props) => {
  // Use Map for better performance with large element lists
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

    return Array.from(cleanedMap.values());
  }, [props.elements, props.tab]);

  // Deep memo for context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...props,
    elements: cleanedElements
  }), [props, cleanedElements]);

  return (
    <ElementRendererContext.Provider value={contextValue}>
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
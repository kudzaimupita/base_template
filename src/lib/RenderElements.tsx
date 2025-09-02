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
import { retrieveBody } from './digest/state/utils';
import DebugWrapper from './effectWrapper';
import { twMerge } from 'tailwind-merge';
import { useParams } from 'react-router-dom';
import {
  convertParentViewToLayoutItem,
  createEventHandlers,
  extractValue,
  processObjectTemplatesAndReplace,
  renderComponent,
  SELF_CLOSING_TAGS,
  syncParentChildRelationships,
} from './utils';
import { message } from 'antd';
import { SortableContainerSetup } from './Setup';
import { SimpleDndKit, SimpleSortableItem } from './SimpleDndKit';

// Global state to track sortable operations and prevent conflicts
let isSortableOperationActive = false;
const sortableOperationTimeouts = new Set<NodeJS.Timeout>();

const setSortableOperationState = (active: boolean) => {
  isSortableOperationActive = active;
  if (!active) {
    // Clear any pending timeouts when operation completes
    sortableOperationTimeouts.forEach((timeout) => clearTimeout(timeout));
    sortableOperationTimeouts.clear();
  }
};

// Helper function to check if sortable is active using DOM state as fallback
const isSortableCurrentlyActive = () => {
  return (
    isSortableOperationActive ||
    document.body.classList.contains('sortable-dragging') ||
    document.querySelector('.sortable-ghost') !== null
  );
};

// Utility function to interpolate text with template variables


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
    'alignItems',
    'columnsList',
    'gridTemplateColumns',
    'gridTemplateRows',
    'justifyContent',
    'rowsList',
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
const ElementItem = React.memo(
  ({ item: oldItem, index, allElements, renderingStack = new Set() }: ElementItemProps) => {
    const context = useElementRenderer();

    // Check if we should use sortable
    const shouldUseSortable = context?.editMode && !oldItem?.isVirtual && oldItem?.componentId !== 'slot' && oldItem?.i;

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
    
    // State for tracking event handlers refresh
    const [eventHandlersRefreshKey, setEventHandlersRefreshKey] = useState(0);
    const lastEditModeRef = useRef(editMode);
    const lastTabRef = useRef(tab);

    // Listen for element overrides updates
    useEffect(() => {
      const handleOverridesUpdate = (event) => {
        const { elementId, viewId } = event.detail;
        if (elementId === oldItem?.i && viewId === tab) {
          setOverridesRefreshKey((prev) => prev + 1);
        }
      };

      window.addEventListener('elementOverridesUpdated', handleOverridesUpdate);
      return () => window.removeEventListener('elementOverridesUpdated', handleOverridesUpdate);
    }, [oldItem?.i, tab]);
    
    // Trigger event handlers refresh when editMode or tab changes
    useEffect(() => {
      if (lastEditModeRef.current !== editMode || lastTabRef.current !== tab) {
        setEventHandlersRefreshKey((prev) => prev + 1);
        lastEditModeRef.current = editMode;
        lastTabRef.current = tab;
      }
    }, [editMode, tab]);

    // Use cached processed item or create new one - but force refresh if content changed
    const item = useMemo(() => {
      const processed = processElement(oldItem);
      
      // For debugging: always log when processing elements
      
      return processed;
    }, [oldItem?.i, oldItem?.configuration, oldItem?.style, oldItem?.name, oldItem?.children, oldItem?.componentId]);

    const [isHovered, setisHovered] = useState(false);
    const hasInitialized = useRef(false);
    const initializationKey = useRef(null);

    // Optimize children management with batching - avoid conflicts with SortableJS
    const ensureChildrenInGlobalElements = useCallback(
      (childElements) => {
        if (!childElements || childElements.length === 0) return;

        // Check if we're in the middle of a sortable operation to avoid conflicts
        if (isSortableCurrentlyActive()) {
          // Defer until sortable operation is complete
          const timeout = setTimeout(() => ensureChildrenInGlobalElements(childElements), 200);
          sortableOperationTimeouts.add(timeout);
          return;
        }

        // Use a more conservative approach without requestAnimationFrame to avoid timing conflicts
        setElements?.((currentElements) => {
          const elementsMap = new Map(currentElements.map((el) => [el.i, el]));
          let hasChanges = false;

          const newElements = childElements.filter((childEl) => {
            if (childEl && childEl.i && !elementsMap.has(childEl.i)) {
              elementsMap.set(childEl.i, childEl);
              hasChanges = true;
              return true;
            }
            return false;
          });

          return hasChanges ? Array.from(elementsMap.values()) : currentElements;
        });
      },
      [setElements]
    );

    // Optimize overrides processing with better error handling and caching
    const processOverrides = useCallback(
      async (overrides, eventType) => {
        if (!overrides || overrides.length === 0) return;

        const validOverrides = overrides.filter((key) => !isEmpty(key));
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
                  { ...process, store, allElements, currentItemConfiguration: item?.configuration },
                  allElements,
                  setElements,
                  appState,
                  dispatch,
                  tab,
                  createEventHandlers,
                  editMode,
                  extractValue,
                  setAppStatePartial,
                  currentApplication,
                  navigate,
                  params,
                  store,
                  refreshAppAuth,
                  setDestroyInfo,
                  setSessionInfo,
                  storeInvocation,
                 
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
      },
      [
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
        storeInvocation,
      ]
    );

    // Helper function to resolve dependency values
    const resolveDependencyValue = useCallback((depString) => {
      try {
        return retrieveBody(
          null,
          depString,
          {},
          appState,
          { tab },
          currentApplication?._id + '-sessionInfo',
          {
            compId: item?.i,
            store: store,
            pageId: tab,
          }
        );
      } catch (error) {
        console.warn('Failed to resolve dependency:', depString, error);
        return undefined;
      }
    }, [appState, tab, currentApplication?._id, item?.i, store]);

    // Helper function to interpolate text with template variables
    const interpolateText = useCallback((text) => {
      if (!text || typeof text !== 'string') return text;
      
      // Check if text contains template variables {{}}
      if (text.includes('{{') && text.includes('}}')) {
        try {
          return retrieveBody(
            null,
            text,
            {},
            appState,
            { tab },
            currentApplication?._id + '-sessionInfo',
            {
              compId: item?.i,
              store: store,
              pageId: tab,
            }
          );
        } catch (error) {
          console.warn('Failed to interpolate text:', text, error);
          return text;
        }
      }
      
      return text;
    }, [appState, tab, currentApplication?._id, item?.i, store]);

    // Dynamic dependencies for each override with dependencies
    const overrideDependencies = useMemo(() => {
      const overrides = item?.configuration?._overrides_ || [];
      const deps = new Map();
      
      overrides.forEach((override, index) => {
        if (override?.dependencies && Array.isArray(override.dependencies)) {
          const resolvedDeps = override.dependencies.map(depString => 
            resolveDependencyValue(depString)
          );
          deps.set(index, {
            override,
            dependencies: override.dependencies,
            resolvedValues: resolvedDeps,
          });
        }
      });
      
      return deps;
    }, [
      item?.configuration?._overrides_, 
      resolveDependencyValue,
      appState, // Add appState to dependencies to trigger when state changes
      tab,
      store
    ]);

    // Track previous dependency values to detect changes
    const prevDependencyValues = useRef(new Map());

    // Check which overrides need to be triggered based on dependency changes
    const getOverridesToTrigger = useCallback((overrides, eventType) => {
      const toTrigger = [];
      
      overrides.forEach((override, index) => {
        const depInfo = overrideDependencies.get(index);
        
        if (!depInfo || !depInfo.dependencies?.length) {
          // No dependencies - always trigger (existing behavior)
          toTrigger.push(override);
          return;
        }

        // Check if any dependency values have changed
        const prevValues = prevDependencyValues.current.get(index) || [];
        const currentValues = depInfo.resolvedValues || [];
        
        let hasChanged = false;
        
        // Check if dependency count changed
        if (prevValues.length !== currentValues.length) {
          hasChanged = true;
        } else {
          // Check if any values changed
          for (let i = 0; i < currentValues.length; i++) {
            if (JSON.stringify(prevValues[i]) !== JSON.stringify(currentValues[i])) {
              hasChanged = true;
              break;
            }
          }
        }

        if (hasChanged || eventType === 'onMount') {
          toTrigger.push(override);
          // Update the stored values
          prevDependencyValues.current.set(index, [...currentValues]);
        }
      });

      return toTrigger;
    }, [overrideDependencies]);

    // Enhanced processOverrides that only triggers changed dependencies
    const processOverridesWithDependencies = useCallback(
      async (overrides, eventType) => {
        if (!overrides || overrides.length === 0) return;

        // Get only the overrides that should be triggered
        const overridesToTrigger = getOverridesToTrigger(overrides, eventType);
        
        if (overridesToTrigger.length === 0) {
          return;
        }

        
        // Use the original processOverrides logic but with filtered overrides
        await processOverrides(overridesToTrigger, eventType);
      },
      [processOverrides, getOverridesToTrigger]
    );

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
        const mountOverrides = overrides.filter((key) => !key?.isCleanUp);

        if (mountOverrides.length > 0) {
          await processOverridesWithDependencies(mountOverrides, 'onMount');
        }
      };

      // Debounce initialization to prevent rapid fire
      const timer = setTimeout(initializeComponent, 0);

      return () => {
        clearTimeout(timer);

        const processCleanup = async () => {
          const overrides = item?.configuration?._overrides_ || [];
          const cleanupOverrides = overrides.filter((key) => key?.isCleanUp);

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
      // processOverridesWithDependencies,
      item?.configuration?._overrides_,
      // JSON.stringify(item?.configuration?._overrides_),
      // overridesRefreshKey,
      tab
    ]);

    // Additional useEffect to trigger overrides when dependencies change (not just on mount)
    useEffect(() => {
      if (!item?.i || !currentApplication?._id || readOnly || !allElements?.length) {
        return;
      }

      // Skip if not initialized yet
      if (!hasInitialized.current) {
        return;
      }

      const overrides = item?.configuration?._overrides_ || [];
      const mountOverrides = overrides.filter((key) => !key?.isCleanUp);

      if (mountOverrides.length > 0) {
        // This will only trigger overrides whose dependencies actually changed
        processOverridesWithDependencies(mountOverrides, 'onDependencyChange');
      }
    }, [
      overrideDependencies, // This will trigger when any dependency value changes
      // processOverridesWithDependencies,
      item?.i,
      currentApplication?._id,
      readOnly,
      allElements?.length
    ]);

    // Cache processed components globally
    const processedComponents = useMemo(
      () => allComponentsRaw?.map((item) => generateComponentGroups(item)) || [],
      [allComponentsRaw]
    );

    const componentsMap = useMemo(() => {
      const map = new Map();
      processedComponents?.forEach((component) => {
        if (component?.value) {
          map.set(component.value, component.config?.component);
        }
      });
      return Object.fromEntries(map);
    }, [processedComponents]);

    // Optimize hover state with target checking
    const isTargeted = useMemo(() => targets?.some((target) => target.id === item.i), [targets, item.i]);

    // Optimize style processing with better memoization
    const processedStyle = useMemo(() => {
      const baseStyle = { ...item?.style };

      // Add CSS variables from configuration
      if (item?.configuration?.cssVariables) {
        Object.assign(baseStyle, item.configuration.cssVariables);
      }

      // Handle background image
      if (item.configuration?.backgroundImage) {
        const bgImg = item.configuration.backgroundImage;
        if (bgImg.startsWith('http') || bgImg.startsWith('data:')) {
          baseStyle.backgroundImage = `url(${bgImg})`;
        } else {
          baseStyle.backgroundImage = bgImg;
        }
      }

      // Don't set transform inline - let CSS variables handle it
      // This ensures Redux updates work properly
      // if (item?.configuration?.transform) {
      //   baseStyle.transform = item.configuration.transform;
      // }

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
          .map((value) => {
            const trimmed = value.trim();
            return trimmed.endsWith('px') ? trimmed : `${trimmed}px`;
          })
          .join(' ');
      }

      return baseStyle;
    }, [
      item?.style,
      item?.configuration?.cssVariables,
      item.configuration?.backgroundImage,
      item.configuration?.transform,
      isHovered,
      readOnly,
      isDragging,
      editMode,
      isTargeted,
    ]);

    // Optimize configuration wit_overrh shallow comparison
    const itemConfiguration = useMemo(() => {
      const config = { ...item.configuration };

      if (item.componentId === 'text') {
        config.backgroundImage = '';
        config.background = '';
      }

      const stateConfig = appState?.[item.i] || {};
      let classNames = ` ${stateConfig.classNames || config.classNames}`.trim();

      // Add pointer-events-none to text elements inside buttons (not in edit mode)
      if (item.componentId === 'text' && !editMode) {
        const parentElement = allElements?.find(el => el.i === item.parent);
        const isInsideButton = parentElement?.configuration?.tag === 'button';
        
        if (isInsideButton) {
          classNames = classNames ? `${classNames} pointer-events-none` : 'pointer-events-none';
        }
      }

      return {
        ...config,
        ...stateConfig,
        classNames,
      };
    }, [item.configuration, item.componentId, item.parent, appState?.[item.i], editMode, allElements]);

    // Optimize event handlers with better memoization
    const eventHandlers = useMemo(() => {
      if (editMode) return {};
      
      // Defensive check: only create event handlers if store is properly initialized
      if (!store?.dispatch) {
        console.warn('RenderElements: Store not fully initialized yet, skipping event handlers creation');
        return {};
      }

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
      currentApplication?._id, // Only care about app ID changes, not the whole object
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
      overridesRefreshKey,
      eventHandlersRefreshKey, // Force refresh when editMode or tab changes
    ]);

    // Optimize cursor class generation
    const cursorClass = useMemo(() => {
      // Remove !pointer-events-none as it prevents dragging
      if (builderCursorMode === 'hand') return 'cursor-grab active:cursor-grabbing';
      if (builderCursorMode === 'draw') return '!cursor-draw !disabled';
      if (builderCursorMode === 'path') return 'cursor-path';
      if (builderCursorMode === 'comment') return '!cursor-comment';
      if (editMode && !isDrawingPathActive && builderCursorMode === 'default') {
        return `${!isLayout ? 'cube' : ''} active:cursor-grabbing`;
      }
      return !isLayout ? 'cube' : '';
    }, [builderCursorMode, editMode, isDrawingPathActive, isLayout]);

    const renderItemWithData = useCallback(() => {
      const viewTag = item.componentId === 'text' ? 'p' : item?.configuration?.tag || 'div';

      const baseProps = {
        key: item.i || index,
        id: item.i || index,
        'data-id': item.i || index, // For sortable detection
        ...(item.componentId === 'text' || item.componentId === 'container' || item.componentId === 'icon'
          ? { id: item.i || index }
          : {}), // onMouseEnter: editMode && !readOnly ? () => setisHovered(true) : undefined,
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
      
      // Process ALL dynamic properties globally (dynamicText, dynamicSrc, dynamicIcon, dynamicAlt, dynamicValue, etc.)
      const resolvedDynamicProps = {};
      
      
      // Find all dynamic properties in itemConfiguration
      for (const [key, value] of Object.entries(itemConfiguration || {})) {
        
        if (key.startsWith('dynamic') && typeof value === 'string' && value.trim() !== '') {
          const basePropertyName = key.replace(/^dynamic/, '').toLowerCase();
          
          try {
            // Use retrieveBody to resolve the template
            const resolvedValue = retrieveBody(
              null,
              value,
              {},
              {},
              { tab },
              currentApplication?._id + '-sessionInfo',
              {
                compId: item?.i,
                store: store,
                pageId: tab,
              }
            );
            
            
            // Only include if it resolved to a valid value
            if (resolvedValue !== null && resolvedValue !== undefined && resolvedValue !== '') {
              resolvedDynamicProps[basePropertyName] = resolvedValue;
            } else {
            }
          } catch (error) {
            console.warn('[RenderElements] Failed to resolve', key, ':', error);
          }
        }
      }
      
      
      // Build the object to process
      const objectToProcess = {
        id: item.i,
        ...flattenStyleObject(
          {
            ...baseProps,
            ...itemConfiguration,
            ...flattenStyleObject(item?.configuration, item?.style?.transform, editMode),
            ...eventHandlers,
            ...stateConfig,
          },
          item?.configuration?.transform,
          editMode
        ),
        ...eventHandlers,
      };
      
      // Apply all resolved dynamic properties to the object
      Object.assign(objectToProcess, resolvedDynamicProps);
      // message.info('objectToProcess:'+ JSON.stringify(objectToProcess.text));
      const props = processObjectTemplatesAndReplace(
        objectToProcess,
        {
          event: {},
          globalObj: {},
          paramState: params,
          sessionKey: currentApplication?._id + '-sessionInfo',
          store: store,
        },
        { element: item.i },
        tab
      );
      if (editMode) {
        delete props.disabled;
        if (viewTag.toLowerCase() === 'button') {
          props.type = 'button';
        }
      }
      delete props.style.position;
      delete props.style.transform;
      
      // Helper to get interpolated text
 
      // Optimize children rendering
      const children = useMemo(() => {
        // Built-in containers (container, slot, form) - just render children directly
        if ((item?.isGroup && (item.componentId === 'container' || item.componentId === 'form')) || item.componentId === 'slot') {
          return (
            <ElementRenderer allElements={allElements} parentId={item.i} isWrapper={false} renderingStack={renderingStack} />
          );
        }

        // Handle text component rendering
        if (item.componentId === 'text') {
          // message.info('Rendering text component with value: ' + props.text);
          return props.text || '';
        }

        // Check if any element has text content in configuration (for anchor tags, buttons, etc.)
        if (item.configuration?.text && (item.componentId === 'container' || item.configuration?.tag)) {
          return props.text || item.configuration.text || '';
        }

        // For all other components (including 3rd party containers), use renderComponent
        return renderComponent(
          item.componentId,
          {
            ...processObjectTemplatesAndReplace(
              { ...item },
              {
                event: {},
                globalObj: {},
                paramState: params,
                sessionKey: currentApplication?._id + '-sessionInfo',
                // ...(appState?.[item.i] || {}),
                props: appState?.[item.i] || {},

                store: store,
              },
              componentsMap,
              tab
            ),
            isDrawingPathActive: item.i === activeDrawingPathId && isDrawingPathActive,
            setIsDrawingPathActive,
            activeDrawingPathId,
            setActiveDrawingPathId,
            allComponentsRaw,
            processedStyle,
            renderChildren: (el) => {
              let childEls = [];
              if (el) {
                // el is a string array of IDs, find the actual elements
                childEls = el
                  .map((str) => {
                    if (typeof str === 'string') {
                      return allElements?.find((ele) => ele.i === str);
                    }
                    return str;
                  })
                  .filter(Boolean);
              } else {
                // Check if this component has componentRef properties in its schema
                const componentId = item?.meta?.componentId;
                if (componentId && allComponentsRaw) {
                  const component = allComponentsRaw.find((comp) => comp._id === componentId || comp.id === componentId);

                  if (component && component.props) {
                    try {
                      const schema = JSON.parse(component.props);
                      const properties = schema?.schema?.properties || {};

                      // Find properties with config.uiType === "componentRef" and collect their values
                      const componentRefIds = [];
                      Object.keys(properties).forEach((key) => {
                        const property = properties[key];
                        if (property?.config?.uiType === 'componentRef') {
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
                        childEls = componentRefIds
                          .map((str) => {
                            if (typeof str === 'string') {
                              return allElements?.find((ele) => ele.i === str);
                            }
                            return str;
                          })
                          .filter(Boolean);
                      }
                    } catch (error) {}
                  }
                }

                // Fallback to original children logic if no componentRef found
                if (childEls.length === 0) {
                  childEls =
                    item?.children
                      ?.map((str) => {
                        return allElements?.find((ele) => ele.i === str);
                      })
                      .filter(Boolean) || [];
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
            configuration: { ...item.configuration, ...(appState?.[item.i] || {}) },
          },
          componentsMap,
          editMode,
          allElements,
          setElements,
          setItemToEdit
        );
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
        tab,
      ]);

      // Handle component view with better recursion detection
      if (item.isComponentView) {
        const componentViewId = `${item.componentId}-${item.i}`;

        if (renderingStack.has(componentViewId)) {
          return (
            <div className="border-2 border-red-500 border-dashed p-4 bg-red-50" style={processedStyle}>
              <p className="text-red-600 text-sm">⚠️ Recursive component: {item.componentId}</p>
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

        // Force fresh conversion to ensure latest view changes are reflected
        const viewElements = syncParentChildRelationships([...convertParentViewToLayoutItem(elementss, item.i)]) || [];
        if (viewElements.length > 0) {
          ensureChildrenInGlobalElements(viewElements?.filter((it) => it.parent));
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
        // Add onError handler specifically for img tags
        if (viewTag.toLowerCase() === 'img') {
          const imgProps = {
            ...props,
            onError: (e) => {
              // Set a placeholder image when the src fails to load
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iMiIgc3Ryb2tlPSIjOTQ5NDk0IiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNOSA5QzIgOS41IDkgMTAuNSA5IDEwLjVaIiBzdHJva2U9IiM5NDk0OTQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTIxIDEzTDE4IDEwTDEwIDEzTDIgMTBWMjBBMiAyIDAgMDA0IDIySDIwQTIgMiAwIDAwMjIgMjBWMTNaIiBzdHJva2U9IiM5NDk0OTQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiIHN0cm9rZT0iIzk0OTQ5NCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
              // Also add a subtle gray background and some styling to indicate it's a placeholder
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.border = '1px solid #e5e7eb';
              e.currentTarget.style.objectFit = 'contain';
              e.currentTarget.style.padding = '8px';
              // Optional: Add a title to indicate it's a placeholder
              e.currentTarget.title = 'Image failed to load - showing placeholder';
            }
          };
          const content = React.createElement(viewTag, imgProps);
          return item?.isVirtual ? (
            <VirtualElementWrapper editMode={editMode} style={processedStyle}>
              {content}
            </VirtualElementWrapper>
          ) : (
            content
          );
        }
        
        // For all other self-closing tags, use the original logic
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
        let childrenClassNames = itemConfiguration?.classNames || '';
        
        // Process classNames through retrieveBody for children component too
        if (childrenClassNames && typeof childrenClassNames === 'string' && childrenClassNames.includes('{{')) {
          try {
            childrenClassNames = retrieveBody(
              null,
              childrenClassNames,
              {},
              {},
              { tab },
              currentApplication?._id + '-sessionInfo',
              {
                compId: item?.i,
                store: store,
                pageId: tab,
              }
            );
          } catch (error) {
            console.warn('[RenderElements] Failed to process children classNames:', error);
            childrenClassNames = itemConfiguration?.classNames || ''; // Fallback to original
          }
        }
        
        return <div className={childrenClassNames} />;
      }

      const { classNames, ...restProps } = props;
      
      // Process classNames through retrieveBody to populate dynamic values like {{state.bgColor}}
      let processedClassNames = classNames;
      if (classNames && typeof classNames === 'string' && classNames.includes('{{')) {
        try {
          processedClassNames = retrieveBody(
            null,
            classNames,
            {},
            {},
            { tab },
            currentApplication?._id + '-sessionInfo',
            {
              compId: item?.i,
              store: store,
              pageId: tab,
            }
          );
        } catch (error) {
          console.warn('[RenderElements] Failed to process classNames:', error);
          processedClassNames = classNames; // Fallback to original
        }
      }
      
      const content = React.createElement(viewTag, { ...restProps, className: processedClassNames }, children);

      // Wrap with sortable if needed
      if (shouldUseSortable && !item.parent) {
        // Only sortable for root level items for now
        return (
          <SimpleSortableItem id={item.i}>
            {item?.isVirtual ? (
              <VirtualElementWrapper editMode={editMode} style={processedStyle}>
                {content}
              </VirtualElementWrapper>
            ) : (
              content
            )}
          </SimpleSortableItem>
        );
      }

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
      tab,
      shouldUseSortable,
      appState, // Add appState to trigger re-render when state changes
    ]);

    return renderItemWithData();
  },
  (prevProps, nextProps) => {
    // CRITICAL: During sortable operations, always skip re-render
    if (isSortableCurrentlyActive()) {
      return true; // Return true to prevent re-render
    }

    // Custom comparison for better memoization
    return (
      prevProps.item === nextProps.item &&
      prevProps.index === nextProps.index &&
      prevProps.allElements === nextProps.allElements &&
      prevProps.renderingStack === nextProps.renderingStack
    );
  }
);

interface ElementRendererProps {
  allElements: any[];
  parentId?: string | null;
  isWrapper?: boolean;
  renderingStack?: Set<any>;
}
const ElementRenderer = React.memo(
  ({ allElements, parentId = null, isWrapper = false, renderingStack = new Set() }: ElementRendererProps) => {
    const { editMode, currentApplication, tab, readOnly, setElements } = useElementRenderer();

    const [currentTab, setCurrentTab] = useState(tab);
    const [isClearing, setIsClearing] = useState(false);

    // Log when render is attempted during sorting
    if (isSortableCurrentlyActive()) {
    }

    // Optimize tab change with better batching - avoid conflicts with SortableJS
    useEffect(() => {
      if (currentTab !== tab && isWrapper) {
        setIsClearing(true);

        const performTabChange = () => {
          setElements?.((currentElements) => {
            const filteredElements = currentElements.filter((el) => {
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
      allElements.forEach((item) => {
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
        <ErrorBoundary
          key={`${item.i}-${tab}-${item.isVirtual ? 'v' : 'n'}`}
          fallback={<p>Error</p>}
          onDOMError={handleDOMError}
        >
          <DebugWrapper
            element={item}
            enabled={editMode && currentApplication?.builderSettings?.anatomy}
          >
            <ElementItem item={item} index={index} allElements={allElements} renderingStack={renderingStack} />
          </DebugWrapper>
        </ErrorBoundary>
      ));
    }, [allElements, parentId, tab, isClearing, renderingStack, editMode, currentApplication?.builderSettings?.anatomy]);

    return <>{filteredElements}</>;
  }
);

interface ElementRendererWithContextProps {
  elements: any[];
  setElements?: (elements: any[]) => void;
  parentId?: string | null;
  isWrapper?: boolean;
  tab?: string;
  editMode?: boolean;
}

const ElementRendererWithContext = React.memo((props: ElementRendererWithContextProps) => {
  // Track the last known good elements to use during sorting
  const lastStableElements = useRef(props.elements);
  const [isSortingActive, setIsSortingActive] = useState(false);

  // Monitor sortable state
  useEffect(() => {
    const checkSortableState = () => {
      const isActive = isSortableCurrentlyActive();
      setIsSortingActive(isActive);

      // Update stable elements only when not sorting
      if (!isActive && props.elements !== lastStableElements.current) {
        lastStableElements.current = props.elements;
      }
    };

    // Check immediately and then periodically
    checkSortableState();
    const interval = setInterval(checkSortableState, 50);
    return () => clearInterval(interval);
  }, [props.elements]);

  // Use Map for better performance with large element lists and sort by hierarchy
  const cleanedElements = useMemo(() => {
    
    // CRITICAL: Use last stable elements during sorting to prevent DOM conflicts
    const elementsToUse = isSortingActive ? lastStableElements.current : props.elements;

    if (isSortingActive) {
    }

    if (!elementsToUse || !Array.isArray(elementsToUse)) {
      return [];
    }

    const cleanedMap = new Map();

    for (const el of elementsToUse) {
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

    // CRITICAL: Apply slot name mapping to ALL elements (virtual + main view elements)
    // This ensures elements with parent: "content-slot" get mapped to actual slot IDs
    const elementsWithSlotMapping = syncParentChildRelationships(elementsArray);

    // Console log the rendered elements to debug slot mapping
    elementsWithSlotMapping.forEach(el => {
      if (el.componentId === 'slot') {
      }
      if (el.parent && (el.parent.includes('slot') || el.parent === 'content-slot')) {
      }
    });

    // Sort elements hierarchically based on children arrays
    const sortElementsHierarchically = (elements) => {
      const elementMap = new Map(elements.map((el) => [el.i, el]));
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
      const rootElements = elements.filter((el) => !el.parent || el.parent === null);

      // Process each root element and its descendants
      rootElements.forEach((rootElement) => {
        traverseDepthFirst(rootElement.i);
      });

      // Add any remaining unprocessed elements (orphaned elements)
      elements.forEach((element) => {
        if (!processed.has(element.i)) {
          sortedElements.push(element);
        }
      });

      return sortedElements;
    };

    return sortElementsHierarchically(elementsWithSlotMapping);
  }, [props.elements, props.tab, isSortingActive]); // Include isSortingActive in dependencies

  // Deep memo for context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...props,
      elements: cleanedElements,
      setElements: props.setElements,
    }),
    [props, cleanedElements]
  );

  // Toggle to use DndKit instead of SortableJS
  const useDndKit = true; // Set to true to use DndKit

  const elementRenderer = (
    <ElementRenderer
      allElements={cleanedElements}
      parentId={props.parentId}
      isWrapper={props.isWrapper !== false}
      renderingStack={new Set()}
    />
  );

  return (
    <ElementRendererContext.Provider value={contextValue}>
      {/* <SortableContainerSetup elements={cleanedElements} setElements={props.setElements} /> */}
      {props.editMode && useDndKit ? (
        elementRenderer
      ) : (
        // <SimpleDndKit
        //   elements={cleanedElements}
        //   setElements={props.setElements}
        // >
        // {/* </SimpleDndKit> */}
        <>{elementRenderer}</>
      )}
    </ElementRendererContext.Provider>
  );
});

export default ElementRendererWithContext;


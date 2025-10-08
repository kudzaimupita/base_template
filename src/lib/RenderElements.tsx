/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useRef, useState, createContext, useContext, useCallback } from 'react';

import ErrorBoundary from './ErrorBoundary';
import VirtualElementWrapper from './VitualElementWrapper';
import { flattenStyleObject } from './flattenStyleObject';
import { generateComponentGroups } from './list';
// Remove lodash dependency - use native checks instead
import { processController } from './digest/digester';
import renderElementUtil from './renderElementUtil';
import { retrieveBody } from './digest/state/utils';
import DebugWrapper from './effectWrapper';
import { twMerge } from 'tailwind-merge';
import { useParams } from 'react-router-dom';
import { SimpleOverrideManager } from './SimpleOverrideManager';
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
import { SpacingOverlay } from '@/lib/spacing-editor/SpacingOverlay';

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

// Advanced caching system with depth awareness
class DepthAwareCache {
  private cache: Map<string, { data: any; depth: number; timestamp: number; hits: number }>;
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize = 1000, maxAge = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge; // milliseconds
  }

  get(key: string, currentDepth: number): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is stale
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Only use cache if depth matches (prevents using shallow cache for deep renders)
    if (entry.depth !== currentDepth) {
      return null;
    }

    // Update hit count for LRU tracking
    entry.hits++;
    entry.timestamp = Date.now();

    return entry.data;
  }

  set(key: string, data: any, depth: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      depth,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Prioritize evicting old, rarely-hit entries
      if (entry.hits < leastHits || (entry.hits === leastHits && entry.timestamp < oldestTime)) {
        leastUsedKey = key;
        leastHits = entry.hits;
        oldestTime = entry.timestamp;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        depth: entry.depth,
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
      })),
    };
  }
}

// Global cache instance for component rendering
const componentRenderCache = new DepthAwareCache(500, 30000); // 500 entries, 30 second TTL

// Configuration for maximum nesting depth to prevent stack overflow
// Set to browser's practical limit (way higher than 100!)
// Modern browsers can handle 10,000+ levels before stack overflow
// We set a conservative limit that's still extremely high
const MAX_NESTING_DEPTH = 10000; // Browser's practical limit (not arbitrary)
const MAX_CIRCULAR_REFS = 3; // Maximum times an element can appear (detects circular refs quickly)

// Enhanced rendering stack with depth tracking and circular reference detection
class RenderingTracker {
  private stack: Map<string, number>; // elementId -> occurrence count
  private depth: number;

  constructor(existingTracker?: RenderingTracker) {
    this.stack = existingTracker ? new Map(existingTracker.stack) : new Map();
    this.depth = existingTracker ? existingTracker.depth : 0;
  }

  canRender(elementId: string, elementType: 'component' | 'virtual' | 'ref'): { allowed: boolean; reason?: string } {
    // Check depth limit
    if (this.depth >= MAX_NESTING_DEPTH) {
      return {
        allowed: false,
        reason: `Maximum nesting depth of ${MAX_NESTING_DEPTH} exceeded`,
      };
    }

    // Check circular references
    const currentCount = this.stack.get(elementId) || 0;
    if (currentCount >= MAX_CIRCULAR_REFS) {
      return {
        allowed: false,
        reason: `Circular reference detected: ${elementId} appears ${currentCount} times in rendering stack`,
      };
    }

    return { allowed: true };
  }

  enter(elementId: string): RenderingTracker {
    const newTracker = new RenderingTracker(this);
    newTracker.stack.set(elementId, (newTracker.stack.get(elementId) || 0) + 1);
    newTracker.depth += 1;
    return newTracker;
  }

  getDepth(): number {
    return this.depth;
  }

  getPath(): string[] {
    return Array.from(this.stack.keys());
  }
}

interface ElementItemProps {
  item: any;
  index: number;
  allElements: any[];
  renderingStack?: Set<any>;
  renderingTracker?: RenderingTracker; // New enhanced tracker
}
const ElementItem = React.memo(
  ({ item: oldItem, index, allElements, renderingStack = new Set(), renderingTracker = new RenderingTracker() }: ElementItemProps) => {
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
      scale,
      containerRef,
      isMoving,
    } = context;

    // Debug scale in ElementItem
    useEffect(() => {
      console.log('🔍 ElementItem - scale from context:', scale, 'for element:', oldItem?.i);
    }, [scale, oldItem?.i]);

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
        // Also refresh overrides when switching modes to ensure latest changes are reflected
        setOverridesRefreshKey((prev) => prev + 1);
        lastEditModeRef.current = editMode;
        lastTabRef.current = tab;
        
        // Log mode changes for debugging
        console.log(`[${oldItem?.i}] Mode changed - editMode: ${editMode}, tab: ${tab}`);
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
    const lastProcessingTime = useRef(0);

    // Optimize children management with batching - avoid conflicts with SortableJS
    const ensureChildrenInGlobalElementsRef = useRef(null);
    const ensureChildrenInGlobalElements = useCallback(
      (childElements) => {
        if (!childElements || childElements.length === 0) return;

        // Debounce to prevent rapid fire calls
        if (ensureChildrenInGlobalElementsRef.current) {
          clearTimeout(ensureChildrenInGlobalElementsRef.current);
        }

        ensureChildrenInGlobalElementsRef.current = setTimeout(() => {
          // Check if we're in the middle of a sortable operation to avoid conflicts
          if (isSortableCurrentlyActive()) {
            // Defer until sortable operation is complete
            const timeout = setTimeout(() => ensureChildrenInGlobalElements(childElements), 200);
            sortableOperationTimeouts.add(timeout);
            return;
          }

          // Use a more conservative approach without requestAnimationFrame to avoid timing conflicts
          setElements?.((currentElements) => {
            if (!currentElements || !Array.isArray(currentElements)) {
              return currentElements;
            }

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

            // Only return new array if there are actual changes
            if (hasChanges) {
              return Array.from(elementsMap.values());
            }
            
            // Return the same reference to prevent unnecessary re-renders
            return currentElements;
          });
        }, 50);
      },
      [setElements]
    );

    // Optimize overrides processing with better error handling and caching
    const processOverrides = useCallback(
      async (overrides, eventType) => {
      
        if (!overrides || overrides.length === 0) return;

        const validOverrides = overrides.filter((key) => key && Object.keys(key).length > 0);
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

    // Memoize overrides array to prevent infinite loops
    const stableOverrides = useMemo(() => {
      return item?.configuration?._overrides_ || [];
    }, [item?.configuration?._overrides_]);

    // Dynamic dependencies for each override with dependencies
    const overrideDependencies = useMemo(() => {
      const deps = new Map();
      
      stableOverrides.forEach((override, index) => {
        if (override?.dependencies && Array.isArray(override.dependencies)) {
          // Store the dependency strings, resolve them later to avoid infinite loops
          deps.set(index, {
            override,
            dependencies: override.dependencies,
            // Don't resolve values here - do it in getOverridesToTrigger
          });
        }
      });
      
      return deps;
    }, [stableOverrides]);

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

        // Resolve dependency values here to avoid infinite loops in useMemo
        const currentValues = depInfo.dependencies.map(depString => 
          resolveDependencyValue(depString)
        );
        
        // Check if any dependency values have changed
        const prevValues = prevDependencyValues.current.get(index) || [];
        
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

    // Enhanced processOverrides that only triggers changed dependencies with debouncing
    const processOverridesWithDependencies = useCallback(
      async (overrides, eventType) => {
        if (!overrides || overrides.length === 0) return;

        // Debounce to prevent double processing within 100ms (increased from 50ms)
        const now = Date.now();
        if (now - lastProcessingTime.current < 100) {
          console.log(`[${item?.i}] Debounced override processing for ${eventType}`);
          return;
        }
        lastProcessingTime.current = now;

        console.log(`[${item?.i}] Processing overrides for ${eventType}`);

        // Get only the overrides that should be triggered
        const overridesToTrigger = getOverridesToTrigger(overrides, eventType);
        
        if (overridesToTrigger.length === 0) {
          console.log(`[${item?.i}] No overrides to trigger for ${eventType}`);
          return;
        }

        console.log(`[${item?.i}] Triggering ${overridesToTrigger.length} overrides for ${eventType}`);

        // Use the original processOverrides logic but with filtered overrides
        await processOverrides(overridesToTrigger, eventType);
      },
      [processOverrides, getOverridesToTrigger, item?.i]
    );

    // Combined effect for initialization and dependency changes
    useEffect(() => {
      const currentKey = `${item?.i}-${currentApplication?._id}`;

      if (!item?.i || !currentApplication?._id || readOnly || !allElements?.length) {
        return;
      }

      const processOverridesForElement = async () => {
        // Block overrides in edit mode - only execute in preview mode
        if (editMode) {
          console.log(`[${item?.i}] ✋ BLOCKED: Edit mode - overrides disabled`);
          return;
        }
        
        // Simple override execution check - prevents infinite loops and double execution
        if (!SimpleOverrideManager.shouldExecute(currentApplication?._id, item?.i)) {
          return;
        }

        const mountOverrides = stableOverrides.filter((key) => !key?.isCleanUp);

        if (mountOverrides.length === 0) return;

        // Determine event type based on initialization state
        const isInitializing = !hasInitialized.current || initializationKey.current !== currentKey;
        const eventType = isInitializing ? 'onMount' : 'onDependencyChange';

        if (isInitializing) {
          hasInitialized.current = true;
          initializationKey.current = currentKey;
          console.log(`[${item?.i}] Initializing component`);
        } else {
          console.log(`[${item?.i}] Dependencies changed`);
        }

        await processOverridesWithDependencies(mountOverrides, eventType);
      };

      // Debounce to prevent rapid fire
      const timer = setTimeout(processOverridesForElement, 0);

      return () => {
        clearTimeout(timer);

        const processCleanup = async () => {
          const cleanupOverrides = stableOverrides.filter((key) => key?.isCleanUp);

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
      stableOverrides,
      overrideDependencies,
      tab
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

    // Track resolution to prevent infinite loops with timestamp
    const isResolvingRef = useRef(false);
    const lastResolveTime = useRef(0);

    // Resolve dynamic data for virtual elements - SIMPLIFIED TO STOP INFINITE LOOP
    const resolvedAppStateData = useMemo(() => {
      return appState?.[item?.i];
    }, [appState?.[item?.i]]);

    // Watch for changes to dynamic data and update ALL virtual elements with the same data source
    useEffect(() => {
      console.log(`🔍 [${item.i}] useEffect triggered for dynamic data watcher`);
      console.log(`🔍 [${item.i}] Dependencies:`, {
        isVirtual: item?.isVirtual,
        isVirtualElement: resolvedAppStateData?.__isVirtualElement,
        dynamicDataKey: resolvedAppStateData?.__dynamicDataKey,
        dynamicIndex: resolvedAppStateData?.__dynamicIndex,
        todosLength: appState?.todos?.length,
        firstTodoCompleted: appState?.todos?.[0]?.completed
      });
      
      if (!item?.isVirtual || !resolvedAppStateData?.__isVirtualElement) {
        console.log(`🔍 [${item.i}] Skipping - not virtual or not virtual element`);
        return;
      }
      
      const dynamicDataKey = resolvedAppStateData.__dynamicDataKey;
      const dynamicIndex = resolvedAppStateData.__dynamicIndex;
      
      if (!dynamicDataKey || typeof dynamicIndex !== 'number') return;
      
      // Resolve the current data array from appState
      let currentDataArray;
      try {
        if (typeof dynamicDataKey === 'string' && dynamicDataKey.includes('{{')) {
          // Handle template strings like "{{state.todos}}"
          const path = dynamicDataKey.replace(/^\{\{state\./, '').replace(/\}\}$/, '');
          const keys = path.split('.');
          currentDataArray = keys.reduce((obj, key) => obj?.[key], appState);
        } else if (dynamicDataKey) {
          // Direct state path like "state.todos"
          const keys = dynamicDataKey.replace(/^state\./, '').split('.');
          currentDataArray = keys.reduce((obj, key) => obj?.[key], appState);
        }
        
        // Get the current item from the array
        if (Array.isArray(currentDataArray) && currentDataArray[dynamicIndex]) {
          const currentItem = currentDataArray[dynamicIndex];
          
          // Check if the current item is different from what's stored
          const storedData = { ...resolvedAppStateData };
          delete storedData.__dynamicIndex;
          delete storedData.__dynamicDataKey;
          delete storedData.__isVirtualElement;
          delete storedData.__lastUpdated;
          
          const currentData = { ...currentItem };
          
          // Only update if data has actually changed
          if (JSON.stringify(storedData) !== JSON.stringify(currentData)) {
            console.log(`🔄 [${item.i}] Dynamic data changed, updating ALL virtual elements with same data source`);
            
            // Find ALL virtual elements that use the same dynamicDataKey
            const updateAllVirtualElementsWithSameDataSource = () => {
              if (!setAppStatePartial || !dispatch || !allElements) return;
              
              // Find all virtual elements that share the same dynamicDataKey
              const virtualElementsToUpdate = [];
              
              // Check appState for all virtual elements with the same dynamicDataKey
              Object.keys(appState || {}).forEach(key => {
                const stateData = appState[key];
                if (stateData?.__isVirtualElement && stateData?.__dynamicDataKey === dynamicDataKey) {
                  const elementIndex = stateData.__dynamicIndex;
                  if (typeof elementIndex === 'number' && currentDataArray[elementIndex]) {
                    virtualElementsToUpdate.push({
                      elementId: key,
                      index: elementIndex,
                      newData: currentDataArray[elementIndex]
                    });
                  }
                }
              });
              
              console.log(`🔄 Found ${virtualElementsToUpdate.length} virtual elements to update:`, virtualElementsToUpdate.map(v => v.elementId));
              
              // Update all virtual elements
              virtualElementsToUpdate.forEach(({ elementId, index, newData }) => {
                const dynamicReference = {
                  ...newData,
                  // Add metadata for dynamic resolution
                  __dynamicIndex: index,
                  __dynamicDataKey: dynamicDataKey,
                  __isVirtualElement: true,
                  __lastUpdated: Date.now(),
                };
                
                console.log(`🔄 [${elementId}] Updating virtual element:`, dynamicReference);
                dispatch(
                  setAppStatePartial({
                    key: elementId,
                    payload: dynamicReference,
                  })
                );
              });
            };
            
            // Call the function to update all virtual elements
            updateAllVirtualElementsWithSameDataSource();
          }
        }
      } catch (error) {
        console.error(`❌ [${item.i}] Error updating dynamic data:`, error);
      }
    }, [
      // Watch for changes to the dynamic data - make it generic
      (() => {
        if (!item?.isVirtual || !resolvedAppStateData?.__dynamicDataKey) return null;
        const dynamicDataKey = resolvedAppStateData.__dynamicDataKey;
        
        try {
          if (typeof dynamicDataKey === 'string' && dynamicDataKey.includes('{{')) {
            const path = dynamicDataKey.replace(/^\{\{state\./, '').replace(/\}\}$/, '');
            const keys = path.split('.');
            return keys.reduce((obj, key) => obj?.[key], appState);
          } else if (dynamicDataKey) {
            const keys = dynamicDataKey.replace(/^state\./, '').split('.');
            return keys.reduce((obj, key) => obj?.[key], appState);
          }
        } catch (error) {
          return null;
        }
        return null;
      })(),
      item?.i,
      item?.isVirtual,
      resolvedAppStateData?.__dynamicDataKey,
      resolvedAppStateData?.__dynamicIndex,
      setAppStatePartial,
      dispatch,
      allElements
    ]);

    // Create a hash of the resolved data to force re-renders when dynamic data changes
    const dynamicDataHash = useMemo(() => {
      if (item?.isVirtual && resolvedAppStateData?.__isVirtualElement && resolvedAppStateData?.__dynamicDataKey) {
        try {
          // Create a hash of the current dynamic data to detect changes
          const dataToHash = {
            ...resolvedAppStateData,
            // Remove metadata from hash to focus on actual data
            __dynamicIndex: undefined,
            __dynamicDataKey: undefined,
            __isVirtualElement: undefined,
          };
          const hash = JSON.stringify(dataToHash);
          console.log(`🔄 [${item.i}] Dynamic data hash:`, hash.slice(0, 100) + '...');
          return hash;
        } catch (error) {
          return Date.now().toString();
        }
      }
      return null;
    }, [resolvedAppStateData]);

    // Optimize configuration wit_overrh shallow comparison
    const itemConfiguration = useMemo(() => {
      const config = { ...item.configuration };

      if (item.componentId === 'text') {
        config.backgroundImage = '';
        config.background = '';
      }

      const stateConfig = resolvedAppStateData || {};
      let classNames = ` ${stateConfig.classNames || config.classNames}`.trim();
      
      // Debug state changes for loading-spinner and other key elements


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
    }, [item.configuration, item.componentId, item.parent, resolvedAppStateData, editMode, allElements]);

    // Optimize event handlers with better memoization
    const eventHandlers = useMemo(() => {

      if (editMode) return {};
      // message.info('eventHandlers')
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
      currentApplication?._id,
      navigate,
      params,
      tab,
      store,
      refreshAppAuth,
      setDestroyInfo,
      setAppStatePartial,
      storeInvocation,
      stableOverrides,
      overridesRefreshKey,
      eventHandlersRefreshKey,
    ]);


    // Optimize cursor class generation
    const cursorClass = useMemo(() => {
      let result = '';
      
      // Remove !pointer-events-none as it prevents dragging
      if (builderCursorMode === 'hand') {
        result = 'cursor-grab active:cursor-grabbing';
      } else if (builderCursorMode === 'draw') {
        result = '!cursor-draw !disabled';
      } else if (builderCursorMode === 'path') {
        result = 'cursor-path';
      } else if (builderCursorMode === 'comment') {
        result = '!cursor-comment';
      } else if (editMode && !isDrawingPathActive && builderCursorMode === 'default') {
        // Always add cube class for draggable elements in edit mode, regardless of isLayout
        result = `cube active:cursor-grabbing`;
      } else {
        // Always add cube class for draggable elements when not in special modes
        result = editMode ? 'cube' : '';
      }
      
      // Debug cursor class (commented out to prevent re-renders)
      // console.log('🎨 CURSOR CLASS:', {
      //   elementId: item?.i,
      //   builderCursorMode,
      //   editMode,
      //   isDrawingPathActive,
      //   result,
      //   hasCube: result.includes('cube'),
      //   itemIsGroup: item?.isGroup,
      //   itemComponentId: item?.componentId
      // });
      
      return result;
    }, [builderCursorMode, editMode, isDrawingPathActive, item?.i]);

    // Memoize dynamic props resolution to prevent infinite loops
    const memoizedDynamicProps = useMemo(() => {
      const props = {};
      
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
              props[basePropertyName] = resolvedValue;
            }
          } catch (error) {
            console.warn('[RenderElements] Failed to resolve', key, ':', error);
          }
        }
      }
      
      return props;
    }, [itemConfiguration, tab, currentApplication?._id, item?.i, store, resolvedAppStateData]);
// consol
// message.info('memoizedDynamicProps')
if (item.i === 'loading-spinner' || item.i === 'todo-items-container') {
  console.log(`🔍 [${item.i}] State Debug:`, {
    appState: appState,
    stateConfig: resolvedAppStateData,
    // originalClassNames: config.classNames,
    // finalClassNames: classNames,
    // hasHidden: classNames.includes('hidden'),
    timestamp: new Date().toISOString()
  });
}
    // Move children memoization outside of the callback - now after resolvedDynamicProps
    const children = useMemo(() => {
        // Built-in containers (container, slot, form) - just render children directly
        if ((item?.isGroup && (item.componentId === 'container' || item.componentId === 'form')) || item.componentId === 'slot') {
          // Enter tracking for container/slot rendering
          const childTracker = renderingTracker.enter(`${item.componentId}-${item.i}`);
          return (
            <ElementRenderer
              allElements={allElements}
              parentId={item.i}
              isWrapper={false}
              renderingStack={renderingStack}
              renderingTracker={childTracker}
            />
          );
        }

        // Handle text component rendering
        if (item.componentId === 'text') {
          // Get text from resolved dynamic props or configuration
          const textValue = (memoizedDynamicProps as any).text || itemConfiguration?.text || '';
          return textValue;
        }

        // Check if any element has text content in configuration (for anchor tags, buttons, etc.)
        if (item.configuration?.text && (item.componentId === 'container' || item.configuration?.tag)) {
          const textValue = (memoizedDynamicProps as any).text || item.configuration.text || '';
          return textValue;
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
                props: resolvedAppStateData || {},

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
              // Check depth limit before rendering children
              const childRenderCheck = renderingTracker.canRender(`renderChildren-${item.i}`, 'ref');
              if (!childRenderCheck.allowed) {
                console.warn(`[RenderElements] Skipping renderChildren for ${item.i}:`, childRenderCheck.reason);
                return (
                  <div className="border border-orange-400 bg-orange-50 p-2 text-xs text-orange-700">
                    ⚠️ Children rendering depth limit reached
                  </div>
                );
              }

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
                    } catch (error) {
                      // Handle JSON parse error silently
                    }
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
                  renderingTracker={renderingTracker}
                />
              );
            },
            configuration: { ...item.configuration, ...(resolvedAppStateData || {}) },
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

    const renderItemWithData = useCallback(() => {
      // Add protection for virtual elements with circular refs or depth issues
      if (item?.isVirtual) {
        const virtualCheck = renderingTracker.canRender(`virtual-${item.i}`, 'virtual');
        if (!virtualCheck.allowed) {
          console.warn(`[RenderElements] Virtual element blocked: ${item.i}`, virtualCheck);
          return (
            <div className="border border-purple-400 bg-purple-50 p-2 text-xs text-purple-700">
              ⚠️ Virtual element: {item.name || item.i}
              <div className="mt-1 text-purple-500 text-[10px]">
                {virtualCheck.reason}
              </div>
            </div>
          );
        }
      }

      const viewTag = item.componentId === 'text' ? 'p' : item?.configuration?.tag || 'div';

      const baseProps = {
        key: item.i || index,
        id: item.i || index,
        'data-id': item.i || index,
        ...(item.componentId === 'text' || item.componentId === 'container' || item.componentId === 'icon'
          ? { id: item.i || index }
          : {}),
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
      
      const stateConfig = resolvedAppStateData || {};
      
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
      console.log(item.i,'objectToProcess', objectToProcess)
      // Apply all resolved dynamic properties to the object
      Object.assign(objectToProcess, memoizedDynamicProps);
      
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

      // Handle component view with enhanced recursion detection
      if (item.isComponentView) {
        const componentViewId = `${item.componentId}-${item.i}`;

        // Use enhanced rendering tracker for better circular reference detection
        const renderCheck = renderingTracker.canRender(componentViewId, 'component');
        if (!renderCheck.allowed) {
          console.error(`[RenderElements] Component view blocked: ${componentViewId}`, {
            reason: renderCheck.reason,
            depth: renderingTracker.getDepth(),
            path: renderingTracker.getPath(),
          });
          return (
            <div className="border-2 border-red-500 border-dashed p-4 bg-red-50" style={processedStyle}>
              <p className="text-red-600 text-sm font-semibold">⚠️ {renderCheck.reason}</p>
              <p className="text-red-500 text-xs mt-2">Component: {item.componentId}</p>
              <p className="text-red-500 text-xs">
                Depth: {renderingTracker.getDepth()}
                {renderingTracker.getDepth() >= MAX_NESTING_DEPTH && ` (Browser limit reached)`}
              </p>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-red-600 hover:text-red-800">View rendering path</summary>
                <pre className="mt-1 p-2 bg-red-100 rounded text-xs overflow-auto max-h-32">
                  {renderingTracker.getPath().join('\n  → ')}
                </pre>
              </details>
            </div>
          );
        }

        // Legacy check for backward compatibility
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

        // Create new tracking instances for child rendering
        const newRenderingStack = new Set(renderingStack);
        newRenderingStack.add(componentViewId);
        const newRenderingTracker = renderingTracker.enter(componentViewId);

        return (
          <div id={item.i} data-depth={renderingTracker.getDepth()} data-component-view={componentViewId}>
            <ElementRenderer
              allElements={allElements}
              parentId={item.i}
              isWrapper={false}
              renderingStack={newRenderingStack}
              renderingTracker={newRenderingTracker}
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
            // Fallback to original
            childrenClassNames = itemConfiguration?.classNames || '';
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
          // Fallback to original
          processedClassNames = classNames;
        }
      }
      
      const content = React.createElement(viewTag, { ...restProps, className: processedClassNames }, children);

      // Check if this element is selected
      const isElementSelected = targets?.some(t => t.id === item.i) || false;

      // Check if element has children or is self-closing
      const elementHasChildren = children && React.Children.count(children) > 0;
      const isSelfClosingTag = SELF_CLOSING_TAGS.has(viewTag.toLowerCase());

      // Wrap with SpacingOverlay if in edit mode
      const wrappedContent = editMode ? (
        <SpacingOverlay
          enabled={editMode && builderCursorMode === 'default'}
          elementId={item.i || String(index)}
          tagName={viewTag}
          isSelected={isElementSelected}
          scale={scale || 1}
          containerRef={containerRef}
          isSelfClosing={isSelfClosingTag}
          hasChildren={elementHasChildren}
          isMoving={isMoving}
        >
          {content}
        </SpacingOverlay>
      ) : content;

      // Wrap with sortable if needed
      if ( !item.parent) {
        // Only sortable for root level items for now
        return (
          <>
            {item?.isVirtual ? (
              <VirtualElementWrapper editMode={editMode} style={processedStyle}>
                {wrappedContent}
              </VirtualElementWrapper>
            ) : (
              wrappedContent
            )}
          </>
        );
      }

      return item?.isVirtual ? (
        <VirtualElementWrapper editMode={editMode} style={processedStyle}>
          {wrappedContent}
        </VirtualElementWrapper>
      ) : (
        wrappedContent
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
      appState,
      memoizedDynamicProps,
      children,
      dynamicDataHash,
    ]);

    return renderItemWithData();
  },
  (prevProps, nextProps) => {
    // CRITICAL: During sortable operations, always skip re-render
    if (isSortableCurrentlyActive()) {
      // Return true to prevent re-render
      return true;
    }

    // Always allow re-renders for now to fix state update issues
    // TODO: Optimize this later with proper context-aware comparison
    // Always re-render
    return false;
  }
);

interface ElementRendererProps {
  allElements: any[];
  parentId?: string | null;
  isWrapper?: boolean;
  renderingStack?: Set<any>;
  renderingTracker?: RenderingTracker;
}
const ElementRenderer = React.memo(
  ({ allElements, parentId = null, isWrapper = false, renderingStack = new Set(), renderingTracker = new RenderingTracker() }: ElementRendererProps) => {
    const { editMode, currentApplication, tab, readOnly, setElements, appState } = useElementRenderer();

    const [currentTab, setCurrentTab] = useState(tab);
    const [isClearing, setIsClearing] = useState(false);

    // Log when render is attempted during sorting
    if (isSortableCurrentlyActive()) {
      // Sorting is active - render will be skipped
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
            // Debug virtual element filtering
            if (item.i === 'loading-spinner' || item.i === 'todo-items-container') {
              console.log(`🚫 FILTERED OUT [${item.i}]:`, {
                isVirtual: item.isVirtual,
                sourceTab: item.sourceTab,
                currentTab: tab,
                parent: item.parent,
                parentId: parentId
              });
            }
            continue;
          }
          filtered.push(item);
          
          // Debug what gets rendered
          if (item.i === 'loading-spinner' || item.i === 'todo-items-container') {
            console.log(`✅ RENDERED [${item.i}]:`, {
              isVirtual: item.isVirtual,
              sourceTab: item.sourceTab,
              currentTab: tab,
              parent: item.parent,
              parentId: parentId
            });
          }
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
          elementId={item.i}
          depth={renderingTracker?.getDepth()}
          renderPath={renderingTracker?.getPath()}
        >
          <DebugWrapper
            element={item}
            enabled={editMode && currentApplication?.builderSettings?.anatomy}
          >
            <ElementItem
              item={item}
              index={index}
              allElements={allElements}
              renderingStack={renderingStack}
              renderingTracker={renderingTracker}
            />
          </DebugWrapper>
        </ErrorBoundary>
      ));
    }, [allElements, parentId, tab, isClearing, renderingStack, editMode, currentApplication?.builderSettings?.anatomy, appState]);

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
  setIsDragging?: (isDragging: boolean) => void;
  setSelectedTargets?: (targets: any[]) => void;
  appState?: any;
  dispatch?: any;
  store?: any;
  navigate?: any;
  params?: any;
  currentApplication?: any;
  setAppStatePartial?: any;
  refreshAppAuth?: any;
  setDestroyInfo?: any;
  setSessionInfo?: any;
  storeInvocation?: any;
  allComponentsRaw?: any;
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

  // Force re-render when appState changes by using a hash
  const appStateHash = useMemo(() => {
    return JSON.stringify(props.appState || {}).slice(0, 100);
  }, [props.appState]);

  // Debug scale changes
  useEffect(() => {
    console.log('🔍 ElementRendererWithContext - scale prop changed to:', props.scale);
  }, [props.scale]);

  // Deep memo for context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => {
      console.log('🔍 Creating new context value with scale:', props.scale);
      return {
        ...props,
        elements: cleanedElements,
        setElements: props.setElements,
        appStateHash, // Include hash to force updates
      };
    },
    [props, cleanedElements, props.appState, appStateHash, props.scale]
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
     {props.editMode &&     <SortableContainerSetup 
        elementss={cleanedElements} 
        setElements={props.setElements}
        setSortableOperationState={setSortableOperationState}
        isSortableCurrentlyActive={isSortableCurrentlyActive}
        setIsDragging={props.setIsDragging}
        setSelectedTargets={props.setSelectedTargets}
      />}

      {props.editMode ? (
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


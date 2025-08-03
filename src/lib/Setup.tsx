import { message } from 'antd';
import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

// Interface for component props
interface SortableContainerSetupProps {
  elementss: any[];
  setElements: (elements: any[] | ((currentElements: any[]) => any[])) => void;
  setSortableOperationState?: (active: boolean) => void;
  isSortableCurrentlyActive?: () => boolean;
}

export const SortableContainerSetup = ({ 
  elementss, 
  setElements, 
  setSortableOperationState,
  isSortableCurrentlyActive 
}: SortableContainerSetupProps) => {
    const sortableInstances = useRef([]);
    const isProcessingUpdate = useRef(false);

    // Safety function to remove duplicate DOM elements
    const removeDuplicateElements = () => {
        try {
            const seenIds = new Set();
            const cubeElements = document.querySelectorAll('.cube[id]');
    
            cubeElements.forEach(element => {
                const elementId = element.id;
                if (seenIds.has(elementId)) {
                    try {
                        element.remove();
                    } catch (removeError) {
                        // Failed to remove duplicate element
                    }
                } else {
                    seenIds.add(elementId);
                }
            });
        } catch (error) {
            // Error in removeDuplicateElements
        }
    };

    useEffect(() => {
        try {
            // Clean up existing instances
            sortableInstances.current.forEach(instance => {
                try {
                    if (instance && typeof instance.destroy === 'function') {
                        instance.destroy();
                    }
                } catch (destroyError) {
                    // Error destroying sortable instance
                }
            });
            sortableInstances.current = [];

            // Remove any duplicate elements before setup
            removeDuplicateElements();

            // Simple approach: find all potential containers
            const containers = [];
            
            // Add root container
            const rootContainer = document.getElementById('servly-builder-container');
            if (rootContainer) {
                containers.push(rootContainer);
            }
            
            // Find all elements that currently contain .cube children
            document.querySelectorAll('*').forEach(element => {
                const directCubeChildren = element.querySelectorAll(':scope > .cube');
                if (directCubeChildren.length > 0 && !containers.includes(element)) {
                    containers.push(element);
                }
            });
            
            // Also add all group elements for future drops
            const containerElements = elementss?.filter(el => el.isGroup) || [];
            containerElements.forEach(el => {
                const elementDOM = document.getElementById(el.i);
                if (elementDOM && !containers.includes(elementDOM)) {
                    containers.push(elementDOM);
                }
            });
            
            containers.forEach((container) => {
                try {
                    // Remove the data attribute to ensure fresh initialization
                    container.removeAttribute('data-sortable-init');
                    
                    const sortableInstance = Sortable.create(container as HTMLElement, {
                        group: { name: 'sortable-list-2', pull: true, put: true },
                        draggable: '.cube', // Only .cube elements within the container are draggable
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        chosenClass: 'sortable-chosen',
                        dragClass: 'sortable-drag',
                        forceFallback: true,
                        fallbackTolerance: 3,
                        scroll: false,
                        bubbleScroll: false,
                        filter: '.virtual .noDrag, [data-virtual="true"], [data-slot="true"]', // Filter out virtual elements and slots
                        swapThreshold: 1,
                        emptyInsertThreshold: 5,
                        
                        onStart: (evt) => {
                            try {
                                const draggedElement = evt.item;
                                const elementId = draggedElement?.id;
                                const element = elementss?.find(el => el.i === elementId);
                                
                                // Block external elements completely (from component library)
                                // Check if element exists in our elements array by ID
                                if (!element || !elementId) {
                                    return false;
                                }
                                
                                // Block virtual elements and slots
                                if (element?.isVirtual || element?.componentId === 'slot') {
                                    return false;
                                }
                                
                                // Set global state to prevent React conflicts
                                setSortableOperationState?.(true);
                                document.body.classList.add('sortable-dragging');
                            } catch (error) {
                                setSortableOperationState?.(false);
                                return false;
                            }
                        },

                        // Note: onAdd is intentionally not implemented here
                        // New components from the library are handled by the existing drop system
                        // This sortable only handles reordering existing elements
                        
                        onEnd: (evt) => {
                            // return
                            try {
                                document.body.classList.remove('sortable-dragging');
                                
                                // Prevent multiple simultaneous updates
                                if (isProcessingUpdate.current) {
                                    setSortableOperationState?.(false);
                                    return;
                                }
                                isProcessingUpdate.current = true;
                                
                                const { item, to, from, newIndex, oldIndex } = evt || {};
                              
                                if (!item || !item.id) {
                                    message.success('❌ Invalid drag item');
                                    isProcessingUpdate.current = false;
                                    return;
                                }
                                
                                const movedId = item.id;
                                const newParentId = to?.getAttribute?.('data-id') || to?.id || null;
                                const oldParentId = from?.getAttribute?.('data-id') || from?.id || null;

                                // Block external elements completely (from component library)
                                const movedElement = elementss?.find(el => el.i === movedId);
                                if (!movedElement) {
                                    isProcessingUpdate.current = false;
                                    return;
                                }
                                
                                // Block virtual elements and slots
                                if (movedElement?.isVirtual || movedElement?.componentId === 'slot') {
                                    isProcessingUpdate.current = false;
                                    return;
                                }

                                // Check if it's the same container and same position
                                if (to === from && newIndex === oldIndex) {
                                    isProcessingUpdate.current = false;
                                    return;
                                }
                                
                                // Capture the DOM state immediately after SortableJS move
                                const captureContainerState = (container) => {
                                    if (!container || !container.children) return [];
                                    return Array.from(container.children)
                                        .map(child => (child as HTMLElement)?.id)
                                        .filter(id => id && id !== '' && typeof id === 'string');
                                };
                                
                                const newParentChildren = captureContainerState(to);
                                const oldParentChildren = from !== to ? captureContainerState(from) : null;
                                
                                // Validate that our moved element is in the new container
                                if (!newParentChildren.includes(movedId)) {
                                    isProcessingUpdate.current = false;
                                    return;
                                }
                                
                                // Defer the state update to avoid DOM conflicts
                                setTimeout(() => {
                                    try {
                                        if (setElements && typeof setElements === 'function') {
                                            setElements(currentElements => {
                                                try {
                                                    if (!Array.isArray(currentElements)) {
                                                        return currentElements || [];
                                                    }
                                                    
                                                    // Create a deep copy while preserving virtual element properties
                                                    const updatedElements = currentElements.map(el => ({
                                                        ...el,
                                                        children: Array.isArray(el.children) ? [...el.children] : [],
                                                        // Preserve virtual element properties
                                                        ...(el.isVirtual && {
                                                            isVirtual: el.isVirtual,
                                                            sourceTab: el.sourceTab,
                                                            isViewBlueprint: el.isViewBlueprint,
                                                            originalBlueprintId: el.originalBlueprintId
                                                        }),
                                                        // Preserve slot properties
                                                        ...(el.componentId === 'slot' && {
                                                            componentId: 'slot'
                                                        })
                                                    }));
                                                    
                                                    // Find the moved element
                                                    const movedElementIndex = updatedElements.findIndex(el => el?.i === movedId);
                                                    const movedElement = updatedElements[movedElementIndex];
                                                    
                                                    if (!movedElement || movedElementIndex === -1) {
                                                        
                                                        return currentElements;
                                                    }
                                                    
                                                    // Double-check that we're not moving a virtual element
                                                    if (movedElement.isVirtual || movedElement.componentId === 'slot') {
                                                        
                                                        isProcessingUpdate.current = false;
                                                        return currentElements;
                                                    }
                                                    
                                                    // Update moved element's parent (in case it changed)
                                                    updatedElements[movedElementIndex] = {
                                                        ...movedElement,
                                                        parent: newParentId
                                                    };
                                                    
                                                    // Update the parent container's children array
                                                    const parentId = newParentId || oldParentId;
                                                    
                                                    if (parentId) {
                                                        const parentIndex = updatedElements.findIndex(el => el?.i === parentId);
                                                        
                                                        if (parentIndex !== -1) {
                                                            if (oldParentId === newParentId) {
                                                                // Same container reordering
                                                                const currentChildren = [...updatedElements[parentIndex].children];
                                                                const domChildren = newParentChildren.filter(id => id && id.trim() !== '');
                                                                
                                                                // Preserve virtual children that exist in state but not in DOM
                                                                const virtualChildren = currentChildren.filter(childId => {
                                                                    const childElement = updatedElements.find(el => el.i === childId);
                                                                    return childElement && (childElement.isVirtual || childElement.componentId === 'slot');
                                                                });
                                                                
                                                                // Find non-virtual children that exist in state but not in DOM
                                                                const missingNonVirtualChildren = currentChildren.filter(childId => {
                                                                    const childElement = updatedElements.find(el => el.i === childId);
                                                                    return childElement && 
                                                                           !childElement.isVirtual && 
                                                                           childElement.componentId !== 'slot' && 
                                                                           !domChildren.includes(childId);
                                                                });
                                                                
                                                                // Create new order: DOM order + preserved missing children + virtual children
                                                                const newOrder = [...domChildren, ...missingNonVirtualChildren, ...virtualChildren];
                                                                
                                                                updatedElements[parentIndex] = {
                                                                    ...updatedElements[parentIndex],
                                                                    children: newOrder
                                                                };
                                                            } else {
                                                                // Different container move
                                                                
                                                                // Update old parent (remove moved item, preserve virtual children)
                                                                if (oldParentId) {
                                                                    const oldParentIndex = updatedElements.findIndex(el => el?.i === oldParentId);
                                                                    if (oldParentIndex !== -1) {
                                                                        const currentOldChildren = [...updatedElements[oldParentIndex].children];
                                                                        
                                                                        // Keep virtual children and non-moved children
                                                                        const filteredOldChildren = currentOldChildren.filter(childId => {
                                                                            if (childId === movedId) return false; // Remove moved element
                                                                            const childElement = updatedElements.find(el => el.i === childId);
                                                                            return childElement; // Keep all other children including virtual ones
                                                                        });
                                                                        
                                                                        updatedElements[oldParentIndex] = {
                                                                            ...updatedElements[oldParentIndex],
                                                                            children: filteredOldChildren
                                                                        };
                                                                    }
                                                                }
                                                                
                                                                // Update new parent (use DOM order + preserve missing + preserve virtual)
                                                                const currentNewParentChildren = [...updatedElements[parentIndex].children];
                                                                const domChildren = newParentChildren.filter(id => id && id.trim() !== '');
                                                                
                                                                // Preserve virtual children
                                                                const virtualChildren = currentNewParentChildren.filter(childId => {
                                                                    const childElement = updatedElements.find(el => el.i === childId);
                                                                    return childElement && (childElement.isVirtual || childElement.componentId === 'slot');
                                                                });
                                                                
                                                                // Find missing non-virtual children
                                                                const missingNonVirtualChildren = currentNewParentChildren.filter(childId => {
                                                                    const childElement = updatedElements.find(el => el.i === childId);
                                                                    return childElement && 
                                                                           !childElement.isVirtual && 
                                                                           childElement.componentId !== 'slot' && 
                                                                           !domChildren.includes(childId) && 
                                                                           childId !== movedId;
                                                                });
                                                                
                                                                const newOrder = [...domChildren, ...missingNonVirtualChildren, ...virtualChildren];
                                                                
                                                                updatedElements[parentIndex] = {
                                                                    ...updatedElements[parentIndex],
                                                                    children: newOrder
                                                                };
                                                            }
                                                        } else {
                                                            
                                                        }
                                                    }
                                                    
                                                    return updatedElements;
                                                    
                                                } catch (stateError) {
                                                    
                                                    return currentElements || [];
                                                }
                                            });
                                        } else {
                                            
                                        }
                                    } catch (setElementsError) {
                                        
                                    }
                                    
                                    // Clean up after state update completes
                                    setTimeout(() => {
                                        removeDuplicateElements();
                                        isProcessingUpdate.current = false;
                                        setSortableOperationState?.(false);
                                    }, 150);
                                }, 100); // Immediate but deferred execution
                                
                            } catch (onEndError) {
                                
                                isProcessingUpdate.current = false;
                                setSortableOperationState?.(false);
                            }
                        },
                        
                        // Prevent DOM conflicts during rapid updates and external drops
                        onMove: (evt, originalEvent) => {
                            if (isProcessingUpdate.current) {
                                return false; // Temporarily prevent moves during state updates
                            }
                            
                            const draggedElement = evt.dragged;
                            const elementId = draggedElement?.id;
                            const element = elementss?.find(el => el.i === elementId);
                            
                            // Block external drops from component library
                            // If the dragged element doesn't exist in our elements array, it's external
                            if (!element) {
                                
                                return false;
                            }
                            
                            // Block virtual elements and slots
                            if (element?.isVirtual || element?.componentId === 'slot') {
                                
                                return false;
                            }
                            
                            // Only allow drops into containers with isGroup: true
                            const targetElement = evt.to;
                            const targetId = targetElement?.getAttribute?.('data-id') || targetElement?.id;
                            const targetElementData = elementss?.find(el => el.i === targetId);
                            
                            if (targetElementData) {
                                // ONLY allow drops into elements where isGroup is true
                                if (targetElementData.isGroup === true) {
                                    
                                    return true;
                                } else {
                                    
                                    return false;
                                }
                            }
                            
                            
                            return false;
                        }
                    });
                    
                    if (sortableInstance) {
                        sortableInstances.current.push(sortableInstance);
                        container.setAttribute('data-sortable-init', 'true');
                    }
                    
                } catch (containerError) {
                    
                }
            });

        } catch (setupError) {
            
        }

        // Cleanup function
        return () => {
            try {
                sortableInstances.current.forEach(instance => {
                    try {
                        if (instance && typeof instance.destroy === 'function') {
                            instance.destroy();
                        }
                    } catch (cleanupError) {
                        
                    }
                });
                sortableInstances.current = [];
                isProcessingUpdate.current = false;
                setSortableOperationState?.(false);
            } catch (cleanupError) {
                
                setSortableOperationState?.(false);
            }
        };
    }, [elementss]);

    return <></>;
};
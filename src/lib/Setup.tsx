import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

export const SortableContainerSetup = ({ elementss, setElements }) => {
    const sortableInstances = useRef([]);
    const isProcessingUpdate = useRef(false);

    // Safety function to remove duplicate DOM elements
    const removeDuplicateElements = () => {
        try {
            const seenIds = new Set();
            const cubeElements = document.querySelectorAll('.cube [id]');
            
            cubeElements.forEach(element => {
                if (element.id && seenIds.has(element.id)) {
                    try {
                        element.remove();
                    } catch (removeError) {
                        console.warn('Failed to remove duplicate:', removeError);
                    }
                } else if (element.id) {
                    seenIds.add(element.id);
                }
            });
        } catch (error) {
            console.warn('Error in removeDuplicateElements:', error);
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
                    console.warn('Error destroying sortable instance:', destroyError);
                }
            });
            sortableInstances.current = [];

            // Remove any duplicate elements before setup
            removeDuplicateElements();

            const containers = document.querySelectorAll('.cube');
            
            containers.forEach((container) => {
                try {
                    // Remove the data attribute to ensure fresh initialization
                    container.removeAttribute('data-sortable-init');
                    
                    const sortableInstance = Sortable.create(container, {
                        group: { name: 'sortable-list-2', pull: true, put: true },
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        chosenClass: 'sortable-chosen',
                        dragClass: 'sortable-drag',
                        forceFallback: true,
                        fallbackTolerance: 3,
                        scroll: false,
                        bubbleScroll: false,
                        
                        onStart: (evt) => {
                            try {
                                document.body.classList.add('sortable-dragging');
                            } catch (error) {
                                console.warn('Error in onStart:', error);
                            }
                        },
                        
                        onEnd: (evt) => {
                            try {
                                document.body.classList.remove('sortable-dragging');
                                
                                // Prevent multiple simultaneous updates
                                if (isProcessingUpdate.current) {
                                    return;
                                }
                                isProcessingUpdate.current = true;
                                
                                const { item, to, from, newIndex, oldIndex } = evt || {};
                                
                                if (!item || !item.id) {
                                    console.warn('❌ Invalid drag item');
                                    isProcessingUpdate.current = false;
                                    return;
                                }
                                
                                const movedId = item.id;
                                const newParentId = to?.getAttribute?.('data-id') || to?.id || null;
                                const oldParentId = from?.getAttribute?.('data-id') || from?.id || null;
                                
                                // Check if it's the same container and same position
                                if (to === from && newIndex === oldIndex) {
                                    isProcessingUpdate.current = false;
                                    return;
                                }
                                
                                // Capture the DOM state immediately after SortableJS move
                                const captureContainerState = (container) => {
                                    if (!container || !container.children) return [];
                                    return Array.from(container.children)
                                        .map(child => child?.id)
                                        .filter(id => id && id !== '' && typeof id === 'string');
                                };
                                
                                const newParentChildren = captureContainerState(to);
                                const oldParentChildren = from !== to ? captureContainerState(from) : null;
                                
                                // Validate that our moved element is in the new container
                                if (!newParentChildren.includes(movedId)) {
                                    console.warn('❌ Moved element not found in new parent DOM children');
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
                                                        console.warn('❌ currentElements is not an array');
                                                        return currentElements || [];
                                                    }
                                                    
                                                    // Create a deep copy
                                                    const updatedElements = currentElements.map(el => ({
                                                        ...el,
                                                        children: Array.isArray(el.children) ? [...el.children] : []
                                                    }));
                                                    
                                                    // Find the moved element
                                                    const movedElementIndex = updatedElements.findIndex(el => el?.i === movedId);
                                                    const movedElement = updatedElements[movedElementIndex];
                                                    
                                                    if (!movedElement || movedElementIndex === -1) {
                                                        console.warn('❌ Moved element not found in state:', movedId);
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
                                                                
                                                                // Find children that exist in state but not in DOM (preserve them)
                                                                const missingFromDOM = currentChildren.filter(id => !domChildren.includes(id));
                                                                
                                                                // Create new order: DOM order + preserved missing children
                                                                const newOrder = [...domChildren, ...missingFromDOM];
                                                                
                                                                updatedElements[parentIndex] = {
                                                                    ...updatedElements[parentIndex],
                                                                    children: newOrder
                                                                };
                                                                
                                                            } else {
                                                                // Different container move
                                                                
                                                                // Update old parent (remove moved item)
                                                                if (oldParentId) {
                                                                    const oldParentIndex = updatedElements.findIndex(el => el?.i === oldParentId);
                                                                    if (oldParentIndex !== -1) {
                                                                        const filteredOldChildren = (oldParentChildren || []).filter(id => id !== movedId);
                                                                        updatedElements[oldParentIndex] = {
                                                                            ...updatedElements[oldParentIndex],
                                                                            children: filteredOldChildren
                                                                        };
                                                                    }
                                                                }
                                                                
                                                                // Update new parent (use DOM order + preserve missing)
                                                                const currentNewParentChildren = [...updatedElements[parentIndex].children];
                                                                const domChildren = newParentChildren.filter(id => id && id.trim() !== '');
                                                                const missingFromDOM = currentNewParentChildren.filter(id => !domChildren.includes(id) && id !== movedId);
                                                                const newOrder = [...domChildren, ...missingFromDOM];
                                                                
                                                                updatedElements[parentIndex] = {
                                                                    ...updatedElements[parentIndex],
                                                                    children: newOrder
                                                                };
                                                            }
                                                        } else {
                                                            console.warn('❌ Parent container not found:', parentId);
                                                        }
                                                    }
                                                    
                                                    return updatedElements;
                                                    
                                                } catch (stateError) {
                                                    console.error('❌ Error in state update:', stateError);
                                                    return currentElements || [];
                                                }
                                            });
                                        } else {
                                            console.warn('❌ setElements not available or not a function');
                                        }
                                    } catch (setElementsError) {
                                        console.error('❌ Error calling setElements:', setElementsError);
                                    } finally {
                                        // Clean up after state update completes
                                        setTimeout(() => {
                                            removeDuplicateElements();
                                            isProcessingUpdate.current = false;
                                        }, 50);
                                    }
                                }, 0); // Immediate but deferred execution
                                
                            } catch (onEndError) {
                                console.error('❌ Error in onEnd handler:', onEndError);
                                isProcessingUpdate.current = false;
                            }
                        },
                        
                        // Prevent DOM conflicts during rapid updates
                        onMove: (evt, originalEvent) => {
                            if (isProcessingUpdate.current) {
                                return false; // Temporarily prevent moves during state updates
                            }
                            return true;
                        }
                    });
                    
                    if (sortableInstance) {
                        sortableInstances.current.push(sortableInstance);
                        container.setAttribute('data-sortable-init', 'true');
                    }
                    
                } catch (containerError) {
                    console.error('❌ Error setting up sortable for container:', containerError);
                }
            });

        } catch (setupError) {
            console.error('❌ Error in sortable setup:', setupError);
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
                        console.warn('Error in cleanup:', cleanupError);
                    }
                });
                sortableInstances.current = [];
                isProcessingUpdate.current = false;
            } catch (cleanupError) {
                console.error('Error in cleanup function:', cleanupError);
            }
        };
    }, [elementss]);

    return <></>;
};
import React, { useEffect, useRef, useState } from 'react';

interface CustomDragSetupProps {
  elements: any[];
  setElements: (elements: any[] | ((currentElements: any[]) => any[])) => void;
  setSortableOperationState?: (active: boolean) => void;
  isSortableCurrentlyActive?: () => boolean;
  setIsDragging?: (isDragging: boolean) => void;
  setSelectedTargets?: (targets: any[]) => void;
}

export const CustomDragSetup = ({ 
  elements, 
  setElements, 
  setSortableOperationState,
  isSortableCurrentlyActive,
  setIsDragging,
  setSelectedTargets
}: CustomDragSetupProps) => {
  const dragState = useRef({
    isDragging: false,
    isPreparing: false,
    draggedElement: null as HTMLElement | null,
    draggedElementId: null as string | null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    placeholder: null as HTMLElement | null,
    originalParent: null as HTMLElement | null,
    originalNextSibling: null as HTMLElement | null,
    dragThreshold: 5,
    currentDropTarget: null as HTMLElement | null,
    currentDropPosition: null as { insertBefore: Element | null, index: number } | null
  });

  const [, forceUpdate] = useState({});

  useEffect(() => {
    console.log('🎯 CUSTOM DRAG SETUP START:', {
      elementsCount: elements?.length,
      hasElements: !!elements
    });

    const setupCustomDrag = () => {
      // Find all draggable elements (with cube class)
      const draggableElements = document.querySelectorAll('.cube');
      console.log('🎲 Found draggable elements:', draggableElements.length);

      // FIX: Disable native drag for all IMG elements to allow custom drag
      const allImages = document.querySelectorAll('img');
      allImages.forEach(img => {
        img.draggable = false;
        img.setAttribute('draggable', 'false');

        // Prevent all native drag events on IMG elements
        img.addEventListener('dragstart', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, { capture: true });

        img.addEventListener('drag', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, { capture: true });
      });
      console.log('🖼️ Disabled native drag for', allImages.length, 'IMG elements');

      // Log some examples for debugging
      if (draggableElements.length > 0) {
               console.log('🎲 First few draggable elements:', Array.from(draggableElements).slice(0, 3).map(el => ({
         id: el.id,
         tagName: el.tagName,
         className: el.className
       })));

       // Also check all elements to see which ones should be draggable
       const allElementsWithIds = document.querySelectorAll('[id]');
       console.log('📋 All elements with IDs:', allElementsWithIds.length);
       console.log('📋 Sample elements and their classes:', Array.from(allElementsWithIds).slice(0, 5).map(el => ({
         id: el.id,
         tagName: el.tagName,
         className: el.className,
         hasCube: el.classList.contains('cube')
       })));
      }

             // Use event delegation on document instead of individual listeners
       // This is more reliable and works with dynamically added elements
       document.removeEventListener('mousedown', handleMouseDown);
       document.addEventListener('mousedown', handleMouseDown);
       console.log('🔗 Added document-level drag listener (event delegation)');

      // Also setup drop zones
      const dropZones = document.querySelectorAll('[data-drop-zone="true"], #servly-builder-container');
      console.log('📦 Found drop zones:', dropZones.length);
    };

    // Setup with a small delay to ensure elements are rendered
    const timeout = setTimeout(setupCustomDrag, 100);
    
    // Also setup a longer delay to check if elements get cube class later
    const laterTimeout = setTimeout(() => {
      const laterCubeElements = document.querySelectorAll('.cube');
      console.log('⏰ LATER CHECK - Found cube elements:', laterCubeElements.length);
      if (laterCubeElements.length > 2) {
        console.log('🔄 More cube elements found, re-running setup...');
        setupCustomDrag();
      }
    }, 500);

    // Global mouse event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDragging && !dragState.current.isPreparing) return;
      console.log('🖱️ MOUSE MOVE:', {
        isPreparing: dragState.current.isPreparing,
        isDragging: dragState.current.isDragging,
        hasElement: !!dragState.current.draggedElement
      });
      handleDragMove(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState.current.isDragging && !dragState.current.isPreparing) return;
      console.log('🖱️ MOUSE UP:', {
        isPreparing: dragState.current.isPreparing,
        isDragging: dragState.current.isDragging
      });
      handleDragEnd(e);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      clearTimeout(timeout);
      clearTimeout(laterTimeout);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [elements]);

  const handleMouseDown = (e: MouseEvent) => {
    console.log('🔥 MOUSEDOWN TRIGGERED!', {
      button: e.button,
      clientX: e.clientX,
      clientY: e.clientY
    });

    // CRITICAL: NEVER handle right-click events - these are for context menus
    if (e.button === 2 || e.type === 'contextmenu') {
      return;
    }

    const target = e.target as HTMLElement;

    // FIX: Prevent default drag behavior for IMG elements and other draggable elements
    // This is crucial for <img> tags which have native drag-and-drop behavior
    if (target.tagName === 'IMG' || target.draggable) {
      e.preventDefault();
      e.stopPropagation();
      target.draggable = false;

      // Also prevent the native drag events
      const preventDrag = (evt: Event) => {
        evt.preventDefault();
        evt.stopPropagation();
        return false;
      };
      target.addEventListener('dragstart', preventDrag, { once: true, capture: true });
      target.addEventListener('drag', preventDrag, { once: true, capture: true });
    }

    console.log('🖱️ MOUSEDOWN EVENT:', {
      target: target.tagName,
      targetId: target.id,
      targetClasses: target.className,
      hasCubeClass: target.classList.contains('cube'),
      isIMG: target.tagName === 'IMG',
      parentElements: Array.from(target.parentElement?.children || []).map(el => ({
        id: el.id,
        classes: el.className,
        hasCube: el.classList.contains('cube')
      })).slice(0, 3)
    });

    // Find the draggable element (with cube class) - could be the target itself or a parent
    let draggableElement = target.closest('.cube') as HTMLElement;
    let elementId = '';
    
    // TEMPORARY: If no cube element found, try to find any element with an ID that exists in our elements array
    if (!draggableElement) {
      const elementWithId = target.closest('[id]') as HTMLElement;
      if (elementWithId?.id) {
        const element = elements?.find(el => el.i === elementWithId.id);
        if (element && !element.isVirtual && element.componentId !== 'slot') {
          console.log('🔧 FALLBACK: Using element with ID instead of cube class');
          draggableElement = elementWithId;
          elementId = elementWithId.id;
        }
      }
    } else {
      elementId = draggableElement.id || draggableElement.getAttribute('data-id') || '';
    }
    
    console.log('🔍 SEARCHING FOR DRAGGABLE:', {
      foundDraggable: !!draggableElement,
      draggableId: elementId,
      draggableClasses: draggableElement?.className,
      searchPath: (() => {
        let current = target;
        const path = [];
        while (current && current !== document.body) {
          path.push({
            tag: current.tagName,
            id: current.id,
            classes: current.className,
            hasCube: current.classList.contains('cube')
          });
          current = current.parentElement as HTMLElement;
          if (path.length > 5) break;
        }
        return path;
      })()
    });
    
    if (!draggableElement || !elementId) {
      console.log('❌ No valid draggable element found');
      return;
    }

    const element = elements?.find(el => el.i === elementId);
    if (!element) {
      console.log('❌ Element not found in array:', elementId);
      return;
    }

    // Block virtual elements and slots
    if (element?.isVirtual || element?.componentId === 'slot') {
      console.log('❌ BLOCKED: Virtual element or slot');
      return;
    }

    console.log('🚀 DRAG START:', {
      elementId,
      element: element,
      clickedTarget: target.tagName,
      draggableElement: draggableElement.tagName,
      draggableClasses: draggableElement.className
    });

    console.log('🎯 PREPARING FOR DRAG - waiting for mouse movement...');

    // Prevent default to avoid text selection and other browser behaviors
    e.preventDefault();
    e.stopPropagation();

    const rect = draggableElement.getBoundingClientRect();
    
    dragState.current = {
      isDragging: false,
      isPreparing: true,
      draggedElement: draggableElement,
      draggedElementId: elementId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      placeholder: null,
      originalParent: draggableElement.parentElement,
      originalNextSibling: draggableElement.nextElementSibling as HTMLElement,
      dragThreshold: 5,
      currentDropTarget: null,
      currentDropPosition: null
    };

    // Don't prevent default or start visual changes yet - wait for actual movement
    setSortableOperationState?.(true);
    setIsDragging?.(true);
    setSelectedTargets?.([]);
  };

  const startActualDrag = () => {
    const { draggedElement, draggedElementId } = dragState.current;
    if (!draggedElement || !draggedElementId) return;

    console.log('🎬 STARTING ACTUAL DRAG for:', draggedElementId);

    const rect = draggedElement.getBoundingClientRect();

    // Create placeholder that looks like the actual element
    const placeholder = draggedElement.cloneNode(true) as HTMLElement;
    placeholder.className = `${draggedElement.className} drag-placeholder-element`;
    
    // Style the placeholder with static, professional appearance
    placeholder.style.cssText = `
      opacity: 0.75 !important;
      pointer-events: none;
      position: relative;
      filter: grayscale(100%) brightness(1.1) !important;
      border: 3px dashed #6b7280 !important;
      background: rgba(107, 114, 128, 0.1) !important;
      border-radius: 6px !important;
      box-shadow: 0 0 10px rgba(107, 114, 128, 0.2) !important;
      transform: scale(0.99);
      outline: 1px solid rgba(107, 114, 128, 0.25) !important;
      outline-offset: 2px !important;
    `;
    
    // Remove any IDs from the placeholder and its children to avoid duplicates
    placeholder.removeAttribute('id');
    placeholder.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    
    // Safely insert placeholder
    try {
      if (draggedElement.parentElement) {
        dragState.current.placeholder = placeholder;
        draggedElement.parentElement.insertBefore(placeholder, draggedElement);
        console.log('📍 Placeholder inserted successfully');
      } else {
        console.log('⚠️ No parent element to insert placeholder');
        dragState.current.placeholder = null;
      }
    } catch (insertError) {
      console.log('❌ Error inserting placeholder:', insertError);
      dragState.current.placeholder = null;
    }

    // Style the dragged element with minimal visual feedback (no shadows)
    draggedElement.style.position = 'fixed';
    draggedElement.style.zIndex = '10000';
    draggedElement.style.pointerEvents = 'none';
    draggedElement.style.opacity = '0';
    draggedElement.style.transform = 'scale(0.95)';
    draggedElement.style.left = `${rect.left}px`;
    draggedElement.style.top = `${rect.top}px`;
    draggedElement.style.width = `${rect.width}px`;
    draggedElement.style.height = `${rect.height}px`;
    draggedElement.style.transition = 'none';
    draggedElement.style.boxShadow = 'none';
    draggedElement.style.filter = 'none';
    
    // Add a visual class for additional styling
    draggedElement.classList.add('being-dragged');
    
    // Update drag state
    dragState.current.isDragging = true;
    dragState.current.isPreparing = false;

    // Add dragging class to body
    document.body.classList.add('custom-dragging');
    
    console.log('✨ Drag visuals applied - element is now dragging');
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragState.current.isPreparing && !dragState.current.isDragging) return;
    if (!dragState.current.draggedElement) return;

    const { draggedElement, startX, startY, dragThreshold } = dragState.current;
    
    // Check if we've moved enough to start dragging
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (dragState.current.isPreparing && distance >= dragThreshold) {
      // Start the actual drag
      console.log('🚀 DRAG THRESHOLD REACHED - Starting drag!');
      startActualDrag();
    }
    
    if (!dragState.current.isDragging) return;
    
    // Update position
    const newX = e.clientX - dragState.current.offsetX;
    const newY = e.clientY - dragState.current.offsetY;
    
    draggedElement.style.left = `${newX}px`;
    draggedElement.style.top = `${newY}px`;

    // Find drop target
    const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
    const dropTarget = findValidDropTarget(elementsBelow);
    
    if (dropTarget) {
      console.log('🎯 Over drop target:', dropTarget.id);
      highlightDropTarget(dropTarget);
      
      // Calculate precise drop position based on cursor location
      const dropPosition = findDropPosition(dropTarget, e.clientX, e.clientY);
      console.log('📍 Drop position:', { index: dropPosition.index, insertBefore: dropPosition.insertBefore ? (dropPosition.insertBefore as HTMLElement).id : 'end' });
      
      // Store current drop target and position for consistent drop behavior
      dragState.current.currentDropTarget = dropTarget;
      dragState.current.currentDropPosition = dropPosition;
      
      // Move placeholder to show exact insertion point
      const { placeholder } = dragState.current;
      if (placeholder) {
        try {
          if (dropPosition.insertBefore) {
            // Insert before specific element (beginning or between items)
            dropTarget.insertBefore(placeholder, dropPosition.insertBefore);
            console.log('📍 Placeholder inserted before:', (dropPosition.insertBefore as HTMLElement).id);
          } else {
            // Append at the end
            dropTarget.appendChild(placeholder);
            console.log('📍 Placeholder appended at end of:', dropTarget.id);
          }
          
          // Add visual connection between cursor and drop zone
          updateCursorToDropZoneConnection(e.clientX, e.clientY, placeholder);
          
          // Optional: Gentle cursor magnetic pull toward drop zone (uncomment to enable)
          // applyCursorMagneticPull(e, placeholder);
          
        } catch (moveError) {
          console.log('❌ Error positioning placeholder:', moveError);
        }
      }
    } else {
      clearDropTargetHighlights();
      clearConnectionLine();
      
      // Clear stored drop target and position
      dragState.current.currentDropTarget = null;
      dragState.current.currentDropPosition = null;
      
      // Move placeholder back to root if no valid drop target
      const { placeholder } = dragState.current;
      const rootContainer = document.getElementById('servly-builder-container');
      if (placeholder && rootContainer) {
        try {
          rootContainer.appendChild(placeholder);
          console.log('📍 Moved placeholder back to root');
        } catch (moveError) {
          console.log('❌ Error moving placeholder to root:', moveError);
        }
      }
    }
  };

  const handleDragEnd = (e: MouseEvent) => {
    if (!dragState.current.isDragging && !dragState.current.isPreparing) return;

    console.log('🏁 DRAG END', {
      wasDragging: dragState.current.isDragging,
      wasPreparing: dragState.current.isPreparing
    });

    // If we were only preparing (didn't cross threshold), just clean up
    if (dragState.current.isPreparing && !dragState.current.isDragging) {
      console.log('🚫 Drag cancelled - threshold not reached');
      dragState.current = {
        isDragging: false,
        isPreparing: false,
        draggedElement: null,
        draggedElementId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        placeholder: null,
        originalParent: null,
        originalNextSibling: null,
        dragThreshold: 5,
        currentDropTarget: null,
        currentDropPosition: null
      };
      setSortableOperationState?.(false);
      setIsDragging?.(false);
      clearConnectionLine();
      return;
    }

    const { draggedElement, draggedElementId, placeholder, originalParent, originalNextSibling } = dragState.current;
    
    if (!draggedElement || !draggedElementId) {
      console.log('❌ Missing dragged element or ID');
      return;
    }

    try {
      // Use stored drop target and position for consistency
      const dropTarget = dragState.current.currentDropTarget;
      const dropPosition = dragState.current.currentDropPosition;

      console.log('📍 Using stored drop target:', dropTarget?.id || 'root');
      console.log('📍 Using stored drop position:', dropPosition ? { index: dropPosition.index, insertBefore: dropPosition.insertBefore ? (dropPosition.insertBefore as HTMLElement).id : 'end' } : 'none');

      // Fallback: if no stored position, calculate from current mouse position
      let finalDropTarget = dropTarget;
      let finalDropPosition = dropPosition;
      if (!dropTarget || !dropPosition) {
        const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
        finalDropTarget = findValidDropTarget(elementsBelow);
        finalDropPosition = finalDropTarget ? findDropPosition(finalDropTarget, e.clientX, e.clientY) : null;
        console.log('⚠️ Using fallback drop calculation');
      }

      // Remove placeholder FIRST to avoid duplication
      if (placeholder) {
        try {
          // Check if placeholder is actually in the DOM and has a parent
          if (placeholder.parentElement && placeholder.parentElement.contains(placeholder)) {
            placeholder.parentElement.removeChild(placeholder);
            console.log('🗑️ Placeholder removed');
          } else if (placeholder.parentNode) {
            // Try with parentNode if parentElement doesn't work
            placeholder.parentNode.removeChild(placeholder);
            console.log('🗑️ Placeholder removed via parentNode');
          } else {
            // Placeholder is already removed or not in DOM
            console.log('ℹ️ Placeholder already removed or not in DOM');
          }
        } catch (placeholderError) {
          console.log('⚠️ Error removing placeholder:', placeholderError);
          // Try alternative removal method
          try {
            if (placeholder.remove) {
              placeholder.remove();
              console.log('🗑️ Placeholder removed via .remove()');
            }
          } catch (removeError) {
            console.log('⚠️ Alternative removal also failed:', removeError);
          }
        }
      }

      // Move element to precise position immediately, then update React state
      let dropSuccessful = false;
      let targetParentId = null;
      
      if (finalDropTarget && finalDropTarget !== draggedElement) {
        // Check if the drop target is valid and not the element itself
        if (!draggedElement.contains(finalDropTarget)) {
          targetParentId = finalDropTarget.id;
          dropSuccessful = true;
          
          // Move element to precise position in DOM
          try {
            if (finalDropPosition && finalDropPosition.insertBefore) {
              finalDropTarget.insertBefore(draggedElement, finalDropPosition.insertBefore);
              console.log('📍 Element inserted before:', (finalDropPosition.insertBefore as HTMLElement).id);
            } else {
              finalDropTarget.appendChild(draggedElement);
              console.log('📍 Element appended to end of:', finalDropTarget.id);
            }
          } catch (moveError) {
            console.log('❌ Error moving element to precise position:', moveError);
          }
        } else {
          console.log('⚠️ Cannot drop element into itself');
        }
      }
      
      if (!dropSuccessful) {
        // Drop to root
        const rootContainer = document.getElementById('servly-builder-container');
        if (rootContainer && rootContainer !== draggedElement) {
          targetParentId = null;
          dropSuccessful = true;
          
          try {
            rootContainer.appendChild(draggedElement);
            console.log('📍 Element moved to root');
          } catch (moveError) {
            console.log('❌ Error moving element to root:', moveError);
          }
        }
      }
      
      // Update React state to match DOM position
      if (dropSuccessful) {
        updateElementsState(draggedElementId, targetParentId, finalDropPosition?.index);
      } else {
        console.log('⚠️ Drop failed, keeping element in original position');
      }
    } catch (error) {
      console.log('❌ Critical error during drop:', error);
      // Try to restore element to original position
      if (originalParent && draggedElement) {
        try {
          if (originalNextSibling && originalNextSibling.parentElement === originalParent) {
            originalParent.insertBefore(draggedElement, originalNextSibling);
          } else {
            originalParent.appendChild(draggedElement);
          }
          console.log('🔄 Emergency restore to original position');
        } catch (restoreError) {
          console.log('❌ Emergency restore failed:', restoreError);
        }
      }
    }

    // Restore element to original position temporarily until React re-renders
    try {
      if (originalParent && draggedElement) {
        if (originalNextSibling && originalNextSibling.parentElement === originalParent) {
          originalParent.insertBefore(draggedElement, originalNextSibling);
        } else {
          originalParent.appendChild(draggedElement);
        }
        console.log('🔄 Temporarily restored to original position for React');
      }
    } catch (restoreError) {
      console.log('⚠️ Could not restore to original position:', restoreError);
    }

    // Reset element styles immediately
    setTimeout(() => {
      try {
        if (draggedElement && draggedElement.parentElement) {
          draggedElement.style.position = '';
          draggedElement.style.zIndex = '';
          draggedElement.style.pointerEvents = '';
          draggedElement.style.opacity = '';
          draggedElement.style.transform = '';
          draggedElement.style.left = '';
          draggedElement.style.top = '';
          draggedElement.style.width = '';
          draggedElement.style.height = '';
          draggedElement.style.boxShadow = '';
          draggedElement.style.borderRadius = '';
          draggedElement.style.transition = '';
          draggedElement.style.filter = '';
          
          // Remove the dragging class
          draggedElement.classList.remove('being-dragged');
          
          console.log('🧹 DRAG STYLING CLEANED UP:', draggedElementId);
        } else {
          console.log('⚠️ Element no longer in DOM, skipping style cleanup');
        }
      } catch (cleanupError) {
        console.log('❌ Error during style cleanup:', cleanupError);
      }
    }, 10);

          // Cleanup
      document.body.classList.remove('custom-dragging');
      clearDropTargetHighlights();
      clearConnectionLine();
      setSortableOperationState?.(false);
      setIsDragging?.(false);

    // Reset drag state
    dragState.current = {
      isDragging: false,
      isPreparing: false,
      draggedElement: null,
      draggedElementId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      placeholder: null,
      originalParent: null,
      originalNextSibling: null,
      dragThreshold: 5,
      currentDropTarget: null,
      currentDropPosition: null
    };

    forceUpdate({});
  };

  const findValidDropTarget = (elementsBelow: Element[]): HTMLElement | null => {
    const draggedElement = dragState.current.draggedElement;

    for (const element of elementsBelow) {
      const htmlElement = element as HTMLElement;

      // Skip the dragged element itself and its placeholder
      if (htmlElement === draggedElement ||
          htmlElement === dragState.current.placeholder) {
        continue;
      }

      // CRITICAL FIX: Prevent dropping an element into itself or its descendants
      // Check if the drop target is inside the dragged element
      if (draggedElement && draggedElement.contains(htmlElement)) {
        console.log('🚫 Cannot drop into descendant of dragged element');
        continue;
      }

      // Check if it's a valid drop target
      const elementId = htmlElement.id;
      if (elementId) {
        const elementData = elements?.find(el => el.i === elementId);

        // Allow drops into group elements
        if (elementData?.isGroup) {
          return htmlElement;
        }

        // Allow drops into root container
        if (elementId === 'servly-builder-container') {
          return htmlElement;
        }
      }
    }

    return null;
  };

  const findDropPosition = (container: HTMLElement, mouseX: number, mouseY: number): { insertBefore: Element | null, index: number } => {
    // Get all children that are actual elements (not the dragged element or placeholder)
    const children = Array.from(container.children).filter(child => 
      child !== dragState.current.draggedElement && 
      child !== dragState.current.placeholder &&
      !child.classList.contains('drag-preview-element') &&
      child.nodeType === Node.ELEMENT_NODE &&
      // Only visible elements
      (child as HTMLElement).offsetParent !== null
    );
    
    console.log('🔍 Finding drop position in container:', container.id, 'with', children.length, 'children');
    
    if (children.length === 0) {
      console.log('📍 Empty container - inserting at index 0');
      return { insertBefore: null, index: 0 };
    }
    
    // Determine layout direction by checking container styles and element positions
    const containerStyle = window.getComputedStyle(container);
    const flexDirection = containerStyle.flexDirection;
    const display = containerStyle.display;
    
    let isVerticalLayout = true;
    
    // Check CSS properties first for more accurate detection
    if (flexDirection === 'row' || flexDirection === 'row-reverse') {
      isVerticalLayout = false;
    } else if (flexDirection === 'column' || flexDirection === 'column-reverse') {
      isVerticalLayout = true;
    } else if (display === 'grid') {
      // For grid, check grid-template-columns vs grid-template-rows
      const gridTemplateColumns = containerStyle.gridTemplateColumns;
      const gridTemplateRows = containerStyle.gridTemplateRows;
              if (gridTemplateColumns !== 'none' && gridTemplateRows === 'none') {
          // More columns than rows
          isVerticalLayout = false;
        }
    } else {
      // Fallback: check actual positions
      if (children.length >= 2) {
        const firstRect = children[0].getBoundingClientRect();
        const secondRect = children[1].getBoundingClientRect();
        isVerticalLayout = Math.abs(firstRect.top - secondRect.top) > Math.abs(firstRect.left - secondRect.left);
      }
    }
    
    console.log('📐 Layout direction:', isVerticalLayout ? 'vertical' : 'horizontal', 
                '(flex:', flexDirection, 'display:', display, ')');
    
    // Create virtual drop zones for precise positioning
    const dropZones = [];
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const rect = child.getBoundingClientRect();
      
      // Add drop zone before this element (for first element or between elements)
      if (i === 0) {
        // Zone before first element
        if (isVerticalLayout) {
          dropZones.push({
            type: 'before-first',
            index: 0,
            insertBefore: child,
            zone: {
              top: rect.top - 20,
              bottom: rect.top + (rect.height * 0.3),
              left: rect.left - 10,
              right: rect.right + 10
            }
          });
        } else {
          dropZones.push({
            type: 'before-first',
            index: 0,
            insertBefore: child,
            zone: {
              top: rect.top - 10,
              bottom: rect.bottom + 10,
              left: rect.left - 20,
              right: rect.left + (rect.width * 0.3)
            }
          });
        }
      }
      
      // Add drop zone for this element's center (to insert after it)
      const nextChild = children[i + 1];
      if (nextChild) {
        const nextRect = nextChild.getBoundingClientRect();
        
        if (isVerticalLayout) {
          // Zone between this element and next (vertical)
          const gapTop = rect.bottom;
          const gapBottom = nextRect.top;
          const gapMiddle = (gapTop + gapBottom) / 2;
          
          dropZones.push({
            type: 'between',
            index: i + 1,
            insertBefore: nextChild,
            zone: {
              top: rect.top + (rect.height * 0.7),
              bottom: nextRect.top + (nextRect.height * 0.3),
              left: Math.min(rect.left, nextRect.left) - 10,
              right: Math.max(rect.right, nextRect.right) + 10
            }
          });
        } else {
          // Zone between this element and next (horizontal)
          const gapLeft = rect.right;
          const gapRight = nextRect.left;
          const gapMiddle = (gapLeft + gapRight) / 2;
          
          dropZones.push({
            type: 'between',
            index: i + 1,
            insertBefore: nextChild,
            zone: {
              top: Math.min(rect.top, nextRect.top) - 10,
              bottom: Math.max(rect.bottom, nextRect.bottom) + 10,
              left: rect.left + (rect.width * 0.7),
              right: nextRect.left + (nextRect.width * 0.3)
            }
          });
        }
      } else {
        // Zone after last element
        if (isVerticalLayout) {
          dropZones.push({
            type: 'after-last',
            index: children.length,
            insertBefore: null,
            zone: {
              top: rect.top + (rect.height * 0.7),
              bottom: rect.bottom + 20,
              left: rect.left - 10,
              right: rect.right + 10
            }
          });
        } else {
          dropZones.push({
            type: 'after-last',
            index: children.length,
            insertBefore: null,
            zone: {
              top: rect.top - 10,
              bottom: rect.bottom + 10,
              left: rect.left + (rect.width * 0.7),
              right: rect.right + 20
            }
          });
        }
      }
    }
    
    console.log('🎯 Created', dropZones.length, 'drop zones for precise positioning');
    
    // Find which drop zone the mouse is in
    for (const zone of dropZones) {
      if (mouseX >= zone.zone.left && mouseX <= zone.zone.right &&
          mouseY >= zone.zone.top && mouseY <= zone.zone.bottom) {
        console.log('📍 Mouse in', zone.type, 'zone at index:', zone.index);
        return { insertBefore: zone.insertBefore, index: zone.index };
      }
    }
    
    // If not in any specific zone, find the closest one based on distance
    let closestZone = dropZones[0];
    let closestDistance = Infinity;
    
    for (const zone of dropZones) {
      const zoneCenterX = (zone.zone.left + zone.zone.right) / 2;
      const zoneCenterY = (zone.zone.top + zone.zone.bottom) / 2;
      const distance = Math.sqrt(
        Math.pow(mouseX - zoneCenterX, 2) + Math.pow(mouseY - zoneCenterY, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestZone = zone;
      }
    }
    
    console.log('📍 Using closest zone:', closestZone.type, 'at index:', closestZone.index, 'distance:', Math.round(closestDistance));
    return { insertBefore: closestZone.insertBefore, index: closestZone.index };
  };

  const highlightDropTarget = (target: HTMLElement) => {
    clearDropTargetHighlights();
    target.classList.add('drop-target-highlight');
  };

  const clearDropTargetHighlights = () => {
    document.querySelectorAll('.drop-target-highlight').forEach(el => {
      el.classList.remove('drop-target-highlight');
    });
  };

  const updateCursorToDropZoneConnection = (cursorX: number, cursorY: number, placeholder: HTMLElement) => {
    // Remove existing connection line
    const existingLine = document.querySelector('.drag-connection-line');
    if (existingLine) {
      existingLine.remove();
    }

    // Get placeholder position
    const placeholderRect = placeholder.getBoundingClientRect();
    const placeholderCenterX = placeholderRect.left + placeholderRect.width / 2;
    const placeholderCenterY = placeholderRect.top + placeholderRect.height / 2;

    // Calculate distance between cursor and placeholder
    const deltaX = placeholderCenterX - cursorX;
    const deltaY = placeholderCenterY - cursorY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only show connection if cursor is far from placeholder (more than 50px)
    if (distance > 50) {
      // Create visual connection line
      const connectionLine = document.createElement('div');
      connectionLine.className = 'drag-connection-line';
      connectionLine.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(59, 130, 246, 0.8) 100%);
        height: 2px;
        border-radius: 1px;
        transform-origin: left center;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
        animation: dragPulse 1.5s ease-in-out infinite;
      `;

      // Position and rotate the line
      const angle = Math.atan2(deltaY, deltaX);
      connectionLine.style.left = `${cursorX}px`;
      connectionLine.style.top = `${cursorY}px`;
      connectionLine.style.width = `${distance}px`;
      connectionLine.style.transform = `rotate(${angle}rad)`;

      document.body.appendChild(connectionLine);

      // Add pulsing animation if not already defined
      if (!document.querySelector('#drag-connection-styles')) {
        const styles = document.createElement('style');
        styles.id = 'drag-connection-styles';
        styles.textContent = `
          @keyframes dragPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .drag-connection-line::after {
            content: '';
            position: absolute;
            right: -6px;
            top: -2px;
            width: 6px;
            height: 6px;
            background: rgba(59, 130, 246, 0.9);
            border-radius: 50%;
            box-shadow: 0 0 4px rgba(59, 130, 246, 0.6);
          }
        `;
        document.head.appendChild(styles);
      }
    }
  };

  const clearConnectionLine = () => {
    const connectionLine = document.querySelector('.drag-connection-line');
    if (connectionLine) {
      connectionLine.remove();
    }
  };

  const applyCursorMagneticPull = (e: MouseEvent, placeholder: HTMLElement) => {
    // Get placeholder position
    const placeholderRect = placeholder.getBoundingClientRect();
    const placeholderCenterX = placeholderRect.left + placeholderRect.width / 2;
    const placeholderCenterY = placeholderRect.top + placeholderRect.height / 2;

    // Calculate distance and apply gentle magnetic pull
    const deltaX = placeholderCenterX - e.clientX;
    const deltaY = placeholderCenterY - e.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Apply magnetic pull if within reasonable range (100-300px)
    if (distance > 100 && distance < 300) {
      const pullStrength = 0.1; // Gentle pull (10% toward target)
      const newX = e.clientX + (deltaX * pullStrength);
      const newY = e.clientY + (deltaY * pullStrength);
      
      // Smoothly move cursor toward drop zone
      if (typeof window !== 'undefined' && document.elementFromPoint) {
        try {
          // Note: Direct cursor movement requires special permissions
          // This is a conceptual implementation - actual cursor movement 
          // would need browser-specific APIs or user gesture
          console.log('🧲 Magnetic pull toward drop zone:', { 
            current: { x: e.clientX, y: e.clientY },
            target: { x: placeholderCenterX, y: placeholderCenterY },
            suggested: { x: newX, y: newY }
          });
        } catch (error) {
          console.log('Cursor movement not available:', error);
        }
      }
    }
  };

  const updateElementsState = (draggedElementId: string, newParentId: string | null, insertIndex?: number) => {
    console.log('🔄 Updating elements state:', { draggedElementId, newParentId, insertIndex });

    try {
      setElements(currentElements => {
        try {
          if (!Array.isArray(currentElements)) {
            console.log('⚠️ Elements is not an array, returning as-is');
            return currentElements || [];
          }

          const updatedElements = [...currentElements];
          
          // Find the moved element
          const movedElementIndex = updatedElements.findIndex(el => el?.i === draggedElementId);
          const movedElement = updatedElements[movedElementIndex];
          
          if (!movedElement || movedElementIndex === -1) {
            console.log('❌ Element not found in state:', draggedElementId);
            return currentElements;
          }

          // Store old parent for cleanup
          const oldParentId = movedElement.parent;

          // Remove element from current position
          updatedElements.splice(movedElementIndex, 1);
          
          // Update moved element's parent
          const updatedMovedElement = {
            ...movedElement,
            parent: newParentId
          };

          // Calculate the correct insertion position in the flat array
          let finalInsertIndex = updatedElements.length; // Default to end
          
          if (typeof insertIndex === 'number' && newParentId) {
            // Find siblings with the same parent to calculate correct position
            const siblings = updatedElements.filter(el => el.parent === newParentId);
            console.log('📍 Found', siblings.length, 'siblings with parent:', newParentId);
            
            if (insertIndex <= siblings.length) {
              if (insertIndex === 0) {
                // Insert at the beginning of siblings
                const firstSiblingGlobalIndex = updatedElements.findIndex(el => el.parent === newParentId);
                if (firstSiblingGlobalIndex !== -1) {
                  finalInsertIndex = firstSiblingGlobalIndex;
                }
              } else if (insertIndex < siblings.length) {
                // Insert between siblings
                const targetSibling = siblings[insertIndex];
                const targetSiblingGlobalIndex = updatedElements.findIndex(el => el?.i === targetSibling?.i);
                if (targetSiblingGlobalIndex !== -1) {
                  finalInsertIndex = targetSiblingGlobalIndex;
                }
              } else {
                // Insert after last sibling
                const lastSibling = siblings[siblings.length - 1];
                const lastSiblingGlobalIndex = updatedElements.findIndex(el => el?.i === lastSibling?.i);
                if (lastSiblingGlobalIndex !== -1) {
                  finalInsertIndex = lastSiblingGlobalIndex + 1;
                }
              }
            }
          } else if (typeof insertIndex === 'number' && !newParentId) {
            // Root level positioning
            const rootElements = updatedElements.filter(el => !el.parent);
            if (insertIndex <= rootElements.length) {
              if (insertIndex === 0) {
                finalInsertIndex = 0;
              } else if (insertIndex < rootElements.length) {
                const targetElement = rootElements[insertIndex];
                const targetGlobalIndex = updatedElements.findIndex(el => el?.i === targetElement?.i);
                if (targetGlobalIndex !== -1) {
                  finalInsertIndex = targetGlobalIndex;
                }
              }
            }
          }

          // Insert element at calculated position
          updatedElements.splice(finalInsertIndex, 0, updatedMovedElement);
          console.log('📍 Inserted element at index:', finalInsertIndex, 'of', updatedElements.length, 'total elements');

          // Update parent containers' children arrays (for tree-like structures)
          if (newParentId) {
            const newParentIndex = updatedElements.findIndex(el => el?.i === newParentId);
            if (newParentIndex !== -1) {
              const currentChildren = [...(updatedElements[newParentIndex].children || [])];
              if (!currentChildren.includes(draggedElementId)) {
                // Insert at the specific index within children array
                if (typeof insertIndex === 'number' && insertIndex <= currentChildren.length) {
                  currentChildren.splice(insertIndex, 0, draggedElementId);
                } else {
                  currentChildren.push(draggedElementId);
                }
                updatedElements[newParentIndex] = {
                  ...updatedElements[newParentIndex],
                  children: currentChildren
                };
                console.log('📍 Updated parent children array at index:', insertIndex);
              }
            } else {
              console.log('⚠️ New parent not found in elements:', newParentId);
            }
          }

          // Remove from old parent's children array
          if (oldParentId) {
            const oldParentIndex = updatedElements.findIndex(el => el?.i === oldParentId);
            if (oldParentIndex !== -1) {
              const filteredChildren = (updatedElements[oldParentIndex].children || [])
                .filter(childId => childId !== draggedElementId);
              updatedElements[oldParentIndex] = {
                ...updatedElements[oldParentIndex],
                children: filteredChildren
              };
            } else {
              console.log('⚠️ Old parent not found in elements:', oldParentId);
            }
          }

          console.log('✅ State updated successfully with proper positioning');
          return updatedElements;
        } catch (stateError) {
          console.log('❌ Error updating state:', stateError);
          return currentElements;
        }
      });
    } catch (setElementsError) {
      console.log('❌ Error calling setElements:', setElementsError);
    }
  };

  // Add CSS for drag states
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Disable native drag for IMG elements to allow custom drag */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
        user-select: none !important;
      }

      /* Ensure IMG elements inside cube containers are also properly configured */
      .cube img {
        -webkit-user-drag: none !important;
        pointer-events: auto !important;
        cursor: inherit !important;
      }

      .custom-dragging {
        user-select: none !important;
        cursor: grabbing !important;
      }

      .custom-dragging * {
        cursor: grabbing !important;
      }

      .drop-target-highlight {
        background-color: rgba(59, 130, 246, 0.1) !important;
        outline: 2px dashed #3b82f6 !important;
        outline-offset: -2px !important;
      }

      .drag-placeholder {
        pointer-events: none;
      }

      .drag-placeholder-element {
        /* No animations - static professional appearance */
      }

      .cube {
        cursor: grab;
      }

      .cube:hover {
        cursor: grab;
      }

      .cube:active {
        cursor: grabbing;
      }

      .being-dragged {
        animation: dragPulse 0.8s ease-in-out infinite alternate !important;
        filter: brightness(1.1) contrast(1.05) !important;
      }

      @keyframes dragPulse {
        0% {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
        }
        100% {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(59, 130, 246, 0.8) !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (style.parentElement) {
        style.parentElement.removeChild(style);
      }
    };
  }, []);

  return null;
}; 
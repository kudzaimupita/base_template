import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTransformContext } from 'react-zoom-pan-pinch';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  UniqueIdentifier,
  Modifier,
  Modifiers,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

interface DndKitOptimizedProps {
  elements: any[];
  setElements: (elements: any[] | ((currentElements: any[]) => any[])) => void;
  setSortableOperationState?: (active: boolean) => void;
  isSortableCurrentlyActive?: () => boolean;
  children?: React.ReactNode;
}

// Create a custom modifier that accounts for scale
const createScaleModifier = (scale: number): Modifier => {
  return ({ transform }) => {
    const scaleValue = scale / 100;
    
    if (scaleValue !== 1) {
      return {
        ...transform,
        x: transform.x / scaleValue,
        y: transform.y / scaleValue,
      };
    }
    
    return transform;
  };
};

// Custom collision detection for better container detection
const customCollisionDetection = (args: any) => {
  // First, try pointer within for container detection
  const pointerCollisions = pointerWithin(args);
  const intersectionCollisions = rectIntersection(args);
  
  // Prioritize containers that are being hovered
  const collisions = getFirstCollision(pointerCollisions, 'id');
  
  if (collisions) {
    return [collisions];
  }
  
  return intersectionCollisions;
};

export const DndKitOptimized: React.FC<DndKitOptimizedProps> = ({
  elements,
  setElements,
  setSortableOperationState,
  isSortableCurrentlyActive,
  children,
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  
  React.useEffect(() => {
  }, [elements?.length]);
  
  // Get the actual scale from the TransformWrapper context if available
  let transformContext;
  try {
    transformContext = useTransformContext();
  } catch (e) {
    transformContext = null;
  }
  const scale = transformContext?.transformState ? Math.round(transformContext.transformState.scale * 100) : 100;
  
  // Configure sensors with optimized settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Lower distance for quicker activation
        tolerance: 5,
        delay: 100, // Small delay to prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create scale modifier
  const modifiers = useMemo<Modifiers>(() => {
    return [createScaleModifier(scale)];
  }, [scale]);

  // Build element tree structure for nested support
  const elementTree = useMemo(() => {
    const tree = new Map<string | null, any[]>();
    
    elements.forEach((el) => {
      const parentId = el.parent || null;
      if (!tree.has(parentId)) {
        tree.set(parentId, []);
      }
      tree.get(parentId)?.push(el);
    });
    
    return tree;
  }, [elements]);

  // Get sortable items for a specific parent
  const getSortableItems = useCallback((parentId: string | null) => {
    return elementTree.get(parentId)?.map(el => el.i) || [];
  }, [elementTree]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setSortableOperationState?.(true);
    
    // Add class to body to prevent text selection during drag
    document.body.classList.add('dragging');
    document.body.style.userSelect = 'none';
  }, [setSortableOperationState]);

  // Handle drag over - for detecting containers
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setOverId(null);
      return;
    }
    
    setOverId(over.id);
    
    // Check if we're over a container
    const overElement = elements.find(el => el.i === over.id);
    const activeElement = elements.find(el => el.i === active.id);
    
    if (!overElement || !activeElement) return;
    
    // If dragging over a container (group), prepare for drop
    if (overElement.isGroup && overElement.i !== activeElement.parent) {
    }
  }, [elements]);

  // Handle drag end with nested support
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    
    setActiveId(null);
    setOverId(null);
    setSortableOperationState?.(false);
    
    // Remove dragging styles
    document.body.classList.remove('dragging');
    document.body.style.userSelect = '';
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const activeElement = elements.find(el => el.i === active.id);
    const overElement = elements.find(el => el.i === over.id);
    
    if (!activeElement || !overElement) return;
    
    setElements((currentElements) => {
      const newElements = [...currentElements];
      const activeIndex = newElements.findIndex(el => el.i === active.id);
      
      // Check if dropping into a container
      if (overElement.isGroup) {
        // Move element into container
        newElements[activeIndex] = {
          ...activeElement,
          parent: overElement.i,
        };
      } else {
        // Reorder within same parent
        const overIndex = newElements.findIndex(el => el.i === over.id);
        
        if (activeElement.parent === overElement.parent) {
          // Same parent, just reorder
          return arrayMove(newElements, activeIndex, overIndex);
        } else {
          // Different parent, move to new parent and position
          newElements[activeIndex] = {
            ...activeElement,
            parent: overElement.parent,
          };
          
          // Then reorder
          const updatedActiveIndex = newElements.findIndex(el => el.i === active.id);
          const updatedOverIndex = newElements.findIndex(el => el.i === over.id);
          return arrayMove(newElements, updatedActiveIndex, updatedOverIndex);
        }
      }
      
      return newElements;
    });
  }, [elements, setElements, setSortableOperationState]);

  // Find the active element for the drag overlay
  const activeElement = useMemo(() => {
    if (!activeId) return null;
    return elements.find(el => el.i === activeId);
  }, [activeId, elements]);

  // Render drag overlay in portal for better performance
  const dragOverlay = activeId && activeElement ? (
    <DragOverlay
      modifiers={modifiers}
      dropAnimation={null} // Disable drop animation for better performance
    >
      <div 
        style={{
          opacity: 0.9,
          backgroundColor: '#2a2a2a',
          border: '2px solid #4a90e2',
          borderRadius: '4px',
          padding: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          cursor: 'grabbing',
          minWidth: '100px',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{activeElement.i}</div>
        {activeElement.componentId && (
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
            {activeElement.componentId}
          </div>
        )}
      </div>
    </DragOverlay>
  ) : null;

  // Only log once to avoid spam
  React.useEffect(() => {
  }, [getSortableItems]);
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
      autoScroll={{
        threshold: {
          x: 0.2,
          y: 0.2,
        },
        interval: 5,
        acceleration: 10,
      }}
    >
      <SortableContext
        items={getSortableItems(null)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
      
      {createPortal(dragOverlay, document.body)}
    </DndContext>
  );
};
import React, { useState, useMemo } from 'react';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { logDragStart, logDragEnd, logStateUpdate } from './dragDropDebugger';

// Interface for our element structure
interface Element {
  i: string;
  parent?: string | null;
  children?: string[];
  isGroup?: boolean;
  componentId?: string;
  configuration?: any;
  isVirtual?: boolean;
  [key: string]: any;
}

interface DndKitSetupProps {
  elements: Element[];
  setElements: (elements: Element[] | ((currentElements: Element[]) => Element[])) => void;
  editMode?: boolean;
}

// Sortable Item Component
const SortableItem: React.FC<{
  id: string;
  element: Element;
  children: React.ReactNode;
}> = ({ id, element, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: element.isVirtual || element.componentId === 'slot',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    outline: isDragging ? '2px solid #4a90e2' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`dnd-kit-item ${element.isGroup ? 'dnd-kit-container' : ''}`}
      data-id={id}
    >
      {children}
    </div>
  );
};

// Main DndKit Setup Component
export const DndKitSetup: React.FC<DndKitSetupProps> = ({
  elements,
  setElements,
  editMode = true,
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get root level elements (elements without parent)
  const rootElements = useMemo(() => {
    return elements.filter(el => !el.parent || el.parent === null);
  }, [elements]);

  // Get children of a specific parent
  const getChildren = (parentId: string | null) => {
    if (!parentId) {
      return elements.filter(el => !el.parent || el.parent === null);
    }
    return elements.filter(el => el.parent === parentId);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    
    logDragStart(String(active.id), 'unknown');

  };

  // Handle drag over (for container detection)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // We'll implement container detection here later
    
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over || active.id === over.id) {
      
      return;
    }

    logDragEnd(String(active.id), String(over.id), 'unknown');
    

    // Update elements array
    setElements((currentElements) => {
      const oldIndex = currentElements.findIndex(el => el.i === active.id);
      const newIndex = currentElements.findIndex(el => el.i === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedElements = arrayMove(currentElements, oldIndex, newIndex);
        logStateUpdate({ 
          action: 'elements_reordered', 
          movedId: active.id, 
          fromIndex: oldIndex, 
          toIndex: newIndex 
        });
        return updatedElements;
      }
      
      return currentElements;
    });
  };

  // Find the active element for the drag overlay
  const activeElement = useMemo(() => {
    if (!activeId) return null;
    return elements.find(el => el.i === activeId);
  }, [activeId, elements]);

  if (!editMode) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={rootElements.map(el => el.i)}
        strategy={rectSortingStrategy}
      >
        {/* This will be rendered inside the existing element structure */}
        {/* The SortableItem wrapper will be applied to each element */}
      </SortableContext>
      
      <DragOverlay>
        {activeId && activeElement ? (
          <div 
            className="dnd-kit-overlay"
            style={{
              opacity: 0.8,
              backgroundColor: 'rgba(74, 144, 226, 0.1)',
              border: '2px solid #4a90e2',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            <div>Dragging: {activeElement.i}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Hook to wrap existing elements with sortable functionality
export const useSortableElement = (elementId: string, element: Element) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: elementId,
    disabled: element?.isVirtual || element?.componentId === 'slot',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return {
    sortableProps: {
      ref: setNodeRef,
      style,
      ...attributes,
      ...listeners,
    },
    isDragging,
  };
};
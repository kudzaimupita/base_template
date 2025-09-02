import React, { useState, useEffect, useMemo } from 'react';
import { useTransformContext } from 'react-zoom-pan-pinch';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  UniqueIdentifier,
  Modifier,
  Modifiers,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

interface DndKitElementSetupProps {
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

    // When scale is not 1, we need to adjust the transform
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

export const DndKitElementSetup: React.FC<DndKitElementSetupProps> = ({
  elements,
  setElements,
  setSortableOperationState,
  isSortableCurrentlyActive,
  children,
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Get the actual scale from the TransformWrapper context if available
  let transformContext;
  try {
    transformContext = useTransformContext();
  } catch (e) {
    // Not inside a TransformWrapper, that's okay
    transformContext = null;
  }
  const scale = transformContext?.transformState ? Math.round(transformContext.transformState.scale * 100) : 100;

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 * (scale / 100), // Adjust activation distance based on scale
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

  // Get only the root level elements (elements without parent)
  const rootElements = useMemo(() => {
    return elements.filter((el) => !el.parent || el.parent === null);
  }, [elements]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setSortableOperationState?.(true);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setSortableOperationState?.(false);

    if (!over || active.id === over.id) {
      return;
    }


    // Update elements array
    setElements((currentElements) => {
      const oldIndex = currentElements.findIndex((el) => el.i === active.id);
      const newIndex = currentElements.findIndex((el) => el.i === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        return arrayMove(currentElements, oldIndex, newIndex);
      }

      return currentElements;
    });
  };

  // Find the active element for the drag overlay
  const activeElement = useMemo(() => {
    if (!activeId) return null;
    return elements.find((el) => el.i === activeId);
  }, [activeId, elements]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      <SortableContext items={rootElements.map((el) => el.i)} strategy={rectSortingStrategy}>
        {/* Render children which will have access to sortable context */}
        {children}
      </SortableContext>

      <DragOverlay modifiers={modifiers}>
        {activeId && activeElement
          ? null
          : // <div
            //   style={{
            //     opacity: 0.8,
            //     backgroundColor: 'rgba(74, 144, 226, 0.1)',
            //     border: '2px solid #4a90e2',
            //     borderRadius: '4px',
            //     padding: '8px',
            //     color: 'white',
            //   }}
            // >
            //   <div>Dragging: {activeElement.i}</div>
            //   {activeElement.componentId && (
            //     <div style={{ fontSize: '12px', opacity: 0.7 }}>
            //       Type: {activeElement.componentId}
            //     </div>
            //   )}
            // </div>
            null}
      </DragOverlay>
    </DndContext>
  );
};

import React, { useState, useMemo, useCallback } from 'react';
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
  Modifier,
  Modifiers,
  ClientRect,
  ViewRect,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ScaledDndProps {
  scale: number; // Scale percentage (e.g., 40 = 40%, 100 = 100%)
}

// Create a custom modifier that accounts for scale
const createScaleModifier = (scale: number): Modifier => {
  return ({ transform, activatorEvent, active, over }) => {
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

// Custom sortable item that handles scale
const ScaledSortableItem = ({ 
  id, 
  children, 
  scale 
}: { 
  id: string; 
  children: React.ReactNode;
  scale: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Adjust transform based on scale
  const scaleValue = scale / 100;
  const adjustedTransform = transform ? {
    x: transform.x / scaleValue,
    y: transform.y / scaleValue,
  } : null;

  const style = {
    transform: adjustedTransform ? CSS.Transform.toString({
      ...adjustedTransform,
      scaleX: transform?.scaleX || 1,
      scaleY: transform?.scaleY || 1,
    }) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="scaled-sortable-item"
    >
      {children}
    </div>
  );
};

// Main scaled DndKit component
export const DndKitScaled: React.FC<ScaledDndProps> = ({ scale: propScale = 100 }) => {
  // Get the actual scale from the TransformWrapper context if available
  let transformContext;
  try {
    transformContext = useTransformContext();
  } catch (e) {
    // Not inside a TransformWrapper, that's okay
    transformContext = null;
  }
  const scale = transformContext?.transformState ? Math.round(transformContext.transformState.scale * 100) : propScale;
  
  const [items, setItems] = useState([
    { id: 'scaled-1', content: 'Scaled Element 1' },
    { id: 'scaled-2', content: 'Scaled Element 2' },
    { id: 'scaled-3', content: 'Scaled Element 3' },
    { id: 'scaled-4', content: 'Scaled Element 4' },
    { id: 'scaled-5', content: 'Scaled Element 5' },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors with scale-aware pointer sensor
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }


    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        return arrayMove(items, oldIndex, newIndex);
      }
      return items;
    });
  };

  const activeItem = items.find((item) => item.id === activeId);
  const scaleValue = scale / 100;

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      minHeight: '400px',
    }}>
      <div style={{ marginBottom: '20px', color: 'white' }}>
        <h2>DndKit - Scale Aware (Current Scale: {scale}%)</h2>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>
          This example handles drag and drop at different zoom levels
        </p>
      </div>

      {/* Container that will be scaled */}
      <div style={{
        transform: `scale(${scaleValue})`,
        transformOrigin: 'top left',
        width: `${100 / scaleValue}%`,
        border: '2px dashed #555',
        borderRadius: '4px',
        padding: '20px',
        backgroundColor: '#222',
      }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={modifiers}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((item) => (
                <ScaledSortableItem key={item.id} id={item.id} scale={scale}>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      color: 'white',
                    }}
                  >
                    {item.content}
                  </div>
                </ScaledSortableItem>
              ))}
            </div>
          </SortableContext>

          <DragOverlay
            modifiers={modifiers}
            style={{
              transform: `scale(${scaleValue})`,
              transformOrigin: 'top left',
            }}
          >
            {activeItem ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#3a3a3a',
                  border: '2px solid #4a90e2',
                  borderRadius: '4px',
                  color: 'white',
                  opacity: 0.8,
                  cursor: 'grabbing',
                }}
              >
                {activeItem.content}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div style={{ marginTop: '20px', color: 'white' }}>
        <h3>Test Different Scales:</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {[25, 40, 50, 75, 100, 125, 150].map((testScale) => (
            <button
              key={testScale}
              onClick={() => {
                // This would normally come from your zoom controls
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: scale === testScale ? '#4a90e2' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {testScale}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Hook to integrate with your existing scale system
export const useScaledDnd = (scale: number) => {
  const scaleValue = scale / 100;

  // Create scale-adjusted modifiers
  const modifiers = useMemo<Modifiers>(() => {
    return [createScaleModifier(scale)];
  }, [scale]);

  // Create scale-adjusted sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: Math.max(8 * scaleValue, 3), // Minimum 3px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to adjust coordinates based on scale
  const adjustCoordinates = useCallback((x: number, y: number) => {
    return {
      x: x / scaleValue,
      y: y / scaleValue,
    };
  }, [scaleValue]);

  return {
    sensors,
    modifiers,
    scaleValue,
    adjustCoordinates,
  };
};
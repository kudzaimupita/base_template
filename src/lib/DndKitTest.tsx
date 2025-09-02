import React, { useState } from 'react';
import { DndKitNested } from './DndKitNested';
import { DndKitScaled } from './DndKitScaled';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Simple sortable item component
const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
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
      className="cube"
    >
      {children}
    </div>
  );
};

interface DndKitTestProps {
  scale?: number; // Pass the scale from the builder
}

// Test component to demonstrate basic drag and drop
export const DndKitTest: React.FC<DndKitTestProps> = ({ scale: propScale }) => {
  const [showNested, setShowNested] = useState(false);
  const [showScaled, setShowScaled] = useState(false);
  
  // Get the actual scale from the TransformWrapper context
  let transformContext;
  try {
    transformContext = useTransformContext();
  } catch (e) {
    // Not inside a TransformWrapper, that's okay
    transformContext = null;
  }
  const scale = transformContext?.transformState ? Math.round(transformContext.transformState.scale * 100) : (propScale || 100);
  // Test data - simple elements
  const [items, setItems] = useState([
    { id: 'item-1', content: 'Element 1' },
    { id: 'item-2', content: 'Element 2' },
    { id: 'item-3', content: 'Element 3' },
    { id: 'item-4', content: 'Element 4' },
    { id: 'item-5', content: 'Element 5' },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  if (showNested) {
    return <DndKitNested onBack={() => setShowNested(false)} />;
  }

  if (showScaled) {
    return (
      <div>
        <button
          onClick={() => setShowScaled(false)}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            padding: '8px 16px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <DndKitScaled scale={scale} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'white', margin: 0 }}>DndKit Test - Simple List</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowScaled(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Scale Test (Current: {scale}%) →
          </button>
          <button
            onClick={() => setShowNested(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Nested Example →
          </button>
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id}>
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
              </SortableItem>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
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

      <div style={{ marginTop: '40px', color: 'white' }}>
        <h3>Current Order:</h3>
        <pre>{JSON.stringify(items.map(item => item.id), null, 2)}</pre>
      </div>
    </div>
  );
};
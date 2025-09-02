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
  CollisionDetection,
  rectIntersection,
  getFirstCollision,
  pointerWithin,
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

interface TreeItem {
  id: string;
  children?: string[];
  content: string;
  isContainer?: boolean;
}

interface FlatItem extends TreeItem {
  parentId: string | null;
  depth: number;
}

// Sortable item that can also be a container
const SortableTreeItem = ({
  id,
  item,
  children,
  depth = 0,
}: {
  id: string;
  item: TreeItem;
  children?: React.ReactNode;
  depth?: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id,
    data: {
      type: item.isContainer ? 'container' : 'item',
      item,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="sortable-tree-item"
      data-depth={depth}
    >
      <div
        style={{
          padding: '12px',
          marginLeft: `${depth * 20}px`,
          backgroundColor: item.isContainer ? '#2a2a2a' : '#3a3a3a',
          border: `2px solid ${isOver ? '#4a90e2' : item.isContainer ? '#555' : '#444'}`,
          borderRadius: '4px',
          marginBottom: '4px',
          cursor: 'move',
          color: 'white',
        }}
      >
        <div style={{ fontWeight: item.isContainer ? 'bold' : 'normal' }}>
          {item.isContainer ? '📁 ' : '📄 '} {item.content}
        </div>
        {item.isContainer && (
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
            {item.children?.length || 0} items
          </div>
        )}
      </div>
      {children && (
        <div style={{ marginTop: '4px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

interface DndKitNestedProps {
  onBack?: () => void;
}

export const DndKitNested: React.FC<DndKitNestedProps> = ({ onBack }) => {
  // Hierarchical data structure
  const [items, setItems] = useState<TreeItem[]>([
    { id: 'container-1', content: 'Container 1', isContainer: true, children: ['item-1', 'item-2'] },
    { id: 'item-1', content: 'Item 1' },
    { id: 'item-2', content: 'Item 2' },
    { id: 'container-2', content: 'Container 2', isContainer: true, children: ['item-3'] },
    { id: 'item-3', content: 'Item 3' },
    { id: 'item-4', content: 'Item 4 (root level)' },
    { id: 'container-3', content: 'Container 3 (empty)', isContainer: true, children: [] },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  // Create a flat structure for easier manipulation
  const flattenTree = (items: TreeItem[]): FlatItem[] => {
    const flat: FlatItem[] = [];
    const itemMap = new Map(items.map(item => [item.id, item]));
    
    // Add root items first
    items.forEach(item => {
      const isRoot = !items.some(parent => 
        parent.children?.includes(item.id)
      );
      if (isRoot) {
        flat.push({ ...item, parentId: null, depth: 0 });
      }
    });

    // Add children recursively
    const addChildren = (parentId: string, depth: number) => {
      const parent = itemMap.get(parentId);
      if (parent?.children) {
        parent.children.forEach(childId => {
          const child = itemMap.get(childId);
          if (child) {
            flat.push({ ...child, parentId, depth });
            if (child.isContainer) {
              addChildren(childId, depth + 1);
            }
          }
        });
      }
    };

    flat.forEach(item => {
      if (item.isContainer && item.children) {
        addChildren(item.id, 1);
      }
    });

    return flat;
  };

  const flatItems = useMemo(() => flattenTree(items), [items]);

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
    logDragStart(String(event.active.id), 'unknown');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeItem = items.find(item => item.id === active.id);
    const overItem = items.find(item => item.id === over.id);
    
    // Log container detection
    if (overItem?.isContainer) {
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeItem = items.find(item => item.id === active.id);
    const overItem = items.find(item => item.id === over.id);

    if (!activeItem) return;

    logDragEnd(String(active.id), String(over.id), 'nested');

    setItems(currentItems => {
      const newItems = [...currentItems];
      
      // Remove active item from its current parent
      newItems.forEach(item => {
        if (item.children?.includes(String(active.id))) {
          item.children = item.children.filter(id => id !== active.id);
        }
      });

      // If dropping on a container, add to it
      if (overItem?.isContainer) {
        const container = newItems.find(item => item.id === over.id);
        if (container) {
          if (!container.children) container.children = [];
          container.children.push(String(active.id));
        }
      } else {
        // Otherwise, reorder at root level or within same parent
        const activeIndex = newItems.findIndex(item => item.id === active.id);
        const overIndex = newItems.findIndex(item => item.id === over.id);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          return arrayMove(newItems, activeIndex, overIndex);
        }
      }

      logStateUpdate({ 
        action: 'nested_update', 
        movedId: active.id,
        targetId: over.id,
        isContainer: overItem?.isContainer 
      });

      return newItems;
    });
  };

  const activeItem = items.find(item => item.id === activeId);

  // Render tree recursively
  const renderTree = (parentId: string | null = null, depth: number = 0) => {
    const children = flatItems.filter(item => item.parentId === parentId);
    
    if (children.length === 0 && parentId) {
      return (
        <div style={{ 
          padding: '8px', 
          marginLeft: `${(depth + 1) * 20}px`,
          opacity: 0.5,
          color: '#888',
          fontSize: '14px'
        }}>
          Drop items here...
        </div>
      );
    }

    return (
      <SortableContext
        items={children.map(child => child.id)}
        strategy={verticalListSortingStrategy}
      >
        {children.map(child => (
          <SortableTreeItem
            key={child.id}
            id={child.id}
            item={child}
            depth={depth}
          >
            {child.isContainer && renderTree(child.id, depth + 1)}
          </SortableTreeItem>
        ))}
      </SortableContext>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'white', margin: 0 }}>
          DndKit Test - Nested Containers
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ← Back to Simple
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'white', marginBottom: '10px' }}>Drag Area</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div style={{ minHeight: '400px' }}>
              {renderTree()}
            </div>

            <DragOverlay>
              {activeItem ? (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: activeItem.isContainer ? '#2a2a2a' : '#3a3a3a',
                    border: '2px solid #4a90e2',
                    borderRadius: '4px',
                    opacity: 0.8,
                    cursor: 'grabbing',
                    color: 'white',
                  }}
                >
                  {activeItem.isContainer ? '📁 ' : '📄 '} {activeItem.content}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <div style={{ width: '300px' }}>
          <h3 style={{ color: 'white', marginBottom: '10px' }}>Structure</h3>
          <pre style={{ 
            color: '#0f0', 
            backgroundColor: '#000', 
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(items.map(item => ({
              id: item.id,
              children: item.children || [],
              isContainer: item.isContainer
            })), null, 2)}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: '20px', color: '#888', fontSize: '14px' }}>
        <p>📁 = Container (can hold items)</p>
        <p>📄 = Regular item</p>
        <p>• Drag items into containers</p>
        <p>• Drag items to reorder</p>
        <p>• Containers can be nested</p>
      </div>
    </div>
  );
};
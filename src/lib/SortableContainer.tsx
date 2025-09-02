import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface SortableContainerProps {
  elements: any[];
  parentId: string | null;
  children: React.ReactNode;
}

export const SortableContainer: React.FC<SortableContainerProps> = ({
  elements,
  parentId,
  children,
}) => {
  // Get child elements for this container
  const childItems = useMemo(() => {
    return elements
      .filter(el => el.parent === parentId)
      .map(el => el.i)
      .filter(Boolean);
  }, [elements, parentId]);

  // If no children, just render the content
  if (childItems.length === 0) {
    return <>{children}</>;
  }

  return (
    <SortableContext
      items={childItems}
      strategy={verticalListSortingStrategy}
    >
      {children}
    </SortableContext>
  );
};
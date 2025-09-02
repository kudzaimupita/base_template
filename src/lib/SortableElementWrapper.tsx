import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableElementWrapperProps {
  id: string;
  disabled?: boolean;
  isContainer?: boolean;
  children: (props: any) => React.ReactElement;
}

export const SortableElementWrapper: React.FC<SortableElementWrapperProps> = ({
  id,
  disabled = false,
  isContainer = false,
  children,
}) => {
  React.useEffect(() => {
  
  }, [id, disabled, isContainer]);
  
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
    disabled,
    data: {
      isContainer,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    outline: isOver && isContainer ? '2px dashed #4a90e2' : undefined,
  };

  const sortableProps = {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
    'data-sortable-id': id,
    'data-is-container': isContainer,
  };
  


  return children(sortableProps);
};
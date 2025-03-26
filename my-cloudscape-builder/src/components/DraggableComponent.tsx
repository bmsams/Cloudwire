import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';

export interface DraggableComponentProps {
  component: any;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDrop: (id: string, atIndex: number, section: string, parentId?: string) => void;
  index: number;
  section: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onSelect,
  onRemove,
  onDrop,
  index,
  section
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { id: component.id, index, section },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }));

  const [, drop] = useDrop(() => ({
    accept: 'component',
    hover(item: any) {
      if (item.id !== component.id) {
        // If in nested mode, we pass parentId (if available)
        onDrop(item.id, index, section, component.parentId || undefined);
      }
    }
  }));

  const isSelected = false; // You may adjust based on external selectedComponent state

  const wrapperStyles: React.CSSProperties = {
    position: 'relative',
    border: isSelected ? '2px solid #0972d3' : '2px solid transparent',
    padding: '2px',
    borderRadius: '4px',
    marginBottom: '10px',
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move'
  };

  const controlsStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-15px',
    right: '0',
    display: isSelected ? 'flex' : 'none',
    zIndex: 10,
    gap: '4px'
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={wrapperStyles}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      <div style={controlsStyles}>
        <Button
          variant="icon"
          iconName="close"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(component.id);
          }}
          ariaLabel="Remove component"
        />
      </div>
      {/* Render component content from the parent */}
      <div>{component.type}</div>
    </div>
  );
};

export default DraggableComponent;

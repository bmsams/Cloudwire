// File: src/components/DraggableComponent.tsx
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import Icon from '@cloudscape-design/components/icon';
import ComponentPreview from './ComponentPreview';

export interface DraggableComponentProps {
  component: any;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDrop: (id: string, atIndex: number, section: string, parentId?: string) => void;
  index: number;
  section: string;
  isSelected?: boolean;
  previewMode?: boolean;
  darkMode?: boolean;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onSelect,
  onRemove,
  onDrop,
  index,
  section,
  isSelected = false,
  previewMode = false,
  darkMode = false
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { id: component.id, index, section },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: !previewMode // Disable dragging in preview mode
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    hover(item: any) {
      if (item.id !== component.id) {
        // If in nested mode, we pass parentId (if available)
        onDrop(item.id, index, section, component.parentId || undefined);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    }),
    canDrop: () => !previewMode // Disable dropping in preview mode
  }));

  const wrapperStyles: React.CSSProperties = {
    position: 'relative',
    border: isSelected ? '2px solid #0972d3' : isOver ? '2px dashed #0972d3' : '2px solid transparent',
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '10px',
    opacity: isDragging ? 0.5 : 1,
    cursor: previewMode ? 'default' : 'move',
    transition: 'border 0.2s ease-in-out'
  };

  const controlsStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-15px',
    right: '0',
    display: previewMode ? 'none' : isSelected ? 'flex' : 'none',
    zIndex: 10,
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '2px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
  };

  const typeIndicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-15px',
    left: '0',
    display: previewMode ? 'none' : 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 114, 211, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#0972d3',
    gap: '4px'
  };

  // For preview mode, just render the component preview
  if (previewMode) {
    return (
      <Box padding="s">
        <ComponentPreview 
          component={component} 
          darkMode={darkMode}
        />
      </Box>
    );
  }

  return (
    <div
      ref={(node) => drag(drop(node)) as any}
      style={wrapperStyles}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      <div style={typeIndicatorStyles}>
        <Icon name={getIconForComponentType(component.type)} />
        <span>{component.type}</span>
      </div>
      
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
        {component.children && (
          <Button
            variant="icon"
            iconName="add-plus"
            onClick={(e) => {
              e.stopPropagation();
              // Handle adding nested component
            }}
            ariaLabel="Add nested component"
          />
        )}
      </div>
      
      {/* Component preview */}
      <Box padding="s">
        <ComponentPreview 
          component={component} 
          darkMode={darkMode}
        />
      </Box>
    </div>
  );
};

// Helper function to get appropriate icon for component type
function getIconForComponentType(type: string): string {
  const iconMap: Record<string, string> = {
    container: 'folder',
    grid: 'view-vertical',
    'column-layout': 'view-horizontal',
    button: 'settings',
    input: 'edit',
    checkbox: 'check',
    'radio-group': 'radio-button',
    select: 'caret-down',
    multiselect: 'multiselect',
    'date-picker': 'calendar',
    table: 'table',
    cards: 'contact',
    header: 'file',
    badge: 'status-positive',
    alert: 'notification',
    spinner: 'refresh',
    'side-navigation': 'menu',
    'breadcrumb-group': 'chevron-right',
    tabs: 'folder-open',
    'help-panel': 'question',
    modal: 'external'
  };
  
  return iconMap[type] || 'default';
}

export default DraggableComponent;
// File: src/components/DroppableSection.tsx
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import SegmentedControl from '@cloudscape-design/components/segmented-control';
import DraggableComponent from './DraggableComponent';

interface DroppableSectionProps {
  section: string;
  components: any[];
  darkMode: boolean;
  onDrop: (id: string, atIndex: number, section: string) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  previewMode?: boolean;
  selectedComponentId?: string;
}

const DroppableSection: React.FC<DroppableSectionProps> = ({
  section,
  components,
  darkMode,
  onDrop,
  onSelect,
  onRemove,
  previewMode = false,
  selectedComponentId
}) => {
  const [viewMode, setViewMode] = useState<'default' | 'compact'>('default');

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: any, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        onDrop((item as any).id, components.length, section);
      }
      return { section };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    }),
    canDrop: () => !previewMode // Disable dropping in preview mode
  }));

  const sectionStyle: React.CSSProperties = {
    minHeight: '400px',
    border: isOver && canDrop ? '2px dashed #0972d3' : '1px dashed #ccc',
    padding: '20px',
    backgroundColor: darkMode ? '#0f1b2a' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    transition: 'background-color 0.3s, color 0.3s, border 0.2s ease-in-out',
    borderRadius: '4px'
  };

  // Helper function to render a specific component
  const renderComponentWithChildren = (component: any, index: number) => {
    return (
      <DraggableComponent
        key={component.id}
        component={component}
        onSelect={onSelect}
        onRemove={onRemove}
        onDrop={onDrop}
        index={index}
        section={section}
        isSelected={component.id === selectedComponentId}
        previewMode={previewMode}
        darkMode={darkMode}
      />
    );
  };

  return (
    <div>
      {!previewMode && (
        <Box float="right" padding="xs">
          <SegmentedControl
            selectedId={viewMode}
            onChange={({ detail }) => setViewMode(detail.selectedId as 'default' | 'compact')}
            options={[
              { id: 'default', text: 'Default View' },
              { id: 'compact', text: 'Compact' }
            ]}
          />
        </Box>
      )}
      
      <div
        ref={drop}
        style={sectionStyle}
        className={viewMode === 'compact' ? 'compact-view' : ''}
      >
        <SpaceBetween size={viewMode === 'compact' ? 'xs' : 'l'}>
          {components.length === 0 ? (
            <Box textAlign="center" color="text-status-inactive">
              <Box variant="h3" padding="s">
                {previewMode 
                  ? `No ${section} components yet` 
                  : `Add ${section} components from the left sidebar`}
              </Box>
              {!previewMode && (
                <Box variant="p">Click on components to edit their properties</Box>
              )}
            </Box>
          ) : (
            components.map((component, index) => renderComponentWithChildren(component, index))
          )}
        </SpaceBetween>
      </div>
    </div>
  );
};

export default DroppableSection;
import React from 'react';
import { useDrop } from 'react-dnd';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';

interface DroppableSectionProps {
  section: string;
  components: any[];
  darkMode: boolean;
  onDrop: (id: string, atIndex: number, section: string) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const DroppableSection: React.FC<DroppableSectionProps> = ({
  section,
  components,
  darkMode,
  onDrop,
  onSelect,
  onRemove
}) => {
  const [, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        onDrop((item as any).id, components.length, section);
      }
      return { section };
    }
  }));

  return (
    <div
      ref={drop}
      style={{
        minHeight: '400px',
        border: '1px dashed #ccc',
        padding: '20px',
        backgroundColor: darkMode ? '#0f1b2a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        transition: 'background-color 0.3s, color 0.3s'
      }}
    >
      <SpaceBetween size="l">
        {components.length === 0 ? (
          <Box textAlign="center" color="text-status-inactive">
            <Box variant="h3" padding="s">
              Add {section} components from the left sidebar
            </Box>
            <Box variant="p">Click on components to edit their properties</Box>
          </Box>
        ) : (
          components.map((component, index) => (
            // You can import and use DraggableComponent here if needed
            <div key={component.id}>{component.type}</div>
          ))
        )}
      </SpaceBetween>
    </div>
  );
};

export default DroppableSection;

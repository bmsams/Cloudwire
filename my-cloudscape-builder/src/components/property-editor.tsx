// File: src/components/PropertyEditor.tsx
import React from 'react';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Checkbox from '@cloudscape-design/components/checkbox';
import Select from '@cloudscape-design/components/select';
import Textarea from '@cloudscape-design/components/textarea';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import { componentLibrary } from '../config/componentLibrary';

interface PropertyEditorProps {
  component: any;
  properties: any;
  onPropertyChange: (key: string, value: any) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ 
  component, 
  properties, 
  onPropertyChange 
}) => {
  // Get component definition from library
  const componentDef = componentLibrary.find(c => c.id === component.type);
  if (!componentDef) {
    return <div>Component definition not found</div>;
  }

  // Render appropriate input based on property type
  const renderPropertyInput = (key: string, value: any) => {
    const propType = componentDef.propertyTypes[key];
    
    // Handle simple types
    if (propType === 'string') {
      return (
        <Input
          value={value?.toString() || ''}
          onChange={({ detail }) => onPropertyChange(key, detail.value)}
        />
      );
    }
    
    if (propType === 'number') {
      return (
        <Input
          type="number"
          value={value?.toString() || '0'}
          onChange={({ detail }) => onPropertyChange(key, parseFloat(detail.value) || 0)}
        />
      );
    }
    
    if (propType === 'boolean') {
      return (
        <Checkbox
          checked={!!value}
          onChange={({ detail }) => onPropertyChange(key, detail.checked)}
        >
          Enabled
        </Checkbox>
      );
    }
    
    if (propType === 'textarea') {
      return (
        <Textarea
          value={value?.toString() || ''}
          onChange={({ detail }) => onPropertyChange(key, detail.value)}
          rows={3}
        />
      );
    }
    
    // Handle select type
    if (typeof propType === 'object' && propType.type === 'select') {
      return (
        <Select
          selectedOption={propType.options.find((opt: any) => opt.value === value) || null}
          options={propType.options}
          onChange={({ detail }) => onPropertyChange(key, detail.selectedOption?.value)}
        />
      );
    }
    
    // Handle object and array types
    if (propType === 'object' || propType === 'array') {
      const stringifiedValue = JSON.stringify(value, null, 2);
      return (
        <SpaceBetween size="xs">
          <Textarea
            value={stringifiedValue}
            onChange={({ detail }) => {
              try {
                const parsedValue = JSON.parse(detail.value);
                onPropertyChange(key, parsedValue);
              } catch (e) {
                // Handle invalid JSON - show error or just don't update the value
              }
            }}
            rows={5}
          />
          <div>Enter valid JSON</div>
        </SpaceBetween>
      );
    }
    
    // Fallback to basic input
    return (
      <Input
        value={value?.toString() || ''}
        onChange={({ detail }) => onPropertyChange(key, detail.value)}
      />
    );
  };

  return (
    <Form>
      <SpaceBetween size="l">
        {Object.entries(properties).map(([key, value]) => (
          <FormField key={key} label={key}>
            {renderPropertyInput(key, value)}
          </FormField>
        ))}
        {componentDef.allowsNesting && (
          <FormField label="Nested Components">
            <Button iconName="add-plus" variant="normal">
              Add Nested Component
            </Button>
          </FormField>
        )}
      </SpaceBetween>
    </Form>
  );
};

export default PropertyEditor;
// File: src/components/ComponentPreview.tsx
import React from 'react';

// Import all Cloudscape components that can be previewed
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Input from '@cloudscape-design/components/input';
import Checkbox from '@cloudscape-design/components/checkbox';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Select from '@cloudscape-design/components/select';
import Multiselect from '@cloudscape-design/components/multiselect';
import DatePicker from '@cloudscape-design/components/date-picker';
import Grid from '@cloudscape-design/components/grid';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Cards from '@cloudscape-design/components/cards';
import Badge from '@cloudscape-design/components/badge';
import Alert from '@cloudscape-design/components/alert';
import Spinner from '@cloudscape-design/components/spinner';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Tabs from '@cloudscape-design/components/tabs';
import FormField from '@cloudscape-design/components/form-field';
import Modal from '@cloudscape-design/components/modal';
import HelpPanel from '@cloudscape-design/components/help-panel';

interface ComponentPreviewProps {
  component: any;
  darkMode: boolean;
  onAction?: (action: string, data?: any) => void;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ 
  component, 
  darkMode,
  onAction = () => {} 
}) => {
  // Recursive function to render components and their children
  const renderComponent = (comp: any): React.ReactNode => {
    switch (comp.type) {
      case 'container':
        return (
          <Container
            header={comp.props.header ? <Header>{comp.props.header}</Header> : undefined}
            footer={comp.props.footer || undefined}
            disableContentPaddings={comp.props.disableContentPaddings}
          >
            {comp.children && comp.children.length > 0 ? (
              <SpaceBetween size="m">
                {comp.children.map((child: any) => renderComponent(child))}
              </SpaceBetween>
            ) : (
              <Box textAlign="center" color="text-status-inactive">Container content</Box>
            )}
          </Container>
        );
      
      case 'grid':
        const gridDefinition = comp.props.gridDefinition || [{ colspan: 12 }];
        return (
          <Grid gridDefinition={gridDefinition}>
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((child: any, index: number) => (
                <div key={child.id || index}>{renderComponent(child)}</div>
              ))
            ) : (
              gridDefinition.map((col: any, index: number) => (
                <Box 
                  key={index}
                  padding="m" 
                  textAlign="center" 
                  color="text-status-inactive"
                  border="dotted"
                >
                  Column {index + 1}
                </Box>
              ))
            )}
          </Grid>
        );

      case 'column-layout':
        return (
          <ColumnLayout columns={comp.props.columns || 2}>
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((child: any) => renderComponent(child))
            ) : (
              Array.from({ length: comp.props.columns || 2 }).map((_, index) => (
                <Box 
                  key={index}
                  padding="m" 
                  textAlign="center" 
                  color="text-status-inactive"
                  border="dotted"
                >
                  Column {index + 1}
                </Box>
              ))
            )}
          </ColumnLayout>
        );
      
      case 'button':
        return (
          <Button
            variant={comp.props.variant || 'normal'}
            disabled={comp.props.disabled}
            iconName={comp.props.iconName}
            onClick={() => {
              if (comp.props.onClick === 'openModal' && comp.props.modalId) {
                onAction('openModal', comp.props.modalId);
              } else {
                onAction('buttonClick', comp.id);
              }
            }}
          >
            {comp.props.children || 'Button'}
          </Button>
        );
      
      case 'input':
        return (
          <Input
            value={comp.props.value || ''}
            placeholder={comp.props.placeholder}
            disabled={comp.props.disabled}
            type={comp.props.type || 'text'}
            onChange={() => {}} // In preview mode, we don't need to handle changes
          />
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={comp.props.checked || false}
            onChange={() => {}} // In preview mode, we don't need to handle changes
          >
            {comp.props.label || 'Checkbox label'}
          </Checkbox>
        );
      
      case 'radio-group':
        return (
          <RadioGroup
            value={comp.props.value || ''}
            items={comp.props.items || [{ value: 'option1', label: 'Option 1' }]}
            onChange={() => {}} // In preview mode, we don't need to handle changes
          />
        );
      
      case 'select':
        return (
          <Select
            selectedOption={comp.props.selectedOption || null}
            options={comp.props.options || []}
            placeholder={comp.props.placeholder}
            onChange={() => {}} // In preview mode, we don't need to handle changes
          />
        );
      
      case 'multiselect':
        return (
          <Multiselect
            selectedOptions={comp.props.selectedOptions || []}
            options={comp.props.options || []}
            placeholder={comp.props.placeholder}
            onChange={() => {}} // In preview mode, we don't need to handle changes
          />
        );
      
      case 'date-picker':
        return (
          <DatePicker
            value={comp.props.value || ''}
            placeholder={comp.props.placeholder}
            onChange={() => {}} // In preview mode, we don't need to handle changes
          />
        );
      
      case 'table':
        return (
          <Table
            columnDefinitions={comp.props.columnDefinitions || [
              { id: 'col1', header: 'Column 1', cell: () => 'Value' }
            ]}
            items={comp.props.items || [{ id: 'item1' }]}
            loading={comp.props.loading}
          />
        );
      
      case 'cards':
        return (
          <Cards
            cardDefinition={comp.props.cardDefinition}
            items={comp.props.items || []}
            loading={comp.props.loading}
          />
        );
      
      case 'header':
        return (
          <Header
            variant={comp.props.variant}
            description={comp.props.description}
          >
            {comp.props.children || 'Header text'}
          </Header>
        );
      
      case 'badge':
        return (
          <Badge color={comp.props.color || 'blue'}>
            {comp.props.children || 'Badge'}
          </Badge>
        );
      
      case 'alert':
        return (
          <Alert
            type={comp.props.type || 'info'}
            header={comp.props.header}
          >
            {comp.props.children || 'Alert content'}
          </Alert>
        );
      
      case 'spinner':
        return <Spinner size={comp.props.size || 'normal'} />;
      
      case 'side-navigation':
        return (
          <SideNavigation
            header={comp.props.header}
            items={comp.props.items || []}
            onFollow={() => {}} // In preview mode, we don't need to handle navigation
          />
        );
      
      case 'breadcrumb-group':
        return (
          <BreadcrumbGroup
            items={comp.props.items || []}
            onFollow={() => {}} // In preview mode, we don't need to handle navigation
          />
        );
      
      case 'tabs':
        return (
          <Tabs
            tabs={comp.props.tabs || [
              { id: 'tab1', label: 'Tab 1', content: 'Tab 1 content' }
            ]}
            onChange={() => {}} // In preview mode, we don't need to handle tab changes
          />
        );
      
      case 'help-panel':
        return (
          <HelpPanel
            header={comp.props.header || 'Help'}
          >
            {comp.props.children || 'Help content'}
          </HelpPanel>
        );
      
      // Add more component types as needed
      
      default:
        return (
          <Box padding="m" textAlign="center" color="text-status-inactive">
            {comp.type} component (preview not available)
          </Box>
        );
    }
  };

  return (
    <div style={{ 
      backgroundColor: darkMode ? '#0f1b2a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
      padding: '10px',
      borderRadius: '4px',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {renderComponent(component)}
    </div>
  );
};

export default ComponentPreview;
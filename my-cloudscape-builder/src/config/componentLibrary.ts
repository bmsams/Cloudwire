// Define the component library for the builder
export interface ComponentDefinition {
    id: string;
    name: string;
    icon: string;
    category: string;
    sections: string[];
    allowsNesting?: boolean;
    defaultProps: any;
    propertyTypes: any;
  }
  
  export const componentLibrary: ComponentDefinition[] = [
    // Layout Components
    {
      id: 'container',
      name: 'Container',
      icon: 'folder',
      category: 'layout',
      sections: ['content', 'tools', 'modal', 'nested'],
      allowsNesting: true,
      defaultProps: { header: 'Container header', footer: '', disableContentPaddings: false },
      propertyTypes: { header: 'string', footer: 'string', disableContentPaddings: 'boolean' }
    },
    {
      id: 'grid',
      name: 'Grid',
      icon: 'view-vertical',
      category: 'layout',
      sections: ['content', 'tools', 'modal', 'nested'],
      allowsNesting: true,
      defaultProps: { gridDefinition: [{ colspan: 6 }, { colspan: 6 }] },
      propertyTypes: { gridDefinition: 'array' }
    },
    {
      id: 'column-layout',
      name: 'Column Layout',
      icon: 'view-horizontal',
      category: 'layout',
      sections: ['content', 'tools', 'modal', 'nested'],
      allowsNesting: true,
      defaultProps: { columns: 2 },
      propertyTypes: { columns: 'number' }
    },
    // Navigation Components
    {
      id: 'side-navigation',
      name: 'Side Navigation',
      icon: 'menu',
      category: 'navigation',
      sections: ['navigation'],
      defaultProps: {
        header: { text: 'Navigation' },
        items: [{ type: 'section', text: 'Section 1', items: [{ type: 'link', text: 'Link 1', href: '#' }, { type: 'link', text: 'Link 2', href: '#' }] }]
      },
      propertyTypes: { header: 'object', items: 'array' }
    },
    {
      id: 'breadcrumb-group',
      name: 'Breadcrumbs',
      icon: 'chevron-right',
      category: 'navigation',
      sections: ['breadcrumbs'],
      defaultProps: { items: [{ text: 'Home', href: '#' }, { text: 'Current Page', href: '#' }] },
      propertyTypes: { items: 'array' }
    },
    {
      id: 'tabs',
      name: 'Tabs',
      icon: 'folder-open',
      category: 'navigation',
      sections: ['content', 'tools', 'modal', 'nested'],
      allowsNesting: true,
      defaultProps: { tabs: [{ id: 'tab1', label: 'Tab 1', content: 'Tab 1 content' }, { id: 'tab2', label: 'Tab 2', content: 'Tab 2 content' }] },
      propertyTypes: { tabs: 'array' }
    },
    {
      id: 'top-navigation',
      name: 'Top Navigation',
      icon: 'menu-horizontal',
      category: 'navigation',
      sections: ['navigation'],
      defaultProps: { identity: { href: '#', title: 'Service Name' }, utilities: [] },
      propertyTypes: { identity: 'object', utilities: 'array' }
    },
    // Input Components
    {
      id: 'button',
      name: 'Button',
      icon: 'settings',
      category: 'input',
      sections: ['content', 'tools', 'navigation', 'modal', 'nested'],
      defaultProps: { children: 'Button text', variant: 'primary', disabled: false, onClick: '' },
      propertyTypes: {
        children: 'string',
        variant: { type: 'select', options: [{ value: 'primary', label: 'Primary' }, { value: 'normal', label: 'Normal' }, { value: 'link', label: 'Link' }, { value: 'icon', label: 'Icon' }] },
        disabled: 'boolean',
        onClick: { type: 'select', options: [{ value: '', label: 'No action' }, { value: 'openModal', label: 'Open modal' }] }
      }
    },
    {
      id: 'input',
      name: 'Input',
      icon: 'edit',
      category: 'input',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { value: '', placeholder: 'Enter text...', disabled: false, type: 'text' },
      propertyTypes: {
        value: 'string',
        placeholder: 'string',
        disabled: 'boolean',
        type: { type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'number', label: 'Number' }, { value: 'email', label: 'Email' }, { value: 'password', label: 'Password' }] }
      }
    },
    {
      id: 'checkbox',
      name: 'Checkbox',
      icon: 'check',
      category: 'input',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { checked: false, label: 'Checkbox label' },
      propertyTypes: { checked: 'boolean', label: 'string' }
    },
    {
      id: 'radio-group',
      name: 'Radio Group',
      icon: 'radio-button',
      category: 'input',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { value: 'option1', items: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }] },
      propertyTypes: { value: 'string', items: 'array' }
    },
    {
      id: 'select',
      name: 'Select',
      icon: 'caret-down',
      category: 'input',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { selectedOption: { value: 'option1', label: 'Option 1' }, options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }], placeholder: 'Choose an option' },
      propertyTypes: { selectedOption: 'object', options: 'array', placeholder: 'string' }
    },
    {
      id: 'multiselect',
      name: 'Multiselect',
      icon: 'multiselect',
      category: 'input',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { selectedOptions: [], options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }], placeholder: 'Choose options' },
      propertyTypes: { selectedOptions: 'array', options: 'array', placeholder: 'string' }
    },
    {
      id: 'date-picker',
      name: 'Date Picker',
      icon: 'calendar',
      category: 'input',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { value: '', placeholder: 'YYYY/MM/DD' },
      propertyTypes: { value: 'string', placeholder: 'string' }
    },
    // Data Display Components
    {
      id: 'table',
      name: 'Table',
      icon: 'table',
      category: 'data',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { columnDefinitions: [{ id: 'col1', header: 'Column 1', cell: (row: any) => row.col1 }, { id: 'col2', header: 'Column 2', cell: (row: any) => row.col2 }], items: [{ col1: 'Value 1', col2: 'Value 2' }, { col1: 'Value 3', col2: 'Value 4' }], loading: false },
      propertyTypes: { columnDefinitions: 'array', items: 'array', loading: 'boolean' }
    },
    {
      id: 'cards',
      name: 'Cards',
      icon: 'contact',
      category: 'data',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { cardDefinition: { header: (item: any) => item.name, sections: [{ id: 'description', header: 'Description', content: (item: any) => item.description }] }, items: [{ name: 'Card 1', description: 'Description 1' }, { name: 'Card 2', description: 'Description 2' }], loading: false },
      propertyTypes: { cardDefinition: 'object', items: 'array', loading: 'boolean' }
    },
    {
      id: 'header',
      name: 'Header',
      icon: 'file',
      category: 'data',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { children: 'Header text', variant: 'h2', description: '' },
      propertyTypes: {
        children: 'string',
        variant: { type: 'select', options: [{ value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' }, { value: 'h3', label: 'H3' }] },
        description: 'string'
      }
    },
    {
      id: 'badge',
      name: 'Badge',
      icon: 'status-positive',
      category: 'data',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { children: 'Status', color: 'blue' },
      propertyTypes: {
        children: 'string',
        color: { type: 'select', options: [{ value: 'blue', label: 'Blue' }, { value: 'grey', label: 'Grey' }, { value: 'green', label: 'Green' }, { value: 'red', label: 'Red' }, { value: 'yellow', label: 'Yellow' }] }
      }
    },
    // Feedback Components
    {
      id: 'alert',
      name: 'Alert',
      icon: 'notification',
      category: 'feedback',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { header: 'Alert header', type: 'info', children: 'Alert content goes here' },
      propertyTypes: {
        header: 'string',
        type: { type: 'select', options: [{ value: 'success', label: 'Success' }, { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }, { value: 'info', label: 'Info' }] },
        children: 'textarea'
      }
    },
    {
      id: 'flashbar',
      name: 'Flashbar',
      icon: 'status-info',
      category: 'feedback',
      sections: ['notifications'],
      defaultProps: { items: [{ type: 'success', content: 'Operation successful', dismissible: true }] },
      propertyTypes: { items: 'array' }
    },
    {
      id: 'spinner',
      name: 'Spinner',
      icon: 'refresh',
      category: 'feedback',
      sections: ['content', 'tools', 'modal', 'nested'],
      defaultProps: { size: 'normal' },
      propertyTypes: { size: { type: 'select', options: [{ value: 'normal', label: 'Normal' }, { value: 'big', label: 'Big' }, { value: 'large', label: 'Large' }] } }
    },
    {
      id: 'modal',
      name: 'Modal',
      icon: 'external',
      category: 'feedback',
      sections: ['modals'],
      allowsNesting: true,
      defaultProps: { visible: false, header: 'Modal title', size: 'medium', closeAriaLabel: 'Close modal', children: 'Modal content goes here' },
      propertyTypes: {
        header: 'string',
        size: { type: 'select', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }] },
        closeAriaLabel: 'string',
        children: 'textarea'
      }
    },
    {
      id: 'help-panel',
      name: 'Help Panel',
      icon: 'question',
      category: 'feedback',
      sections: ['tools'],
      allowsNesting: true,
      defaultProps: { header: 'Help panel', children: 'This is a help panel with useful information.' },
      propertyTypes: { header: 'string', children: 'textarea' }
    }
  ];
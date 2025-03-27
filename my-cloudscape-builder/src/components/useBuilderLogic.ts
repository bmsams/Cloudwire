// File: src/components/useBuilderLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { componentLibrary } from '../config/componentLibrary';
import { generateUniqueId, sanitizeId } from '../helpers/idHelpers';
import { reorderNestedChildren } from '../helpers/nestedHelpers';

interface BuilderState {
  appLayoutConfig: {
    navigation: any[];
    content: any[];
    tools: any[];
    notifications: any[];
    breadcrumbs: any[];
  };
  modals: any[];
  visibleModalId: string | null;
  selectedComponent: any;
  componentProperties: any;
  activeSection: string;
  generatedCode: string;
  darkMode: boolean;
  toolsOpen: boolean;
  previewMode: boolean;
  savedDesigns: any[];
  currentDesignName: string;
  saveModalVisible: boolean;
  loadModalVisible: boolean;
  searchTerm: string;
  categoryFilter: string;
  history: any[];
  historyIndex: number;
}

const useBuilderLogic = () => {
  const [appLayoutConfig, setAppLayoutConfig] = useState<BuilderState['appLayoutConfig']>({
    navigation: [],
    content: [],
    tools: [],
    notifications: [],
    breadcrumbs: []
  });
  const [modals, setModals] = useState<any[]>([]);
  const [visibleModalId, setVisibleModalId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [componentProperties, setComponentProperties] = useState<any>({});
  const [activeSection, setActiveSection] = useState<string>('content');
  const [generatedCode, setGeneratedCode] = useState<string>('// Add components to see code here');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toolsOpen, setToolsOpen] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [currentDesignName, setCurrentDesignName] = useState<string>('New Design');
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [loadModalVisible, setLoadModalVisible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Save current state for undo/redo
  const saveToHistory = useCallback(() => {
    const currentState = { 
      appLayoutConfig: JSON.parse(JSON.stringify(appLayoutConfig)), 
      modals: JSON.parse(JSON.stringify(modals)) 
    };
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);
  }, [appLayoutConfig, modals, history, historyIndex]);

  // On mount: initialize default navigation and load saved designs
  useEffect(() => {
    // Add an initial SideNavigation component if none exists
    if (appLayoutConfig.navigation.length === 0) {
      const sideNavComp = componentLibrary.find(c => c.id === 'side-navigation');
      if (sideNavComp) {
        addComponentToSection('side-navigation', 'navigation');
      }
    }
    
    // Load saved designs from localStorage
    const saved = localStorage.getItem('cloudscapeBuilderDesigns');
    if (saved) {
      try {
        setSavedDesigns(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved designs', e);
      }
    }
    
    // Initialize history
    saveToHistory();
  }, []);

  // Generate code when components change
  useEffect(() => {
    generateCode();
  }, [appLayoutConfig, modals, selectedComponent, componentProperties]);

  // Save designs to localStorage
  useEffect(() => {
    if (savedDesigns.length > 0) {
      localStorage.setItem('cloudscapeBuilderDesigns', JSON.stringify(savedDesigns));
    }
  }, [savedDesigns]);

  // Undo/redo functions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setAppLayoutConfig(prevState.appLayoutConfig);
      setModals(prevState.modals);
      setHistoryIndex(newIndex);
      
      // Clear selection when undoing
      setSelectedComponent(null);
      setComponentProperties({});
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setAppLayoutConfig(nextState.appLayoutConfig);
      setModals(nextState.modals);
      setHistoryIndex(newIndex);
      
      // Clear selection when redoing
      setSelectedComponent(null);
      setComponentProperties({});
    }
  };

  // Add a component to a given section
  const addComponentToSection = (componentType: string, section: string, index: number = -1) => {
    const compDef = componentLibrary.find(c => c.id === componentType);
    if (compDef) {
      const newComponent = {
        id: generateUniqueId(componentType),
        type: componentType,
        props: { ...compDef.defaultProps },
        children: []
      };
      
      saveToHistory();
      
      if (section === 'modals') {
        setModals(prev =>
          index >= 0 ? 
            [...prev.slice(0, index), newComponent, ...prev.slice(index)] : 
            [...prev, newComponent]
        );
      } else {
        setAppLayoutConfig(prev => {
          const sectionComponents = [...prev[section]];
          index >= 0 ? 
            sectionComponents.splice(index, 0, newComponent) : 
            sectionComponents.push(newComponent);
          return { ...prev, [section]: sectionComponents };
        });
      }
      
      // Select the newly added component
      setSelectedComponent(newComponent);
      setComponentProperties(newComponent.props);
    }
  };

  // Recursive search for a component by id
  const findComponentById = (id: string, components: any[]): any | null => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children && comp.children.length > 0) {
        const found = findComponentById(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Find component section by id
  const findComponentSectionById = (id: string): string | null => {
    for (const section of Object.keys(appLayoutConfig)) {
      if (findComponentById(id, appLayoutConfig[section])) {
        return section;
      }
    }
    if (findComponentById(id, modals)) {
      return 'modals';
    }
    return null;
  };

  // Select a component for editing
  const selectComponent = (id: string) => {
    let comp = null;
    
    // Check in all sections
    for (const section of Object.keys(appLayoutConfig)) {
      comp = findComponentById(id, appLayoutConfig[section]);
      if (comp) break;
    }
    
    // Check in modals if not found in sections
    if (!comp) {
      comp = findComponentById(id, modals);
    }
    
    setSelectedComponent(comp);
    setComponentProperties(comp ? comp.props : {});
  };

  // Update a component property
  const updateComponentProperty = (key: string, value: any) => {
    if (!selectedComponent) return;
    
    saveToHistory();
    
    // Update local state for property panel
    setComponentProperties({ ...componentProperties, [key]: value });
    
    // Find the component's section
    const section = findComponentSectionById(selectedComponent.id);
    if (!section) return;
    
    // Update the component in the appropriate section
    if (section === 'modals') {
      setModals(prev => 
        updateComponentInArray(prev, selectedComponent.id, key, value)
      );
    } else {
      setAppLayoutConfig(prev => ({
        ...prev,
        [section]: updateComponentInArray(prev[section], selectedComponent.id, key, value)
      }));
    }
    
    // Special handling for modal-related actions
    if (key === 'onClick' && value === 'openModal' && selectedComponent.type === 'button') {
      // Create a modal if none exist
      if (modals.length === 0) {
        const modalDef = componentLibrary.find(c => c.id === 'modal');
        if (modalDef) {
          const newModal = { 
            id: generateUniqueId('modal'), 
            type: 'modal', 
            props: { ...modalDef.defaultProps }, 
            children: [] 
          };
          setModals([newModal]);
          
          // Link the button to this modal
          updateComponentProperty('modalId', newModal.id);
        }
      }
    }
  };

  // Helper function to update a component in an array (recursive)
  const updateComponentInArray = (components: any[], id: string, key: string, value: any): any[] => {
    return components.map(comp => {
      if (comp.id === id) {
        return { ...comp, props: { ...comp.props, [key]: value } };
      } else if (comp.children && comp.children.length > 0) {
        return { ...comp, children: updateComponentInArray(comp.children, id, key, value) };
      }
      return comp;
    });
  };

  // Remove a component
  const removeComponent = (id: string) => {
    saveToHistory();
    
    // Find the component's section
    const section = findComponentSectionById(id);
    if (!section) return;
    
    // Remove from the appropriate section
    if (section === 'modals') {
      setModals(prev => removeComponentFromArray(prev, id));
    } else {
      setAppLayoutConfig(prev => ({
        ...prev,
        [section]: removeComponentFromArray(prev[section], id)
      }));
    }
    
    // Deselect if the removed component was selected
    if (selectedComponent && selectedComponent.id === id) {
      setSelectedComponent(null);
      setComponentProperties({});
    }
  };

  // Helper function to remove a component from an array (recursive)
  const removeComponentFromArray = (components: any[], id: string): any[] => {
    const result = components.filter(comp => comp.id !== id);
    return result.map(comp => {
      if (comp.children && comp.children.length > 0) {
        return { ...comp, children: removeComponentFromArray(comp.children, id) };
      }
      return comp;
    });
  };

  // Add a nested component to a parent
  const addNestedComponent = (parentId: string, componentType: string) => {
    const parentSection = findComponentSectionById(parentId);
    if (!parentSection) return;
    
    const compDef = componentLibrary.find(c => c.id === componentType);
    if (!compDef) return;
    
    saveToHistory();
    
    const newComponent = {
      id: generateUniqueId(componentType),
      type: componentType,
      props: { ...compDef.defaultProps },
      children: [],
      parentId: parentId // Track parent ID for nested components
    };
    
    // Add to the appropriate section
    if (parentSection === 'modals') {
      setModals(prev => addNestedComponentToArray(prev, parentId, newComponent));
    } else {
      setAppLayoutConfig(prev => ({
        ...prev,
        [parentSection]: addNestedComponentToArray(prev[parentSection], parentId, newComponent)
      }));
    }
    
    // Select the newly added component
    setSelectedComponent(newComponent);
    setComponentProperties(newComponent.props);
  };

  // Helper function to add a nested component to a parent (recursive)
  const addNestedComponentToArray = (components: any[], parentId: string, newComponent: any): any[] => {
    return components.map(comp => {
      if (comp.id === parentId) {
        if (!comp.children) comp.children = [];
        return { ...comp, children: [...comp.children, newComponent] };
      } else if (comp.children && comp.children.length > 0) {
        return { ...comp, children: addNestedComponentToArray(comp.children, parentId, newComponent) };
      }
      return comp;
    });
  };

  // Generate React code based on the components
  const generateCode = () => {
    if (Object.values(appLayoutConfig).every(section => section.length === 0) && modals.length === 0) {
      setGeneratedCode('// Add components to see code here');
      return;
    }
    
    let imports = new Set<string>([
      'React',
      'useState',
      'AppLayout',
      'ContentLayout'
    ]);
    
    // Add imports for all used components
    Object.values(appLayoutConfig).forEach(section => {
      collectImports(section, imports);
    });
    collectImports(modals, imports);
    
    let code = "import React, { useState, useEffect } from 'react';\n";
    
    // Import all used Cloudscape components
    const cloudscapeImports = Array.from(imports)
      .filter(imp => imp !== 'React' && imp !== 'useState' && imp !== 'useEffect')
      .sort();
    
    cloudscapeImports.forEach(component => {
      code += `import ${component} from '@cloudscape-design/components/${component.toLowerCase()}';\n`;
    });
    
    code += '\nfunction CloudscapeApp() {\n';
    code += '  const [toolsOpen, setToolsOpen] = useState(false);\n';
    
    // Add state for modals if needed
    if (modals.length > 0) {
      code += '  const [visibleModal, setVisibleModal] = useState(null);\n';
    }
    
    // Generate navigation content
    let navigationContent = 'null';
    if (appLayoutConfig.navigation.length > 0) {
      navigationContent = '(\n    <React.Fragment>\n';
      navigationContent += generateComponentsCode(appLayoutConfig.navigation, 6);
      navigationContent += '    </React.Fragment>\n  )';
    }
    
    // Generate tools content
    let toolsContent = 'null';
    if (appLayoutConfig.tools.length > 0) {
      toolsContent = '(\n    <React.Fragment>\n';
      toolsContent += generateComponentsCode(appLayoutConfig.tools, 6);
      toolsContent += '    </React.Fragment>\n  )';
    }
    
    // Generate breadcrumbs content
    let breadcrumbsContent = 'null';
    if (appLayoutConfig.breadcrumbs.length > 0) {
      breadcrumbsContent = '(\n    <React.Fragment>\n';
      breadcrumbsContent += generateComponentsCode(appLayoutConfig.breadcrumbs, 6);
      breadcrumbsContent += '    </React.Fragment>\n  )';
    }
    
    // Generate main content
    let contentContent = '<ContentLayout>Content goes here</ContentLayout>';
    if (appLayoutConfig.content.length > 0) {
      contentContent = '(\n    <ContentLayout>\n';
      contentContent += generateComponentsCode(appLayoutConfig.content, 6);
      contentContent += '    </ContentLayout>\n  )';
    }
    
    // Generate modal rendering
    if (modals.length > 0) {
      code += '\n  // Render visible modal\n';
      code += '  const renderModal = () => {\n';
      code += '    switch (visibleModal) {\n';
      
      modals.forEach(modal => {
        code += `      case "${sanitizeId(modal.id)}":\n`;
        code += `        return (\n`;
        code += `          <Modal\n`;
        code += `            visible={true}\n`;
        code += `            header="${modal.props.header || 'Modal'}"\n`;
        if (modal.props.size) {
          code += `            size="${modal.props.size}"\n`;
        }
        code += `            onDismiss={() => setVisibleModal(null)}\n`;
        code += `          >\n`;
        
        if (modal.children && modal.children.length > 0) {
          code += generateComponentsCode(modal.children, 12);
        } else {
          code += `            <div>Modal content</div>\n`;
        }
        
        code += `          </Modal>\n`;
        code += `        );\n`;
      });
      
      code += '      default:\n';
      code += '        return null;\n';
      code += '    }\n';
      code += '  };\n';
    }
    
    // Generate app layout
    code += '\n  return (\n';
    code += '    <AppLayout\n';
    code += `      navigation=${navigationContent}\n`;
    code += `      tools=${toolsContent}\n`;
    if (breadcrumbsContent !== 'null') {
      code += `      breadcrumbs=${breadcrumbsContent}\n`;
    }
    code += '      toolsOpen={toolsOpen}\n';
    code += '      onToolsChange={({ detail }) => setToolsOpen(detail.open)}\n';
    code += `      content=${contentContent}\n`;
    code += '    >\n';
    
    // Add modals if needed
    if (modals.length > 0) {
      code += '      {renderModal()}\n';
    }
    
    code += '    </AppLayout>\n';
    code += '  );\n';
    code += '}\n\n';
    code += 'export default CloudscapeApp;';
    
    setGeneratedCode(code);
  };

  // Helper function to generate code for a list of components
  const generateComponentsCode = (components: any[], indentLevel: number = 0): string => {
    const indent = ' '.repeat(indentLevel);
    let code = '';
    
    components.forEach(comp => {
      code += `${indent}<${getComponentTagName(comp.type)}\n`;
      
      // Add props
      Object.entries(comp.props).forEach(([key, value]) => {
        if (key === 'children') return; // Skip children, handled separately
        
        const formattedValue = formatPropValue(value);
        if (formattedValue !== null) {
          code += `${indent}  ${key}=${formattedValue}\n`;
        }
      });
      
      // Handle children
      if (comp.children && comp.children.length > 0) {
        code += `${indent}>\n`;
        code += generateComponentsCode(comp.children, indentLevel + 2);
        code += `${indent}</${getComponentTagName(comp.type)}>\n`;
      } else if (comp.props.children) {
        code += `${indent}>\n`;
        code += `${indent}  ${formatChildrenContent(comp.props.children)}\n`;
        code += `${indent}</${getComponentTagName(comp.type)}>\n`;
      } else {
        code += `${indent}/>\n`;
      }
    });
    
    return code;
  };

  // Helper function to collect imports for all used components
  const collectImports = (components: any[], imports: Set<string>) => {
    components.forEach(comp => {
      // Add the component type to imports
      const componentName = getComponentTagName(comp.type);
      imports.add(componentName);
      
      // Check button onClick actions for modal handling
      if (comp.type === 'button' && comp.props.onClick === 'openModal') {
        imports.add('Modal');
      }
      
      // Recursively collect imports for children
      if (comp.children && comp.children.length > 0) {
        collectImports(comp.children, imports);
      }
    });
  };

  // Helper function to convert component type to React component name
  const getComponentTagName = (type: string): string => {
    // Map component types to React component names
    const componentMap: Record<string, string> = {
      'side-navigation': 'SideNavigation',
      'breadcrumb-group': 'BreadcrumbGroup',
      'radio-group': 'RadioGroup',
      'date-picker': 'DatePicker',
      'help-panel': 'HelpPanel',
      'column-layout': 'ColumnLayout'
    };
    
    if (componentMap[type]) {
      return componentMap[type];
    }
    
    // Convert kebab-case to PascalCase
    return type.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  // Helper function to format prop values as JSX
  const formatPropValue = (value: any): string | null => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    
    if (typeof value === 'string') {
      // Special case for onClick="openModal"
      if (value === 'openModal') {
        return '{() => setVisibleModal("modal_id")}';
      }
      return `"${value}"`;
    }
    
    if (typeof value === 'boolean') {
      return `{${value}}`;
    }
    
    if (typeof value === 'number') {
      return `{${value}}`;
    }
    
    if (Array.isArray(value)) {
      return `{${JSON.stringify(value)}}`;
    }
    
    if (typeof value === 'object') {
      return `{${JSON.stringify(value)}}`;
    }
    
    return String(value);
  };

  // Helper function to format children content
  const formatChildrenContent = (children: any): string => {
    if (typeof children === 'string') {
      return children;
    }
    
    if (Array.isArray(children)) {
      return children.join(', ');
    }
    
    return String(children);
  };

  // Save a design
  const saveDesign = (name: string, description: string) => {
    const newDesign = {
      id: Date.now().toString(),
      name,
      description,
      date: new Date().toISOString(),
      appLayoutConfig,
      modals
    };
    setSavedDesigns([...savedDesigns, newDesign]);
    setCurrentDesignName(name);
  };

  // Load a design
  const loadDesign = (designId: string) => {
    const design = savedDesigns.find(d => d.id === designId);
    if (design) {
      saveToHistory();
      setAppLayoutConfig(design.appLayoutConfig);
      setModals(design.modals);
      setCurrentDesignName(design.name);
      
      // Clear selection
      setSelectedComponent(null);
      setComponentProperties({});
    }
  };

  return {
    appLayoutConfig,
    modals,
    visibleModalId,
    setVisibleModalId,
    selectedComponent,
    componentProperties,
    activeSection,
    setActiveSection,
    generatedCode,
    darkMode,
    setDarkMode,
    toolsOpen,
    setToolsOpen,
    previewMode,
    setPreviewMode,
    savedDesigns,
    currentDesignName,
    setCurrentDesignName,
    saveModalVisible,
    setSaveModalVisible,
    loadModalVisible,
    setLoadModalVisible,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    history,
    historyIndex,
    handleUndo,
    handleRedo,
    addComponentToSection,
    selectComponent,
    updateComponentProperty,
    removeComponent,
    addNestedComponent,
    generateCode,
    saveDesign,
    loadDesign
  };
};

export default useBuilderLogic;
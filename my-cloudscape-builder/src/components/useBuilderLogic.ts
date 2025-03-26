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
    const currentState = { appLayoutConfig: { ...appLayoutConfig }, modals: [...modals] };
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);
  }, [appLayoutConfig, modals, history, historyIndex]);

  // On mount: initialize default navigation and load saved designs
  useEffect(() => {
    const sideNavComp = componentLibrary.find(c => c.id === 'side-navigation');
    if (sideNavComp && appLayoutConfig.navigation.length === 0) {
      addComponentToSection('side-navigation', 'navigation');
    }
    const saved = localStorage.getItem('cloudscapeBuilderDesigns');
    if (saved) setSavedDesigns(JSON.parse(saved));
  }, []);

  useEffect(() => {
    generateCode();
  }, [appLayoutConfig, modals, selectedComponent, componentProperties]);

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
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setAppLayoutConfig(nextState.appLayoutConfig);
      setModals(nextState.modals);
      setHistoryIndex(newIndex);
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
          index >= 0 ? [...prev.slice(0, index), newComponent, ...prev.slice(index)] : [...prev, newComponent]
        );
      } else {
        setAppLayoutConfig(prev => {
          const sectionComponents = [...prev[section]];
          index >= 0 ? sectionComponents.splice(index, 0, newComponent) : sectionComponents.push(newComponent);
          return { ...prev, [section]: sectionComponents };
        });
      }
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

  const selectComponent = (id: string) => {
    let comp = findComponentById(id, appLayoutConfig[activeSection]);
    if (!comp) comp = findComponentById(id, modals);
    setSelectedComponent(comp);
    setComponentProperties(comp ? comp.props : {});
  };

  const updateComponentProperty = (key: string, value: any) => {
    if (!selectedComponent) return;
    saveToHistory();
    setComponentProperties({ ...componentProperties, [key]: value });
    if (activeSection === 'modals') {
      setModals(prev =>
        prev.map(comp =>
          comp.id === selectedComponent.id ? { ...comp, props: { ...comp.props, [key]: value } } : comp
        )
      );
    } else {
      setAppLayoutConfig(prev => ({
        ...prev,
        [activeSection]: prev[activeSection].map((comp: any) =>
          comp.id === selectedComponent.id ? { ...comp, props: { ...comp.props, [key]: value } } : comp
        )
      }));
    }
    if (key === 'onClick' && value === 'openModal' && selectedComponent.type === 'button') {
      if (modals.length === 0) {
        const modalDef = componentLibrary.find(c => c.id === 'modal');
        if (modalDef) {
          const newModal = { id: generateUniqueId('modal'), type: 'modal', props: { ...modalDef.defaultProps }, children: [] };
          setModals([newModal]);
        }
      }
    }
  };

  const removeComponent = (id: string) => {
    saveToHistory();
    if (activeSection === 'modals') {
      setModals(prev => prev.filter(comp => comp.id !== id));
    } else {
      setAppLayoutConfig(prev => ({
        ...prev,
        [activeSection]: prev[activeSection].filter((comp: any) => comp.id !== id)
      }));
    }
    if (selectedComponent && selectedComponent.id === id) {
      setSelectedComponent(null);
      setComponentProperties({});
    }
  };

  const addNestedComponent = (parentId: string, componentType: string) => {
    const parentComp = findComponentById(parentId, activeSection === 'modals' ? modals : appLayoutConfig[activeSection]);
    if (!parentComp) return;
    const compDef = componentLibrary.find(c => c.id === componentType);
    if (!compDef) return;
    saveToHistory();
    const newComponent = {
      id: generateUniqueId(componentType),
      type: componentType,
      props: { ...compDef.defaultProps },
      children: []
    };
    if (!parentComp.children) parentComp.children = [];
    parentComp.children.push(newComponent);
    activeSection === 'modals' ? setModals([...modals]) : setAppLayoutConfig({ ...appLayoutConfig });
  };

  const generateCode = () => {
    if (Object.values(appLayoutConfig).flat().length === 0 && modals.length === 0) {
      setGeneratedCode('// Add components to see code here');
      return;
    }
    let code = "import React, { useState } from 'react';\n";
    code += "\nfunction MyApp() {\n  return (\n    <AppLayout content={<ContentLayout>Content goes here</ContentLayout>} />\n  );\n}\n\nexport default MyApp;";
    setGeneratedCode(code);
  };

  const saveDesign = (name: string, description: string) => {
    const newDesign = { id: Date.now().toString(), name, description, date: new Date(), appLayoutConfig, modals };
    setSavedDesigns([...savedDesigns, newDesign]);
    setCurrentDesignName(name);
    setSaveModalVisible(false);
  };

  const loadDesign = (designId: string) => {
    const design = savedDesigns.find(d => d.id === designId);
    if (design) {
      saveToHistory();
      setAppLayoutConfig(design.appLayoutConfig);
      setModals(design.modals);
      setCurrentDesignName(design.name);
      setLoadModalVisible(false);
    }
  };

  // For simplicity, getVisibleModal and buildNavItems are stubbed out.
  const getVisibleModal = () => null;
  const buildNavItems = () => [];

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
    loadDesign,
    getVisibleModal,
    buildNavItems
  };
};

export default useBuilderLogic;

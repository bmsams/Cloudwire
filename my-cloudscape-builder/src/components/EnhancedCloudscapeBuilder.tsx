import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Cloudscape components
import AppLayout from '@cloudscape-design/components/app-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import CodeView from '@cloudscape-design/components/code-view';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Grid from '@cloudscape-design/components/grid';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Toggle from '@cloudscape-design/components/toggle';
import Textarea from '@cloudscape-design/components/textarea';
import Modal from '@cloudscape-design/components/modal';
import Tabs from '@cloudscape-design/components/tabs';
import HelpPanel from '@cloudscape-design/components/help-panel';
import Link from '@cloudscape-design/components/link';
import Icon from '@cloudscape-design/components/icon';

// Import configuration and helpers
import { componentLibrary } from '../config/componentLibrary';
import { generateUniqueId, sanitizeId } from '../helpers/idHelpers';
import { moveNestedComponent } from '../helpers/nestedHelpers';

// Import sub–components
import DraggableComponent from './DraggableComponent';
import DroppableSection from './DroppableSection';

// A simple helper to capitalize strings
const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

const EnhancedCloudscapeBuilder: React.FC = () => {
  // State declarations
  const [appLayoutConfig, setAppLayoutConfig] = useState({
    navigation: [] as any[],
    content: [] as any[],
    tools: [] as any[],
    notifications: [] as any[],
    breadcrumbs: [] as any[]
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

  // Save state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const currentState = { appLayoutConfig: { ...appLayoutConfig }, modals: [...modals] };
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);
  }, [appLayoutConfig, modals, history, historyIndex]);

  // On mount: initialize default navigation and load saved designs
  useEffect(() => {
    const sideNavComp = componentLibrary.find((c) => c.id === 'side-navigation');
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
    const compDef = componentLibrary.find((c) => c.id === componentType);
    if (compDef) {
      const newComponent = {
        id: generateUniqueId(componentType),
        type: componentType,
        props: { ...compDef.defaultProps },
        children: []
      };
      saveToHistory();
      if (section === 'modals') {
        setModals((prev) => (index >= 0 ? [...prev.slice(0, index), newComponent, ...prev.slice(index)] : [...prev, newComponent]));
      } else {
        setAppLayoutConfig((prev) => {
          const sectionComponents = [...prev[section]];
          if (index >= 0) sectionComponents.splice(index, 0, newComponent);
          else sectionComponents.push(newComponent);
          return { ...prev, [section]: sectionComponents };
        });
      }
    }
  };

  // Find a component by id recursively
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
    // For simplicity, update the state in place (this code may be refactored to handle nested updates)
    if (activeSection === 'modals') {
      setModals((prev) =>
        prev.map((comp) =>
          comp.id === selectedComponent.id ? { ...comp, props: { ...comp.props, [key]: value } } : comp
        )
      );
    } else {
      setAppLayoutConfig((prev) => ({
        ...prev,
        [activeSection]: prev[activeSection].map((comp: any) =>
          comp.id === selectedComponent.id ? { ...comp, props: { ...comp.props, [key]: value } } : comp
        )
      }));
    }
    if (key === 'onClick' && value === 'openModal' && selectedComponent.type === 'button') {
      if (modals.length === 0) {
        const modalDef = componentLibrary.find((c) => c.id === 'modal');
        if (modalDef) {
          const newModal = { id: generateUniqueId('modal'), type: 'modal', props: { ...modalDef.defaultProps }, children: [] };
          setModals([newModal]);
        }
      }
    }
  };

  // Remove a component
  const removeComponent = (id: string) => {
    saveToHistory();
    // Remove from modals or active section
    if (activeSection === 'modals') {
      setModals((prev) => prev.filter((comp) => comp.id !== id));
    } else {
      setAppLayoutConfig((prev) => ({
        ...prev,
        [activeSection]: prev[activeSection].filter((comp: any) => comp.id !== id)
      }));
    }
    if (selectedComponent && selectedComponent.id === id) {
      setSelectedComponent(null);
      setComponentProperties({});
    }
  };

  // Add nested component to selected component
  const addNestedComponent = (parentId: string, componentType: string) => {
    const parentComp = findComponentById(parentId, activeSection === 'modals' ? modals : appLayoutConfig[activeSection]);
    if (!parentComp) return;
    const compDef = componentLibrary.find((c) => c.id === componentType);
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
    // Force state update (a more robust approach might require immutable updates)
    if (activeSection === 'modals') {
      setModals([...modals]);
    } else {
      setAppLayoutConfig({ ...appLayoutConfig });
    }
  };

  // Code generation functions (simplified)
  const generateCode = () => {
    if (Object.values(appLayoutConfig).flat().length === 0 && modals.length === 0) {
      setGeneratedCode('// Add components to see code here');
      return;
    }
    let code = "import React, { useState } from 'react';\n";
    // Collect imports (omitted here for brevity)
    code += "\nfunction MyApp() {\n  return (\n    <AppLayout\n      content={<ContentLayout>Content goes here</ContentLayout>}\n    />\n  );\n}\n\nexport default MyApp;";
    setGeneratedCode(code);
  };

  // Modal handling for save/load
  const saveDesign = (name: string, description: string) => {
    const newDesign = { id: Date.now().toString(), name, description, date: new Date(), appLayoutConfig, modals };
    setSavedDesigns([...savedDesigns, newDesign]);
    setCurrentDesignName(name);
    setSaveModalVisible(false);
  };

  const loadDesign = (designId: string) => {
    const design = savedDesigns.find((d) => d.id === designId);
    if (design) {
      saveToHistory();
      setAppLayoutConfig(design.appLayoutConfig);
      setModals(design.modals);
      setCurrentDesignName(design.name);
      setLoadModalVisible(false);
    }
  };

  const getVisibleModal = () => {
    if (saveModalVisible) {
      return (
        <Modal visible onDismiss={() => setSaveModalVisible(false)} header="Save Design" size="medium" closeAriaLabel="Close modal">
          <SpaceBetween size="l">
            <FormField label="Design Name">
              <Input value={currentDesignName} onChange={({ detail }) => setCurrentDesignName(detail.value)} />
            </FormField>
            <FormField label="Description">
              <Textarea value="" onChange={() => {}} rows={3} />
            </FormField>
            <Box textAlign="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setSaveModalVisible(false)}>Cancel</Button>
                <Button onClick={() => saveDesign(currentDesignName, "")} variant="primary">
                  Save
                </Button>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Modal>
      );
    }
    if (loadModalVisible) {
      return (
        <Modal visible onDismiss={() => setLoadModalVisible(false)} header="Load Design" size="medium" closeAriaLabel="Close modal">
          <SpaceBetween size="l">
            {savedDesigns.length === 0 ? (
              <Box textAlign="center" color="text-status-inactive">No saved designs yet.</Box>
            ) : (
              savedDesigns.map((design) => (
                <Box key={design.id}>
                  <Link onFollow={() => loadDesign(design.id)}>{design.name}</Link>
                  <Box variant="small" color="text-body-secondary">{new Date(design.date).toLocaleString()}</Box>
                </Box>
              ))
            )}
            <Box textAlign="right">
              <Button onClick={() => setLoadModalVisible(false)} variant="primary">Close</Button>
            </Box>
          </SpaceBetween>
        </Modal>
      );
    }
    const modal = modals.find((m) => m.id === visibleModalId);
    if (!modal) return null;
    return (
      <Modal
        visible
        onDismiss={() => setVisibleModalId(null)}
        header={modal.props.header}
        size={modal.props.size}
        closeAriaLabel={modal.props.closeAriaLabel}
      >
        <SpaceBetween size="l">
          {modal.children && modal.children.length > 0
            ? modal.children.map((child: any) => <div key={child.id}>{child.type}</div>)
            : <Box>{modal.props.children}</Box>}
          <Box textAlign="right">
            <Button onClick={() => setVisibleModalId(null)} variant="primary">Close</Button>
          </Box>
        </SpaceBetween>
      </Modal>
    );
  };

  // Build navigation items for sidebar
  const buildNavItems = () => {
    const navItems = [
      {
        type: 'section',
        text: 'Builder Sections',
        items: [
          { type: 'link', text: 'Content', href: '#section-content', info: <Icon name="file" />, selected: activeSection === 'content' },
          { type: 'link', text: 'Navigation', href: '#section-navigation', info: <Icon name="menu" />, selected: activeSection === 'navigation' },
          { type: 'link', text: 'Tools', href: '#section-tools', info: <Icon name="tools" />, selected: activeSection === 'tools' },
          { type: 'link', text: 'Breadcrumbs', href: '#section-breadcrumbs', info: <Icon name="chevron-right" />, selected: activeSection === 'breadcrumbs' },
          { type: 'link', text: 'Modals', href: '#section-modals', info: <Icon name="external" />, selected: activeSection === 'modals' }
        ]
      }
    ];
    // Additional sections and settings...
    navItems.push({
      type: 'section',
      text: 'Settings',
      items: [
        { type: 'link', text: darkMode ? 'Light Mode' : 'Dark Mode', href: '#theme', info: <Icon name={darkMode ? 'sun' : 'moon'} /> },
        { type: 'link', text: previewMode ? 'Edit Mode' : 'Preview Mode', href: '#preview', info: <Icon name={previewMode ? 'edit' : 'view-full'} /> },
        { type: 'link', text: 'Save Design', href: '#save', info: <Icon name="save" /> },
        { type: 'link', text: 'Load Design', href: '#load', info: <Icon name="folder-open" /> }
      ]
    });
    return navItems;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AppLayout
        navigation={
          <SideNavigation
            header={{ text: 'Component Library' }}
            items={buildNavItems()}
            onFollow={(e) => {
              e.preventDefault();
              const href = e.detail.href;
              if (href.startsWith('#section-')) {
                setActiveSection(href.replace('#section-', ''));
                return;
              }
              if (href.startsWith('#category-')) {
                setCategoryFilter(href.replace('#category-', ''));
                return;
              }
              if (href === '#theme') {
                setDarkMode(!darkMode);
                return;
              }
              if (href === '#preview') {
                setPreviewMode(!previewMode);
                return;
              }
              if (href === '#save') {
                setSaveModalVisible(true);
                return;
              }
              if (href === '#load') {
                setLoadModalVisible(true);
                return;
              }
              const compId = href.replace('#', '');
              const comp = componentLibrary.find((c) => c.id === compId);
              if (comp) {
                if (activeSection === 'nested' && selectedComponent) {
                  addNestedComponent(selectedComponent.id, compId);
                } else {
                  addComponentToSection(compId, activeSection);
                }
              }
            }}
          >
            <Box padding="s">
              <Input placeholder="Search components..." value={searchTerm} onChange={({ detail }) => setSearchTerm(detail.value)} clearable />
            </Box>
          </SideNavigation>
        }
        content={
          <ContentLayout
            header={
              <Header
                variant="h1"
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={handleUndo} disabled={historyIndex <= 0} iconName="undo">Undo</Button>
                    <Button onClick={handleRedo} disabled={historyIndex >= history.length - 1} iconName="redo">Redo</Button>
                    <Button onClick={() => setPreviewMode(!previewMode)} iconName={previewMode ? "edit" : "view-full"}>
                      {previewMode ? "Edit Mode" : "Preview Mode"}
                    </Button>
                  </SpaceBetween>
                }
              >
                Cloudscape Component Builder
              </Header>
            }
          >
            <SpaceBetween size="l">
              <Container
                header={
                  <Header>
                    {capitalizeFirstLetter(activeSection)} Section
                    <Box float="right" variant="small">
                      <Button iconName="refresh" variant="icon" onClick={() => setToolsOpen(!toolsOpen)} ariaLabel="Toggle tools panel" />
                    </Box>
                  </Header>
                }
                footer={
                  <Box textAlign="right">
                    <Button variant="primary" iconName="copy" onClick={() => navigator.clipboard.writeText(generatedCode)}>Copy Code</Button>
                  </Box>
                }
              >
                {activeSection === 'modals'
                  ? <DroppableSection section="modals" components={modals} darkMode={darkMode} onDrop={moveNestedComponent} onSelect={selectComponent} onRemove={removeComponent} />
                  : <DroppableSection section={activeSection} components={appLayoutConfig[activeSection]} darkMode={darkMode} onDrop={addComponentToSection} onSelect={selectComponent} onRemove={removeComponent} />}
              </Container>
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Container header={<Header>Properties</Header>}>
                  {selectedComponent ? (
                    <Form>
                      <SpaceBetween size="l">
                        {Object.entries(componentProperties).map(([key, value]) => (
                          <FormField key={key} label={key}>
                            {/* Render property editor based on type; for brevity, using Input */}
                            <Input value={value?.toString() || ''} onChange={({ detail }) => updateComponentProperty(key, detail.value)} />
                          </FormField>
                        ))}
                      </SpaceBetween>
                    </Form>
                  ) : (
                    <Box textAlign="center" color="text-status-inactive" padding="m">Select a component to edit properties</Box>
                  )}
                </Container>
                <Container header={<Header>Code Preview</Header>}>
                  <CodeView code={generatedCode} language="jsx" />
                </Container>
              </Grid>
            </SpaceBetween>
          </ContentLayout>
        }
        tools={
          <Tabs
            tabs={[
              {
                label: "Help",
                id: "help",
                content: (
                  <HelpPanel header="Builder Help">
                    <SpaceBetween size="l">
                      <Box variant="p">This builder allows you to create Cloudscape interfaces by dragging and dropping components.</Box>
                      <Box variant="h4">Current Structure:</Box>
                      <Box>
                        <ul>
                          <li>Navigation: {appLayoutConfig.navigation.length} components</li>
                          <li>Content: {appLayoutConfig.content.length} components</li>
                          <li>Tools: {appLayoutConfig.tools.length} components</li>
                          <li>Breadcrumbs: {appLayoutConfig.breadcrumbs.length} components</li>
                          <li>Modals: {modals.length} modals</li>
                        </ul>
                      </Box>
                      <Box variant="h4">Tips:</Box>
                      <Box>
                        <ul>
                          <li>Click components to edit their properties</li>
                          <li>Drag components to reorder them</li>
                          <li>Toggle preview mode to see your app in action</li>
                        </ul>
                      </Box>
                    </SpaceBetween>
                  </HelpPanel>
                )
              },
              {
                label: "Saved Designs",
                id: "saved",
                content: (
                  <HelpPanel header="Saved Designs">
                    <SpaceBetween size="l">
                      {savedDesigns.length === 0 ? (
                        <Box textAlign="center" color="text-status-inactive">No saved designs yet</Box>
                      ) : (
                        savedDesigns.map(design => (
                          <Box key={design.id}>
                            <Link onFollow={() => loadDesign(design.id)}>{design.name}</Link>
                            <Box variant="small" color="text-body-secondary">{new Date(design.date).toLocaleString()}</Box>
                          </Box>
                        ))
                      )}
                      <Button onClick={() => setSaveModalVisible(true)} iconName="save">Save Current Design</Button>
                    </SpaceBetween>
                  </HelpPanel>
                )
              }
            ]}
          />
        }
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        navigationHide={false}
        toolsHide={false}
      >
        {getVisibleModal()}
      </AppLayout>
    </DndProvider>
  );
};

export default EnhancedCloudscapeBuilder;

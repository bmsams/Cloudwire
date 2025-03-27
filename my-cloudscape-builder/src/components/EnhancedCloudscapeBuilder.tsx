// File: src/components/EnhancedCloudscapeBuilder.tsx
import React, { useState, useEffect } from 'react';
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
import Tabs from '@cloudscape-design/components/tabs';
import HelpPanel from '@cloudscape-design/components/help-panel';
import Link from '@cloudscape-design/components/link';
import Modal from '@cloudscape-design/components/modal';
import TextContent from '@cloudscape-design/components/text-content';
import SegmentedControl from '@cloudscape-design/components/segmented-control';

// Configuration and sub-components
import { componentLibrary } from '../config/componentLibrary';
import DraggableComponent from './DraggableComponent';
import DroppableSection from './DroppableSection';
import useBuilderLogic from './useBuilderLogic';
import PropertyEditor from './PropertyEditor';
import ComponentPreview from './ComponentPreview';

const EnhancedCloudscapeBuilder: React.FC = () => {
  const {
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
  } = useBuilderLogic();

  const [designDescription, setDesignDescription] = useState('');
  const [codeType, setCodeType] = useState('jsx');
  const [activeTab, setActiveTab] = useState('components');
  
  // Filter components based on search term and category
  const getFilteredComponents = () => {
    return componentLibrary.filter(comp => {
      const matchesSearch = searchTerm === '' || 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.category.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = categoryFilter === 'all' || comp.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Build navigation items for the side navigation
  const buildNavItems = () => {
    const items = [
      {
        type: 'section',
        text: 'Builder Actions',
        items: [
          { type: 'link', text: 'Toggle Dark Mode', href: '#theme' },
          { type: 'link', text: previewMode ? 'Edit Mode' : 'Preview Mode', href: '#preview' },
          { type: 'link', text: 'Save Design', href: '#save' },
          { type: 'link', text: 'Load Design', href: '#load' },
        ]
      },
      {
        type: 'section',
        text: 'Sections',
        items: [
          { type: 'link', text: 'Content', href: '#section-content' },
          { type: 'link', text: 'Navigation', href: '#section-navigation' },
          { type: 'link', text: 'Tools', href: '#section-tools' },
          { type: 'link', text: 'Breadcrumbs', href: '#section-breadcrumbs' },
          { type: 'link', text: 'Modals', href: '#section-modals' }
        ]
      },
      {
        type: 'section',
        text: 'Component Categories',
        items: [
          { type: 'link', text: 'All', href: '#category-all' },
          { type: 'link', text: 'Layout', href: '#category-layout' },
          { type: 'link', text: 'Navigation', href: '#category-navigation' },
          { type: 'link', text: 'Input', href: '#category-input' },
          { type: 'link', text: 'Data', href: '#category-data' },
          { type: 'link', text: 'Feedback', href: '#category-feedback' }
        ]
      }
    ];

    // Add component library items based on filter
    if (getFilteredComponents().length > 0) {
      items.push({
        type: 'section',
        text: 'Components',
        items: getFilteredComponents().map(comp => ({
          type: 'link',
          text: comp.name,
          href: `#${comp.id}`,
          info: comp.category
        }))
      });
    }

    return items;
  };

  // Render visible modal based on state
  const getVisibleModal = () => {
    // Save modal
    if (saveModalVisible) {
      return (
        <Modal
          visible={true}
          header="Save Design"
          onDismiss={() => setSaveModalVisible(false)}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setSaveModalVisible(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => {
                  saveDesign(currentDesignName, designDescription);
                  setSaveModalVisible(false);
                }}>Save</Button>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="m">
            <FormField label="Design Name">
              <Input
                value={currentDesignName}
                onChange={({ detail }) => setCurrentDesignName(detail.value)}
              />
            </FormField>
            <FormField label="Description">
              <Input
                value={designDescription}
                onChange={({ detail }) => setDesignDescription(detail.value)}
                multiline
              />
            </FormField>
          </SpaceBetween>
        </Modal>
      );
    }

    // Load modal
    if (loadModalVisible) {
      return (
        <Modal
          visible={true}
          header="Load Design"
          onDismiss={() => setLoadModalVisible(false)}
        >
          {savedDesigns.length === 0 ? (
            <Box textAlign="center" color="text-status-inactive">No saved designs yet</Box>
          ) : (
            <SpaceBetween size="m">
              {savedDesigns.map(design => (
                <Container key={design.id} header={<Header>{design.name}</Header>}>
                  <SpaceBetween size="m">
                    <TextContent>
                      <p>{design.description || 'No description'}</p>
                      <p><i>Created: {new Date(design.date).toLocaleString()}</i></p>
                    </TextContent>
                    <Box float="right">
                      <Button 
                        onClick={() => {
                          loadDesign(design.id);
                          setLoadModalVisible(false);
                        }}
                      >
                        Load
                      </Button>
                    </Box>
                  </SpaceBetween>
                </Container>
              ))}
            </SpaceBetween>
          )}
        </Modal>
      );
    }

    // Component modal (if a modal is set to be visible in the preview)
    if (previewMode && visibleModalId) {
      const modal = modals.find(m => m.id === visibleModalId);
      if (modal) {
        return (
          <Modal
            visible={true}
            header={modal.props.header || 'Modal'}
            size={modal.props.size || 'medium'}
            onDismiss={() => setVisibleModalId(null)}
          >
            <ComponentPreview 
              component={modal} 
              darkMode={darkMode}
              onAction={(action) => {
                // Handle modal actions
                if (action === 'close') {
                  setVisibleModalId(null);
                }
              }}
            />
          </Modal>
        );
      }
    }

    return null;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AppLayout
        navigation={
          <SideNavigation
            header={{ text: 'Component Library' }}
            items={buildNavItems()}
            activeHref={`#section-${activeSection}`}
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
              const comp = componentLibrary.find(c => c.id === compId);
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
              <SpaceBetween size="s">
                <Input 
                  placeholder="Search components..." 
                  value={searchTerm} 
                  onChange={({ detail }) => setSearchTerm(detail.value)} 
                  clearable 
                />
                <SegmentedControl
                  selectedId={activeTab}
                  onChange={({ detail }) => setActiveTab(detail.selectedId)}
                  options={[
                    { id: 'components', text: 'Components' },
                    { id: 'structure', text: 'Structure' }
                  ]}
                />
                {activeTab === 'structure' && (
                  <Box>
                    <SpaceBetween size="xs">
                      <Box variant="h4">Current Structure:</Box>
                      <ul>
                        <li>Navigation: {appLayoutConfig.navigation.length} components</li>
                        <li>Content: {appLayoutConfig.content.length} components</li>
                        <li>Tools: {appLayoutConfig.tools.length} components</li>
                        <li>Breadcrumbs: {appLayoutConfig.breadcrumbs.length} components</li>
                        <li>Modals: {modals.length} modals</li>
                      </ul>
                    </SpaceBetween>
                  </Box>
                )}
              </SpaceBetween>
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
                    {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section
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
                  ? (
                    <DroppableSection 
                      section="modals" 
                      components={modals} 
                      darkMode={darkMode} 
                      onDrop={addComponentToSection} 
                      onSelect={selectComponent} 
                      onRemove={removeComponent} 
                      previewMode={previewMode}
                    />
                  )
                  : (
                    <DroppableSection 
                      section={activeSection} 
                      components={appLayoutConfig[activeSection]} 
                      darkMode={darkMode} 
                      onDrop={addComponentToSection} 
                      onSelect={selectComponent} 
                      onRemove={removeComponent} 
                      previewMode={previewMode}
                    />
                  )
                }
              </Container>
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Container header={<Header>Properties</Header>}>
                  {selectedComponent ? (
                    <PropertyEditor
                      component={selectedComponent}
                      properties={componentProperties}
                      onPropertyChange={updateComponentProperty}
                    />
                  ) : (
                    <Box textAlign="center" color="text-status-inactive" padding="m">Select a component to edit properties</Box>
                  )}
                </Container>
                <Container 
                  header={
                    <Header 
                      actions={
                        <SegmentedControl
                          selectedId={codeType}
                          onChange={({ detail }) => setCodeType(detail.selectedId)}
                          options={[
                            { id: 'jsx', text: 'JSX' },
                            { id: 'tsx', text: 'TSX' }
                          ]}
                        />
                      }
                    >
                      Code Preview
                    </Header>
                  }
                >
                  <CodeView code={generatedCode} language={codeType} />
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
                          <li>Use the copy button to copy generated code</li>
                          <li>Save your designs to reuse them later</li>
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
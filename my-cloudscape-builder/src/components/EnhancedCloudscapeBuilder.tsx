// File: src/components/EnhancedCloudscapeBuilder.tsx
import React from 'react';
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
import Icon from '@cloudscape-design/components/icon';

// Configuration and sub–components
import { componentLibrary } from '../config/componentLibrary';
import DraggableComponent from './DraggableComponent';
import DroppableSection from './DroppableSection';
import useBuilderLogic from './useBuilderLogic';

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
  } = useBuilderLogic();

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
                  ? <DroppableSection section="modals" components={modals} darkMode={darkMode} onDrop={addComponentToSection} onSelect={selectComponent} onRemove={removeComponent} />
                  : <DroppableSection section={activeSection} components={appLayoutConfig[activeSection]} darkMode={darkMode} onDrop={addComponentToSection} onSelect={selectComponent} onRemove={removeComponent} />}
              </Container>
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Container header={<Header>Properties</Header>}>
                  {selectedComponent ? (
                    <Form>
                      {Object.entries(componentProperties).map(([key, value]) => (
                        <FormField key={key} label={key}>
                          <Input value={value?.toString() || ''} onChange={({ detail }) => updateComponentProperty(key, detail.value)} />
                        </FormField>
                      ))}
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

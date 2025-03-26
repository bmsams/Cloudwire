// Helper functions for managing nested components

export const reorderNestedChildren = (
  components: any[],
  parentId: string,
  sourceId: string,
  targetIndex: number
): any[] => {
  return components.map(comp => {
    if (comp.id === parentId && comp.children && comp.children.length > 0) {
      const currentIndex = comp.children.findIndex((child: any) => child.id === sourceId);
      if (currentIndex === -1) return comp;
      const newChildren = [...comp.children];
      const [removed] = newChildren.splice(currentIndex, 1);
      newChildren.splice(targetIndex, 0, removed);
      return { ...comp, children: newChildren };
    } else if (comp.children && comp.children.length > 0) {
      return { ...comp, children: reorderNestedChildren(comp.children, parentId, sourceId, targetIndex) };
    }
    return comp;
  });
};

// A wrapper to update nested component ordering in the main state
export const moveNestedComponent = (
  stateComponents: any[],
  parentId: string,
  sourceId: string,
  targetIndex: number
): any[] => {
  return reorderNestedChildren(stateComponents, parentId, sourceId, targetIndex);
};

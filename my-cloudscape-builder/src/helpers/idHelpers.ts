// Helper functions for generating and sanitizing IDs
export const generateUniqueId = (componentType: string): string => {
  return `${componentType}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  };

  export const sanitizeId = (id: string): string => {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
    };
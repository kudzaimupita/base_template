// Simple Override Execution Manager
// Prevents double execution and infinite loops with minimal complexity

// Global registry - one execution per element per app session
const EXECUTED_ELEMENTS = new Set<string>();

export class SimpleOverrideManager {
  
  static shouldExecute(appId: string, elementId: string): boolean {
    const key = `${appId}-${elementId}`;
    
    if (EXECUTED_ELEMENTS.has(key)) {
      console.log(`[${elementId}] ✋ BLOCKED: Already executed`);
      return false;
    }
    
    // Mark as executed immediately
    EXECUTED_ELEMENTS.add(key);
    console.log(`[${elementId}] ✅ ALLOWED: First execution (registry: ${EXECUTED_ELEMENTS.size})`);
    return true;
  }
  
  static reset(): void {
    EXECUTED_ELEMENTS.clear();
    console.log('🔄 Override registry cleared');
  }
  
  static getRegistrySize(): number {
    return EXECUTED_ELEMENTS.size;
  }
}

// Hook for components to use
export const useSimpleOverrideManager = (appId: string, elementId: string) => {
  const shouldExecute = () => SimpleOverrideManager.shouldExecute(appId, elementId);
  
  return { shouldExecute };
}; 
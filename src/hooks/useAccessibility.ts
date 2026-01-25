import { useContext } from 'react';
import { AccessibilityContext } from '../contexts/accessibility-context';

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};


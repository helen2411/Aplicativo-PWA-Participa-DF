export interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  isTalkBackEnabled: boolean;
  toggleTalkBack: () => void;
  speak: (text: string) => void;
}

import { createContext } from 'react';
export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Privacy Store — hide/show sensitive amounts globally
 */

import { create } from 'zustand';

interface PrivacyState {
  isHidden: boolean;
  toggle: () => void;
  mask: (text: string) => string;
}

export const usePrivacy = create<PrivacyState>((set, get) => ({
  isHidden: false,
  toggle: () => set(s => ({ isHidden: !s.isHidden })),
  mask: (text: string) => get().isHidden ? '••••••' : text,
}));

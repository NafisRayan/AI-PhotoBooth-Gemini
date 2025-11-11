import { create } from 'zustand';
import { AspectRatio, StylePreset, Theme, ToastProps, FileContent, MimeType } from './types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;

  prompt: string;
  setPrompt: (prompt: string) => void;

  contextImageBase64: FileContent | null;
  setContextImageBase64: (image: FileContent | null) => void;
  contextImageMimeType: MimeType | null;
  setContextImageMimeType: (mimeType: MimeType | null) => void;

  currentImageBase64: string | null;
  setCurrentImageBase64: (image: string | null) => void;

  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  
  generationOptions: {
    aspectRatio: AspectRatio;
    stylePreset: StylePreset;
  };
  setGenerationOption: <K extends keyof AppState['generationOptions']>(key: K, value: AppState['generationOptions'][K]) => void;

  toasts: ToastProps[];
  addToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  prompt: '',
  setPrompt: (prompt) => set({ prompt }),

  contextImageBase64: null,
  setContextImageBase64: (image) => set({ contextImageBase64: image }),
  contextImageMimeType: null,
  setContextImageMimeType: (mimeType) => set({ contextImageMimeType: mimeType }),

  currentImageBase64: null,
  setCurrentImageBase64: (image) => set({ currentImageBase64: image }),

  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),

  generationOptions: {
    aspectRatio: AspectRatio.SQUARE,
    stylePreset: StylePreset.PHOTOREALISTIC,
  },
  setGenerationOption: (key, value) => set((state) => ({
    generationOptions: {
      ...state.generationOptions,
      [key]: value,
    },
  })),

  toasts: [],
  addToast: (message, type = 'info', duration = 3000) => {
    const id = uuidv4();
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
    setTimeout(() => get().removeToast(id), duration);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));
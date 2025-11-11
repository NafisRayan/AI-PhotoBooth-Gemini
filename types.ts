import { ReactNode } from 'react';

export interface ImageGenerationOptions {
  aspectRatio: AspectRatio;
  stylePreset: StylePreset;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '16:9',
}

export enum StylePreset {
  PHOTOREALISTIC = 'Photorealistic',
  DIGITAL_ART = 'Digital Art',
  ANIME = 'Anime',
  THREED_RENDER = '3D Render',
  SKETCH = 'Sketch',
}

export type Theme = 'light' | 'dark';

export interface ToastProps {
  id: string;
  message: string | ReactNode;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export type FileContent = string; // Base64 encoded string
export type MimeType = string;

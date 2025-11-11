import { AspectRatio, StylePreset } from './types';

export const ASPECT_RATIO_OPTIONS = [
  { value: AspectRatio.SQUARE, label: 'Square (1:1)' },
  { value: AspectRatio.PORTRAIT, label: 'Portrait (3:4)' },
  { value: AspectRatio.LANDSCAPE, label: 'Landscape (16:9)' },
];

export const STYLE_PRESET_OPTIONS = [
  { value: StylePreset.PHOTOREALISTIC, label: 'Photorealistic' },
  { value: StylePreset.DIGITAL_ART, label: 'Digital Art' },
  { value: StylePreset.ANIME, label: 'Anime' },
  { value: StylePreset.THREED_RENDER, label: '3D Render' },
  { value: StylePreset.SKETCH, label: 'Sketch' },
];

export const INITIAL_PROMPT_PLACEHOLDERS = [
  "A majestic lion with a golden mane, digital painting, vibrant colors.",
  "Futuristic city skyline at sunset, cyberpunk aesthetic, high detail.",
  "Enchanted forest with glowing mushrooms and fireflies, fantasy art.",
  "Abstract geometric patterns in pastel colors, modern design.",
  "A cozy cottage by a lake, surrounded by autumn trees, photorealistic.",
];

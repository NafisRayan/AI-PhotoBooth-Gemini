import { GoogleGenAI, Modality } from '@google/genai';
import { AspectRatio, ImageGenerationOptions, FileContent, MimeType } from '../types';

const getAspectRatioConfig = (aspectRatio: AspectRatio) => {
  switch (aspectRatio) {
    case AspectRatio.SQUARE:
      return '1:1';
    case AspectRatio.PORTRAIT:
      return '3:4';
    case AspectRatio.LANDSCAPE:
      return '16:9';
    default:
      return '1:1';
  }
};

export const generateImage = async (
  prompt: string,
  options: ImageGenerationOptions,
  contextImageBase64: FileContent | null = null,
  contextImageMimeType: MimeType | null = null
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not defined. Please ensure it is set in your environment.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let base64Result: string;

  try {
    if (contextImageBase64 && contextImageMimeType) {
      // Use gemini-2.5-flash-image for multimodal generation
      const imagePart = {
        inlineData: {
          mimeType: contextImageMimeType,
          data: contextImageBase64.split(',')[1], // Remove "data:image/png;base64," prefix
        },
      };
      const textPart = { text: `${prompt}, ${options.stylePreset}` };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // General Image Generation and Editing Tasks
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      if (response.candidates && response.candidates.length > 0 && response.candidates[0].content?.parts?.[0]?.inlineData) {
        base64Result = `data:${response.candidates[0].content.parts[0].inlineData.mimeType};base64,${response.candidates[0].content.parts[0].inlineData.data}`;
      } else {
        throw new Error('No image generated from multimodal prompt.');
      }
    } else {
      // Use imagen-4.0-generate-001 for text-only high-quality generation
      const model = 'imagen-4.0-generate-001';
      const response = await ai.models.generateImages({
        model: model,
        prompt: `${prompt}, ${options.stylePreset}`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg', // imagen-4.0 only supports image/jpeg or image/png
          aspectRatio: getAspectRatioConfig(options.aspectRatio),
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        base64Result = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      } else {
        throw new Error('No image generated from text-only prompt.');
      }
    }
    return base64Result;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};
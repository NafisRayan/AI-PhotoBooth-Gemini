
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ImageAnalysis } from '../types';

let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not defined in environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<ImageAnalysis> {
  const client = getGeminiClient();
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: 'Describe this image in detail and identify any prominent objects, people, or scenes.',
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Prioritize speed for analysis
      }
    });

    const text = response.text;
    const urls: string[] = [];

    // Extract URLs from grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks)) {
        for (const chunk of groundingChunks) {
            if (chunk.web && chunk.web.uri) {
                urls.push(chunk.web.uri);
            }
            if (chunk.maps && chunk.maps.uri) {
                urls.push(chunk.maps.uri);
            }
            if (chunk.maps?.placeAnswerSources && Array.isArray(chunk.maps.placeAnswerSources)) {
                for (const source of chunk.maps.placeAnswerSources) {
                    if (source.reviewSnippets && Array.isArray(source.reviewSnippets)) {
                        for (const snippet of source.reviewSnippets) {
                            if (snippet.uri) {
                                urls.push(snippet.uri);
                            }
                        }
                    }
                }
            }
        }
    }

    return { text, urls };
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error(`Failed to analyze image. ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function editImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  const client = getGeminiClient();
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash-image', // Model specifically for image editing/generation
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE], // Must be an array with a single `Modality.IMAGE` element.
      },
    });

    const editedImagePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (editedImagePart) {
      return editedImagePart;
    } else {
      throw new Error("Gemini did not return an edited image.");
    }
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw new Error(`Failed to edit image. ${error instanceof Error ? error.message : String(error)}`);
  }
}

import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import {
  ASPECT_RATIO_OPTIONS,
  INITIAL_PROMPT_PLACEHOLDERS,
  STYLE_PRESET_OPTIONS,
} from './constants';
import { generateImage } from './services/geminiService';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Textarea } from './components/ui/Textarea';
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from './components/ui/Card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/DropdownMenu';
import { ThemeToggle } from './components/ThemeToggle';
import { ToastContainer } from './components/ToastContainer';
import { ImageUpload } from './components/ImageUpload';
import { Settings } from './components/Settings';
import { AspectRatio, StylePreset } from './types';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const {
    theme,
    setTheme,
    apiKey,
    setApiKey,
    prompt,
    setPrompt,
    contextImageBase64,
    setContextImageBase64,
    contextImageMimeType,
    setContextImageMimeType,
    currentImageBase64,
    setCurrentImageBase64,
    isGenerating,
    setIsGenerating,
    generationOptions,
    setGenerationOption,
    addToast,
  } = useAppStore();

  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Apply theme from store
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Check for API key
    const savedApiKey = localStorage.getItem('gemini_api_key');
    setHasApiKey(!!savedApiKey);
    
    if (!savedApiKey) {
      setShowSettings(true);
    }

    // Set a random initial prompt placeholder
    const randomIndex = Math.floor(Math.random() * INITIAL_PROMPT_PLACEHOLDERS.length);
    setCurrentPlaceholder(INITIAL_PROMPT_PLACEHOLDERS[randomIndex]);
  }, [theme]);


  const handleGenerateImage = async () => {
    if (!prompt.trim() && !contextImageBase64) {
      addToast('Please enter a prompt or upload a context image.', 'info');
      return;
    }

    // Check for API key
    if (!hasApiKey) {
      setShowSettings(true);
      addToast('Please set up your API key in Settings first.', 'info');
      return;
    }

    setIsGenerating(true);
    setCurrentImageBase64(null); // Clear previous image
    try {
      const base64Data = await generateImage(
        prompt,
        generationOptions,
        contextImageBase64,
        contextImageMimeType
      );
      setCurrentImageBase64(base64Data);
      addToast('Image generated successfully!', 'success');
    } catch (error: any) {
      console.error('Generation error:', error);
      if (error.message.includes('API key')) {
        addToast('Invalid or missing API key. Please check your Settings.', 'error');
        setShowSettings(true);
      } else {
        addToast(`Error generating image: ${error.message}`, 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    // Check for API key after settings close
    const savedApiKey = localStorage.getItem('gemini_api_key');
    setHasApiKey(!!savedApiKey);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Please upload an image file.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        addToast('Image size should not exceed 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setContextImageBase64(reader.result as string);
        setContextImageMimeType(file.type);
        addToast('Image uploaded successfully.', 'success');
      };
      reader.onerror = () => {
        addToast('Failed to read image file.', 'error');
      };
      reader.readAsDataURL(file);
    } else {
      setContextImageBase64(null);
      setContextImageMimeType(null);
    }
  };

  const clearContextImage = () => {
    setContextImageBase64(null);
    setContextImageMimeType(null);
    // Optionally clear the file input value
    const fileInput = document.getElementById('context-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    addToast('Context image cleared.', 'info');
  };

  const downloadImage = (base64Data: string, filename: string, mimeType: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Image downloaded.', 'success');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Pixel AI</h1>
          <div className="flex items-center gap-2">
            {!hasApiKey && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                API Key Required
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
            <ThemeToggle />
          </div>
        </nav>

        {/* Generate Tab Content */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Generate New Image</CardTitle>
            <CardDescription>
              Enter a detailed prompt and optionally upload a context image to generate an image using the Gemini API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={currentPlaceholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              aria-label="Image generation prompt"
            />

            <div>
              <h3 className="text-md font-medium mb-2">Context Image (Optional)</h3>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageClear={clearContextImage}
                imagePreview={contextImageBase64}
                isUploading={isGenerating}
                disabled={isGenerating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-md font-medium mb-2">Aspect Ratio</h3>
                <div className="flex gap-2 flex-wrap">
                  {ASPECT_RATIO_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={generationOptions.aspectRatio === option.value ? 'default' : 'outline'}
                      onClick={() => setGenerationOption('aspectRatio', option.value)}
                      disabled={isGenerating}
                      aria-pressed={generationOptions.aspectRatio === option.value}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Style Preset</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isGenerating} className="w-full justify-between" aria-haspopup="listbox" aria-expanded={false}>
                      {STYLE_PRESET_OPTIONS.find(
                        (option) => option.value === generationOptions.stylePreset
                      )?.label || 'Select Style'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" aria-label="Select Style Preset">
                    {STYLE_PRESET_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setGenerationOption('stylePreset', option.value)}
                        role="option"
                        aria-selected={generationOptions.stylePreset === option.value}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleGenerateImage} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </CardFooter>
        </Card>

        {currentImageBase64 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-4">
              {isGenerating ? (
                <div className="w-full h-64 bg-muted animate-pulse flex items-center justify-center rounded-md">
                  <span className="text-muted-foreground">Loading image...</span>
                </div>
              ) : (
                <img src={currentImageBase64} alt="Generated" className="max-w-full h-auto rounded-md shadow-md" />
              )}
            </CardContent>
            {currentImageBase64 && !isGenerating && (
              <CardFooter className="justify-end">
                <Button onClick={() => downloadImage(currentImageBase64, `pixel-ai-${uuidv4().substring(0, 8)}.jpeg`, 'image/jpeg')}>
                  Download Image
                </Button>
              </CardFooter>
            )}
          </Card>
        )}
        {!currentImageBase64 && isGenerating && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-4">
              <div className="w-full h-64 bg-muted animate-pulse flex items-center justify-center rounded-md">
                <span className="text-muted-foreground">Loading image...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <ToastContainer />
      <Settings isOpen={showSettings} onClose={handleSettingsClose} />
    </div>
  );
};

export default App;
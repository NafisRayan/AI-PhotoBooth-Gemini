import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ImageUpload from './components/ImageUpload';
import ChatInterface from './components/ChatInterface';
import { analyzeImage, editImage } from './services/geminiService';
import { ChatMessage, ImageAnalysis } from './types';
import { base64ToDataURL, base64ToBlob } from './utils/imageUtils';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Sun, Moon, Download } from './components/ui/icons';

// Define Theme Context and Type
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ThemeToggle Component
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </Button>
  );
};

function App() {
  const [originalImage, setOriginalImage] = useState<string | undefined>(undefined); // base64
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined); // base64
  const [currentImageMimeType, setCurrentImageMimeType] = useState<string | undefined>(undefined);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | undefined>(undefined);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark'; // Default to dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleImageUpload = useCallback(async (base64: string, mimeType: string) => {
    setError(undefined);
    setLoading(true);
    setOriginalImage(base64);
    setCurrentImage(base64);
    setCurrentImageMimeType(mimeType);
    setChatMessages([{ role: 'model', content: 'Image uploaded successfully! Analyzing it now...' } as ChatMessage]);

    try {
      const analysisResult = await analyzeImage(base64, mimeType);
      setImageAnalysis(analysisResult);
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', content: `Analysis: ${analysisResult.text}` } as ChatMessage,
        ...(analysisResult.urls.length > 0 ? [
          { role: 'model', content: `Sources: ${analysisResult.urls.map(url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${new URL(url).hostname}</a>`).join(', ')}` } as ChatMessage
        ] : [])
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image analysis.';
      setError(`Image analysis failed: ${errorMessage}`);
      setChatMessages((prev) => [...prev, { role: 'model', content: `Error during analysis: ${errorMessage}` } as ChatMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!currentImage || !currentImageMimeType) {
      setError("Please upload an image first.");
      setChatMessages((prev) => [...prev, { role: 'model', content: "Please upload an image first to start editing." } as ChatMessage]);
      return;
    }

    setError(undefined);
    setLoading(true);
    setChatMessages((prev) => [...prev, { role: 'user', content: message } as ChatMessage]);

    try {
      const newBase64Image = await editImage(currentImage, currentImageMimeType, message);
      setCurrentImage(newBase64Image);
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Image successfully edited!' } as ChatMessage,
        { role: 'model', content: 'What\'s next for your time-travel photo?' } as ChatMessage
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image editing.';
      setError(`Image editing failed: ${errorMessage}`);
      setChatMessages((prev) => [...prev, { role: 'model', content: `Error during editing: ${errorMessage}` } as ChatMessage]);
    } finally {
      setLoading(false);
    }
  }, [currentImage, currentImageMimeType]);

  const handleDownload = () => {
    if (currentImage && currentImageMimeType) {
      const blob = base64ToBlob(currentImage, currentImageMimeType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time_travel_photo_${Date.now()}.${currentImageMimeType.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("No image to download!");
    }
  };

  const currentImageUrl = currentImage ? base64ToDataURL(currentImage, currentImageMimeType || 'image/png') : undefined;

  const themeContextValue = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Time-Travel Photo Booth</h1>
                <p className="text-sm text-muted-foreground">
                  Upload a photo, get it analyzed by AI, and edit it with natural language
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-7xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
            {/* Left Column - Image Display */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-muted rounded-lg p-6 relative overflow-hidden">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Generating magic...</p>
                      </div>
                    </div>
                  )}
                  
                  {currentImageUrl ? (
                    <img 
                      src={currentImageUrl} 
                      alt="Current edited image" 
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground space-y-2">
                      <p className="text-lg">Ready to start your journey?</p>
                      <p>Upload an image to begin your time-travel adventure!</p>
                    </div>
                  )}
                </div>
                
                {currentImageUrl && (
                  <Button 
                    onClick={handleDownload} 
                    className="mt-4 w-full" 
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Edited Photo
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Upload and Chat */}
            <div className="flex flex-col space-y-6">
              {error && (
                <Card className="border-destructive/50">
                  <CardContent className="pt-6">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Upload Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload 
                    onImageUpload={handleImageUpload} 
                    currentImage={originalImage ? base64ToDataURL(originalImage, currentImageMimeType || 'image/png') : undefined} 
                    loading={loading} 
                  />
                </CardContent>
              </Card>
              
              <div className="flex-1 min-h-[300px]">
                <ChatInterface 
                  messages={chatMessages} 
                  onSendMessage={handleSendMessage} 
                  loading={loading} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;


import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ImageUpload from './components/ImageUpload';
import ChatInterface from './components/ChatInterface';
import { analyzeImage, editImage } from './services/geminiService';
import { ChatMessage, ImageAnalysis } from './types';
import { base64ToDataURL, base64ToBlob } from './utils/imageUtils';

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

// ThemeToggle Component (placed here for self-contained file update, would typically be in its own file)
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun h-5 w-5 text-yellow-500">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.67 17.67l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon h-5 w-5 text-indigo-700">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
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
    // FIX: Explicitly type the new chat message as ChatMessage
    setChatMessages([{ role: 'model', content: 'Image uploaded successfully! Analyzing it now...' } as ChatMessage]);

    try {
      const analysisResult = await analyzeImage(base64, mimeType);
      setImageAnalysis(analysisResult);
      setChatMessages((prev) => [
        ...prev,
        // FIX: Explicitly type the new chat message as ChatMessage
        { role: 'model', content: `Analysis: ${analysisResult.text}` } as ChatMessage,
        ...(analysisResult.urls.length > 0 ? [
          // FIX: Explicitly type the new chat message as ChatMessage
          { role: 'model', content: `Sources: ${analysisResult.urls.map(url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 dark:text-indigo-300 hover:underline">${new URL(url).hostname}</a>`).join(', ')}` } as ChatMessage
        ] : [])
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image analysis.';
      setError(`Image analysis failed: ${errorMessage}`);
      // FIX: Explicitly type the new chat message as ChatMessage
      setChatMessages((prev) => [...prev, { role: 'model', content: `Error during analysis: ${errorMessage}` } as ChatMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!currentImage || !currentImageMimeType) {
      setError("Please upload an image first.");
      // FIX: Explicitly type the new chat message as ChatMessage
      setChatMessages((prev) => [...prev, { role: 'model', content: "Please upload an image first to start editing." } as ChatMessage]);
      return;
    }

    setError(undefined);
    setLoading(true);
    // FIX: Explicitly type the new chat message as ChatMessage
    setChatMessages((prev) => [...prev, { role: 'user', content: message } as ChatMessage]);

    try {
      const newBase64Image = await editImage(currentImage, currentImageMimeType, message);
      setCurrentImage(newBase64Image);
      setChatMessages((prev) => [
        ...prev,
        // FIX: Explicitly type the new chat message as ChatMessage
        { role: 'model', content: 'Image successfully edited!' } as ChatMessage,
        // FIX: Explicitly type the new chat message as ChatMessage
        { role: 'model', content: 'What\'s next for your time-travel photo?' } as ChatMessage
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image editing.';
      setError(`Image editing failed: ${errorMessage}`);
      // FIX: Explicitly type the new chat message as ChatMessage
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
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl bg-card text-card-foreground rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 md:flex md:flex-row min-h-[90vh]">
          <div className="md:w-1/2 p-6 flex flex-col justify-between">
            <header className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Time-Travel Photo Booth</h1>
              <ThemeToggle />
            </header>

            <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative shadow-inner border border-gray-200 dark:border-gray-700">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10 rounded-lg">
                  <div className="flex flex-col items-center text-white">
                    <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3 text-lg">Generating magic...</p>
                  </div>
                </div>
              )}
              {currentImageUrl ? (
                <img src={currentImageUrl} alt="Current edited" className="max-w-full max-h-full object-contain rounded-lg" />
              ) : (
                <div className="text-gray-500 text-center text-xl p-4">Upload an image to begin your time-travel journey!</div>
              )}
            </div>
            {currentImageUrl && (
              <button
                onClick={handleDownload}
                className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
                disabled={loading}
              >
                Download Edited Photo
              </button>
            )}
          </div>

          <div className="md:w-1/2 p-6 flex flex-col">
            {error && (
              <div className="bg-destructive text-destructive-foreground p-3 rounded-lg mb-4 text-sm text-center animate-pulse border border-red-400 dark:border-red-700">
                {error}
              </div>
            )}
            <div className="mb-6">
              <ImageUpload onImageUpload={handleImageUpload} currentImage={originalImage ? base64ToDataURL(originalImage, currentImageMimeType || 'image/png') : undefined} loading={loading} />
            </div>
            <div className="flex-grow min-h-[300px] md:min-h-[500px]">
              <ChatInterface messages={chatMessages} onSendMessage={handleSendMessage} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;

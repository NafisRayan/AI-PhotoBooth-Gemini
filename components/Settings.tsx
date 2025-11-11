import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { addToast } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      // Load saved API key when dialog opens
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      setValidationError(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setValidationError('Please enter a valid API key');
      return;
    }

    if (!apiKey.startsWith('AIza') || apiKey.length < 20) {
      setValidationError('Please enter a valid Gemini API key (should start with "AIza")');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Save to localStorage
      localStorage.setItem('gemini_api_key', apiKey.trim());
      
      // Test the API key by making a simple request
      await testApiKey(apiKey.trim());
      
      addToast('Settings saved successfully! API key validated.', 'success');
      onClose();
    } catch (error) {
      console.error('API key validation failed:', error);
      setValidationError('Invalid API key. Please check your key and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const testApiKey = async (key: string): Promise<void> => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API key validation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.models || data.models.length === 0) {
      throw new Error('API key appears to be invalid');
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setValidationError(null);
    addToast('API key cleared from local storage.', 'info');
  };

  const getApiKeyStatus = () => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      return {
        status: 'configured',
        message: 'API key is configured',
        color: 'text-green-500'
      };
    }
    return {
      status: 'missing',
      message: 'No API key configured',
      color: 'text-red-500'
    };
  };

  const status = getApiKeyStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Gemini API key to enable AI image generation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="api-key" className="text-sm font-medium">
                Gemini API Key
              </label>
              <span className={cn("text-sm font-medium", status.color)}>
                {status.message}
              </span>
            </div>
            
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationError(null);
              }}
              disabled={isValidating}
              className={cn(
                validationError && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            />
            
            {validationError && (
              <p className="text-sm text-red-500">{validationError}</p>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-medium">How to get your API key:</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key" button</li>
              <li>Copy and paste the key here</li>
            </ol>
          </div>

          {localStorage.getItem('gemini_api_key') && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">API Key Status</p>
                <p className="text-xs text-muted-foreground">
                  Key is saved locally in your browser
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearApiKey}
                disabled={isValidating}
              >
                Clear Key
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isValidating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isValidating}>
            {isValidating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Validating...
              </>
            ) : (
              'Save & Test'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { Settings };
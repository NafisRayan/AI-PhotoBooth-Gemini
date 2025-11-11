import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, loading }) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !loading) {
      const messageToSend = inputMessage;
      setInputMessage('');
      await onSendMessage(messageToSend);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground rounded-lg shadow-sm border border-input">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p>Ready for a time-travel adventure?</p>
            <p>Upload an image and then tell me what to do!</p>
            <p className="text-sm italic mt-2">Example: "Make me look like I'm in ancient Rome"</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg text-sm shadow
                  ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
              >
                {/* Render content as HTML if it contains anchor tags for URLs */}
                <span dangerouslySetInnerHTML={{ __html: msg.content }} />
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-input">
        <div className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={loading ? "Generating..." : "Type your time-travel prompt here..."}
            className="flex-grow h-12 border border-input bg-background rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          />
          <button
            type="submit"
            className={`ml-3 px-6 py-2 rounded-md font-semibold text-primary-foreground transition-colors duration-200 h-12
              ${loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}
            `}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-primary-foreground mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
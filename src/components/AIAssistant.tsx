'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  loading?: boolean;
  debug?: {
    timestamp: string;
    level: string;
    message: string;
  }[];
}

interface Position {
  x: number;
  y: number;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiResponse {
  result: {
    final_output: {
      confidence: number;
      response: string;
    };
    steps: Array<{
      action: string;
      input: any;
      output: any;
      timestamp: number;
    }>;
  };
  debug?: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [showDebug, setShowDebug] = useState<number | null>(null);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearConversation = () => {
    setMessages([]);
    setInput('');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize position to center of viewport on mount
  useEffect(() => {
    if (windowRef.current && position.x === 0 && position.y === 0) {
      const rect = windowRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2,
      });
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        setPosition(prev => ({
          x: Math.min(Math.max(0, prev.x), maxX),
          y: Math.min(Math.max(0, prev.y), maxY),
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDragging = (e: React.MouseEvent) => {
    if (!windowRef.current) return;

    // Calculate the offset from the mouse position to the window's current position
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !windowRef.current) return;

    const rect = windowRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    // Calculate new position by subtracting the initial offset
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const stopDragging = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('mouseleave', stopDragging);

      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', stopDragging);
        window.removeEventListener('mouseleave', stopDragging);
      };
    }
  }, [isDragging]);

  const callApi = async (userInput: string) => {
    try {
      console.log('Sending request to API:', userInput);
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          input: userInput,
          debug: true
        })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('API Response data:', data);

      if (!data.result?.final_output?.response) {
        console.error('Invalid API response format:', data);
        throw new Error('Invalid API response format');
      }

      return {
        response: data.result.final_output.response,
        debug: data.debug
      };
    } catch (error: unknown) {
      console.error('API call failed:', error);
      
      if (error instanceof TypeError) {
        console.error('Network error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        if (error.message.includes('Failed to fetch')) {
          return {
            response: 'Unable to connect to the API. Please ensure the API server is running at http://localhost:8080',
            debug: undefined
          };
        }
      }
      
      return {
        response: error instanceof Error 
          ? `Error: ${error.message}. Please try again.`
          : 'An unexpected error occurred. Please try again.',
        debug: undefined
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { content: userMessage, role: 'user' }]);
    
    // Add assistant message with loading state
    setMessages(prev => [...prev, { content: 'Thinking...', role: 'assistant', loading: true }]);

    // Call API
    const { response, debug } = await callApi(userMessage);

    // Replace loading message with actual response
    setMessages(prev => prev.map((msg, index) => {
      if (index === prev.length - 1) {
        return { content: response, role: 'assistant', debug };
      }
      return msg;
    }));
  };

  const toggleDebug = (index: number) => {
    setShowDebug(showDebug === index ? null : index);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={windowRef}
      className={`cm-ai-floating-window ${isDragging ? 'dragging' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div 
        className={`cm-ai-header ${isDragging ? 'grabbing' : ''}`}
        onMouseDown={startDragging}
      >
        <h2 className="cm-ai-header-title">AI Assistant</h2>
        <div className="cm-ai-header-controls">
          <button className="cm-button" aria-label="Close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4l-8 8m0-8l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="cm-ai-content">
        <div className="cm-ai-sidebar">
          <button className="cm-new-thread-button" onClick={clearConversation}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12m-6-6h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New thread
          </button>
        </div>

        <div className="cm-ai-main">
          <div className="cm-ai-messages">
            {messages.length === 0 ? (
              <div className="cm-ai-welcome">
                <div className="cm-ai-logo">
                  <img src="/logo.png" alt="AI Assistant Logo" width="67" height="67" />
                </div>
                <h1>How can I help today?</h1>
                <p>Ask me anything! I can help you with calculations and more.</p>
              </div>
            ) : (
              <div className="messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message-container ${message.role}`}>
                    <div className={`message ${message.loading ? 'loading' : ''}`}>
                      {message.content}
                      {message.debug && (
                        <button
                          className="debug-button"
                          onClick={() => toggleDebug(index)}
                          title="Show debug information"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M8 5v4m0 2v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    {showDebug === index && message.debug && (
                      <div className="debug-info">
                        <pre>{message.debug.map(d => 
                          `[${d.timestamp}] ${d.level}: ${d.message}`
                        ).join('\n')}</pre>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="cm-ai-input">
            <form onSubmit={handleSubmit}>
              <div className="cm-ai-input-container">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the AI Assistant a question"
                />
                <button type="submit" disabled={!input.trim()}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 2L3 7l4 2 2 4 5-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="cm-ai-disclaimer">Assistant can make mistakes. Verify responses.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 
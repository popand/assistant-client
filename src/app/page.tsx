'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const AIAssistant = dynamic(() => import('../components/AIAssistant'), {
  ssr: false,
});

export default function Home() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-neutral-1 to-neutral-2 pointer-events-auto">
        <div className="px-8 py-16">
          <div className="space-y-6">
            <button 
              onClick={() => setIsAssistantOpen(true)}
              className="inline-flex items-center gap-3 px-4 py-2 bg-blue-1 rounded-full text-blue-6 text-sm font-medium hover:bg-blue-2 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5v13m-6.5-6.5h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Assistant
            </button>
            
            <h1 className="text-4xl font-bold tracking-tight text-neutral-16">
              AI Assistant Demo
            </h1>
            
            <div className="space-y-4">
              <p className="text-xl font-medium text-neutral-16">
                Welcome to the Workflow's AI Agent integration demo.
              </p>
              
              <div className="space-y-4 text-lg text-neutral-11">
                <p className="leading-relaxed">
                  This showcase demonstrates how our AI assistant seamlessly integrates with your workflow environment.
                </p>
                
                <div className="bg-neutral-1 rounded-xl p-6 border border-neutral-4">
                  <h2 className="font-medium text-neutral-16 mb-3">Getting Started</h2>
                  <ol className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-6">1.</span>
                      Click the "<span className="text-blue-6 font-medium">+ Assistant</span>" button above to launch a new session
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-6">2.</span>
                      Interact with the assistant through the chat interface
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-6">3.</span>
                      Move the window anywhere on your screen
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-6">4.</span>
                      Close it when you're done
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed inset-0 pointer-events-none">
        <AIAssistant 
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />
      </div>
    </>
  );
}

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

/** A single authenticated entry point into the AgencyOS Consultora. */
export const AIAssistantWidget: React.FC<{onOpen: () => void}> = ({onOpen}) =>
 <button type="button" onClick={onOpen} title="Abrir Consultora AgencyOS"
  aria-label="Abrir Consultora AgencyOS"
  className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-white text-[#10203A] shadow-xl flex items-center justify-center hover:scale-105 transition-transform ring-4 ring-black/25">
   <Bot className="w-6 h-6"/>
   <Sparkles className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-blue-600"/>
 </button>;

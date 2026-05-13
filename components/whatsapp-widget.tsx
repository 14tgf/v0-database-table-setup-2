'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsAppWidget() {
  const whatsappNumber = '13479259642';
  const whatsappMessage = 'Hello! I would like to inquire about your services.';
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 group"
      aria-label="Contact us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      
      {/* Pulse animation effect */}
      <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping group-hover:animate-pulse" />
    </a>
  );
}

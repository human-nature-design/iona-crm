"use client";

import { useEffect, useState } from "react";

interface SuccessNotificationProps {
  show: boolean;
  onClose: () => void;
  message?: string;
  title?: string;
  autoHideDuration?: number;
}

export function SuccessNotification({
  show,
  onClose,
  message = "Thank you for reaching out. We'll be in touch within 24 hours.",
  title = "SUCCESS!",
  autoHideDuration = 5000,
}: SuccessNotificationProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (show) {
      setProgress(100);
      
      // Start progress animation
      const progressTimer = setTimeout(() => {
        setProgress(0);
      }, 100);

      // Auto-hide after duration
      const hideTimer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => {
        clearTimeout(progressTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, onClose, autoHideDuration]);

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] transition-all duration-500 ${
        show
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 max-w-[400px] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black hover:bg-black hover:text-white w-8 h-8 flex items-center justify-center transition-colors duration-200 border-2 border-black"
          aria-label="Close notification"
        >
          ×
        </button>
        
        {/* Success icon - geometric shape */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-[#FF1493] rotate-45"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">✓</span>
            </div>
          </div>
          <h3 className="text-xl font-office-times-mono tracking-[2px] text-black font-bold">{title}</h3>
        </div>
        
        <p className="text-base font-ibm-plex-mono text-black leading-relaxed">
          {message}
        </p>
        
        {/* Progress bar that shows remaining time */}
        <div className="mt-4 h-1 bg-gray-200 overflow-hidden">
          <div 
            className="h-full bg-[#FF1493] transition-all ease-linear"
            style={{
              width: `${progress}%`,
              transitionDuration: show ? `${autoHideDuration}ms` : '0ms'
            }}
          />
        </div>
      </div>
    </div>
  );
}
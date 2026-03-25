"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    // Trigger fill animation slightly after mount
    const fillTimer = setTimeout(() => setIsFilled(true), 100);
    
    // Disappear right after fill completes (1500ms + buffer)
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setIsMounted(false);
    }, 1800);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background ${
        isVisible ? "opacity-100" : "hidden opacity-0"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Brand Logo */}
        <div className="relative w-fit mx-auto group">
          {/* Base Layer (Muted Outline/Ghost) */}
          <h1 className="text-6xl font-bold tracking-tighter lowercase text-foreground/10 italic pr-4 whitespace-nowrap">
            equis
          </h1>
          
          {/* Fill Layer (Solid Reveal Wrapper) */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ 
              width: isFilled ? '100%' : '0%',
              transition: 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)',
              transitionDelay: isFilled ? '100ms' : '0ms'
            }}
          >
            <h1 className="text-6xl font-bold tracking-tighter lowercase text-foreground italic pr-4 whitespace-nowrap">
              equis
            </h1>
          </div>
        </div>
        
        {/* Simplified progress container */}
        <div className="mt-8 w-12 h-[1px] bg-foreground/10 overflow-hidden" />
      </div>
    </div>
  );
}

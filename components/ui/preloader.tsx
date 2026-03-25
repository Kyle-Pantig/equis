"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    // Trigger fill animation slightly after mount
    const fillTimer = setTimeout(() => setIsFilled(true), 100);
    
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 500); // Wait for fade out
    }, 2000);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Brand Logo */}
        <div className="relative w-fit mx-auto">
          {/* Base Layer (Muted) */}
          <h1 
            className={`text-6xl font-bold tracking-tighter lowercase text-foreground/10 italic pr-4 whitespace-nowrap transition-all duration-1000 ease-out transform ${
              isVisible ? "scale-100 blur-0 opacity-100" : "scale-110 blur-xl opacity-0"
            }`}
          >
            equis
          </h1>
          {/* Fill Layer (Solid) */}
          <h1 
            className={`absolute inset-0 text-6xl font-bold tracking-tighter lowercase text-foreground italic pr-4 whitespace-nowrap pointer-events-none transition-all duration-1000 ease-out transform ${
              isVisible ? "scale-100 blur-0 opacity-100" : "scale-110 blur-xl opacity-0"
            }`}
            style={{
              clipPath: isFilled ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
              transition: isVisible 
                ? 'clip-path 1.5s cubic-bezier(0.65, 0, 0.35, 1), transform 1s ease-out, opacity 1s ease-out, blur 1s ease-out' 
                : 'opacity 0.5s ease-in, transform 0.5s ease-in'
            }}
          >
            equis
          </h1>
        </div>
        
        {/* Simplified progress container */}
        <div className="mt-8 w-12 h-[1px] bg-foreground/10 overflow-hidden" />
      </div>
    </div>
  );
}

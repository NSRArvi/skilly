"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { createPortal } from "react-dom";

export default function ImageGallery({ images, initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !isMounted) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-white/70 font-medium text-sm">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Prev */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 hidden sm:block"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image */}
      <div 
        className="w-full h-full flex items-center justify-center p-4 sm:p-12 cursor-default"
        onClick={onClose}
      >
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain shadow-2xl select-none"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing
        />
      </div>

      {/* Navigation Next */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 hidden sm:block"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      
      {/* Mobile Swipe Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 sm:hidden">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}

"use client";

import { useRef, useState, useEffect } from "react";
import { CharacterPosition } from "./CharacterInserter";

interface CanvasEditorProps {
  mangaPreview: string;
  characterPreview: string;
  position: CharacterPosition;
  onPositionChange: (position: CharacterPosition) => void;
  onDisplayScaleChange: (scale: number) => void;
  onMangaSizeChange: (size: { width: number; height: number }) => void;
  onCharacterSizeChange: (size: { width: number; height: number }) => void;
}

export default function CanvasEditor({
  mangaPreview,
  characterPreview,
  position,
  onPositionChange,
  onDisplayScaleChange,
  onMangaSizeChange,
  onCharacterSizeChange,
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mangaImgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mangaSize, setMangaSize] = useState({ width: 0, height: 0 });
  const [characterSize, setCharacterSize] = useState({ width: 100, height: 100 });
  const [displayedMangaSize, setDisplayedMangaSize] = useState({ width: 0, height: 0 });

  // Load manga dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setMangaSize({ width: img.width, height: img.height });
      onMangaSizeChange({ width: img.width, height: img.height });
    };
    img.src = mangaPreview;
  }, [mangaPreview, onMangaSizeChange]);

  // Load character dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCharacterSize({ width: img.width, height: img.height });
      onCharacterSizeChange({ width: img.width, height: img.height });
    };
    img.src = characterPreview;
  }, [characterPreview, onCharacterSizeChange]);

  // Track displayed manga size and calculate display scale
  useEffect(() => {
    const updateDisplayedSize = () => {
      if (mangaImgRef.current && mangaSize.width > 0) {
        const rect = mangaImgRef.current.getBoundingClientRect();
        setDisplayedMangaSize({ width: rect.width, height: rect.height });
        const scale = rect.width / mangaSize.width;
        onDisplayScaleChange(scale);
      }
    };
    
    updateDisplayedSize();
    window.addEventListener("resize", updateDisplayedSize);
    
    // Also update after image loads
    const timer = setTimeout(updateDisplayedSize, 100);
    
    return () => {
      window.removeEventListener("resize", updateDisplayedSize);
      clearTimeout(timer);
    };
  }, [mangaSize, onDisplayScaleChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    onPositionChange({
      ...position,
      x: Math.max(0, Math.min(newX, displayedMangaSize.width - 20)),
      y: Math.max(0, Math.min(newY, displayedMangaSize.height - 20)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate the preview size for character (capped at 150px for preview)
  const charPreviewMaxSize = 150;
  const charAspect = characterSize.width / characterSize.height;
  let charPreviewWidth, charPreviewHeight;
  if (charAspect > 1) {
    charPreviewWidth = charPreviewMaxSize;
    charPreviewHeight = charPreviewMaxSize / charAspect;
  } else {
    charPreviewHeight = charPreviewMaxSize;
    charPreviewWidth = charPreviewMaxSize * charAspect;
  }

  // Apply user scale to preview
  const scaledPreviewWidth = charPreviewWidth * position.scale;
  const scaledPreviewHeight = charPreviewHeight * position.scale;

  return (
    <div
      style={{
        background: "#111",
        border: "2px solid #1a1a1a",
        padding: "2rem",
        marginTop: "2rem",
      }}
    >
      <h3
        style={{
          fontFamily: "'Bangers', cursive",
          fontSize: "1.3rem",
          marginBottom: "1rem",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span style={{ color: "#ff2d2d" }}>3.</span> Position Character
        <span style={{ color: "#666", fontSize: "0.9rem", fontFamily: "inherit" }}>
          (drag to move)
        </span>
      </h3>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: "relative",
          width: "fit-content",
          maxWidth: "100%",
          margin: "0 auto",
          background: "#000",
          border: "2px solid #333",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        {/* Manga Background */}
        <img
          ref={mangaImgRef}
          src={mangaPreview}
          alt="Manga"
          style={{
            maxWidth: "800px",
            width: "100%",
            height: "auto",
            display: "block",
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable={false}
        />

        {/* Character Overlay */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            width: scaledPreviewWidth,
            height: scaledPreviewHeight,
            cursor: isDragging ? "grabbing" : "grab",
            border: "2px dashed #ff2d2d",
            boxShadow: "0 0 20px rgba(255, 45, 45, 0.3)",
          }}
        >
          <img
            src={characterPreview}
            alt="Character"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
            draggable={false}
          />
          <div
            style={{
              position: "absolute",
              top: "-25px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#ff2d2d",
              color: "#fff",
              padding: "2px 8px",
              fontSize: "0.7rem",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            DRAG ME
          </div>
        </div>
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#555",
          fontSize: "0.8rem",
          marginTop: "1rem",
        }}
      >
        Position: ({Math.round(position.x)}, {Math.round(position.y)}) | Scale: {position.scale.toFixed(1)}x
      </p>
    </div>
  );
}

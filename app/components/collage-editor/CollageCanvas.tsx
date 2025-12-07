"use client";

import { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { ImageElement, TextElement, SpeechBubble } from "./CollageEditor";

interface CollageCanvasProps {
  images: ImageElement[];
  texts: TextElement[];
  speechBubbles: SpeechBubble[];
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  onImagesChange: (images: ImageElement[]) => void;
  onTextsChange: (texts: TextElement[]) => void;
  onSpeechBubblesChange: (bubbles: SpeechBubble[]) => void;
  canvasSize: { width: number; height: number };
  backgroundColor: string;
  frameStyle: "none" | "solid" | "dashed" | "double";
  frameColor: string;
  frameWidth: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const CollageCanvas = forwardRef<HTMLCanvasElement, CollageCanvasProps>(
  (
    {
      images,
      texts,
      speechBubbles,
      selectedElement,
      onElementSelect,
      onImagesChange,
      onTextsChange,
      onSpeechBubblesChange,
      canvasSize,
      backgroundColor,
      frameStyle,
      frameColor,
      frameWidth,
      zoom,
      onZoomChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
    const [editingText, setEditingText] = useState<string | null>(null);
    const [editingTextValue, setEditingTextValue] = useState("");
    const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

    useEffect(() => {
      // Preload all images
      const imageMap = new Map<string, HTMLImageElement>();
      images.forEach((img) => {
        if (!loadedImages.has(img.id)) {
          const image = new Image();
          image.src = img.src;
          image.onload = () => {
            setLoadedImages((prev) => {
              const newMap = new Map(prev);
              newMap.set(img.id, image);
              return newMap;
            });
          };
        }
      });
    }, [images]);

    // Scale calculation
    useEffect(() => {
      const calculateScale = () => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        if (containerWidth > 0 && containerHeight > 0) {
          if (zoom > 0) {
            setScale(zoom);
          } else {
            const scaleX = containerWidth / canvasSize.width;
            const scaleY = containerHeight / canvasSize.height;
            const fitScale = Math.min(scaleX, scaleY) * 0.95;
            setScale(fitScale);
          }
        }
      };

      // Small delay on initial mount to ensure container is rendered
      const timeoutId = setTimeout(calculateScale, 100);
      calculateScale();

      return () => clearTimeout(timeoutId);
    }, [canvasSize.width, canvasSize.height, zoom]);
    
    // Recalculate on window resize when auto-fit
    useEffect(() => {
      if (zoom > 0) return;
      const handleResize = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        if (containerWidth > 0 && containerHeight > 0) {
          const scaleX = containerWidth / canvasSize.width;
          const scaleY = containerHeight / canvasSize.height;
          const fitScale = Math.min(scaleX, scaleY) * 0.95;
          setScale(fitScale);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [canvasSize.width, canvasSize.height, zoom]);

    const getCoordinates = (e: React.MouseEvent) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const canvas = typeof ref === "function" ? null : ref?.current;
      if (!canvas) return { x: 0, y: 0 };
      
      const canvasRect = canvas.getBoundingClientRect();
      
      // Get mouse position relative to canvas
      const x = (e.clientX - canvasRect.left) / scale;
      const y = (e.clientY - canvasRect.top) / scale;
      
      return { x, y };
    };

    const getResizeHandle = (img: ImageElement, x: number, y: number): string | null => {
      const handleSize = 12; // Handle size in canvas coordinates (larger for easier clicking)
      const handles = [
        { name: "nw", x: img.x, y: img.y },
        { name: "ne", x: img.x + img.width, y: img.y },
        { name: "sw", x: img.x, y: img.y + img.height },
        { name: "se", x: img.x + img.width, y: img.y + img.height },
        { name: "n", x: img.x + img.width / 2, y: img.y },
        { name: "s", x: img.x + img.width / 2, y: img.y + img.height },
        { name: "w", x: img.x, y: img.y + img.height / 2 },
        { name: "e", x: img.x + img.width, y: img.y + img.height / 2 },
      ];

      for (const handle of handles) {
        const dx = x - handle.x;
        const dy = y - handle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < handleSize) {
          return handle.name;
        }
      }
      return null;
    };

    const getBubbleResizeHandle = (bubble: SpeechBubble, x: number, y: number): string | null => {
      const handleSize = 12; // Handle size in canvas coordinates
      const handles = [
        { name: "nw", x: bubble.x, y: bubble.y },
        { name: "ne", x: bubble.x + bubble.width, y: bubble.y },
        { name: "sw", x: bubble.x, y: bubble.y + bubble.height },
        { name: "se", x: bubble.x + bubble.width, y: bubble.y + bubble.height },
        { name: "n", x: bubble.x + bubble.width / 2, y: bubble.y },
        { name: "s", x: bubble.x + bubble.width / 2, y: bubble.y + bubble.height },
        { name: "w", x: bubble.x, y: bubble.y + bubble.height / 2 },
        { name: "e", x: bubble.x + bubble.width, y: bubble.y + bubble.height / 2 },
      ];

      for (const handle of handles) {
        const dx = x - handle.x;
        const dy = y - handle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < handleSize) {
          return handle.name;
        }
      }
      return null;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      const coords = getCoordinates(e);
      let clicked = false;

      // Check if clicking on resize handle for selected speech bubble
      if (selectedElement?.startsWith("bubble-")) {
        const bubble = speechBubbles.find((b) => b.id === selectedElement);
        if (bubble) {
          const handle = getBubbleResizeHandle(bubble, coords.x, coords.y);
          if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
            setResizeStart({ width: bubble.width, height: bubble.height, x: bubble.x, y: bubble.y });
            clicked = true;
            return;
          }
        }
      }

      // Check if clicking on resize handle for selected image
      if (selectedElement?.startsWith("img-")) {
        const img = images.find((i) => i.id === selectedElement);
        if (img) {
          const handle = getResizeHandle(img, coords.x, coords.y);
          if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
            setResizeStart({ width: img.width, height: img.height, x: img.x, y: img.y });
            clicked = true;
            return;
          }
        }
      }

      // Check speech bubbles FIRST (so they can be selected even when over images)
      for (let i = speechBubbles.length - 1; i >= 0; i--) {
        const bubble = speechBubbles[i];
        if (
          coords.x >= bubble.x &&
          coords.x <= bubble.x + bubble.width &&
          coords.y >= bubble.y &&
          coords.y <= bubble.y + bubble.height
        ) {
          onElementSelect(bubble.id);
          setIsDragging(true);
          setDragStart({ x: coords.x - bubble.x, y: coords.y - bubble.y });
          clicked = true;
          break;
        }
      }

      // Check images (reverse order for top-most first)
      if (!clicked) {
        for (let i = images.length - 1; i >= 0; i--) {
          const img = images[i];
          if (
            coords.x >= img.x &&
            coords.x <= img.x + img.width &&
            coords.y >= img.y &&
            coords.y <= img.y + img.height
          ) {
            onElementSelect(img.id);
            setIsDragging(true);
            setDragStart({ x: coords.x - img.x, y: coords.y - img.y });
            clicked = true;
            break;
          }
        }
      }

      // Check texts
      if (!clicked) {
        for (let i = texts.length - 1; i >= 0; i--) {
          const text = texts[i];
          const metrics = measureText(text);
          if (
            coords.x >= text.x &&
            coords.x <= text.x + metrics.width &&
            coords.y >= text.y &&
            coords.y <= text.y + metrics.height
          ) {
            onElementSelect(text.id);
            setIsDragging(true);
            setDragStart({ x: coords.x - text.x, y: coords.y - text.y });
            clicked = true;
            break;
          }
        }
      }

      if (!clicked) {
        onElementSelect(null);
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      const coords = getCoordinates(e);

      // Handle resizing speech bubbles
      if (isResizing && selectedElement?.startsWith("bubble-") && resizeHandle) {
        const bubble = speechBubbles.find((b) => b.id === selectedElement);
        if (bubble) {
          let newX = bubble.x;
          let newY = bubble.y;
          let newWidth = bubble.width;
          let newHeight = bubble.height;

          const aspectRatio = resizeStart.width / resizeStart.height;
          const shiftKey = e.shiftKey; // Hold shift to maintain aspect ratio

          switch (resizeHandle) {
            case "nw":
              newWidth = resizeStart.width + (resizeStart.x - coords.x);
              newHeight = shiftKey ? newWidth / aspectRatio : resizeStart.height + (resizeStart.y - coords.y);
              newX = resizeStart.x + resizeStart.width - newWidth;
              newY = resizeStart.y + resizeStart.height - newHeight;
              break;
            case "ne":
              newWidth = coords.x - resizeStart.x;
              newHeight = shiftKey ? newWidth / aspectRatio : resizeStart.height + (resizeStart.y - coords.y);
              newY = resizeStart.y + resizeStart.height - newHeight;
              break;
            case "sw":
              newWidth = resizeStart.width + (resizeStart.x - coords.x);
              newHeight = shiftKey ? newWidth / aspectRatio : coords.y - resizeStart.y;
              newX = resizeStart.x + resizeStart.width - newWidth;
              break;
            case "se":
              newWidth = coords.x - resizeStart.x;
              newHeight = shiftKey ? newWidth / aspectRatio : coords.y - resizeStart.y;
              break;
            case "n":
              newHeight = resizeStart.height + (resizeStart.y - coords.y);
              newY = resizeStart.y + resizeStart.height - newHeight;
              break;
            case "s":
              newHeight = coords.y - resizeStart.y;
              break;
            case "w":
              newWidth = resizeStart.width + (resizeStart.x - coords.x);
              newX = resizeStart.x + resizeStart.width - newWidth;
              break;
            case "e":
              newWidth = coords.x - resizeStart.x;
              break;
          }

          // Minimum size constraints
          if (newWidth < 50) newWidth = 50;
          if (newHeight < 30) newHeight = 30;

          onSpeechBubblesChange(
            speechBubbles.map((b) =>
              b.id === selectedElement
                ? { ...b, x: newX, y: newY, width: newWidth, height: newHeight }
                : b
            )
          );
        }
        return;
      }

      // Handle resizing images
      if (isResizing && selectedElement?.startsWith("img-") && resizeHandle) {
        const img = images.find((i) => i.id === selectedElement);
        if (img) {
          let newX = img.x;
          let newY = img.y;
          let newWidth = img.width;
          let newHeight = img.height;

          const aspectRatio = resizeStart.width / resizeStart.height;
          const shiftKey = e.shiftKey; // Hold shift to maintain aspect ratio

          switch (resizeHandle) {
            case "nw":
              newWidth = resizeStart.width + (resizeStart.x - coords.x);
              newHeight = shiftKey ? newWidth / aspectRatio : resizeStart.height + (resizeStart.y - coords.y);
              newX = resizeStart.x + resizeStart.width - newWidth;
              newY = resizeStart.y + resizeStart.height - newHeight;
              break;
            case "ne":
              newWidth = coords.x - resizeStart.x;
              newHeight = shiftKey ? newWidth / aspectRatio : resizeStart.height + (resizeStart.y - coords.y);
              newY = resizeStart.y + resizeStart.height - newHeight;
              break;
            case "sw":
              newWidth = resizeStart.width + (resizeStart.x - coords.x);
              newHeight = shiftKey ? newWidth / aspectRatio : coords.y - resizeStart.y;
              newX = resizeStart.x + resizeStart.width - newWidth;
              break;
            case "se":
              newWidth = coords.x - resizeStart.x;
              newHeight = shiftKey ? newWidth / aspectRatio : coords.y - resizeStart.y;
              break;
            case "n":
              newHeight = resizeStart.height + (resizeStart.y - coords.y);
              newY = resizeStart.y + resizeStart.height - newHeight;
              break;
            case "s":
              newHeight = coords.y - resizeStart.y;
              break;
            case "w":
              newWidth = resizeStart.width + (resizeStart.x - coords.x);
              newX = resizeStart.x + resizeStart.width - newWidth;
              break;
            case "e":
              newWidth = coords.x - resizeStart.x;
              break;
          }

          // Minimum size constraints
          if (newWidth < 20) newWidth = 20;
          if (newHeight < 20) newHeight = 20;

          onImagesChange(
            images.map((i) =>
              i.id === selectedElement
                ? { ...i, x: newX, y: newY, width: newWidth, height: newHeight }
                : i
            )
          );
        }
        return;
      }

      // Handle dragging
      if (!isDragging || !selectedElement) return;

      if (selectedElement.startsWith("img-")) {
        const img = images.find((i) => i.id === selectedElement);
        if (img) {
          onImagesChange(
            images.map((i) =>
              i.id === selectedElement
                ? { ...i, x: coords.x - dragStart.x, y: coords.y - dragStart.y }
                : i
            )
          );
        }
      } else if (selectedElement.startsWith("text-")) {
        const text = texts.find((t) => t.id === selectedElement);
        if (text) {
          onTextsChange(
            texts.map((t) =>
              t.id === selectedElement
                ? { ...t, x: coords.x - dragStart.x, y: coords.y - dragStart.y }
                : t
            )
          );
        }
      } else if (selectedElement.startsWith("bubble-")) {
        const bubble = speechBubbles.find((b) => b.id === selectedElement);
        if (bubble) {
          onSpeechBubblesChange(
            speechBubbles.map((b) =>
              b.id === selectedElement
                ? {
                    ...b,
                    x: coords.x - dragStart.x,
                    y: coords.y - dragStart.y,
                    tailX: bubble.tailX + (coords.x - dragStart.x - bubble.x),
                    tailY: bubble.tailY + (coords.y - dragStart.y - bubble.y),
                  }
                : b
            )
          );
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      if (!selectedElement) return;
      const coords = getCoordinates(e);

      if (selectedElement.startsWith("text-")) {
        const text = texts.find((t) => t.id === selectedElement);
        if (text) {
          setEditingText(selectedElement);
          setEditingTextValue(text.text);
        }
      } else if (selectedElement.startsWith("bubble-")) {
        const bubble = speechBubbles.find((b) => b.id === selectedElement);
        if (bubble) {
          setEditingText(selectedElement);
          // Clear placeholder text when editing starts
          setEditingTextValue(bubble.text === "Double click to edit" ? "" : bubble.text);
        }
      }
    };

    const handleTextEditSubmit = () => {
      if (!editingText) return;

      if (editingText.startsWith("text-")) {
        onTextsChange(
          texts.map((t) =>
            t.id === editingText ? { ...t, text: editingTextValue } : t
          )
        );
      } else if (editingText.startsWith("bubble-")) {
        onSpeechBubblesChange(
          speechBubbles.map((b) =>
            b.id === editingText ? { ...b, text: editingTextValue } : b
          )
        );
      }
      setEditingText(null);
      setEditingTextValue("");
    };

    const measureText = (text: TextElement) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return { width: 0, height: 0 };
      ctx.font = `${text.bold ? "bold " : ""}${text.italic ? "italic " : ""}${text.fontSize}px ${text.fontFamily}`;
      const lines = text.text.split("\n");
      const width = Math.max(...lines.map((line) => ctx.measureText(line).width));
      const height = lines.length * text.fontSize * 1.2;
      return { width, height };
    };

    const drawCanvas = () => {
      if (typeof ref === "function" || !ref?.current) return;
      const canvas = ref.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set internal canvas dimensions (for drawing)
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      
      // Set display size (CSS)
      canvas.style.width = `${canvasSize.width * scale}px`;
      canvas.style.height = `${canvasSize.height * scale}px`;

      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frame
      if (frameStyle !== "none") {
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = frameWidth;
        if (frameStyle === "dashed") {
          ctx.setLineDash([10, 5]);
        } else if (frameStyle === "double") {
          ctx.lineWidth = frameWidth / 2;
          ctx.strokeRect(
            frameWidth / 4,
            frameWidth / 4,
            canvas.width - frameWidth / 2,
            canvas.height - frameWidth / 2
          );
          ctx.strokeRect(
            frameWidth * 0.75,
            frameWidth * 0.75,
            canvas.width - frameWidth * 1.5,
            canvas.height - frameWidth * 1.5
          );
          ctx.setLineDash([]);
        } else {
          ctx.setLineDash([]);
          ctx.strokeRect(
            frameWidth / 2,
            frameWidth / 2,
            canvas.width - frameWidth,
            canvas.height - frameWidth
          );
        }
      }

      // Helper to draw rounded rectangle
      const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        if (ctx.roundRect) {
          ctx.roundRect(x, y, width, height, radius);
        } else {
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        }
      };

      // Draw images
      images.forEach((img) => {
        const image = loadedImages.get(img.id);
        if (image && image.complete) {
          ctx.save();
          ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
          ctx.rotate((img.rotation * Math.PI) / 180);
          ctx.drawImage(image, -img.width / 2, -img.height / 2, img.width, img.height);
          if (selectedElement === img.id) {
            // Draw selection border
            ctx.strokeStyle = "#ff2d2d";
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(-img.width / 2, -img.height / 2, img.width, img.height);
            ctx.setLineDash([]);

            // Draw resize handles
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "#ff2d2d";
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            const handleSize = 12;
            const handles = [
              { x: img.x, y: img.y },
              { x: img.x + img.width, y: img.y },
              { x: img.x, y: img.y + img.height },
              { x: img.x + img.width, y: img.y + img.height },
              { x: img.x + img.width / 2, y: img.y },
              { x: img.x + img.width / 2, y: img.y + img.height },
              { x: img.x, y: img.y + img.height / 2 },
              { x: img.x + img.width, y: img.y + img.height / 2 },
            ];
            handles.forEach((handle) => {
              ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
              ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            });
          }
          ctx.restore();
        }
      });

      // Draw speech bubbles
      speechBubbles.forEach((bubble) => {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = selectedElement === bubble.id ? "#ff2d2d" : "#000000";
        ctx.lineWidth = selectedElement === bubble.id ? 3 : 2;

        // Draw bubble shape
        drawRoundedRect(bubble.x, bubble.y, bubble.width, bubble.height, 10);
        ctx.fill();
        ctx.stroke();

        // Draw tail
        ctx.beginPath();
        ctx.moveTo(bubble.x + bubble.width / 2, bubble.y + bubble.height);
        ctx.lineTo(bubble.tailX, bubble.tailY);
        ctx.lineTo(bubble.x + bubble.width / 2 - 20, bubble.y + bubble.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = bubble.color;
        ctx.font = `${bubble.fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = bubble.text.split("\n");
        lines.forEach((line, i) => {
          ctx.fillText(
            line,
            bubble.x + bubble.width / 2,
            bubble.y + bubble.height / 2 + (i - (lines.length - 1) / 2) * bubble.fontSize
          );
        });

        // Draw selection border and resize handles for selected bubble
        if (selectedElement === bubble.id) {
          ctx.strokeStyle = "#ff2d2d";
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(bubble.x, bubble.y, bubble.width, bubble.height);
          ctx.setLineDash([]);

          // Draw resize handles
          ctx.fillStyle = "#ff2d2d";
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          const handleSize = 12;
          const handles = [
            { x: bubble.x, y: bubble.y },
            { x: bubble.x + bubble.width, y: bubble.y },
            { x: bubble.x, y: bubble.y + bubble.height },
            { x: bubble.x + bubble.width, y: bubble.y + bubble.height },
            { x: bubble.x + bubble.width / 2, y: bubble.y },
            { x: bubble.x + bubble.width / 2, y: bubble.y + bubble.height },
            { x: bubble.x, y: bubble.y + bubble.height / 2 },
            { x: bubble.x + bubble.width, y: bubble.y + bubble.height / 2 },
          ];
          handles.forEach((handle) => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          });
        }

        ctx.restore();
      });

      // Draw texts
      texts.forEach((text) => {
        ctx.save();
        ctx.fillStyle = text.color;
        ctx.font = `${text.bold ? "bold " : ""}${text.italic ? "italic " : ""}${text.fontSize}px ${text.fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const lines = text.text.split("\n");
        lines.forEach((line, i) => {
          ctx.fillText(line, text.x, text.y + i * text.fontSize * 1.2);
        });
        if (selectedElement === text.id) {
          const metrics = measureText(text);
          ctx.strokeStyle = "#ff2d2d";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(text.x - 2, text.y - 2, metrics.width + 4, metrics.height + 4);
          ctx.setLineDash([]);
        }
        ctx.restore();
      });
    };

    useEffect(() => {
      drawCanvas();
    }, [images, texts, speechBubbles, selectedElement, canvasSize, backgroundColor, frameStyle, frameColor, frameWidth, loadedImages, scale]);

    return (
      <div
        ref={containerRef}
        style={{
          background: "#111",
          border: "2px solid #1a1a1a",
          padding: "1rem",
          marginTop: "2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          height: "75vh",
          width: "100%",
          minHeight: "600px",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          <canvas
            ref={ref}
            style={{
              border: "2px solid #333",
              cursor: isResizing ? "nwse-resize" : isDragging ? "grabbing" : "default",
              display: "block",
            }}
          />
          {editingText && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#1a1a1a",
                border: "2px solid #ff2d2d",
                padding: "1rem",
                zIndex: 1000,
              }}
            >
              <textarea
                value={editingTextValue}
                onChange={(e) => setEditingTextValue(e.target.value)}
                onFocus={(e) => {
                  // Clear placeholder text when focused
                  if (editingTextValue === "Double click to edit") {
                    setEditingTextValue("");
                  }
                }}
                onKeyDown={(e) => {
                  // Clear placeholder text on first keypress
                  if (editingTextValue === "Double click to edit" && e.key.length === 1) {
                    setEditingTextValue("");
                  }
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleTextEditSubmit();
                  }
                }}
                onBlur={handleTextEditSubmit}
                style={{
                  width: "300px",
                  height: "100px",
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #333",
                  padding: "0.5rem",
                  fontSize: "0.9rem",
                }}
                autoFocus
              />
              <p style={{ color: "#888", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                Press Ctrl+Enter to save
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CollageCanvas.displayName = "CollageCanvas";

export default CollageCanvas;



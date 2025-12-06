"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import CollageHeader from "./CollageHeader";
import CollageCanvas from "./CollageCanvas";
import CollageToolbar from "./CollageToolbar";

interface CollageEditorProps {
  onBack: () => void;
}

export interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  file?: File;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
}

export interface SpeechBubble {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  tailX: number;
  tailY: number;
  fontSize: number;
  color: string;
}

export type ToolMode =
  | "select"
  | "add-image"
  | "add-text"
  | "add-speech-bubble"
  | "add-frame";

export default function CollageEditor({ onBack }: CollageEditorProps) {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1000 });
  const [frameStyle, setFrameStyle] = useState<
    "none" | "solid" | "dashed" | "double"
  >("none");
  const [frameColor, setFrameColor] = useState("#000000");
  const [frameWidth, setFrameWidth] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0); // 0 means auto-fit

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (file: File) => {
    if (images.length >= 4) {
      alert("Maximum 4 images allowed per page");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const newImage: ImageElement = {
          id: `img-${Date.now()}`,
          src,
          x: 100 + images.length * 50,
          y: 100 + images.length * 50,
          width,
          height,
          rotation: 0,
          file: file,
        };
        setImages([...images, newImage]);
        setToolMode("select");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleAddText = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: "Double click to edit",
      x: 200,
      y: 200,
      fontSize: 24,
      color: "#000000",
      fontFamily: "Arial",
      bold: false,
      italic: false,
    };
    setTexts([...texts, newText]);
    setSelectedElement(newText.id);
    setToolMode("select");
  };

  const handleAddSpeechBubble = () => {
    const newBubble: SpeechBubble = {
      id: `bubble-${Date.now()}`,
      x: 200,
      y: 200,
      width: 200,
      height: 100,
      text: "Double click to edit",
      tailX: 150,
      tailY: 250,
      fontSize: 18,
      color: "#000000",
    };
    setSpeechBubbles([...speechBubbles, newBubble]);
    setSelectedElement(newBubble.id);
    setToolMode("select");
  };

  const handleDeleteSelected = () => {
    if (!selectedElement) return;

    if (selectedElement.startsWith("img-")) {
      setImages(images.filter((img) => img.id !== selectedElement));
    } else if (selectedElement.startsWith("text-")) {
      setTexts(texts.filter((text) => text.id !== selectedElement));
    } else if (selectedElement.startsWith("bubble-")) {
      setSpeechBubbles(
        speechBubbles.filter((bubble) => bubble.id !== selectedElement)
      );
    }
    setSelectedElement(null);
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

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

    // Preload and draw images
    const imagePromises = images.map((img) => {
      return new Promise<{ img: ImageElement; image: HTMLImageElement }>(
        (resolve) => {
          const image = new Image();
          image.onload = () => resolve({ img, image });
          image.src = img.src;
        }
      );
    });

    const loadedImages = await Promise.all(imagePromises);
    loadedImages.forEach(({ img, image }) => {
      ctx.save();
      ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
      ctx.rotate((img.rotation * Math.PI) / 180);
      ctx.drawImage(
        image,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
      ctx.restore();
    });

    // Helper to draw rounded rectangle
    const drawRoundedRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, radius);
      } else {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - radius,
          y + height
        );
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }
    };

    // Draw speech bubbles
    speechBubbles.forEach((bubble) => {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;

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
          bubble.y +
            bubble.height / 2 +
            (i - (lines.length - 1) / 2) * bubble.fontSize
        );
      });
      ctx.restore();
    });

    // Draw texts
    texts.forEach((text) => {
      ctx.save();
      ctx.fillStyle = text.color;
      ctx.font = `${text.bold ? "bold " : ""}${text.italic ? "italic " : ""}${
        text.fontSize
      }px ${text.fontFamily}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const lines = text.text.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, text.x, text.y + i * text.fontSize * 1.2);
      });
      ctx.restore();
    });

    const dataUrl = canvas.toDataURL("image/png");
    setResultUrl(dataUrl);
  }, [
    images,
    texts,
    speechBubbles,
    canvasSize,
    frameStyle,
    frameColor,
    frameWidth,
    backgroundColor,
  ]);

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = "manga-page.png";
      a.click();
    }
  };

  const handleReset = () => {
    setImages([]);
    setTexts([]);
    setSpeechBubbles([]);
    setSelectedElement(null);
    setResultUrl(null);
    setFrameStyle("none");
    setBackgroundColor("#ffffff");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
      }}
    >
      <CollageHeader onBack={onBack} />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {!resultUrl ? (
          <>
            <CollageToolbar
              toolMode={toolMode}
              onToolModeChange={setToolMode}
              onImageUpload={handleImageUpload}
              onAddText={handleAddText}
              onAddSpeechBubble={handleAddSpeechBubble}
              onDelete={handleDeleteSelected}
              hasSelection={!!selectedElement}
              imageCount={images.length}
              canvasSize={canvasSize}
              onCanvasSizeChange={setCanvasSize}
              frameStyle={frameStyle}
              onFrameStyleChange={setFrameStyle}
              frameColor={frameColor}
              onFrameColorChange={setFrameColor}
              frameWidth={frameWidth}
              onFrameWidthChange={setFrameWidth}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              zoom={zoom}
              onZoomChange={setZoom}
              onExport={handleExport}
              onReset={handleReset}
            />

            <CollageCanvas
              ref={canvasRef}
              images={images}
              texts={texts}
              speechBubbles={speechBubbles}
              selectedElement={selectedElement}
              onElementSelect={setSelectedElement}
              onImagesChange={setImages}
              onTextsChange={setTexts}
              onSpeechBubblesChange={setSpeechBubbles}
              canvasSize={canvasSize}
              backgroundColor={backgroundColor}
              frameStyle={frameStyle}
              frameColor={frameColor}
              frameWidth={frameWidth}
              zoom={zoom}
              onZoomChange={setZoom}
            />
          </>
        ) : (
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
                fontSize: "1.5rem",
                marginBottom: "1rem",
                color: "#ff2d2d",
              }}
            >
              Final Manga Page
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <img
                src={resultUrl}
                alt="Manga page result"
                style={{
                  maxWidth: "100%",
                  maxHeight: "600px",
                  border: "2px solid #333",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleDownload}
                style={{
                  padding: "0.8rem 2rem",
                  background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                  border: "none",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                ⬇ Download
              </button>
              <button
                onClick={() => setResultUrl(null)}
                style={{
                  padding: "0.8rem 2rem",
                  background: "transparent",
                  border: "2px solid #333",
                  color: "#888",
                  fontWeight: "700",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Edit Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

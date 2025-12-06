"use client";

import { useRef } from "react";
import { ToolMode } from "./CollageEditor";

interface CollageToolbarProps {
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
  onImageUpload: (file: File) => void;
  onAddText: () => void;
  onAddSpeechBubble: () => void;
  onDelete: () => void;
  hasSelection: boolean;
  imageCount: number;
  canvasSize: { width: number; height: number };
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
  frameStyle: "none" | "solid" | "dashed" | "double";
  onFrameStyleChange: (style: "none" | "solid" | "dashed" | "double") => void;
  frameColor: string;
  onFrameColorChange: (color: string) => void;
  frameWidth: number;
  onFrameWidthChange: (width: number) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
  onReset: () => void;
}

export default function CollageToolbar({
  toolMode,
  onToolModeChange,
  onImageUpload,
  onAddText,
  onAddSpeechBubble,
  onDelete,
  hasSelection,
  imageCount,
  canvasSize,
  onCanvasSizeChange,
  frameStyle,
  onFrameStyleChange,
  frameColor,
  onFrameColorChange,
  frameWidth,
  onFrameWidthChange,
  backgroundColor,
  onBackgroundColorChange,
  zoom,
  onZoomChange,
  onExport,
  onReset,
}: CollageToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const presetSizes = [
    { label: "Square", width: 600, height: 600 },
    { label: "Portrait", width: 500, height: 700 },
    { label: "Landscape", width: 700, height: 500 },
    { label: "Manga Page", width: 800, height: 1000 },
  ];

  return (
    <div
      style={{
        background: "#111",
        border: "2px solid #1a1a1a",
        padding: "1.5rem 2rem",
        marginTop: "2rem",
      }}
    >
      {/* Main Tools */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#ff2d2d",
            fontSize: "1rem",
            fontWeight: "700",
            fontFamily: "'Bangers', cursive",
            letterSpacing: "1px",
          }}
        >
          Tools:
        </span>

        <button
          onClick={() => onToolModeChange("select")}
          style={{
            padding: "0.6rem 1.2rem",
            background: toolMode === "select" ? "#ff2d2d" : "transparent",
            border: "2px solid #ff2d2d",
            color: toolMode === "select" ? "#fff" : "#ff2d2d",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          ✋ Select
        </button>

        <button
          onClick={() => {
            if (imageCount >= 4) {
              alert("Maximum 4 images allowed per page");
              return;
            }
            onToolModeChange("add-image");
            fileInputRef.current?.click();
          }}
          disabled={imageCount >= 4}
          style={{
            padding: "0.6rem 1.2rem",
            background: toolMode === "add-image" ? "#ff2d2d" : "transparent",
            border: "2px solid #ff2d2d",
            color:
              toolMode === "add-image"
                ? "#fff"
                : imageCount >= 4
                ? "#666"
                : "#ff2d2d",
            cursor: imageCount >= 4 ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            opacity: imageCount >= 4 ? 0.5 : 1,
          }}
        >
          🖼️ Add Image {imageCount > 0 && `(${imageCount}/4)`}
        </button>

        <button
          onClick={() => {
            onAddText();
            onToolModeChange("select");
          }}
          style={{
            padding: "0.6rem 1.2rem",
            background: "transparent",
            border: "2px solid #ff2d2d",
            color: "#ff2d2d",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          📝 Add Text
        </button>

        <button
          onClick={() => {
            onAddSpeechBubble();
            onToolModeChange("select");
          }}
          style={{
            padding: "0.6rem 1.2rem",
            background: "transparent",
            border: "2px solid #ff2d2d",
            color: "#ff2d2d",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          💬 Speech Bubble
        </button>

        {hasSelection && (
          <button
            onClick={onDelete}
            style={{
              padding: "0.6rem 1.2rem",
              background: "transparent",
              border: "2px solid #ff4444",
              color: "#ff4444",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            🗑️ Delete
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
        multiple
      />

      {/* Zoom Controls */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          padding: "1rem",
          background: "#0a0a0a",
          border: "1px solid #222",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            color: "#888",
            fontSize: "0.85rem",
            fontWeight: "600",
          }}
        >
          Zoom:
        </span>
        <button
          onClick={() => onZoomChange(0)}
          style={{
            padding: "0.4rem 0.8rem",
            background: zoom === 0 ? "#ff2d2d" : "transparent",
            border: "1px solid #333",
            color: zoom === 0 ? "#fff" : "#888",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
        >
          Fit to Screen
        </button>
        <button
          onClick={() => {
            if (zoom === 0) {
              // When auto-fit, start from 0.5 and zoom out
              onZoomChange(0.4);
            } else {
              onZoomChange(Math.max(0.1, zoom - 0.1));
            }
          }}
          style={{
            padding: "0.4rem 0.8rem",
            background: "transparent",
            border: "1px solid #333",
            color: "#888",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
        >
          − Zoom Out
        </button>
        <span
          style={{
            color: "#fff",
            fontSize: "0.85rem",
            minWidth: "60px",
            textAlign: "center",
          }}
        >
          {zoom > 0 ? `${Math.round(zoom * 100)}%` : "Auto"}
        </span>
        <button
          onClick={() => {
            if (zoom === 0) {
              // When auto-fit, start from 0.5 and zoom in
              onZoomChange(0.6);
            } else {
              onZoomChange(Math.min(2, zoom + 0.1));
            }
          }}
          style={{
            padding: "0.4rem 0.8rem",
            background: "transparent",
            border: "1px solid #333",
            color: "#888",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
        >
          + Zoom In
        </button>
        <button
          onClick={() => onZoomChange(1)}
          style={{
            padding: "0.4rem 0.8rem",
            background: zoom === 1 ? "#ff2d2d" : "transparent",
            border: "1px solid #333",
            color: zoom === 1 ? "#fff" : "#888",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
        >
          100%
        </button>
      </div>

      {/* Canvas Settings */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
          padding: "1rem",
          background: "#0a0a0a",
          border: "1px solid #222",
        }}
      >
        {/* Canvas Size */}
        <div>
          <label
            style={{
              display: "block",
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            Canvas Size
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {presetSizes.map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  onCanvasSizeChange({
                    width: preset.width,
                    height: preset.height,
                  })
                }
                style={{
                  padding: "0.4rem 0.8rem",
                  background:
                    canvasSize.width === preset.width &&
                    canvasSize.height === preset.height
                      ? "#ff2d2d"
                      : "transparent",
                  border: "1px solid #333",
                  color:
                    canvasSize.width === preset.width &&
                    canvasSize.height === preset.height
                      ? "#fff"
                      : "#888",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  textAlign: "left",
                }}
              >
                {preset.label} ({preset.width}x{preset.height})
              </button>
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div>
          <label
            style={{
              display: "block",
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            Background Color
          </label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              style={{
                width: "50px",
                height: "35px",
                border: "1px solid #333",
                cursor: "pointer",
              }}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              style={{
                flex: 1,
                padding: "0.4rem",
                background: "#0a0a0a",
                border: "1px solid #333",
                color: "#fff",
                fontSize: "0.8rem",
              }}
            />
          </div>
        </div>

        {/* Frame Style */}
        <div>
          <label
            style={{
              display: "block",
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            Frame Style
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(["none", "solid", "dashed", "double"] as const).map((style) => (
              <button
                key={style}
                onClick={() => onFrameStyleChange(style)}
                style={{
                  padding: "0.4rem 0.8rem",
                  background: frameStyle === style ? "#ff2d2d" : "transparent",
                  border: "1px solid #333",
                  color: frameStyle === style ? "#fff" : "#888",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                }}
              >
                {style}
              </button>
            ))}
          </div>
          {frameStyle !== "none" && (
            <div
              style={{
                marginTop: "0.5rem",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <input
                type="color"
                value={frameColor}
                onChange={(e) => onFrameColorChange(e.target.value)}
                style={{
                  width: "40px",
                  height: "30px",
                  border: "1px solid #333",
                  cursor: "pointer",
                }}
              />
              <div style={{ flex: 1 }}>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={frameWidth}
                  onChange={(e) => onFrameWidthChange(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#ff2d2d" }}
                />
                <span style={{ color: "#666", fontSize: "0.7rem" }}>
                  Width: {frameWidth}px
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        <button
          onClick={onExport}
          style={{
            padding: "0.8rem 2rem",
            background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
            border: "none",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "0.9rem",
          }}
        >
          ✨ Export Page
        </button>
        <button
          onClick={onReset}
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
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "#0a0a0a",
          border: "1px solid #222",
        }}
      >
        <p
          style={{
            color: "#666",
            fontSize: "0.85rem",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          💡 <strong>Tips:</strong> Click and drag to move elements. Select an
          image and drag the corner/edge handles to resize. Hold{" "}
          <strong>Shift</strong> while resizing to maintain aspect ratio.
          Double-click text or speech bubbles to edit. You can add up to 4
          images. Use zoom controls to adjust canvas view.
        </p>
      </div>
    </div>
  );
}

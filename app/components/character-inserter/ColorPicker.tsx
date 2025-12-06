"use client";

import { useRef, useState } from "react";

interface ColorPickerProps {
  imageUrl: string;
  onColorPicked: (color: { r: number; g: number; b: number }) => void;
  pickedColor: { r: number; g: number; b: number } | null;
}

export default function ColorPicker({
  imageUrl,
  onColorPicked,
  pickedColor,
}: ColorPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPicking, setIsPicking] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = e.currentTarget;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !isPicking) return;
    const canvas = canvasRef.current;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const img = container.querySelector("img");
    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const scaleX = canvas.width / imgRect.width;
    const scaleY = canvas.height / imgRect.height;

    const x = Math.floor((e.clientX - imgRect.left) * scaleX);
    const y = Math.floor((e.clientY - imgRect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];
    onColorPicked({ r, g, b });
    setIsPicking(false);
  };

  return (
    <div
      style={{
        background: "#111",
        border: "2px solid #1a1a1a",
        padding: "1.5rem",
        marginTop: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h4
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "1rem",
            color: "#ff2d2d",
            margin: 0,
          }}
        >
          Color Picker
        </h4>
        {!pickedColor && (
          <button
            onClick={() => setIsPicking(!isPicking)}
            style={{
              padding: "0.5rem 1rem",
              background: isPicking ? "#ff2d2d" : "transparent",
              border: "2px solid #ff2d2d",
              color: isPicking ? "#fff" : "#ff2d2d",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "600",
            }}
          >
            {isPicking ? "Click on background color" : "Pick Background Color"}
          </button>
        )}
      </div>

      {isPicking && (
        <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Click on the background color you want to remove
        </p>
      )}

      <div
        style={{
          position: "relative",
          display: "inline-block",
          cursor: isPicking ? "crosshair" : "default",
        }}
        onClick={isPicking ? handleClick : undefined}
      >
        <img
          src={imageUrl}
          alt="Character"
          style={{
            maxWidth: "300px",
            maxHeight: "300px",
            display: "block",
            border: isPicking ? "3px solid #ff2d2d" : "2px solid #333",
            pointerEvents: "none",
          }}
          onLoad={handleImageLoad}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      {pickedColor && (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})`,
              border: "2px solid #333",
            }}
          />
          <div>
            <p style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>
              Selected: RGB({pickedColor.r}, {pickedColor.g}, {pickedColor.b})
            </p>
            <button
              onClick={() => {
                onColorPicked({ r: 0, g: 0, b: 0 });
                setIsPicking(false);
              }}
              style={{
                marginTop: "0.3rem",
                padding: "0.3rem 0.8rem",
                background: "transparent",
                border: "1px solid #555",
                color: "#888",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";

interface BackgroundEditorProps {
  imageUrl: string;
  onMaskCreated: (maskDataUrl: string) => void;
  onCancel: () => void;
}

type ToolMode = "magic-wand" | "brush";

export default function BackgroundEditor({
  imageUrl,
  onMaskCreated,
  onCancel,
}: BackgroundEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [brushMode, setBrushMode] = useState<"erase" | "restore">("erase");
  const [toolMode, setToolMode] = useState<ToolMode>("magic-wand");
  const [tolerance, setTolerance] = useState(30);
  const [maskData, setMaskData] = useState<Uint8ClampedArray | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !overlayCanvas || !img) return;

    const ctx = canvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!ctx || !overlayCtx) return;

    const loadImage = () => {
      if (img.complete) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        overlayCanvas.width = img.naturalWidth;
        overlayCanvas.height = img.naturalHeight;

        ctx.drawImage(img, 0, 0);

        // Store image data
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setImageData(imgData);

        // Initialize mask (all white = keep everything)
        const mask = new Uint8ClampedArray(imgData.data.length);
        for (let i = 0; i < mask.length; i += 4) {
          mask[i] = 255;
          mask[i + 1] = 255;
          mask[i + 2] = 255;
          mask[i + 3] = 255;
        }
        setMaskData(mask);
      }
    };

    if (img.complete) {
      loadImage();
    } else {
      img.onload = loadImage;
    }
  }, [imageUrl]);

  // Update overlay visualization
  useEffect(() => {
    if (!maskData || !overlayCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!overlayCtx) return;

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const imageData = overlayCtx.createImageData(
      overlayCanvas.width,
      overlayCanvas.height
    );
    for (let i = 0; i < maskData.length; i += 4) {
      if (maskData[i] < 128) {
        imageData.data[i] = 255;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 150;
      }
    }
    overlayCtx.putImageData(imageData, 0, 0);
  }, [maskData]);

  const getCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return { x: 0, y: 0 };

    // Get the actual displayed size of the overlay canvas
    const overlayRect = overlayCanvas.getBoundingClientRect();

    // Calculate scale factor between displayed size and actual canvas size
    const scaleX = canvas.width / overlayRect.width;
    const scaleY = canvas.height / overlayRect.height;

    // Get mouse position relative to the overlay canvas
    const mouseX = e.clientX - overlayRect.left;
    const mouseY = e.clientY - overlayRect.top;

    // Convert to canvas coordinates
    return {
      x: Math.floor(mouseX * scaleX),
      y: Math.floor(mouseY * scaleY),
    };
  };

  // Magic Wand: Flood fill to remove similar colors
  const magicWand = (startX: number, startY: number) => {
    if (!maskData || !imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const startIdx = (startY * width + startX) * 4;
    const targetR = imageData.data[startIdx];
    const targetG = imageData.data[startIdx + 1];
    const targetB = imageData.data[startIdx + 2];

    const colorDistance = (
      r1: number,
      g1: number,
      b1: number,
      r2: number,
      g2: number,
      b2: number
    ) => {
      return Math.sqrt(
        Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
      );
    };

    const visited = new Set<number>();
    const queue: Array<[number, number]> = [[startX, startY]];
    const newMask = new Uint8ClampedArray(maskData);

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const key = y * width + x;
      if (visited.has(key)) continue;

      const idx = key * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];

      const distance = colorDistance(r, g, b, targetR, targetG, targetB);

      if (distance <= tolerance) {
        visited.add(key);
        newMask[idx] = 0;
        newMask[idx + 1] = 0;
        newMask[idx + 2] = 0;
        newMask[idx + 3] = 255;

        // Add neighbors
        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }

    setMaskData(newMask);
  };

  // Brush tool: Manual drawing with continuous strokes
  const brushDraw = (x: number, y: number, isFirstPoint: boolean = false) => {
    if (!maskData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const radius = brushSize / 2;
    const newMask = new Uint8ClampedArray(maskData);

    // Draw circle at a point
    const drawCircle = (cx: number, cy: number) => {
      for (
        let py = Math.max(0, cy - radius);
        py < Math.min(canvas.height, cy + radius);
        py++
      ) {
        for (
          let px = Math.max(0, cx - radius);
          px < Math.min(canvas.width, cx + radius);
          px++
        ) {
          const dx = px - cx;
          const dy = py - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= radius) {
            const idx = (py * canvas.width + px) * 4;
            if (brushMode === "erase") {
              newMask[idx] = 0;
              newMask[idx + 1] = 0;
              newMask[idx + 2] = 0;
              newMask[idx + 3] = 255;
            } else {
              newMask[idx] = 255;
              newMask[idx + 1] = 255;
              newMask[idx + 2] = 255;
              newMask[idx + 3] = 255;
            }
          }
        }
      }
    };

    // Draw circle at current point
    drawCircle(x, y);

    // If not first point, draw line to previous point for continuous stroke
    if (!isFirstPoint && lastPoint) {
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.ceil(distance / (radius / 2)));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = Math.round(lastPoint.x + dx * t);
        const cy = Math.round(lastPoint.y + dy * t);
        drawCircle(cx, cy);
      }
    }

    setMaskData(newMask);
    setLastPoint({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    setLastPoint(null); // Reset last point

    if (toolMode === "magic-wand") {
      magicWand(x, y);
    } else {
      brushDraw(x, y, true); // First point
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || toolMode !== "brush") return;
    const { x, y } = getCoordinates(e);
    brushDraw(x, y, false); // Continue stroke
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null); // Reset last point
  };

  const handleApply = () => {
    if (!maskData || !canvasRef.current) return;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvasRef.current.width;
    maskCanvas.height = canvasRef.current.height;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    const maskImageData = maskCtx.createImageData(
      maskCanvas.width,
      maskCanvas.height
    );
    maskImageData.data.set(maskData);
    maskCtx.putImageData(maskImageData, 0, 0);

    const maskDataUrl = maskCanvas.toDataURL("image/png");
    onMaskCreated(maskDataUrl);
  };

  const handleClear = () => {
    if (!canvasRef.current || !imageRef.current || !imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(imageRef.current, 0, 0);

    const mask = new Uint8ClampedArray(imageData.data.length);
    for (let i = 0; i < mask.length; i += 4) {
      mask[i] = 255;
      mask[i + 1] = 255;
      mask[i + 2] = 255;
      mask[i + 3] = 255;
    }
    setMaskData(mask);
  };

  return (
    <div
      style={{
        background: "#111",
        border: "2px solid #1a1a1a",
        padding: "2rem",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "1.3rem",
            color: "#ff2d2d",
            margin: 0,
          }}
        >
          Remove Background
        </h3>
        <button
          onClick={onCancel}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            border: "1px solid #555",
            color: "#888",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Cancel
        </button>
      </div>

      {/* Tool Selection */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#888", fontSize: "0.85rem", fontWeight: "600" }}>
          Tool:
        </span>
        <button
          onClick={() => setToolMode("magic-wand")}
          style={{
            padding: "0.5rem 1.5rem",
            background: toolMode === "magic-wand" ? "#ff2d2d" : "transparent",
            border: "2px solid #ff2d2d",
            color: toolMode === "magic-wand" ? "#fff" : "#ff2d2d",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          🪄 Magic Wand
        </button>
        <button
          onClick={() => setToolMode("brush")}
          style={{
            padding: "0.5rem 1.5rem",
            background: toolMode === "brush" ? "#ff2d2d" : "transparent",
            border: "2px solid #ff2d2d",
            color: toolMode === "brush" ? "#fff" : "#ff2d2d",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          🖌️ Brush
        </button>
      </div>

      <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1rem" }}>
        {toolMode === "magic-wand"
          ? "Click on the background color to remove it automatically. Adjust tolerance to include more/less similar colors."
          : "Draw over areas to remove (shown in red). Use Restore mode to fix mistakes."}
      </p>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {toolMode === "magic-wand" ? (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ color: "#888", fontSize: "0.85rem" }}>
              Tolerance:
            </span>
            <input
              type="range"
              min="10"
              max="100"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              style={{ accentColor: "#ff2d2d" }}
            />
            <span
              style={{ color: "#fff", fontSize: "0.85rem", minWidth: "40px" }}
            >
              {tolerance}
            </span>
            <span style={{ color: "#555", fontSize: "0.75rem" }}>
              (Higher = removes more similar colors)
            </span>
          </div>
        ) : (
          <>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <span style={{ color: "#888", fontSize: "0.85rem" }}>Mode:</span>
              <button
                onClick={() => setBrushMode("erase")}
                style={{
                  padding: "0.4rem 1rem",
                  background: brushMode === "erase" ? "#ff2d2d" : "transparent",
                  border: "1px solid #ff2d2d",
                  color: brushMode === "erase" ? "#fff" : "#ff2d2d",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Erase
              </button>
              <button
                onClick={() => setBrushMode("restore")}
                style={{
                  padding: "0.4rem 1rem",
                  background:
                    brushMode === "restore" ? "#ff2d2d" : "transparent",
                  border: "1px solid #ff2d2d",
                  color: brushMode === "restore" ? "#fff" : "#ff2d2d",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Restore
              </button>
            </div>

            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <span style={{ color: "#888", fontSize: "0.85rem" }}>
                Brush Size:
              </span>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ accentColor: "#ff2d2d" }}
              />
              <span
                style={{ color: "#fff", fontSize: "0.85rem", minWidth: "30px" }}
              >
                {brushSize}px
              </span>
            </div>
          </>
        )}

        <button
          onClick={handleClear}
          style={{
            padding: "0.4rem 1rem",
            background: "transparent",
            border: "1px solid #555",
            color: "#888",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          Reset
        </button>
      </div>

      {/* Canvas */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          background: "#000",
          padding: "1rem",
          border: "2px solid #333",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Character"
            style={{
              maxWidth: "500px",
              maxHeight: "500px",
              display: "block",
              pointerEvents: "none",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              opacity: 0,
            }}
          />
          <canvas
            ref={overlayCanvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              cursor: toolMode === "magic-wand" ? "crosshair" : "crosshair",
              pointerEvents: "auto",
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginTop: "1.5rem",
        }}
      >
        <button
          onClick={handleApply}
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
          ✓ Apply & Continue
        </button>
      </div>
    </div>
  );
}

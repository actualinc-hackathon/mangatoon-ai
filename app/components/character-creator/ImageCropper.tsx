"use client";

import { useState, useRef, useEffect } from "react";

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageUrl,
  onCrop,
  onCancel,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        setImageSize({ width, height });
        // Initialize crop area to center 80% of image
        setCropArea({
          x: width * 0.1,
          y: height * 0.1,
          width: width * 0.8,
          height: height * 0.8,
        });
      };
    }
  }, [imageUrl]);

  const getCoordinates = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !imageRef.current) return { x: 0, y: 0 };
    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;
    return {
      x: (e.clientX - imgRect.left) * scaleX,
      y: (e.clientY - imgRect.top) * scaleY,
    };
  };

  const getResizeHandle = (x: number, y: number): string | null => {
    const { x: cx, y: cy, width, height } = cropArea;
    const handleSize = 10;
    const handles = [
      { name: "nw", x: cx, y: cy },
      { name: "ne", x: cx + width, y: cy },
      { name: "sw", x: cx, y: cy + height },
      { name: "se", x: cx + width, y: cy + height },
      { name: "n", x: cx + width / 2, y: cy },
      { name: "s", x: cx + width / 2, y: cy + height },
      { name: "w", x: cx, y: cy + height / 2 },
      { name: "e", x: cx + width, y: cy + height / 2 },
    ];

    for (const handle of handles) {
      if (
        Math.abs(x - handle.x) < handleSize &&
        Math.abs(y - handle.y) < handleSize
      ) {
        return handle.name;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCoordinates(e);
    const handle = getResizeHandle(coords.x, coords.y);

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x: coords.x, y: coords.y });
    } else if (
      coords.x >= cropArea.x &&
      coords.x <= cropArea.x + cropArea.width &&
      coords.y >= cropArea.y &&
      coords.y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({
        x: coords.x - cropArea.x,
        y: coords.y - cropArea.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCoordinates(e);

    if (isResizing && resizeHandle) {
      let newX = cropArea.x;
      let newY = cropArea.y;
      let newWidth = cropArea.width;
      let newHeight = cropArea.height;

      switch (resizeHandle) {
        case "nw":
          newWidth = cropArea.x + cropArea.width - coords.x;
          newHeight = cropArea.y + cropArea.height - coords.y;
          newX = coords.x;
          newY = coords.y;
          break;
        case "ne":
          newWidth = coords.x - cropArea.x;
          newHeight = cropArea.y + cropArea.height - coords.y;
          newY = coords.y;
          break;
        case "sw":
          newWidth = cropArea.x + cropArea.width - coords.x;
          newHeight = coords.y - cropArea.y;
          newX = coords.x;
          break;
        case "se":
          newWidth = coords.x - cropArea.x;
          newHeight = coords.y - cropArea.y;
          break;
        case "n":
          newHeight = cropArea.y + cropArea.height - coords.y;
          newY = coords.y;
          break;
        case "s":
          newHeight = coords.y - cropArea.y;
          break;
        case "w":
          newWidth = cropArea.x + cropArea.width - coords.x;
          newX = coords.x;
          break;
        case "e":
          newWidth = coords.x - cropArea.x;
          break;
      }

      if (newWidth > 20 && newHeight > 20) {
        setCropArea({
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          width: Math.min(imageSize.width - newX, newWidth),
          height: Math.min(imageSize.height - newY, newHeight),
        });
      }
    } else if (isDragging) {
      const newX = Math.max(
        0,
        Math.min(coords.x - dragStart.x, imageSize.width - cropArea.width)
      );
      const newY = Math.max(
        0,
        Math.min(coords.y - dragStart.y, imageSize.height - cropArea.height)
      );
      setCropArea({ ...cropArea, x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      img,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onCrop(url);
      }
    }, "image/png");
  };

  const renderCropArea = () => {
    const img = imageRef.current;
    if (!img || !containerRef.current) return null;

    const imgRect = img.getBoundingClientRect();
    const scaleX = imgRect.width / img.naturalWidth;
    const scaleY = imgRect.height / img.naturalHeight;

    return (
      <div
        style={{
          position: "absolute",
          left: imgRect.left - containerRef.current.getBoundingClientRect().left,
          top: imgRect.top - containerRef.current.getBoundingClientRect().top,
          width: imgRect.width,
          height: imgRect.height,
          pointerEvents: "none",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
          }}
        />
        {/* Crop area */}
        <div
          style={{
            position: "absolute",
            left: cropArea.x * scaleX,
            top: cropArea.y * scaleY,
            width: cropArea.width * scaleX,
            height: cropArea.height * scaleY,
            border: "2px solid #ff2d2d",
            background: "transparent",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Resize handles */}
          {["nw", "ne", "sw", "se", "n", "s", "w", "e"].map((handle) => {
            const positions: { [key: string]: { left: string; top: string } } =
              {
                nw: { left: "0", top: "0" },
                ne: { left: "100%", top: "0" },
                sw: { left: "0", top: "100%" },
                se: { left: "100%", top: "100%" },
                n: { left: "50%", top: "0" },
                s: { left: "50%", top: "100%" },
                w: { left: "0", top: "50%" },
                e: { left: "100%", top: "50%" },
              };
            return (
              <div
                key={handle}
                style={{
                  position: "absolute",
                  ...positions[handle],
                  width: "10px",
                  height: "10px",
                  background: "#ff2d2d",
                  border: "1px solid #fff",
                  transform: "translate(-50%, -50%)",
                  cursor: `${handle}-resize`,
                  pointerEvents: "auto",
                }}
              />
            );
          })}
        </div>
      </div>
    );
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
      <h3
        style={{
          color: "#fff",
          marginBottom: "1rem",
          fontFamily: "'Bangers', cursive",
          letterSpacing: "2px",
        }}
      >
        CROP IMAGE
      </h3>
      <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Drag to move, drag corners/edges to resize
      </p>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-block",
          cursor: isDragging ? "move" : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Crop"
          style={{
            maxWidth: "600px",
            maxHeight: "600px",
            display: "block",
          }}
        />
        {renderCropArea()}
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1.5rem",
          justifyContent: "center",
        }}
      >
        <button
          onClick={handleCrop}
          style={{
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #00cc66, #009944)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          ✓ Apply Crop
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "0.75rem 2rem",
            background: "transparent",
            border: "2px solid #444",
            color: "#888",
            cursor: "pointer",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


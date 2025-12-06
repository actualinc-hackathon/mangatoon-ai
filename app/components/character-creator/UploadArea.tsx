"use client";

import { useRef, DragEvent, ChangeEvent } from "react";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

export default function UploadArea({ onFileSelect }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      onFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        maxWidth: "600px",
        margin: "4rem auto",
        padding: "4rem 2rem",
        border: "3px dashed #333",
        background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
        textAlign: "center",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#ff2d2d";
        e.currentTarget.style.boxShadow = "0 0 30px rgba(255,45,45,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#333";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Corner Decorations */}
      <div
        style={{
          position: "absolute",
          top: "-2px",
          left: "-2px",
          width: "30px",
          height: "30px",
          borderTop: "3px solid #ff2d2d",
          borderLeft: "3px solid #ff2d2d",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-2px",
          right: "-2px",
          width: "30px",
          height: "30px",
          borderTop: "3px solid #ff2d2d",
          borderRight: "3px solid #ff2d2d",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-2px",
          left: "-2px",
          width: "30px",
          height: "30px",
          borderBottom: "3px solid #ff2d2d",
          borderLeft: "3px solid #ff2d2d",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-2px",
          right: "-2px",
          width: "30px",
          height: "30px",
          borderBottom: "3px solid #ff2d2d",
          borderRight: "3px solid #ff2d2d",
        }}
      />

      <div
        style={{
          fontSize: "4rem",
          marginBottom: "1.5rem",
          opacity: 0.8,
        }}
      >
        🎭
      </div>
      <p
        style={{
          fontFamily: "'Bangers', cursive",
          fontSize: "1.5rem",
          letterSpacing: "2px",
          marginBottom: "0.5rem",
          color: "#fff",
        }}
      >
        UPLOAD YOUR PHOTO
      </p>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        or click to browse • JPG, PNG, WebP
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}


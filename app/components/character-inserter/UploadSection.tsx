"use client";

import { useRef } from "react";

interface UploadSectionProps {
  mangaPreview: string | null;
  characterPreview: string | null;
  onMangaSelect: (file: File) => void;
  onCharacterSelect: (file: File) => void;
}

export default function UploadSection({
  mangaPreview,
  characterPreview,
  onMangaSelect,
  onCharacterSelect,
}: UploadSectionProps) {
  const mangaInputRef = useRef<HTMLInputElement>(null);
  const characterInputRef = useRef<HTMLInputElement>(null);

  const handleMangaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onMangaSelect(file);
    }
  };

  const handleCharacterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onCharacterSelect(file);
    }
  };

  const preventDefault = (e: React.DragEvent) => e.preventDefault();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        marginTop: "2rem",
      }}
    >
      {/* Manga Upload */}
      <div>
        <h3
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "1.2rem",
            marginBottom: "1rem",
            color: "#ff2d2d",
            letterSpacing: "1px",
          }}
        >
          1. Manga Background
        </h3>
        <div
          onClick={() => mangaInputRef.current?.click()}
          onDrop={handleMangaDrop}
          onDragOver={preventDefault}
          onDragEnter={preventDefault}
          style={{
            border: mangaPreview ? "2px solid #4ade80" : "2px dashed #333",
            background: "#111",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {mangaPreview ? (
            <img
              src={mangaPreview}
              alt="Manga preview"
              style={{
                maxWidth: "100%",
                maxHeight: "180px",
                objectFit: "contain",
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎨</div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                Drop manga image here
              </p>
              <p style={{ color: "#444", fontSize: "0.8rem" }}>
                or click to browse
              </p>
            </>
          )}
        </div>
        <input
          ref={mangaInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onMangaSelect(file);
          }}
          style={{ display: "none" }}
        />
      </div>

      {/* Character Upload */}
      <div>
        <h3
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "1.2rem",
            marginBottom: "1rem",
            color: "#ff2d2d",
            letterSpacing: "1px",
          }}
        >
          2. Character Image
        </h3>
        <div
          onClick={() => characterInputRef.current?.click()}
          onDrop={handleCharacterDrop}
          onDragOver={preventDefault}
          onDragEnter={preventDefault}
          style={{
            border: characterPreview ? "2px solid #4ade80" : "2px dashed #333",
            background: "#111",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {characterPreview ? (
            <img
              src={characterPreview}
              alt="Character preview"
              style={{
                maxWidth: "100%",
                maxHeight: "180px",
                objectFit: "contain",
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                Drop character image here
              </p>
              <p style={{ color: "#444", fontSize: "0.8rem" }}>
                Sketch or photo
              </p>
            </>
          )}
        </div>
        <input
          ref={characterInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onCharacterSelect(file);
          }}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}


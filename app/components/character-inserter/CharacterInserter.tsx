"use client";

import { useState, useCallback } from "react";
import CharacterHeader from "./CharacterHeader";
import UploadSection from "./UploadSection";
import CanvasEditor from "./CanvasEditor";
import ControlPanel from "./ControlPanel";
import BackgroundEditor from "./BackgroundEditor";

interface CharacterInserterProps {
  onBack: () => void;
}

export interface CharacterPosition {
  x: number;
  y: number;
  scale: number;
}

export default function CharacterInserter({ onBack }: CharacterInserterProps) {
  const [mangaFile, setMangaFile] = useState<File | null>(null);
  const [mangaPreview, setMangaPreview] = useState<string | null>(null);
  const [characterFile, setCharacterFile] = useState<File | null>(null);
  const [characterPreview, setCharacterPreview] = useState<string | null>(null);
  const [characterPosition, setCharacterPosition] = useState<CharacterPosition>(
    {
      x: 100,
      y: 100,
      scale: 1,
    }
  );
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(218);
  const [mode, setMode] = useState<"sketch" | "photo">("sketch");
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);
  const [editedCharacterUrl, setEditedCharacterUrl] = useState<string | null>(
    null
  );

  // Track actual sizes for proper coordinate conversion
  const [displayScale, setDisplayScale] = useState(1);
  const [mangaSize, setMangaSize] = useState({ width: 0, height: 0 });
  const [characterSize, setCharacterSize] = useState({ width: 0, height: 0 });

  const handleMangaSelect = (file: File) => {
    setMangaFile(file);
    setMangaPreview(URL.createObjectURL(file));
    setResultUrl(null);
    setStatus("");
  };

  const handleCharacterSelect = (file: File) => {
    setCharacterFile(file);
    setCharacterPreview(URL.createObjectURL(file));
    setResultUrl(null);
    setStatus("");
    setEditedCharacterUrl(null);
    setShowBackgroundEditor(false);
  };

  const handlePositionChange = (newPosition: CharacterPosition) => {
    setCharacterPosition(newPosition);
  };

  const handleDisplayScaleChange = useCallback((scale: number) => {
    setDisplayScale(scale);
  }, []);

  const handleMangaSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      setMangaSize(size);
    },
    []
  );

  const handleCharacterSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      setCharacterSize(size);
    },
    []
  );

  const handleMaskCreated = async (maskDataUrl: string) => {
    if (!characterFile) return;

    setStatus("Processing background removal...");

    try {
      // Convert mask data URL to blob
      const maskResponse = await fetch(maskDataUrl);
      const maskBlob = await maskResponse.blob();

      // Send to API to process
      const formData = new FormData();
      formData.append("character", characterFile);
      formData.append("mask", maskBlob);

      const response = await fetch("/api/p2/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Background removal failed");
      }

      const editedBlob = await response.blob();
      const editedUrl = URL.createObjectURL(editedBlob);
      setEditedCharacterUrl(editedUrl);
      setShowBackgroundEditor(false);
      setStatus("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`Error: ${errorMessage}`);
    }
  };

  const handleGenerate = async () => {
    if (!mangaFile || !characterFile) return;

    // Use edited character if available, otherwise use original
    const charFileToUse = editedCharacterUrl
      ? await (await fetch(editedCharacterUrl))
          .blob()
          .then((b) => new File([b], "character.png", { type: "image/png" }))
      : characterFile;

    setProcessing(true);
    setStatus("Processing...");

    try {
      // Convert preview coordinates to actual image coordinates
      const actualX = Math.round(characterPosition.x / displayScale);
      const actualY = Math.round(characterPosition.y / displayScale);

      // Calculate the actual character size in the final image
      // Preview character is capped at 150px, so we need to calculate the actual scale
      const charPreviewMaxSize = 150;
      const charAspect = characterSize.width / characterSize.height;
      let charPreviewWidth;
      if (charAspect > 1) {
        charPreviewWidth = charPreviewMaxSize;
      } else {
        charPreviewWidth = charPreviewMaxSize * charAspect;
      }

      // The preview character width with user scale applied
      const scaledPreviewWidth = charPreviewWidth * characterPosition.scale;
      // Convert to actual width in the final image
      const actualCharWidth = scaledPreviewWidth / displayScale;
      // Calculate the actual scale factor for the character
      const actualCharScale = actualCharWidth / characterSize.width;

      const formData = new FormData();
      formData.append("manga", mangaFile);
      formData.append("character", charFileToUse);
      formData.append("x", actualX.toString());
      formData.append("y", actualY.toString());
      formData.append("scale", actualCharScale.toString());
      formData.append("threshold", threshold.toString());
      formData.append("mode", mode);

      const response = await fetch("/api/p2/insert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Processing failed");
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
      setStatus("Done!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`Error: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = "manga-with-character.png";
      a.click();
    }
  };

  const handleReset = () => {
    setMangaFile(null);
    setMangaPreview(null);
    setCharacterFile(null);
    setCharacterPreview(null);
    setResultUrl(null);
    setStatus("");
    setCharacterPosition({ x: 100, y: 100, scale: 1 });
    setEditedCharacterUrl(null);
    setShowBackgroundEditor(false);
  };

  const handleBack = () => {
    handleReset();
    onBack();
  };

  const showEditor = mangaPreview && characterPreview;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
      }}
    >
      <CharacterHeader onBack={handleBack} />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {/* Upload Section */}
        {!showEditor && (
          <UploadSection
            mangaPreview={mangaPreview}
            characterPreview={characterPreview}
            onMangaSelect={handleMangaSelect}
            onCharacterSelect={handleCharacterSelect}
          />
        )}

        {/* Mode Selector - Show when both images are uploaded */}
        {showEditor && !resultUrl && (
          <div
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #111 100%)",
              border: "3px solid #ff2d2d",
              padding: "1.5rem 2rem",
              marginTop: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              borderRadius: "0",
              boxShadow: "0 4px 20px rgba(255, 45, 45, 0.2)",
            }}
          >
            <span
              style={{
                color: "#ff2d2d",
                fontSize: "1.1rem",
                fontWeight: "700",
                fontFamily: "'Bangers', cursive",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Select Type:
            </span>
            <button
              onClick={() => {
                setMode("sketch");
              }}
              style={{
                padding: "0.7rem 2rem",
                background: mode === "sketch" ? "#ff2d2d" : "transparent",
                border: "2px solid #ff2d2d",
                color: mode === "sketch" ? "#fff" : "#ff2d2d",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (mode !== "sketch") {
                  e.currentTarget.style.background = "#ff2d2d33";
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== "sketch") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              ✏️ Sketch
            </button>
            <button
              onClick={() => {
                setMode("photo");
              }}
              style={{
                padding: "0.7rem 2rem",
                background: mode === "photo" ? "#ff2d2d" : "transparent",
                border: "2px solid #ff2d2d",
                color: mode === "photo" ? "#fff" : "#ff2d2d",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (mode !== "photo") {
                  e.currentTarget.style.background = "#ff2d2d33";
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== "photo") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              📷 Photo
            </button>
          </div>
        )}

        {/* Canvas Editor */}
        {showEditor && !resultUrl && (
          <>
            <CanvasEditor
              mangaPreview={mangaPreview!}
              characterPreview={editedCharacterUrl || characterPreview!}
              position={characterPosition}
              onPositionChange={handlePositionChange}
              onDisplayScaleChange={handleDisplayScaleChange}
              onMangaSizeChange={handleMangaSizeChange}
              onCharacterSizeChange={handleCharacterSizeChange}
            />

            {/* Background Editor for Photos */}
            {mode === "photo" &&
              characterPreview &&
              !showBackgroundEditor &&
              !editedCharacterUrl && (
                <div style={{ marginTop: "1rem" }}>
                  <div
                    style={{
                      background: "#111",
                      border: "2px solid #1a1a1a",
                      padding: "1.5rem",
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: "'Bangers', cursive",
                        fontSize: "1rem",
                        color: "#ff2d2d",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Remove Background
                    </h4>
                    <p
                      style={{
                        color: "#888",
                        fontSize: "0.9rem",
                        marginBottom: "1rem",
                      }}
                    >
                      Click below to manually remove the background by drawing
                      over areas to erase.
                    </p>
                    <button
                      onClick={() => setShowBackgroundEditor(true)}
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
                      🎨 Edit Background
                    </button>
                  </div>
                </div>
              )}

            {/* Show edited character preview */}
            {mode === "photo" && editedCharacterUrl && (
              <div style={{ marginTop: "1rem" }}>
                <div
                  style={{
                    background: "#111",
                    border: "2px solid #4ade80",
                    padding: "1rem",
                  }}
                >
                  <p
                    style={{
                      color: "#4ade80",
                      fontSize: "0.85rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ✓ Background removed! Ready to insert.
                  </p>
                  <img
                    src={editedCharacterUrl}
                    alt="Edited character"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      border: "1px solid #333",
                    }}
                  />
                  <button
                    onClick={() => {
                      setEditedCharacterUrl(null);
                      setShowBackgroundEditor(false);
                    }}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.4rem 1rem",
                      background: "transparent",
                      border: "1px solid #555",
                      color: "#888",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    Edit Again
                  </button>
                </div>
              </div>
            )}

            {/* Background Editor Component */}
            {showBackgroundEditor && characterPreview && (
              <BackgroundEditor
                imageUrl={characterPreview}
                onMaskCreated={handleMaskCreated}
                onCancel={() => setShowBackgroundEditor(false)}
              />
            )}

            <ControlPanel
              mode={mode}
              threshold={threshold}
              onThresholdChange={setThreshold}
              scale={characterPosition.scale}
              onScaleChange={(scale) =>
                setCharacterPosition((prev) => ({ ...prev, scale }))
              }
              processing={processing}
              onGenerate={handleGenerate}
              onReset={handleReset}
              status={status}
              hasEditedCharacter={!!editedCharacterUrl}
            />
          </>
        )}

        {/* Result View */}
        {resultUrl && (
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
              Result
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
                alt="Result"
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
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
                onClick={handleReset}
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
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div
          style={{
            marginTop: "3rem",
            padding: "1.5rem",
            background: "#111",
            border: "1px solid #222",
          }}
        >
          <h4
            style={{
              color: "#ff2d2d",
              marginBottom: "0.5rem",
              fontFamily: "'Bangers', cursive",
              letterSpacing: "1px",
            }}
          >
            💡 Tips
          </h4>
          <ul
            style={{
              color: "#666",
              fontSize: "0.9rem",
              lineHeight: 1.8,
              paddingLeft: "1.5rem",
            }}
          >
            <li>
              For <strong>sketches</strong> on white paper: Use "Sketch" mode -
              threshold removes only the outer white background
            </li>
            <li>
              For <strong>photos</strong>: Use "Photo" mode - click "Edit
              Background" to manually draw and remove background areas
            </li>
            <li>Drag the character to position it anywhere on the manga</li>
            <li>Use the scale slider to resize the character</li>
            <li>PNG images with transparent backgrounds work best</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

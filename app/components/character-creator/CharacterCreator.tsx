"use client";

import { useState } from "react";
import CharacterCreatorHeader from "./CharacterCreatorHeader";
import UploadArea from "./UploadArea";
import ImagePreview from "./ImagePreview";
import ProgressBar from "./ProgressBar";
import StatusMessage from "./StatusMessage";
import ActionButtons from "./ActionButtons";
import ToolInfo from "./ToolInfo";
import ImageCropper from "./ImageCropper";

interface CharacterCreatorProps {
  onBack: () => void;
}

export default function CharacterCreator({ onBack }: CharacterCreatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResultUrl(null);
    setStatus("");
    setProgress(0);
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setResultUrl(null);
    setProgress(0);

    try {
      setStatus("Converting to anime style...");
      setProgress(50);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/p3/convert-to-anime", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed");
      }

      const resultBlob = await response.blob();
      setResultUrl(URL.createObjectURL(resultBlob));
      setStatus("Done!");
      setProgress(100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(`Error: ${errorMessage}`);
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const urlToDownload = croppedUrl || resultUrl;
    if (urlToDownload) {
      const a = document.createElement("a");
      a.href = urlToDownload;
      a.download = "anime-character.png";
      a.click();
    }
  };

  const handleCrop = (croppedImageUrl: string) => {
    setCroppedUrl(croppedImageUrl);
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
  };

  const resetTool = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setStatus("");
    setProgress(0);
    setShowCropper(false);
    setCroppedUrl(null);
  };

  const handleBack = () => {
    resetTool();
    onBack();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
      }}
    >
      <CharacterCreatorHeader onBack={handleBack} />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {/* Upload Area */}
        {!preview && <UploadArea onFileSelect={handleFileSelect} />}

        {/* Image Processing Area */}
        {preview && (
          <div
            style={{
              background: "#111",
              border: "2px solid #1a1a1a",
              padding: "2rem",
              marginTop: "2rem",
            }}
          >
            <ImagePreview
              preview={preview}
              resultUrl={croppedUrl || resultUrl}
            />

            {processing && <ProgressBar status={status} progress={progress} />}

            {!processing && status && <StatusMessage status={status} />}

            {!showCropper && resultUrl && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <button
                  onClick={() => setShowCropper(true)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "transparent",
                    border: "2px solid #ff2d2d",
                    color: "#ff2d2d",
                    cursor: "pointer",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontSize: "0.9rem",
                  }}
                >
                  ✂ Crop Image
                </button>
              </div>
            )}

            {showCropper && resultUrl && (
              <ImageCropper
                imageUrl={resultUrl}
                onCrop={handleCrop}
                onCancel={handleCropCancel}
              />
            )}

            {!showCropper && (
              <ActionButtons
                processing={processing}
                hasResult={!!resultUrl}
                hasPreview={!!preview}
                onProcess={handleProcess}
                onDownload={handleDownload}
                onReset={resetTool}
              />
            )}
          </div>
        )}

        <ToolInfo />
      </div>
    </main>
  );
}


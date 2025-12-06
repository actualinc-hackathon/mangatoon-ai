"use client";

import { useState } from "react";
import { fileToBase64, createMaskBase64 } from "@/utils/masking";
import ConverterHeader from "./ConverterHeader";
import UploadArea from "./UploadArea";
import ImagePreview from "./ImagePreview";
import ProgressBar from "./ProgressBar";
import StatusMessage from "./StatusMessage";
import ActionButtons from "./ActionButtons";
import ToolInfo from "./ToolInfo";

interface Detection {
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

interface SketchConverterProps {
  onBack: () => void;
}

export default function SketchConverter({ onBack }: SketchConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

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
      setStatus("Detecting text & logos...");
      setProgress(25);
      const formData = new FormData();
      formData.append("file", file);

      const detectResponse = await fetch("/api/p1/detect", {
        method: "POST",
        body: formData,
      });

      if (!detectResponse.ok) {
        throw new Error("Detection failed");
      }

      const { detections }: { detections: Detection[] } = await detectResponse.json();

      setStatus("Creating mask...");
      setProgress(50);
      const maskBase64 = await createMaskBase64(file, detections);
      const imageBase64 = await fileToBase64(file);

      setStatus("Converting to manga style...");
      setProgress(75);

      const processResponse = await fetch("/api/p1/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, maskBase64 }),
      });

      if (!processResponse.ok) {
        throw new Error("Processing failed");
      }

      const resultBlob = await processResponse.blob();
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
    if (resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = "manga-sketch.png";
      a.click();
    }
  };

  const resetTool = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setStatus("");
    setProgress(0);
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
      <ConverterHeader onBack={handleBack} />

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
            <ImagePreview preview={preview} resultUrl={resultUrl} />

            {processing && <ProgressBar status={status} progress={progress} />}

            {!processing && status && <StatusMessage status={status} />}

            <ActionButtons
              processing={processing}
              hasResult={!!resultUrl}
              hasPreview={!!preview}
              onProcess={handleProcess}
              onDownload={handleDownload}
              onReset={resetTool}
            />
          </div>
        )}

        <ToolInfo />
      </div>
    </main>
  );
}


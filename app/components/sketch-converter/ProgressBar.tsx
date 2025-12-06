"use client";

interface ProgressBarProps {
  status: string;
  progress: number;
}

export default function ProgressBar({ status, progress }: ProgressBarProps) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
          fontSize: "0.85rem",
        }}
      >
        <span style={{ color: "#ff2d2d", fontWeight: "500" }}>{status}</span>
        <span style={{ color: "#666" }}>{progress}%</span>
      </div>
      <div
        style={{
          height: "6px",
          background: "#1a1a1a",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #ff2d2d, #ff6b6b)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}


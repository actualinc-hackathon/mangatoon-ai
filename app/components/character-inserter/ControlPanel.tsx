"use client";

interface ControlPanelProps {
  mode: "sketch" | "photo";
  threshold: number;
  onThresholdChange: (value: number) => void;
  scale: number;
  onScaleChange: (value: number) => void;
  processing: boolean;
  onGenerate: () => void;
  onReset: () => void;
  status: string;
  hasEditedCharacter?: boolean;
}

export default function ControlPanel({
  mode,
  threshold,
  onThresholdChange,
  scale,
  onScaleChange,
  processing,
  onGenerate,
  onReset,
  status,
  hasEditedCharacter = false,
}: ControlPanelProps) {
  return (
    <div
      style={{
        background: "#111",
        border: "2px solid #1a1a1a",
        borderTop: "none",
        padding: "1.5rem 2rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Background Removal Control */}
        {mode === "sketch" ? (
          <div>
            <label
              style={{
                display: "block",
                color: "#888",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              Background Threshold (for white paper removal)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input
                type="range"
                min="180"
                max="255"
                value={threshold}
                onChange={(e) => onThresholdChange(Number(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: "#ff2d2d",
                }}
              />
              <span
                style={{
                  color: "#fff",
                  fontSize: "0.9rem",
                  minWidth: "40px",
                }}
              >
                {threshold}
              </span>
            </div>
            <p
              style={{
                color: "#555",
                fontSize: "0.75rem",
                marginTop: "0.3rem",
              }}
            >
              Higher = removes lighter colors (paper)
            </p>
          </div>
        ) : (
          <div>
            <label
              style={{
                display: "block",
                color: "#888",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              Background Status
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {hasEditedCharacter ? (
                <span style={{ color: "#4ade80", fontSize: "0.9rem" }}>
                  ✓ Background removed
                </span>
              ) : (
                <span style={{ color: "#888", fontSize: "0.9rem" }}>
                  Click "Edit Background" above to remove background
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scale Control */}
        <div>
          <label
            style={{
              display: "block",
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            Character Scale
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => onScaleChange(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: "#ff2d2d",
              }}
            />
            <span
              style={{
                color: "#fff",
                fontSize: "0.9rem",
                minWidth: "40px",
              }}
            >
              {scale.toFixed(1)}x
            </span>
          </div>
          <p
            style={{ color: "#555", fontSize: "0.75rem", marginTop: "0.3rem" }}
          >
            Resize the character
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={onGenerate}
          disabled={processing}
          style={{
            padding: "1rem 2.5rem",
            background: processing
              ? "#333"
              : "linear-gradient(135deg, #ff2d2d, #cc0000)",
            border: "none",
            color: "#fff",
            fontWeight: "700",
            cursor: processing ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontSize: "1rem",
            boxShadow: processing ? "none" : "4px 4px 0 #000",
          }}
        >
          {processing ? "⏳ Processing..." : "⚡ Generate"}
        </button>
        <button
          onClick={onReset}
          disabled={processing}
          style={{
            padding: "1rem 2rem",
            background: "transparent",
            border: "2px solid #333",
            color: "#888",
            fontWeight: "700",
            cursor: processing ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Reset
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            color: status.includes("Error") ? "#ff4444" : "#4ade80",
            fontSize: "0.9rem",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

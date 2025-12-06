"use client";

interface ActionButtonsProps {
  processing: boolean;
  hasResult: boolean;
  hasPreview: boolean;
  onProcess: () => void;
  onDownload: () => void;
  onReset: () => void;
}

export default function ActionButtons({
  processing,
  hasResult,
  hasPreview,
  onProcess,
  onDownload,
  onReset,
}: ActionButtonsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {!hasResult && (
        <button
          onClick={onProcess}
          disabled={processing}
          className="manga-btn"
          style={{
            padding: "1rem 2.5rem",
            fontSize: "1rem",
            fontWeight: "700",
            background: processing
              ? "#333"
              : "linear-gradient(135deg, #ff2d2d, #cc0000)",
            border: "none",
            color: processing ? "#666" : "#fff",
            cursor: processing ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "2px",
            boxShadow: processing ? "none" : "4px 4px 0 #000",
            transition: "all 0.3s",
          }}
        >
          {processing ? "⏳ Processing..." : "⚡ Transform to Anime"}
        </button>
      )}

      {hasResult && (
        <>
          <button
            onClick={onDownload}
            className="manga-btn"
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #00cc66, #009944)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "2px",
              boxShadow: "4px 4px 0 #000",
            }}
          >
            ⬇ Download
          </button>
          <button
            onClick={onReset}
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1rem",
              fontWeight: "700",
              background: "transparent",
              border: "2px solid #444",
              color: "#888",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "2px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ff2d2d";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#444";
              e.currentTarget.style.color = "#888";
            }}
          >
            ✚ New Image
          </button>
        </>
      )}

      {!hasResult && hasPreview && (
        <button
          onClick={onReset}
          disabled={processing}
          style={{
            padding: "1rem 2.5rem",
            fontSize: "1rem",
            fontWeight: "700",
            background: "transparent",
            border: "2px solid #333",
            color: "#666",
            cursor: processing ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "2px",
            opacity: processing ? 0.5 : 1,
            transition: "all 0.3s",
          }}
        >
          ✕ Cancel
        </button>
      )}
    </div>
  );
}


"use client";

interface CollageHeaderProps {
  onBack: () => void;
}

export default function CollageHeader({ onBack }: CollageHeaderProps) {
  return (
    <header
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
        borderBottom: "3px solid #ff2d2d",
        padding: "1.5rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "2rem",
            color: "#ff2d2d",
            margin: 0,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          ✨ Manga Studio
        </h1>
        <span
          style={{
            color: "#666",
            fontSize: "0.9rem",
            fontStyle: "italic",
          }}
        >
          マンガスタジオ
        </span>
      </div>
      <button
        onClick={onBack}
        style={{
          padding: "0.7rem 1.5rem",
          background: "transparent",
          border: "2px solid #ff2d2d",
          color: "#ff2d2d",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "0.9rem",
          textTransform: "uppercase",
          letterSpacing: "1px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ff2d2d";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#ff2d2d";
        }}
      >
        ← Back
      </button>
    </header>
  );
}

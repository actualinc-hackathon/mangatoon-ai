"use client";

interface CharacterHeaderProps {
  onBack: () => void;
}

export default function CharacterHeader({ onBack }: CharacterHeaderProps) {
  return (
    <header
      style={{
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid #1a1a1a",
        background: "#0a0a0a",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "2px solid #333",
            color: "#888",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          ← Back
        </button>
        <div>
          <h1
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: "1.8rem",
              letterSpacing: "2px",
              color: "#fff",
            }}
          >
            CHARACTER INSERTER
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "#ff2d2d",
              letterSpacing: "3px",
            }}
          >
            キャラ追加
          </p>
        </div>
      </div>
    </header>
  );
}

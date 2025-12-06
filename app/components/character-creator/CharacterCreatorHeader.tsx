"use client";

interface CharacterCreatorHeaderProps {
  onBack: () => void;
}

export default function CharacterCreatorHeader({
  onBack,
}: CharacterCreatorHeaderProps) {
  return (
    <header
      style={{
        padding: "1rem 2rem",
        borderBottom: "2px solid #ff2d2d",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(10, 10, 10, 0.95)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            padding: "0.5rem",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff2d2d")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
        >
          ←
        </button>
        <div>
          <h1
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: "1.5rem",
              letterSpacing: "2px",
              color: "#fff",
            }}
          >
            CHARACTER CREATION
          </h1>
          <p
            style={{
              color: "#ff2d2d",
              fontSize: "0.75rem",
              letterSpacing: "2px",
            }}
          >
            キャラクター作成
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#444",
          fontSize: "0.8rem",
        }}
      >
        <span style={{ fontSize: "1rem" }}>漫</span>
        <span
          style={{
            fontFamily: "'Bangers', cursive",
            letterSpacing: "1px",
          }}
        >
          MANGATOON
        </span>
      </div>
    </header>
  );
}


"use client";

interface NavbarProps {
  onScrollToFeatures: () => void;
  onLaunchApp: () => void;
}

export default function Navbar({ onScrollToFeatures, onLaunchApp }: NavbarProps) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(10, 10, 10, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 45, 45, 0.2)",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.8rem" }}>漫</span>
        <span
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "1.5rem",
            letterSpacing: "2px",
            background: "linear-gradient(135deg, #ff2d2d, #ff6b6b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          MANGATOON
        </span>
      </div>
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <button
          onClick={onScrollToFeatures}
          style={{
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
        >
          Features
        </button>
        <button
          onClick={onLaunchApp}
          className="manga-btn"
          style={{
            padding: "0.6rem 1.5rem",
            background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Launch App
        </button>
      </div>
    </nav>
  );
}


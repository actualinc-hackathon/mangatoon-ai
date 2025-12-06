"use client";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "3rem 2rem",
        borderTop: "1px solid #1a1a1a",
        textAlign: "center",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>漫</span>
        <span
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "1.2rem",
            letterSpacing: "2px",
            color: "#ff2d2d",
          }}
        >
          MANGATOON
        </span>
      </div>
      <p style={{ color: "#444", fontSize: "0.8rem" }}>
        Powered by Google Vision API & Vertex AI
      </p>
      <p
        style={{
          color: "#333",
          fontSize: "0.75rem",
          marginTop: "0.5rem",
        }}
      >
        © 2024 Mangatoon. Transform reality into manga.
      </p>
    </footer>
  );
}


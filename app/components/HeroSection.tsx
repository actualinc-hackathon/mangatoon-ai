"use client";

interface HeroSectionProps {
  onStartCreating: () => void;
  onScrollToFeatures: () => void;
}

export default function HeroSection({ onStartCreating, onScrollToFeatures }: HeroSectionProps) {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "6rem 2rem 2rem",
      }}
    >
      {/* Background Effects */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(255, 45, 45, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(255, 45, 45, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #111 100%)
          `,
        }}
      />

      {/* Manga Speed Lines Background */}
      <div
        className="speed-lines"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
        }}
      />

      {/* Floating Manga Elements */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          fontSize: "4rem",
          opacity: 0.1,
          animation: "float 6s ease-in-out infinite",
        }}
      >
        漫画
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          fontSize: "3rem",
          opacity: 0.1,
          animation: "float 8s ease-in-out infinite",
          animationDelay: "-2s",
        }}
      >
        アート
      </div>

      <div
        style={{
          position: "relative",
          textAlign: "center",
          maxWidth: "900px",
          animation: "slideIn 1s ease-out",
        }}
      >
        {/* Japanese Title */}
        <p
          style={{
            fontSize: "1.2rem",
            color: "#ff2d2d",
            marginBottom: "1rem",
            letterSpacing: "8px",
            fontWeight: "400",
          }}
        >
          マンガトゥーン
        </p>

        {/* Main Title */}
        <h1
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "clamp(3rem, 10vw, 7rem)",
            lineHeight: 1,
            marginBottom: "1.5rem",
            textShadow: "4px 4px 0 #ff2d2d, 8px 8px 0 rgba(255,45,45,0.3)",
            letterSpacing: "4px",
          }}
        >
          MANGATOON
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            color: "#aaa",
            marginBottom: "3rem",
            maxWidth: "600px",
            margin: "0 auto 3rem",
            lineHeight: 1.6,
          }}
        >
          Transform your photos into stunning{" "}
          <span style={{ color: "#ff2d2d", fontWeight: "700" }}>
            manga artwork
          </span>{" "}
          with AI-powered tools. Remove distractions, add effects, and
          unleash your inner mangaka.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onStartCreating}
            className="manga-btn"
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
              border: "3px solid #ff2d2d",
              borderRadius: "0",
              color: "#fff",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "2px",
              boxShadow: "4px 4px 0 #000",
            }}
          >
            ⚡ Start Creating
          </button>
          <button
            onClick={onScrollToFeatures}
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: "700",
              background: "transparent",
              border: "3px solid #333",
              borderRadius: "0",
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
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.color = "#888";
            }}
          >
            Explore Features
          </button>
        </div>

        {/* Scroll Indicator */}
        <div
          onClick={onScrollToFeatures}
          style={{
            marginTop: "4rem",
            cursor: "pointer",
            animation: "pulse 2s infinite",
          }}
        >
          <p
            style={{
              color: "#555",
              fontSize: "0.8rem",
              marginBottom: "0.5rem",
            }}
          >
            Scroll to explore
          </p>
          <span style={{ fontSize: "1.5rem", color: "#ff2d2d" }}>↓</span>
        </div>
      </div>
    </section>
  );
}


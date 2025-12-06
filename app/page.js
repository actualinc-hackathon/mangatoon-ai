"use client";

import { useState, useRef } from "react";
import { fileToBase64, createMaskBase64 } from "@/utils/masking";

export default function Home() {
  const [currentView, setCurrentView] = useState("landing");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const fileInputRef = useRef(null);
  const featuresRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setStatus("");
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResultUrl(null);
      setStatus("");
      setProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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

      const { detections } = await detectResponse.json();

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
      setStatus(`Error: ${error.message}`);
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

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      id: "sketch-converter",
      title: "Manga Sketch",
      subtitle: "スケッチ変換",
      description:
        "Transform any photo into authentic manga-style artwork. AI removes text, logos & ads, then converts to beautiful sketch style.",
      icon: "✏️",
      status: "available",
      action: () => setCurrentView("sketch-converter"),
    },
    {
      id: "panel-creator",
      title: "Panel Creator",
      subtitle: "パネル作成",
      description:
        "Create dynamic manga panels with speech bubbles, effects, and authentic Japanese typography.",
      icon: "💬",
      status: "coming-soon",
      action: null,
    },
    {
      id: "character-gen",
      title: "Character Gen",
      subtitle: "キャラ生成",
      description:
        "Generate original manga characters with customizable styles, expressions, and poses.",
      icon: "👤",
      status: "coming-soon",
      action: null,
    },
    {
      id: "effect-studio",
      title: "Effect Studio",
      subtitle: "効果スタジオ",
      description:
        "Add speed lines, impact frames, screentones, and iconic manga effects to any image.",
      icon: "💥",
      status: "coming-soon",
      action: null,
    },
  ];

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Bangers&family=Permanent+Marker&family=Noto+Sans+JP:wght@400;700;900&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Noto Sans JP", sans-serif;
          background: #0a0a0a;
          min-height: 100vh;
          color: #ffffff;
          overflow-x: hidden;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes speedLines {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }

        .manga-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .manga-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .manga-btn:hover::before {
          left: 100%;
        }

        .feature-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
        }

        .halftone {
          background-image: radial-gradient(
            circle,
            #ff2d2d 1px,
            transparent 1px
          );
          background-size: 8px 8px;
        }

        .speed-lines {
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255, 45, 45, 0.1) 2px,
            rgba(255, 45, 45, 0.1) 4px
          );
        }
      `}</style>

      {currentView === "landing" ? (
        <main style={{ minHeight: "100vh" }}>
          {/* Navigation */}
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
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
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
                onClick={scrollToFeatures}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#888")}
              >
                Features
              </button>
              <button
                onClick={() => setCurrentView("sketch-converter")}
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

          {/* Hero Section */}
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
                  textShadow:
                    "4px 4px 0 #ff2d2d, 8px 8px 0 rgba(255,45,45,0.3)",
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
                  onClick={() => setCurrentView("sketch-converter")}
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
                  onClick={scrollToFeatures}
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
                    e.target.style.borderColor = "#ff2d2d";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#333";
                    e.target.style.color = "#888";
                  }}
                >
                  Explore Features
                </button>
              </div>

              {/* Scroll Indicator */}
              <div
                onClick={scrollToFeatures}
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

          {/* Features Section */}
          <section
            ref={featuresRef}
            style={{
              padding: "6rem 2rem",
              background: "#0f0f0f",
              position: "relative",
            }}
          >
            {/* Section Header */}
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p
                style={{
                  color: "#ff2d2d",
                  fontSize: "0.9rem",
                  letterSpacing: "4px",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                }}
              >
                機能 • Features
              </p>
              <h2
                style={{
                  fontFamily: "'Bangers', cursive",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  marginBottom: "1rem",
                  letterSpacing: "3px",
                }}
              >
                MANGA CREATION SUITE
              </h2>
              <p style={{ color: "#666", maxWidth: "500px", margin: "0 auto" }}>
                Powerful AI tools to transform your creative vision into manga
                reality
              </p>
            </div>

            {/* Features Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className="feature-card"
                  onClick={feature.action}
                  style={{
                    background:
                      feature.status === "available"
                        ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
                        : "#0f0f0f",
                    border:
                      feature.status === "available"
                        ? "2px solid #ff2d2d"
                        : "2px solid #222",
                    padding: "2rem",
                    position: "relative",
                    cursor: feature.action ? "pointer" : "default",
                    overflow: "hidden",
                  }}
                >
                  {/* Corner Accent */}
                  {feature.status === "available" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "60px",
                        height: "60px",
                        background:
                          "linear-gradient(135deg, transparent 50%, #ff2d2d 50%)",
                      }}
                    />
                  )}

                  {/* Status Badge */}
                  {feature.status === "coming-soon" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        padding: "0.3rem 0.8rem",
                        background: "#222",
                        border: "1px solid #333",
                        fontSize: "0.65rem",
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Coming Soon
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    style={{
                      fontSize: "2.5rem",
                      marginBottom: "1rem",
                      filter:
                        feature.status === "coming-soon"
                          ? "grayscale(1)"
                          : "none",
                      opacity: feature.status === "coming-soon" ? 0.5 : 1,
                    }}
                  >
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "'Bangers', cursive",
                      fontSize: "1.5rem",
                      letterSpacing: "2px",
                      marginBottom: "0.3rem",
                      color: feature.status === "available" ? "#fff" : "#555",
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Japanese Subtitle */}
                  <p
                    style={{
                      color:
                        feature.status === "available" ? "#ff2d2d" : "#333",
                      fontSize: "0.85rem",
                      marginBottom: "1rem",
                      letterSpacing: "2px",
                    }}
                  >
                    {feature.subtitle}
                  </p>

                  {/* Description */}
                  <p
                    style={{
                      color: feature.status === "available" ? "#888" : "#444",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>

                  {/* Action Button */}
                  {feature.status === "available" && (
                    <button
                      style={{
                        marginTop: "1.5rem",
                        padding: "0.7rem 1.5rem",
                        background: "transparent",
                        border: "2px solid #ff2d2d",
                        color: "#ff2d2d",
                        fontWeight: "700",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontSize: "0.8rem",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#ff2d2d";
                        e.target.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#ff2d2d";
                      }}
                    >
                      Try Now →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section
            style={{
              padding: "6rem 2rem",
              background: "#0a0a0a",
            }}
          >
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <p
                  style={{
                    color: "#ff2d2d",
                    fontSize: "0.9rem",
                    letterSpacing: "4px",
                    marginBottom: "1rem",
                    textTransform: "uppercase",
                  }}
                >
                  仕組み • Process
                </p>
                <h2
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    letterSpacing: "3px",
                  }}
                >
                  HOW IT WORKS
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "2rem",
                }}
              >
                {[
                  {
                    step: "01",
                    title: "Upload",
                    desc: "Drop your photo",
                    icon: "📸",
                  },
                  {
                    step: "02",
                    title: "Detect",
                    desc: "AI finds text & logos",
                    icon: "🔍",
                  },
                  {
                    step: "03",
                    title: "Clean",
                    desc: "Remove distractions",
                    icon: "✨",
                  },
                  {
                    step: "04",
                    title: "Transform",
                    desc: "Convert to manga",
                    icon: "🎨",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: "center",
                      padding: "2rem 1rem",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {item.icon}
                    </div>
                    <p
                      style={{
                        fontFamily: "'Bangers', cursive",
                        fontSize: "2rem",
                        color: "#ff2d2d",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.step}
                    </p>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
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
        </main>
      ) : (
        /* ==================== SKETCH CONVERTER TOOL ==================== */
        <main
          style={{
            minHeight: "100vh",
            background: "#0a0a0a",
          }}
        >
          {/* Tool Header */}
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
                onClick={() => {
                  setCurrentView("landing");
                  resetTool();
                }}
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
                onMouseEnter={(e) => (e.target.style.color = "#ff2d2d")}
                onMouseLeave={(e) => (e.target.style.color = "#888")}
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
                  MANGA SKETCH
                </h1>
                <p
                  style={{
                    color: "#ff2d2d",
                    fontSize: "0.75rem",
                    letterSpacing: "2px",
                  }}
                >
                  スケッチ変換
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

          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "2rem",
            }}
          >
            {/* Upload Area */}
            {!preview && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  maxWidth: "600px",
                  margin: "4rem auto",
                  padding: "4rem 2rem",
                  border: "3px dashed #333",
                  background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff2d2d";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(255,45,45,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Corner Decorations */}
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    left: "-2px",
                    width: "30px",
                    height: "30px",
                    borderTop: "3px solid #ff2d2d",
                    borderLeft: "3px solid #ff2d2d",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "30px",
                    height: "30px",
                    borderTop: "3px solid #ff2d2d",
                    borderRight: "3px solid #ff2d2d",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: "-2px",
                    width: "30px",
                    height: "30px",
                    borderBottom: "3px solid #ff2d2d",
                    borderLeft: "3px solid #ff2d2d",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "30px",
                    height: "30px",
                    borderBottom: "3px solid #ff2d2d",
                    borderRight: "3px solid #ff2d2d",
                  }}
                />

                <div
                  style={{
                    fontSize: "4rem",
                    marginBottom: "1.5rem",
                    opacity: 0.8,
                  }}
                >
                  📸
                </div>
                <p
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "1.5rem",
                    letterSpacing: "2px",
                    marginBottom: "0.5rem",
                    color: "#fff",
                  }}
                >
                  DROP YOUR IMAGE
                </p>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  or click to browse • JPG, PNG, WebP
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            )}

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
                {/* Images Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: resultUrl ? "1fr 1fr" : "1fr",
                    gap: "2rem",
                    marginBottom: "2rem",
                  }}
                >
                  {/* Original Image */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <span
                        style={{
                          background: "#ff2d2d",
                          color: "#fff",
                          padding: "0.2rem 0.6rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Original
                      </span>
                      <span style={{ color: "#444", fontSize: "0.8rem" }}>
                        入力
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#0a0a0a",
                        padding: "0.5rem",
                        border: "1px solid #222",
                      }}
                    >
                      <img
                        src={preview}
                        alt="Input"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </div>
                  </div>

                  {/* Result Image */}
                  {resultUrl && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <span
                          style={{
                            background: "#00cc66",
                            color: "#fff",
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Manga
                        </span>
                        <span style={{ color: "#444", fontSize: "0.8rem" }}>
                          出力
                        </span>
                      </div>
                      <div
                        style={{
                          background: "#0a0a0a",
                          padding: "0.5rem",
                          border: "1px solid #222",
                        }}
                      >
                        <img
                          src={resultUrl}
                          alt="Result"
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {processing && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span style={{ color: "#ff2d2d", fontWeight: "500" }}>
                        {status}
                      </span>
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
                          background:
                            "linear-gradient(90deg, #ff2d2d, #ff6b6b)",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {!processing && status && (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      marginBottom: "1.5rem",
                      background: status.includes("Error")
                        ? "rgba(255,0,0,0.1)"
                        : "rgba(0,204,102,0.1)",
                      border: `1px solid ${
                        status.includes("Error") ? "#ff2d2d" : "#00cc66"
                      }`,
                      color: status.includes("Error") ? "#ff6b6b" : "#00cc66",
                      fontWeight: "500",
                    }}
                  >
                    {status === "Done!" ? "✓ Transformation Complete!" : status}
                  </p>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {!resultUrl && (
                    <button
                      onClick={handleProcess}
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
                      {processing ? "⏳ Processing..." : "⚡ Transform"}
                    </button>
                  )}

                  {resultUrl && (
                    <>
                      <button
                        onClick={handleDownload}
                        className="manga-btn"
                        style={{
                          padding: "1rem 2.5rem",
                          fontSize: "1rem",
                          fontWeight: "700",
                          background:
                            "linear-gradient(135deg, #00cc66, #009944)",
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
                        onClick={resetTool}
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
                          e.target.style.borderColor = "#ff2d2d";
                          e.target.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = "#444";
                          e.target.style.color = "#888";
                        }}
                      >
                        ✚ New Image
                      </button>
                    </>
                  )}

                  {!resultUrl && preview && (
                    <button
                      onClick={resetTool}
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
              </div>
            )}

            {/* Tool Info */}
            <div
              style={{
                marginTop: "3rem",
                padding: "2rem",
                background: "#0f0f0f",
                border: "1px solid #1a1a1a",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Bangers', cursive",
                  fontSize: "1.2rem",
                  letterSpacing: "2px",
                  marginBottom: "1rem",
                  color: "#ff2d2d",
                }}
              >
                WHAT THIS TOOL DOES
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {[
                  {
                    icon: "🔍",
                    title: "Detects",
                    desc: "Text, logos, signs & ads",
                  },
                  { icon: "🧹", title: "Removes", desc: "All visual clutter" },
                  {
                    icon: "🎨",
                    title: "Converts",
                    desc: "To manga sketch style",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                    <div>
                      <p style={{ fontWeight: "700", marginBottom: "0.25rem" }}>
                        {item.title}
                      </p>
                      <p style={{ color: "#666", fontSize: "0.85rem" }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

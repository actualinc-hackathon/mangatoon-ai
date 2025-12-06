"use client";

import { forwardRef } from "react";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  status: "available" | "coming-soon";
  action: (() => void) | null;
}

interface FeaturesSectionProps {
  features: Feature[];
}

const FeaturesSection = forwardRef<HTMLElement, FeaturesSectionProps>(
  ({ features }, ref) => {
    return (
      <section
        ref={ref}
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
          {features.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
              onClick={feature.action || undefined}
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
                    feature.status === "coming-soon" ? "grayscale(1)" : "none",
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
                  color: feature.status === "available" ? "#ff2d2d" : "#333",
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
                    e.currentTarget.style.background = "#ff2d2d";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ff2d2d";
                  }}
                >
                  Try Now →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }
);

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;


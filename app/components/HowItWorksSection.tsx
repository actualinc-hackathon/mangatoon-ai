"use client";

const steps = [
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
];

export default function HowItWorksSection() {
  return (
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
          {steps.map((item, i) => (
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
              <p style={{ color: "#666", fontSize: "0.9rem" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


"use client";

const infoItems = [
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
];

export default function ToolInfo() {
  return (
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
        {infoItems.map((item, i) => (
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
              <p style={{ color: "#666", fontSize: "0.85rem" }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


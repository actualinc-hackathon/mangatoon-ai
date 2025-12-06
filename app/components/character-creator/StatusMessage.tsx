"use client";

interface StatusMessageProps {
  status: string;
}

export default function StatusMessage({ status }: StatusMessageProps) {
  const isError = status.includes("Error");
  
  return (
    <p
      style={{
        textAlign: "center",
        padding: "1rem",
        marginBottom: "1.5rem",
        background: isError ? "rgba(255,0,0,0.1)" : "rgba(0,204,102,0.1)",
        border: `1px solid ${isError ? "#ff2d2d" : "#00cc66"}`,
        color: isError ? "#ff6b6b" : "#00cc66",
        fontWeight: "500",
      }}
    >
      {status === "Done!" ? "✓ Transformation Complete!" : status}
    </p>
  );
}


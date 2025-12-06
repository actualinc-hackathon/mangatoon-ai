"use client";

interface ImagePreviewProps {
  preview: string;
  resultUrl: string | null;
}

export default function ImagePreview({ preview, resultUrl }: ImagePreviewProps) {
  return (
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
          <span style={{ color: "#444", fontSize: "0.8rem" }}>入力</span>
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
            <span style={{ color: "#444", fontSize: "0.8rem" }}>出力</span>
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
  );
}

